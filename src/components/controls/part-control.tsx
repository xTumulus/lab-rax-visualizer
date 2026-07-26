import { PART_LABELS, isOptional } from '../../domain/constants'
import type { OptionalPart, PartType } from '../../domain/types'
import { useBuildStore } from '../../store/use-build-store'
import { PalettePicker } from '../../ui/palette-picker'
import { VisibilityToggle } from '../../ui/visibility-toggle'

// Pattern/solid controls are disabled for now: RackReal renders real STL
// parts with a flat color only, so there's no pattern preview to drive.
export function PartControl({ part }: { part: PartType }) {
  const style = useBuildStore((s) => s.parts[part])
  const setPartStyle = useBuildStore((s) => s.setPartStyle)
  const palette = useBuildStore((s) => s.palette)
  const optional = isOptional(part)
  const enabled = useBuildStore((s) => (optional ? s.toggles[part as OptionalPart] : true))
  const toggle = useBuildStore((s) => s.toggle)
  const visible = useBuildStore((s) => s.visibility[part])
  const toggleVisibility = useBuildStore((s) => s.toggleVisibility)

  return (
    <div
      className={`rounded-lg border border-white/5 bg-black/20 p-3 transition-opacity ${
        enabled ? '' : 'opacity-40'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {optional && (
            <input
              type="checkbox"
              checked={enabled}
              onChange={() => toggle(part as OptionalPart)}
              className="accent-accent"
              title={enabled ? 'Included' : 'Excluded'}
            />
          )}
          <span className="text-sm font-medium">{PART_LABELS[part]}</span>
        </div>
        <div className="flex items-center gap-1">
          <VisibilityToggle visible={visible} onToggle={() => toggleVisibility(part)} />
          <PalettePicker
            color={style.color}
            palette={palette}
            onSelect={(color) => setPartStyle(part, { color })}
          />
        </div>
      </div>
    </div>
  )
}
