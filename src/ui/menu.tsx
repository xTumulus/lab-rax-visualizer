import { useEffect, useId, useRef, useState } from 'react'

export interface MenuItem {
  id: string
  label: string
  onSelect: () => void
  emphasis?: boolean
}

interface Props {
  items: MenuItem[]
  label?: string
}

/** Generic overflow-menu primitive: a trigger button opening a `role="menu"` panel. */
export function Menu({ items, label = 'More actions' }: Props) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const panelId = useId()

  useEffect(() => {
    if (open) itemRefs.current[0]?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node
      // trigger handles its own toggle via onClick — closing here too would
      // cause pointerdown-close then click-reopen
      if (triggerRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const focusIndex = (i: number) => {
    const n = items.length
    itemRefs.current[((i % n) + n) % n]?.focus()
  }

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    const current = itemRefs.current.findIndex((el) => el === document.activeElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusIndex(current + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusIndex(current - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      focusIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      focusIndex(items.length - 1)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="grid h-11 w-11 place-items-center rounded-md text-white/70 hover:bg-white/10"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-label={label}
          onKeyDown={onPanelKeyDown}
          className="absolute right-0 top-full z-50 mt-1 min-w-44 rounded-md border border-white/10 bg-panelraised p-1 shadow-xl"
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                item.onSelect()
                setOpen(false)
                triggerRef.current?.focus()
              }}
              className={`block w-full rounded px-3 py-2.5 text-left text-xs font-medium hover:bg-white/10 ${
                item.emphasis ? 'text-accent' : 'text-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
