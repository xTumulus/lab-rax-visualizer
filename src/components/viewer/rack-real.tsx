import { Fragment } from 'react'
import { SCALE } from '../../domain/constants'
import {
  DEPTH_RAIL_FOOT_HOLE_OFFSET_MM,
  FOOT_HEIGHT_MM,
  MODEL_FILES,
  RACK_HALF_DEPTH_MM,
  RACK_HALF_WIDTH_MM,
  SHELF_TYPE_FILES,
  SIDE_PANEL_EXTRA_ROT_Y,
  SIDE_PANEL_FILES,
  U_MM,
  VERTICAL_RAIL_FILES,
  WIDTH_RAIL_BAR_TOP_MM,
  decomposeIntoSegments,
} from '../../domain/models'
import type { ShelfType } from '../../domain/types'
import { useBuildStore } from '../../store/use-build-store'
import { use3mfPart, useStlPart } from './materials/use-model-geometry'
import type { PreparedGeometry } from './materials/use-model-geometry'
import { RealMesh } from './parts/real-mesh'

const PI = Math.PI

export function RackReal() {
  const rackU = useBuildStore((s) => s.rackU)
  const parts = useBuildStore((s) => s.parts)
  const toggles = useBuildStore((s) => s.toggles)
  const shelves = useBuildStore((s) => s.shelves)
  const visibility = useBuildStore((s) => s.visibility)

  // Hooks must run unconditionally, so load every possible segment length up
  // front (cheap: cached after first load) and pick from them below.
  const rail1 = useStlPart(VERTICAL_RAIL_FILES[1])
  const rail2 = useStlPart(VERTICAL_RAIL_FILES[2])
  const rail3 = useStlPart(VERTICAL_RAIL_FILES[3])
  const rail4 = useStlPart(VERTICAL_RAIL_FILES[4])
  const rail5 = useStlPart(VERTICAL_RAIL_FILES[5])
  const railByLen = { 1: rail1, 2: rail2, 3: rail3, 4: rail4, 5: rail5 }

  const panel1 = useStlPart(SIDE_PANEL_FILES[1], SIDE_PANEL_EXTRA_ROT_Y)
  const panel2 = useStlPart(SIDE_PANEL_FILES[2], SIDE_PANEL_EXTRA_ROT_Y)
  const panel3 = useStlPart(SIDE_PANEL_FILES[3], SIDE_PANEL_EXTRA_ROT_Y)
  const panel4 = useStlPart(SIDE_PANEL_FILES[4], SIDE_PANEL_EXTRA_ROT_Y)
  const panel5 = useStlPart(SIDE_PANEL_FILES[5], SIDE_PANEL_EXTRA_ROT_Y)
  const panelByLen = { 1: panel1, 2: panel2, 3: panel3, 4: panel4, 5: panel5 }

  const widthRail = use3mfPart(MODEL_FILES.railHorizontalWidth)
  const depthRail = useStlPart(MODEL_FILES.railHorizontalDepth)
  const topBottomPanel = useStlPart(MODEL_FILES.panelTopBottom)
  const foot = use3mfPart(MODEL_FILES.foot)
  const handle = use3mfPart(MODEL_FILES.handle)

  const plate1u = useStlPart(SHELF_TYPE_FILES['plate-1u'], Math.PI, Math.PI / 2)
  const plate2u = useStlPart(SHELF_TYPE_FILES['plate-2u'], Math.PI, Math.PI / 2)
  const shelfOpen1u = useStlPart(SHELF_TYPE_FILES['shelf-open-1u'])
  const shelfSlotted1u = useStlPart(SHELF_TYPE_FILES['shelf-slotted-1u'])
  const shelfFan40mm1u = use3mfPart(SHELF_TYPE_FILES['shelf-plate-40mm-fan-1u'])
  const shelfFan80mm2u = useStlPart(SHELF_TYPE_FILES['shelf-plate-80mm-fan-2u'], Math.PI, Math.PI / 2)
  const shelfKeystone1u = useStlPart(SHELF_TYPE_FILES['shelf-plate-keystone-1u'], Math.PI, Math.PI / 2)
  const shelfSbc72u = useStlPart(SHELF_TYPE_FILES['shelf-sbc-7-2u'])
  const shelfGeoByType: Record<ShelfType, PreparedGeometry> = {
    'plate-1u': plate1u,
    'plate-2u': plate2u,
    'shelf-open-1u': shelfOpen1u,
    'shelf-slotted-1u': shelfSlotted1u,
    'shelf-plate-40mm-fan-1u': shelfFan40mm1u,
    'shelf-plate-80mm-fan-2u': shelfFan80mm2u,
    'shelf-plate-keystone-1u': shelfKeystone1u,
    'shelf-sbc-7-2u': shelfSbc72u,
  }

  const totalHeight = rackU * U_MM
  const segments = decomposeIntoSegments(rackU)

  const corners = [
    { key: 'fl', x: -RACK_HALF_WIDTH_MM, z: RACK_HALF_DEPTH_MM, railRotY: 0, railMirror: false },
    // Front-right mirrors the front-left rail (negative X scale) rather than
    // rotating 180° about Y — a rotation and a mirror only coincide for a
    // rotationally-symmetric cross-section, which this isn't.
    { key: 'fr', x: RACK_HALF_WIDTH_MM, z: RACK_HALF_DEPTH_MM, railRotY: 0, railMirror: true },
    // Back-left mirrors the back-right rail, same pattern as the front pair.
    { key: 'bl', x: -RACK_HALF_WIDTH_MM, z: -RACK_HALF_DEPTH_MM, railRotY: PI, railMirror: true },
    { key: 'br', x: RACK_HALF_WIDTH_MM, z: -RACK_HALF_DEPTH_MM, railRotY: PI, railMirror: false },
  ]

  // Vertically center the whole assembly to match the app's existing camera
  // framing convention (rack centered at the origin).
  const centerOffset = -(totalHeight / 2) / SCALE

  // Vertical rail corner positions, each face-matched to the corresponding
  // width rail's edge (measured from the loaded geometry, not guessed
  // constants). Front matches the front-bottom width rail (centered at
  // z=+RACK_HALF_DEPTH_MM); back mirrors that against the back-bottom width
  // rail (centered at z=-RACK_HALF_DEPTH_MM) — both width rails share the
  // same size, so back is simply the negation of front.
  const frontRailZ = RACK_HALF_DEPTH_MM + widthRail.size.z / 2 - rail1.size.z / 2
  const backRailZ = -frontRailZ
  // Both width rails are centered at world x=0, so left/right rail-X offsets
  // are the same for the front and back pairs.
  const rightRailX = widthRail.size.x / 2 - rail1.size.x / 2
  const leftRailX = -rightRailX
  const railZByKey = { fl: frontRailZ, fr: frontRailZ, bl: backRailZ, br: backRailZ }
  const railXByKey = { fl: leftRailX, fr: rightRailX, bl: leftRailX, br: rightRailX }

  // Same idea, for the depth rails (used by both the depth-rail render below
  // and the handles, which sit centered on the top depth rail's own X, not
  // the vertical rail's).
  const rightDepthRailX = widthRail.size.x / 2 - depthRail.size.x / 2
  const leftDepthRailX = -rightDepthRailX

  // Shelves: pushed forward past the front width rail's own front edge by a
  // few millimeters. widthRail's front edge is its own center
  // (RACK_HALF_DEPTH_MM) plus half its depth; the shelf's center is then
  // placed so *its* front-most reach (half its own depth) lands that far
  // beyond it.
  const SHELF_OVERSHOOT_MM = 3
  const SIDE_PANEL_DEPTH_RAIL_OVERLAP_MM = 3
  const SIDE_PANEL_OUTER_INSET_MM = 1
  const TOP_PANEL_INSET_MM = 1
  const BOTTOM_PANEL_INSET_MM = 1
  const widthRailFrontEdge = RACK_HALF_DEPTH_MM + widthRail.size.z / 2
  // Depth position, from a given shelf model's own footprint depth.
  const shelfZ = (geo: PreparedGeometry) => widthRailFrontEdge + SHELF_OVERSHOOT_MM - geo.size.z / 2

  // Shelf rows are laid out on a plain 0-based U grid (row 0 bottom = y=0),
  // which is offset from the rail's actual bottom (WIDTH_RAIL_BAR_TOP_MM) and
  // top (WIDTH_RAIL_BAR_TOP_MM + totalHeight). Base shift lands the shelf's
  // top flush with the top of its highest occupied row (topRow) — the row
  // right below where the height rail's top-of-slot would be.
  const shelfY = (geo: PreparedGeometry, topRow: number) =>
    topRow * U_MM + WIDTH_RAIL_BAR_TOP_MM + U_MM - geo.size.y

  return (
    <group scale={[1 / SCALE, 1 / SCALE, 1 / SCALE]} position={[0, centerOffset, 0]}>
      {/* Vertical rails: stack the greedy segment decomposition at each corner,
          starting at the bottom width rail's main-bar top edge (not the
          taller corner-tab peak) so the post's bottom edge sits flush with
          the bar itself. */}
      {visibility.verticalRails &&
        corners.map((c) => {
          let y = WIDTH_RAIL_BAR_TOP_MM
          const railZ = railZByKey[c.key as keyof typeof railZByKey]
          const railX = railXByKey[c.key as keyof typeof railXByKey]
          return (
            <Fragment key={`rail-${c.key}`}>
              {segments.map((len, i) => {
                const seg = railByLen[len as keyof typeof railByLen]
                const mesh = (
                  <RealMesh
                    key={i}
                    geometry={seg.geometry}
                    color={parts.verticalRails.color}
                    position={[railX, y, railZ]}
                    rotation={[0, c.railRotY, 0]}
                    scale={c.railMirror ? [-1, 1, 1] : undefined}
                  />
                )
                y += len * U_MM
                return mesh
              })}
            </Fragment>
          )
        })}

      {/* Side panels: same segment stacking, left/right only. Bottom edge is
          set 3mm below the bottom depth rails' top edge (depthRail.size.y —
          see the horizontal-depth-rails block below for that derivation), so
          the panel overlaps down into the rail rather than butting its
          bottom face.

          X is pushed out so the panel's outer face sits 1mm inside the rest
          of the assembly's outer face (widthRail.size.x / 2 — the same
          envelope edge the vertical/depth rails face-match to, see
          rightRailX/rightDepthRailX above), rather than the untested
          RACK_HALF_WIDTH_MM guess. Panel center is that target face minus
          its own measured half-width. */}
      {toggles.sidePanels &&
        visibility.sidePanels &&
        (
          [
            { side: 'right', sign: 1, rotY: 0 },
            { side: 'left', sign: -1, rotY: PI },
          ] as const
        ).map(({ side, sign, rotY }) => {
          let y = depthRail.size.y - SIDE_PANEL_DEPTH_RAIL_OVERLAP_MM
          return (
            <Fragment key={`panel-${side}`}>
              {segments.map((len, i) => {
                const seg = panelByLen[len as keyof typeof panelByLen]
                const outerFaceX = widthRail.size.x / 2 - SIDE_PANEL_OUTER_INSET_MM
                const x = sign * (outerFaceX - seg.size.x / 2)
                const mesh = (
                  <RealMesh
                    key={i}
                    geometry={seg.geometry}
                    color={parts.sidePanels.color}
                    position={[x, y, 0]}
                    rotation={[0, rotY, 0]}
                  />
                )
                y += len * U_MM
                return mesh
              })}
            </Fragment>
          )
        })}

      {/* Width rails: front/back x top/bottom. The top-front slot
          (z=-RACK_HALF_DEPTH_MM, still keyed 'front-top' from an earlier
          position swap) uses the heroEdge color; the other 3 use the
          dedicated widthRails color/visibility (not horizontalEdges, which
          is now depth-rails-only). Same geometry file reused across all 4 —
          no distinct hero/corner-bracket part exists.

          Top instances are flipped 180° about X, which mirrors the part
          around its pivot: the pivot (previously the part's bottom, at the
          post-facing main-bar edge) becomes the part's topmost point, and
          that same main-bar edge ends up WIDTH_RAIL_BAR_TOP_MM *below* the
          pivot. So to land that edge on the post top (totalHeight +
          WIDTH_RAIL_BAR_TOP_MM), the pivot itself goes one more
          WIDTH_RAIL_BAR_TOP_MM higher still. */}
      {(
        [
          {
            key: 'front-top',
            z: -RACK_HALF_DEPTH_MM,
            y: totalHeight + 2 * WIDTH_RAIL_BAR_TOP_MM,
            rotX: PI,
            rotY: 0,
            color: parts.widthRails.color,
            visible: visibility.widthRails,
          },
          {
            key: 'back-top',
            z: RACK_HALF_DEPTH_MM,
            y: totalHeight + 2 * WIDTH_RAIL_BAR_TOP_MM,
            rotX: PI,
            rotY: PI,
            color: parts.heroEdge.color,
            visible: visibility.heroEdge,
          },
          {
            key: 'front-bottom',
            z: RACK_HALF_DEPTH_MM,
            y: 0,
            rotX: 0,
            rotY: 0,
            color: parts.widthRails.color,
            visible: visibility.widthRails,
          },
          {
            key: 'back-bottom',
            z: -RACK_HALF_DEPTH_MM,
            y: 0,
            rotX: 0,
            rotY: PI,
            color: parts.widthRails.color,
            visible: visibility.widthRails,
          },
        ] as const
      )
        .filter((r) => r.visible)
        .map((r) => (
          <RealMesh
            key={r.key}
            geometry={widthRail.geometry}
            color={r.color}
            position={[0, r.y, r.z]}
            rotation={[r.rotX, r.rotY, 0]}
          />
        ))}

      {/* Horizontal depth rails: left/right x top/bottom.

          rotX is swapped between the top/bottom Y-slots per earlier
          correction (orientation pattern unchanged, just which slot gets
          which); rotY (left/right) is untouched.

          Top slot is now unflipped (rotX=0), so it's bottom-anchored like
          the bottom width rail: its pivot sits at its OWN bottom and the part
          extends upward by depthRail.size.y. To land its top face exactly on
          the top width rail's topmost point (totalHeight +
          2*WIDTH_RAIL_BAR_TOP_MM — see that block's comment for why), the
          pivot goes one depthRail.size.y below that point.

          Bottom slot is now flipped (rotX=PI), so — mirroring the width
          rail's flip logic — its pivot becomes the part's TOPmost point and
          it hangs down by depthRail.size.y. The bottom width rail's
          bottommost edge is its own pivot, i.e. y=0, so to land the depth
          rail's bottom face there, its pivot goes one depthRail.size.y
          above 0.

          Left/right rails: shifted so their outside face lines up with the
          width rail's corresponding edge — same width-rail-is-centered-at-
          x=0 logic as the vertical rail X fix, using the depth rail's own
          measured width instead of the vertical rail's. Left is the mirror
          of right, same as the vertical rails' leftRailX/rightRailX. */}
      {visibility.horizontalEdges &&
        (() => {
          const topWidthRailTopY = totalHeight + 2 * WIDTH_RAIL_BAR_TOP_MM
          const topDepthRailY = topWidthRailTopY - depthRail.size.y
          const bottomDepthRailY = depthRail.size.y
          return (
            [
              { key: 'top-right', x: rightDepthRailX, y: topDepthRailY, rotX: 0, rotY: PI },
              { key: 'top-left', x: leftDepthRailX, y: topDepthRailY, rotX: 0, rotY: 0 },
              { key: 'bottom-right', x: rightDepthRailX, y: bottomDepthRailY, rotX: PI, rotY: PI },
              { key: 'bottom-left', x: leftDepthRailX, y: bottomDepthRailY, rotX: PI, rotY: 0 },
            ] as const
          ).map((r) => (
            <RealMesh
              key={r.key}
              geometry={depthRail.geometry}
              color={parts.horizontalEdges.color}
              position={[r.x, r.y, 0]}
              rotation={[r.rotX, r.rotY, 0]}
            />
          ))
        })()}

      {/* Top / bottom panels: same flat part, flipped for the top. The top
          panel is flipped (rotX=PI), so — same as the top width/depth rail
          slots — its pivot becomes its own top face. Set 1mm below the
          highest rail edge (totalHeight + 2*WIDTH_RAIL_BAR_TOP_MM, the top
          width rail's topmost point, which the top depth rails are also
          face-matched to) so the panel sits recessed rather than flush.

          Bottom panel is unrotated, so its pivot is its own bottom face;
          the lowest rail edge is y=0 (both the bottom width rail and bottom
          depth rails are bottom-anchored there — see those blocks), so
          raising the pivot to BOTTOM_PANEL_INSET_MM lands it 1mm above it. */}
      {toggles.bottomPanel && visibility.bottomPanel && (
        <RealMesh
          geometry={topBottomPanel.geometry}
          color={parts.bottomPanel.color}
          position={[0, BOTTOM_PANEL_INSET_MM, 0]}
        />
      )}
      {toggles.topPanel && visibility.topPanel && (
        <RealMesh
          geometry={topBottomPanel.geometry}
          color={parts.topPanel.color}
          position={[0, totalHeight + 2 * WIDTH_RAIL_BAR_TOP_MM - TOP_PANEL_INSET_MM, 0]}
          rotation={[PI, 0, 0]}
        />
      )}

      {/* Feet: mirror the single "right front" foot across X (left/right) and
          Z (front/back). X uses the depth rail's own X (rightDepthRailX/
          leftDepthRailX), not the vertical rail's — same fix as the handles
          above. Z is centered on the bottom depth rail's actual front/back
          mounting hole (±DEPTH_RAIL_FOOT_HOLE_OFFSET_MM from its own center,
          measured from the mesh), not the vertical rail's corner Z. */}
      {toggles.feet &&
        visibility.feet &&
        corners.map((c) => (
          <RealMesh
            key={`foot-${c.key}`}
            geometry={foot.geometry}
            color={parts.feet.color}
            position={[
              c.x < 0 ? leftDepthRailX : rightDepthRailX,
              -FOOT_HEIGHT_MM,
              c.z < 0 ? -DEPTH_RAIL_FOOT_HOLE_OFFSET_MM : DEPTH_RAIL_FOOT_HOLE_OFFSET_MM,
            ]}
            scale={[c.x < 0 ? -1 : 1, 1, c.z < 0 ? -1 : 1]}
          />
        ))}

      {/* Handles: mirror the single "right" handle across X for the left
          side. Bottom-anchored (pivot = its own bottom face), so setting Y to
          the top depth rail's top face (totalHeight + 2*WIDTH_RAIL_BAR_TOP_MM
          — the top width rail's topmost point, which the top depth rail was
          aligned to) lands the handle's bottom face exactly there. X uses the
          depth rail's own X (rightDepthRailX/leftDepthRailX), not the
          vertical rail's — centering the handle on the rail it actually
          rests on, so their hole patterns line up. */}
      {toggles.handles && visibility.handles && (
        <Fragment>
          <RealMesh
            geometry={handle.geometry}
            color={parts.handles.color}
            position={[rightDepthRailX, totalHeight + 2 * WIDTH_RAIL_BAR_TOP_MM, 0]}
          />
          <RealMesh
            geometry={handle.geometry}
            color={parts.handles.color}
            position={[leftDepthRailX, totalHeight + 2 * WIDTH_RAIL_BAR_TOP_MM, 0]}
            scale={[-1, 1, 1]}
          />
        </Fragment>
      )}

      {/* Shelves: one real part per shelf, picked by its `shelfType` (each a
          fixed 1U or 2U model — see domain/models.ts SHELF_TYPE_FILES).
          Shelves are independently positioned via startU, so gaps and "no
          shelves at all" are just... nothing rendered there. No rotation —
          the trays are already correctly oriented. Z is shifted forward
          (shelfZ) so it extends past the front width rail's front edge by
          SHELF_OVERSHOOT_MM. Y (shelfY) lands the shelf's top flush with the
          top of its highest occupied row. */}
      {visibility.shelves &&
        shelves.map((shelf) => {
          const geo = shelfGeoByType[shelf.shelfType]
          const topRow = shelf.startU + shelf.u - 1
          return (
            <RealMesh
              key={`shelf-${shelf.id}`}
              geometry={geo.geometry}
              color={shelf.color}
              position={[0, shelfY(geo, topRow), shelfZ(geo)]}
            />
          )
        })}
    </group>
  )
}
