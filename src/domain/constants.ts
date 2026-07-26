import type { OptionalPart, PartType, PatternId, ShelfType, ShelfU } from './types'

// Work the whole scene in metres-ish units: divide mm by this scale factor so
// three.js camera framing stays in a comfortable range.
export const SCALE = 100

// --- Size range --------------------------------------------------------------
export const MIN_U = 4
export const MAX_U = 12
export const DEFAULT_U = 6

// --- Part types (menu order) -------------------------------------------------
export const PART_TYPES: PartType[] = [
  'horizontalEdges',
  'heroEdge',
  'widthRails',
  'verticalRails',
  'sidePanels',
  'topPanel',
  'bottomPanel',
  'handles',
  'feet',
  'shelves',
]

export const PART_LABELS: Record<PartType, string> = {
  horizontalEdges: 'Depth rails',
  heroEdge: 'Hero rail (front width)',
  widthRails: 'Width rails',
  verticalRails: 'Height rails',
  sidePanels: 'Side panels',
  topPanel: 'Top panel',
  bottomPanel: 'Bottom panel',
  handles: 'Handles',
  feet: 'Feet',
  shelves: 'Shelves',
}

export const OPTIONAL_PARTS: OptionalPart[] = [
  'sidePanels',
  'topPanel',
  'bottomPanel',
  'handles',
  'feet',
]

export function isOptional(part: PartType): part is OptionalPart {
  return (OPTIONAL_PARTS as PartType[]).includes(part)
}

// --- Patterns ----------------------------------------------------------------
export interface PatternDef {
  id: PatternId
  label: string
}

export const PATTERNS: PatternDef[] = [
  { id: 'none', label: 'None (plain)' },
  { id: 'honeycomb', label: 'Honeycomb' },
  { id: 'grid', label: 'Grid' },
  { id: 'vents', label: 'Vent slots' },
  { id: 'perf', label: 'Perforated' },
]

export function patternLabel(id: PatternId): string {
  return PATTERNS.find((p) => p.id === id)?.label ?? id
}

// --- Shelf types ---------------------------------------------------------
// Real Lab Rax shelf parts, each its own fixed-size STL (see domain/models.ts).
export interface ShelfTypeDef {
  id: ShelfType
  label: string
  u: ShelfU
}

export const SHELF_TYPES: ShelfTypeDef[] = [
  { id: 'plate-1u', label: 'Plate (1U)', u: 1 },
  { id: 'plate-2u', label: 'Plate (2U)', u: 2 },
  { id: 'shelf-open-1u', label: 'Open shelf (1U)', u: 1 },
  { id: 'shelf-slotted-1u', label: 'Slotted shelf (1U)', u: 1 },
  { id: 'shelf-plate-40mm-fan-1u', label: '40mm fan plate (1U)', u: 1 },
  { id: 'shelf-plate-80mm-fan-2u', label: '80mm fan plate (2U)', u: 2 },
  { id: 'shelf-plate-keystone-1u', label: 'Keystone plate (1U)', u: 1 },
  { id: 'shelf-sbc-7-2u', label: 'SBC holder ×7 (2U)', u: 2 },
]

export function shelfTypeU(id: ShelfType): ShelfU {
  return SHELF_TYPES.find((t) => t.id === id)?.u ?? 1
}

// --- Base quantities for the parts list --------------------------------------
// Fixed-count parts. Shelves and horizontal edges are computed from rackU.
export const BASE_QUANTITIES: Partial<Record<PartType, number>> = {
  verticalRails: 4, // four posts
  feet: 4,
  handles: 2,
  sidePanels: 2,
  topPanel: 1,
  bottomPanel: 1,
  heroEdge: 1,
  widthRails: 3, // the other 3 width rails (hero counted separately)
}
