import type { BuildState, PartType, PatternId } from './types'
import {
  BASE_QUANTITIES,
  PART_LABELS,
  isOptional,
  patternLabel,
} from './constants'

export interface PartRow {
  part: string
  color: string
  pattern: string
  solid: string
  quantity: number
}

function patternText(pattern: PatternId, solid: boolean): { pattern: string; solid: string } {
  if (pattern === 'none') return { pattern: '—', solid: '—' }
  return { pattern: patternLabel(pattern), solid: solid ? 'Backplate' : 'Open voids' }
}

/**
 * Build the export rows for the current build, honouring toggles and
 * grouping identical shelves together.
 */
export function buildPartsList(state: BuildState): PartRow[] {
  const rows: PartRow[] = []
  const { parts, toggles, shelves } = state

  // Fixed-count structural parts.
  const fixed: PartType[] = [
    'verticalRails',
    'heroEdge',
    'widthRails',
    'horizontalEdges',
    'sidePanels',
    'topPanel',
    'bottomPanel',
    'handles',
    'feet',
  ]

  for (const part of fixed) {
    if (isOptional(part) && !toggles[part]) continue

    const qty = BASE_QUANTITIES[part] ?? 0
    if (qty <= 0) continue

    const style = parts[part]
    const pt = patternText(style.pattern, style.solid)
    rows.push({
      part: PART_LABELS[part],
      color: style.color,
      pattern: pt.pattern,
      solid: pt.solid,
      quantity: qty,
    })
  }

  // Shelves: group by (u, solid, color, pattern).
  const shelfGroups = new Map<string, { u: number; count: number; color: string; pattern: PatternId; solid: boolean }>()
  for (const s of shelves) {
    const key = `${s.u}|${s.solid}|${s.color}|${s.pattern}`
    const g = shelfGroups.get(key)
    if (g) g.count += 1
    else shelfGroups.set(key, { u: s.u, count: 1, color: s.color, pattern: s.pattern, solid: s.solid })
  }
  for (const g of shelfGroups.values()) {
    rows.push({
      part: `${g.u}U shelf`,
      color: g.color,
      pattern: g.pattern === 'none' ? '—' : patternLabel(g.pattern),
      // For shelves the "solid" column describes the shelf face itself.
      solid: g.solid ? 'Solid' : 'Holed',
      quantity: g.count,
    })
  }

  return rows
}

export function totalPartCount(state: BuildState): number {
  return buildPartsList(state).reduce((n, r) => n + r.quantity, 0)
}
