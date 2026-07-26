import { useState } from 'react'
import { PART_TYPES } from '../../domain/constants'
import { useBuildStore } from '../../store/use-build-store'
import { SizeControl } from '../controls/size-control'
import { ColorsSection } from '../controls/colors-section'
import { PartControl } from '../controls/part-control'
import { ShelfEditor } from '../controls/shelf-editor'
import { VisibilityToggle } from '../../ui/visibility-toggle'

export function Sidebar() {
  const partTypes = PART_TYPES.filter((p) => p !== 'shelves')
  const shelvesVisible = useBuildStore((s) => s.visibility.shelves)
  const toggleVisibility = useBuildStore((s) => s.toggleVisibility)

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-panel">
      <div className="scroll-thin flex-1 space-y-3 overflow-y-auto p-3">
        <Section title="Size">
          <SizeControl />
        </Section>

        <Section title="Colors">
          <ColorsSection />
        </Section>

        <Section title="Parts" collapsible>
          <div className="space-y-2">
            {partTypes.map((part) => (
              <PartControl key={part} part={part} />
            ))}
          </div>
        </Section>

        <Section
          title="Shelves"
          action={
            <VisibilityToggle visible={shelvesVisible} onToggle={() => toggleVisibility('shelves')} />
          }
        >
          <ShelfEditor />
        </Section>
      </div>
    </aside>
  )
}

function Section({
  title,
  action,
  collapsible,
  children,
}: {
  title: string
  action?: React.ReactNode
  collapsible?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  const showChildren = !collapsible || open

  return (
    <section>
      <div className="mb-1.5 flex items-center justify-between px-1">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-white/40 hover:text-white/60"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={`transition-transform ${open ? 'rotate-90' : ''}`}
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
            {title}
          </button>
        ) : (
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{title}</h2>
        )}
        {action}
      </div>
      {showChildren && children}
    </section>
  )
}
