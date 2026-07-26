import type { BuildState, Palette, PartStyle, PartType, PartVisibility, Toggles } from './types'
import { DEFAULT_U, PART_TYPES } from './constants'
import { defaultShelves } from './shelves'

const BASE_COLORS: Record<PartType, string> = {
  horizontalEdges: '#2b2f36',
  heroEdge: '#4f9cf9',
  widthRails: '#2b2f36',
  verticalRails: '#3a3f47',
  sidePanels: '#20242b',
  topPanel: '#20242b',
  bottomPanel: '#20242b',
  handles: '#1a1d22',
  feet: '#1a1d22',
  shelves: '#5a6270',
}

export const DEFAULT_STYLES: Record<PartType, PartStyle> = PART_TYPES.reduce(
  (acc, part) => {
    acc[part] = { color: BASE_COLORS[part], pattern: 'none', solid: true }
    return acc
  },
  {} as Record<PartType, PartStyle>,
)

export const DEFAULT_TOGGLES: Toggles = {
  handles: true,
  feet: true,
  sidePanels: true,
  topPanel: true,
  bottomPanel: true,
}

export const DEFAULT_PALETTE: Palette = [
  '#2b2f36',
  '#4f9cf9',
  '#3a3f47',
  '#20242b',
  '#1a1d22',
  '#5a6270',
]

export function makeAllVisible(): PartVisibility {
  return PART_TYPES.reduce((acc, part) => {
    acc[part] = true
    return acc
  }, {} as PartVisibility)
}

export function makeDefaultBuild(): BuildState {
  return {
    rackU: DEFAULT_U,
    parts: structuredClone(DEFAULT_STYLES),
    toggles: { ...DEFAULT_TOGGLES },
    shelves: defaultShelves(DEFAULT_U),
    palette: [...DEFAULT_PALETTE],
  }
}
