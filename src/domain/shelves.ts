import { SHELF_TYPES, shelfTypeU } from './constants'
import type { PartStyle, Shelf, ShelfType, ShelfU } from './types'
import { DEFAULT_STYLES } from './defaults'

/**
 * Deterministic id (Date.now/Math.random are avoided for reproducible
 * state) derived from the highest existing `sN` id in `existing` — a plain
 * incrementing module counter would restart at `s1` on every page load and
 * collide with ids already in a persisted/rehydrated shelf list.
 */
export function nextShelfId(existing: Shelf[]): string {
  let max = 0
  for (const s of existing) {
    const n = Number(/^s(\d+)$/.exec(s.id)?.[1])
    if (Number.isFinite(n)) max = Math.max(max, n)
  }
  return `s${max + 1}`
}

function makeShelf(shelfType: ShelfType, startU: number, existing: Shelf[], template?: PartStyle): Shelf {
  const style = template ?? DEFAULT_STYLES.shelves
  return {
    id: nextShelfId(existing),
    u: shelfTypeU(shelfType),
    shelfType,
    startU,
    solid: style.solid,
    color: style.color,
    pattern: style.pattern,
  }
}

const VALID_SHELF_TYPES = new Set(SHELF_TYPES.map((t) => t.id))

/**
 * Best-effort `shelfType` for a shelf that may predate this field (persisted
 * saves, share links) or carry a stale/unknown id — inferred from `solid` and
 * `u` so old builds still render as something sensible instead of crashing.
 */
export function normalizeShelfType(shelf: Shelf): ShelfType {
  if (shelf.shelfType && VALID_SHELF_TYPES.has(shelf.shelfType)) return shelf.shelfType
  if (shelf.solid) return shelf.u >= 2 ? 'plate-2u' : 'plate-1u'
  return 'shelf-open-1u'
}

export function sumU(shelves: Shelf[]): number {
  return shelves.reduce((n, s) => n + s.u, 0)
}

/** Rows (0-indexed from the bottom) covered by any shelf. */
function occupiedRows(shelves: Shelf[], rackU: number, excludeId?: string): boolean[] {
  const occupied = new Array(rackU).fill(false)
  for (const s of shelves) {
    if (s.id === excludeId) continue
    for (let i = s.startU; i < s.startU + s.u && i < rackU; i++) {
      if (i >= 0) occupied[i] = true
    }
  }
  return occupied
}

/**
 * First available row with `size` contiguous free rows, scanning from the
 * TOP of the rack down — so the first shelf added lands at the top, and each
 * one after it fills into the next gap below (which, for a simple sequential
 * add, is the gap right underneath what's already there). Returns null if no
 * such gap exists anywhere, used to decide whether "add shelf" is enabled.
 */
export function findFirstGap(shelves: Shelf[], rackU: number, size: ShelfU = 1): number | null {
  const occupied = occupiedRows(shelves, rackU)
  for (let start = rackU - size; start >= 0; start--) {
    let fits = true
    for (let i = start; i < start + size; i++) {
      if (occupied[i]) {
        fits = false
        break
      }
    }
    if (fits) return start
  }
  return null
}

/**
 * How large a shelf whose top sits at `topRow` could grow, extending
 * downward with its top held fixed, without overlapping another shelf or
 * going below row 0. Growth has to extend *down*, not up: shelves are
 * always placed flush against whatever's directly above them (see
 * `findFirstGap`, which always returns the highest free row), so there's
 * never free space above a shelf to grow into — only below it. Used to cap
 * the shelf-type selector so a shelf can never be resized into occupied or
 * out-of-bounds space.
 */
export function maxDownGrowth(shelves: Shelf[], shelfId: string, topRow: number): number {
  const occupied = new Set<number>()
  for (const s of shelves) {
    if (s.id === shelfId) continue
    for (let i = s.startU; i < s.startU + s.u; i++) occupied.add(i)
  }
  let size = 0
  for (let row = topRow; row >= 0; row--) {
    if (occupied.has(row)) break
    size++
  }
  return size
}

/**
 * Drop shelves that no longer fit at all after a rack resize. Each shelf is
 * now a fixed-size real part (size follows `shelfType`, e.g. always 2U for
 * plate-2u), so a shelf that no longer fits can't be shrunk to fit — it's
 * dropped instead. Also backfills `shelfType` on older saves that predate
 * it, and reassigns a fresh id to any shelf whose id collides with an
 * earlier one in the list (self-healing a previous id-generation bug —
 * see `nextShelfId` — rather than leaving broken persisted/shared state
 * stuck with duplicate React keys forever). No auto-fill — gaps (including
 * "no shelves at all") are allowed; this only removes what genuinely
 * doesn't fit anymore.
 */
export function clampShelvesToRack(shelves: Shelf[], rackU: number): Shelf[] {
  let maxId = 0
  for (const s of shelves) {
    const n = Number(/^s(\d+)$/.exec(s.id)?.[1])
    if (Number.isFinite(n)) maxId = Math.max(maxId, n)
  }
  const result: Shelf[] = []
  const seenIds = new Set<string>()
  for (const shelf of shelves) {
    if (!Number.isFinite(shelf.startU) || !Number.isFinite(shelf.u)) continue
    if (shelf.startU < 0 || shelf.startU >= rackU) continue
    const shelfType = normalizeShelfType(shelf)
    const u = shelfTypeU(shelfType)
    if (shelf.startU + u > rackU) continue
    const id = seenIds.has(shelf.id) ? `s${++maxId}` : shelf.id
    seenIds.add(id)
    result.push({ ...shelf, id, shelfType, u })
  }
  return result
}

/** Default build: a single 1U example shelf at the top of the rack. */
export function defaultShelves(rackU: number): Shelf[] {
  const shelfType: ShelfType = 'plate-1u'
  return [makeShelf(shelfType, rackU - shelfTypeU(shelfType), [])]
}

export { makeShelf }
