import type { JoinMode } from './types'

/** Longest rail / side panel part available (rail-height-5u, panel-side-5u). */
export const MAX_SEGMENT_U = 5

/** Height one support-extension module adds (and the side panel it replaces). */
export const EXTENSION_U = 1

/** Support extensions are used in pairs: one per side of the rack. */
export const EXTENSIONS_PER_SPLIT = 2

/**
 * Rail joiners needed per split: one per vertical post.
 * ASSUMPTION — change here if a joiner also connects the side panels.
 */
export const JOINERS_PER_SPLIT = 4

/**
 * How many places the rails/panels are split: none up to 5U, then as few as
 * possible. Joiners add no height, so one split covers up to 10U; an extension
 * module adds 1U, so 5U + extension + 5U reaches 11U with a single split.
 */
export function splitCount(rackU: number, mode: JoinMode): 0 | 1 | 2 {
  if (rackU <= MAX_SEGMENT_U) return 0
  const oneSplitMax = 2 * MAX_SEGMENT_U + (mode === 'extensions' ? EXTENSION_U : 0)
  return rackU <= oneSplitMax ? 1 : 2
}

export interface SplitBound {
  min: number
  max: number
  value: number
}

export interface RackLayout {
  splits: number
  /** Rail/panel section heights, bottom to top. Length is `splits + 1`. */
  segments: number[]
  /** Slider bounds for each of the leading `splits` sections. */
  bounds: SplitBound[]
}

/**
 * Work out the rail/panel sections for a rack. `preferred` holds the user's
 * chosen heights for the bottom and middle sections; they are clamped to what
 * is physically possible (each section 1–5U, or 0–5U with extension modules
 * since they can sit directly on a section), and the top section takes
 * whatever height remains. Extension modules add 1U each at every split.
 */
export function resolveLayout(rackU: number, mode: JoinMode, preferred: readonly number[]): RackLayout {
  const splits = splitCount(rackU, mode)
  const sections = splits + 1
  const min = mode === 'extensions' ? 0 : 1
  let remaining = rackU - (mode === 'extensions' ? splits * EXTENSION_U : 0)
  const segments: number[] = []
  const bounds: SplitBound[] = []
  for (let i = 0; i < splits; i++) {
    const after = sections - 1 - i
    const lo = Math.max(min, remaining - after * MAX_SEGMENT_U)
    const hi = Math.min(MAX_SEGMENT_U, remaining - after * min)
    const value = Math.max(lo, Math.min(hi, Math.round(preferred[i] ?? MAX_SEGMENT_U)))
    bounds.push({ min: lo, max: hi, value })
    segments.push(value)
    remaining -= value
  }
  segments.push(remaining)
  return { splits, segments, bounds }
}

export type LayoutItem = { kind: 'segment'; u: number } | { kind: 'extension' }

/** Bottom-to-top stack of rail/panel sections with extension modules between. */
export function layoutItems(layout: RackLayout, mode: JoinMode): LayoutItem[] {
  const items: LayoutItem[] = []
  layout.segments.forEach((u, i) => {
    if (i > 0 && mode === 'extensions') items.push({ kind: 'extension' })
    if (u > 0) items.push({ kind: 'segment', u })
  })
  return items
}
