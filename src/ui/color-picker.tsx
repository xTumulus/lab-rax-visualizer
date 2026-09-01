import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { HexColorPicker } from 'react-colorful'

interface Props {
  color: string
  onChange: (c: string) => void
  title?: string
  /** Which edge of the popover aligns with the swatch button. Default 'right'
   * suits swatches at the right end of a row; use 'left' for swatches laid
   * out left-to-right (e.g. a palette row) so the popover doesn't run off
   * the left side of the sidebar for non-rightmost swatches. */
  align?: 'left' | 'right'
}

// Approximate rendered size (react-colorful's fixed 200px width + p-3
// padding + the hex input row) — used to clamp the popover on-screen.
const PANEL_W = 224
const PANEL_H = 260

/**
 * Swatch button that opens a popover hex color picker.
 *
 * Rendered via a portal into document.body, positioned from the button's
 * live screen coordinates. The sidebar's scroll container clips overflow on
 * both axes (a side effect of `overflow-y-auto`), so a popover positioned
 * relative to the button would get clipped — or, for swatches near the
 * sidebar edge, spill into and render underneath the 3D viewport. A portal
 * sidesteps both: it's no longer a descendant of the clipping container, and
 * being appended at the end of <body> it naturally paints above the canvas.
 */
export function ColorPicker({ color, onChange, title, align = 'right' }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const measure = useCallback(() => {
    const btn = buttonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()

    const desiredLeft = align === 'left' ? rect.left : rect.right - PANEL_W
    const left = Math.min(Math.max(desiredLeft, 8), window.innerWidth - PANEL_W - 8)

    let top = rect.bottom + 8
    if (top + PANEL_H > window.innerHeight) {
      // flip above the button when there's no room below
      top = rect.top - PANEL_H - 8
    }

    setPos({ top, left })
  }, [align])

  useLayoutEffect(() => {
    if (open) measure()
  }, [open, measure])

  useEffect(() => {
    if (!open) return
    // scroll uses capture:true — the sidebar's own scroll container doesn't
    // bubble its scroll event, so a non-capturing listener would never fire
    // and the portalled popover would strand at its original coordinates
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open, measure])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (buttonRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        title={title ?? color}
        onClick={() => setOpen((v) => !v)}
        className="h-7 w-7 rounded border border-white/20 shadow-inner pointer-coarse:h-11 pointer-coarse:w-11"
        style={{ background: color }}
      />
      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[200] rounded-lg bg-panelraised p-3 shadow-xl ring-1 ring-black/40"
            style={{ top: pos.top, left: pos.left }}
          >
            <HexColorPicker color={color} onChange={onChange} />
            <div className="mt-2 flex items-center rounded bg-black/40 px-2 py-1 text-xs uppercase tracking-wide text-white">
              <span className="text-white/40">#</span>
              <input
                className="w-full bg-transparent outline-none"
                value={color.replace(/^#/, '')}
                onChange={(e) => onChange('#' + e.target.value.replace(/#/g, ''))}
                spellCheck={false}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
