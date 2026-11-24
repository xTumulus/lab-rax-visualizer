import type { BuildState, PartType, PatternId } from './types'
import {
  BASE_QUANTITIES,
  PART_LABELS,
  SHELF_TYPES,
  isOptional,
  patternLabel,
} from './constants'
import { EXTENSIONS_PER_SPLIT, JOINERS_PER_SPLIT, resolveLayout } from './layout'

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
  const layout = resolveLayout(state.rackU, state.joinMode, state.splits)

  // Rails and side panels come in 1-5U sections: four rails (one per post) or
  // two panels (one per side) for every section of the layout.
  const sectionRows = (part: PartType, label: string, perSection: number) => {
    const style = parts[part]
    const pt = patternText(style.pattern, style.solid)
    const byLength = new Map<number, number>()
    for (const u of layout.segments) if (u > 0) byLength.set(u, (byLength.get(u) ?? 0) + 1)
    for (const u of [...byLength.keys()].sort((a, b) => b - a)) {
      rows.push({
        part: `${label} (${u}U)`,
        color: style.color,
        pattern: pt.pattern,
        solid: pt.solid,
        quantity: byLength.get(u)! * perSection,
      })
    }
  }

  sectionRows('verticalRails', 'Height rail', 4)

  // Whatever joins the sections follows the height rails' styling.
  if (layout.splits > 0) {
    const joinStyle = parts.verticalRails
    const base = { color: joinStyle.color, pattern: '—', solid: '—' }
    if (state.joinMode === 'extensions') {
      rows.push({ ...base, part: 'Support extension (1U)', quantity: layout.splits * EXTENSIONS_PER_SPLIT })
    } else {
      rows.push({ ...base, part: 'Rail joiner', quantity: layout.splits * JOINERS_PER_SPLIT })
    }
  }

  if (toggles.sidePanels) sectionRows('sidePanels', 'Side panel', 2)

  // Fixed-count structural parts.
  const fixed: PartType[] = [
    'heroEdge',
    'widthRails',
    'horizontalEdges',
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

  // Shelves: group by (type, solid, color, pattern) — each type is a
  // different physical part, so 1U plates and 1U fan plates stay separate.
  const shelfGroups = new Map<
    string,
    { label: string; count: number; color: string; pattern: PatternId; solid: boolean }
  >()
  for (const s of shelves) {
    const key = `${s.shelfType}|${s.solid}|${s.color}|${s.pattern}`
    const g = shelfGroups.get(key)
    if (g) g.count += 1
    else {
      const label = SHELF_TYPES.find((t) => t.id === s.shelfType)?.label ?? `${s.u}U shelf`
      shelfGroups.set(key, { label, count: 1, color: s.color, pattern: s.pattern, solid: s.solid })
    }
  }
  for (const g of shelfGroups.values()) {
    rows.push({
      part: g.label,
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
