import type { BuildState, Palette, PartStyle, PartType, Shelf } from '../domain/types'
import { PALETTE_SIZE } from '../domain/types'
import { MAX_U, MIN_U, PART_TYPES } from '../domain/constants'
import { makeDefaultBuild } from '../domain/defaults'

// --- base64url helpers (URL-safe, no padding) --------------------------------
function toBase64Url(str: string): string {
  const b64 = btoa(unescape(encodeURIComponent(str)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(b64url: string): string {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  return decodeURIComponent(escape(atob(b64)))
}

export function encodeBuild(state: BuildState): string {
  const compact = {
    u: state.rackU,
    p: state.parts,
    t: state.toggles,
    s: state.shelves,
    c: state.palette,
  }
  return toBase64Url(JSON.stringify(compact))
}

/** Parse & validate an encoded build; returns null if malformed. */
export function decodeBuild(param: string): BuildState | null {
  try {
    const raw = JSON.parse(fromBase64Url(param)) as {
      u?: unknown
      p?: unknown
      t?: unknown
      s?: unknown
      c?: unknown
    }
    const base = makeDefaultBuild()

    const rackU =
      typeof raw.u === 'number' ? Math.max(MIN_U, Math.min(MAX_U, Math.round(raw.u))) : base.rackU

    // Merge parts defensively — keep defaults for any missing/invalid part.
    const parts = { ...base.parts }
    if (raw.p && typeof raw.p === 'object') {
      for (const part of PART_TYPES) {
        const incoming = (raw.p as Record<string, Partial<PartStyle>>)[part]
        if (incoming && typeof incoming === 'object') {
          parts[part as PartType] = {
            color: typeof incoming.color === 'string' ? incoming.color : parts[part].color,
            pattern: (incoming.pattern as PartStyle['pattern']) ?? parts[part].pattern,
            solid: typeof incoming.solid === 'boolean' ? incoming.solid : parts[part].solid,
          }
        }
      }
    }

    const toggles = { ...base.toggles }
    if (raw.t && typeof raw.t === 'object') {
      for (const k of Object.keys(toggles) as (keyof typeof toggles)[]) {
        const v = (raw.t as Record<string, unknown>)[k]
        if (typeof v === 'boolean') toggles[k] = v
      }
    }

    let shelves: Shelf[] = base.shelves
    if (Array.isArray(raw.s)) {
      // startU is required — links encoded before it existed simply drop
      // their shelves rather than crash on the missing field.
      shelves = (raw.s as Shelf[]).filter(
        (s) =>
          s &&
          typeof s === 'object' &&
          [1, 2, 3, 4].includes(s.u) &&
          typeof s.startU === 'number' &&
          s.startU >= 0,
      )
    }

    let palette: Palette = base.palette
    if (Array.isArray(raw.c) && raw.c.length === PALETTE_SIZE && raw.c.every((c) => typeof c === 'string')) {
      palette = raw.c as Palette
    }

    return { rackU, parts, toggles, shelves, palette }
  } catch {
    return null
  }
}

export function readShareParam(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get('b')
}

export function buildShareUrl(state: BuildState): string {
  const url = new URL(window.location.href)
  url.searchParams.set('b', encodeBuild(state))
  return url.toString()
}
