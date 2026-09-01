import { useId, useState } from 'react'

interface Props {
  title: string
  action?: React.ReactNode
  collapsible?: boolean
  children: React.ReactNode
  /** Controlled variant, e.g. for state persisted outside this component
   * (see the support panel). Omit both to keep the section's own
   * uncontrolled state, defaulting to open. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CollapsibleSection({ title, action, collapsible, children, open: openProp, onOpenChange }: Props) {
  const [openState, setOpenState] = useState(true)
  const open = openProp ?? openState
  const setOpen = onOpenChange ?? setOpenState
  const showChildren = !collapsible || open
  const bodyId = useId()

  return (
    <section>
      <div className="mb-1.5 flex items-center justify-between px-1">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={bodyId}
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
      {showChildren && <div id={bodyId}>{children}</div>}
    </section>
  )
}
