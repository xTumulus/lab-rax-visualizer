import { PART_TYPES } from '../../domain/constants'
import { useBuildStore } from '../../store/use-build-store'
import { SizeControl } from '../controls/size-control'
import { ColorsSection } from '../controls/colors-section'
import { PartControl } from '../controls/part-control'
import { ShelfEditor } from '../controls/shelf-editor'
import { VisibilityToggle } from '../../ui/visibility-toggle'
import { CollapsibleSection } from '../../ui/collapsible-section'

/**
 * Single source of truth for the rack's control sections. Just the
 * `space-y-3` stack (+ optional footer) — no scroll container or padding, so
 * each host (desktop aside vs. mobile sheet) can own its own scroll/overflow
 * behavior.
 */
export function ControlsPanel({ footer }: { footer?: React.ReactNode }) {
  const partTypes = PART_TYPES.filter((p) => p !== 'shelves')
  const shelvesVisible = useBuildStore((s) => s.visibility.shelves)
  const toggleVisibility = useBuildStore((s) => s.toggleVisibility)

  return (
    <div className="space-y-3">
      <CollapsibleSection title="Size">
        <SizeControl />
      </CollapsibleSection>

      <CollapsibleSection title="Colors">
        <ColorsSection />
      </CollapsibleSection>

      <CollapsibleSection title="Parts" collapsible>
        <div className="space-y-2">
          {partTypes.map((part) => (
            <PartControl key={part} part={part} />
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Shelves"
        action={<VisibilityToggle visible={shelvesVisible} onToggle={() => toggleVisibility('shelves')} />}
      >
        <ShelfEditor />
      </CollapsibleSection>

      {footer}
    </div>
  )
}
