// Config for the *real* Lab Rax STL/3MF parts, as distinct from the
// stylized procedural geometry in domain/constants.ts. Kept separate so the
// procedural fallback (components/viewer/Rack.tsx) is unaffected.

import type { ShelfType } from './types'

export const MODEL_BASE = '/models-3d/'

// Rail/panel segments are exact multiples of 44.45mm and are only available
// in 1-5U lengths; taller racks stack several (see domain/layout.ts).
export const VERTICAL_RAIL_FILES: Record<number, string> = {
  1: 'rail-height-1u.stl',
  2: 'rail-height-2u.stl',
  3: 'rail-height-3u.stl',
  4: 'rail-height-4u.stl',
  5: 'rail-height-5u.stl',
}

export const SIDE_PANEL_FILES: Record<number, string> = {
  1: 'panel-side-1u.stl',
  2: 'panel-side-2u.stl',
  3: 'panel-side-3u.stl',
  4: 'panel-side-4u.stl',
  5: 'panel-side-5u.stl',
}

export const MODEL_FILES = {
  railHorizontalWidth: 'rail-width.3mf',
  railHorizontalDepth: 'rail-depth.stl',
  panelTopBottom: 'panel-top-bottom.stl',
  foot: 'foot.3mf',
  handle: 'handle.3mf',
} as const

/**
 * One real part per selectable `ShelfType` (see domain/types.ts). Most are
 * .stl; `shelf-plate-40mm-fan-1u` is a .3mf, so it's loaded via
 * `use3mfPart` rather than `useStlPart` in RackReal.
 */
export const SHELF_TYPE_FILES: Record<ShelfType, string> = {
  'plate-1u': 'plate-1u.stl',
  'plate-2u': 'plate-2u.stl',
  'shelf-open-1u': 'shelf-open-1u.stl',
  'shelf-slotted-1u': 'shelf-slotted-1u.stl',
  'shelf-plate-40mm-fan-1u': 'shelf-plate-40mm-fan-1u.3mf',
  'shelf-plate-80mm-fan-2u': 'shelf-plate-80mm-fan-2u.stl',
  'shelf-plate-keystone-1u': 'shelf-plate-keystone-1u.stl',
  'shelf-sbc-7-2u': 'shelf-sbc-7-2u.stl',
} as const

// --- Measured constants (from inspecting the actual files) -------------------
// Rail-height segments are exact U*44.45mm with no lip; side panels are
// U*44.45 + a 5.9mm interlocking lip.
export const U_MM = 44.45
export const SIDE_PANEL_LIP_MM = 5.9

// Corner-to-corner spacing, derived from measured part envelopes. Matches the
// 222mm "usable width between posts" from the Lab Rax reference article.
export const RACK_WIDTH_MM = 222
export const RACK_DEPTH_MM = 180
export const RACK_HALF_WIDTH_MM = RACK_WIDTH_MM / 2
export const RACK_HALF_DEPTH_MM = RACK_DEPTH_MM / 2

export const FOOT_HEIGHT_MM = 12

/** Handle height (measured from handle.3mf); it sits on top of the top rails. */
export const HANDLE_HEIGHT_MM = 32.5

// Frame envelope, measured from rail-width.3mf (282.25 wide, 54.85 deep).
export const WIDTH_RAIL_WIDTH_MM = 282.25
export const WIDTH_RAIL_DEPTH_MM = 54.85
export const RACK_OUTER_WIDTH_MM = WIDTH_RAIL_WIDTH_MM
export const RACK_OUTER_DEPTH_MM = RACK_DEPTH_MM + WIDTH_RAIL_DEPTH_MM

/**
 * Support extension: a 1U brace per side that joins two rail sections and
 * replaces 1U of rail + side panel. Measured: 240 long (front to back), 84.15
 * tall (44.45 body + a tab overlapping ~19.85 into the section on each side),
 * 30 thick.
 */
export const SUPPORT_EXTENSION_FILE = 'support-extension-1u.stl'
export const SUPPORT_EXTENSION_HEIGHT_MM = 84.15
export const SUPPORT_EXTENSION_TAB_MM = (SUPPORT_EXTENSION_HEIGHT_MM - U_MM) / 2
/** Rotation about the raw STL's Z (print-flat) axis that aligns its long edge with X. */
export const SUPPORT_EXTENSION_RAW_ROT = (134 * Math.PI) / 180

/**
 * Distance from the depth rail's own center to its front-most / back-most
 * mounting hole, measured from the mesh (a row of evenly-spaced holes at
 * ~9mm pitch; the front-most and back-most sit symmetrically at this
 * distance from center — the middle holes are for other accessories, not
 * feet). This is the row that ends up on the rendered BOTTOM face for
 * bottom-depth-rail instances, since those are flipped 180°.
 */
export const DEPTH_RAIL_FOOT_HOLE_OFFSET_MM = 58.16

/**
 * Height of the width rail's main bar top edge above its own bottom, measured
 * from the mesh itself (max Z in the part's middle third, away from the
 * corner mounting tabs, minus the part's overall bottom). Deliberately
 * smaller than the part's full bounding-box height (~54.85mm), which is
 * dominated by the corner tabs standing taller than the bar itself — vertical
 * posts rest on the bar's edge, not the tab peak.
 */
export const WIDTH_RAIL_BAR_TOP_MM = 33.773

/**
 * Per-part-type extra Y rotation applied on top of the universal Z-up->Y-up
 * bake, when a part's own local axes don't already line up with the scene
 * once that conversion is applied. Only the side panel needs this: its wide
 * (175.9mm, depth-spanning) face comes out on the wrong axis otherwise.
 */
export const SIDE_PANEL_EXTRA_ROT_Y = Math.PI / 2

/**
 * Overall rack size in mm: posts plus the top and bottom width rails, plus
 * the feet and handles when those parts are included. Extension modules
 * replace rail height 1:1, so they don't change it.
 */
export function overallSizeMm(rackU: number, withFeet: boolean, withHandles: boolean) {
  return {
    width: RACK_OUTER_WIDTH_MM,
    depth: RACK_OUTER_DEPTH_MM,
    height:
      rackU * U_MM +
      2 * WIDTH_RAIL_BAR_TOP_MM +
      (withFeet ? FOOT_HEIGHT_MM : 0) +
      (withHandles ? HANDLE_HEIGHT_MM : 0),
  }
}
