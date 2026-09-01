import { useRef, useState } from 'react'
import { MAX_U, MIN_U } from '../../domain/constants'
import { totalPartCount } from '../../domain/parts-list'
import { useBuildStore } from '../../store/use-build-store'
import { AdPanel } from './ad-panel'
import { ControlsPanel } from './controls-panel'

type Snap = 'peek' | 'expanded'

/** 28px drag handle + 48px peek row. */
const PEEK_PX = 76
/** px/ms — a flick past this speed snaps in the direction of travel
 * regardless of how far the sheet has moved. */
const FLICK_VELOCITY = 0.5
const TAP_MAX_MS = 250
const TAP_MAX_PX = 6

interface DragState {
  startY: number
  startOffset: number
  startT: number
  peekOffset: number
  samples: { y: number; t: number }[]
  moved: boolean
}

/**
 * Mobile controls sheet, overlaying the canvas. Fixed height + `translateY`,
 * never an animated height — animating height would trigger an r3f canvas
 * resize (and a Bounds refit) on every drag frame. State is local: `snap`
 * has exactly one reader, `offset` is a 60fps drag value that has no
 * business in the shared store, and drag samples live in a ref since they're
 * never rendered. None of it persists — reopening the app with the sheet
 * pre-expanded would hide the model behind a sheet the user doesn't
 * remember opening.
 */
export function ControlsSheet() {
  const rackU = useBuildStore((s) => s.rackU)
  const setRackU = useBuildStore((s) => s.setRackU)
  const parts = useBuildStore((s) => s.parts)
  const toggles = useBuildStore((s) => s.toggles)
  const shelves = useBuildStore((s) => s.shelves)
  const palette = useBuildStore((s) => s.palette)
  const count = totalPartCount({ rackU, parts, toggles, shelves, palette })

  const [snap, setSnap] = useState<Snap>('peek')
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState(0)

  const sheetRef = useRef<HTMLElement>(null)
  const dragRef = useRef<DragState | null>(null)

  const toggleSnap = () => setSnap((s) => (s === 'peek' ? 'expanded' : 'peek'))

  const onHandlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const sheetHeight = sheetRef.current?.getBoundingClientRect().height ?? 0
    const peekOffset = Math.max(sheetHeight - PEEK_PX, 0)
    const startOffset = snap === 'peek' ? peekOffset : 0
    dragRef.current = {
      startY: e.clientY,
      startOffset,
      startT: e.timeStamp,
      peekOffset,
      samples: [{ y: e.clientY, t: e.timeStamp }],
      moved: false,
    }
    setDragging(true)
    setOffset(startOffset)
  }

  const onHandlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const dy = e.clientY - drag.startY
    if (Math.abs(dy) > TAP_MAX_PX) drag.moved = true
    setOffset(Math.min(Math.max(drag.startOffset + dy, 0), drag.peekOffset))
    drag.samples.push({ y: e.clientY, t: e.timeStamp })
    if (drag.samples.length > 2) drag.samples.shift()
  }

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag) return
    e.currentTarget.releasePointerCapture(e.pointerId)

    const isTap = !drag.moved && e.timeStamp - drag.startT < TAP_MAX_MS
    if (isTap) {
      toggleSnap()
    } else {
      const [a, b] = drag.samples
      const dt = a && b ? b.t - a.t : 0
      const velocity = dt > 0 ? (b.y - a.y) / dt : 0
      if (Math.abs(velocity) > FLICK_VELOCITY) {
        setSnap(velocity > 0 ? 'peek' : 'expanded')
      } else {
        setSnap(offset > drag.peekOffset / 2 ? 'peek' : 'expanded')
      }
    }

    dragRef.current = null
    setDragging(false)
  }

  const onHandleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleSnap()
    } else if (e.key === 'Escape' && snap === 'expanded') {
      setSnap('peek')
    }
  }

  const translateY = dragging ? `${offset}px` : snap === 'peek' ? `calc(100% - ${PEEK_PX}px)` : '0px'

  return (
    <section
      id="controls-sheet"
      ref={sheetRef}
      className={`absolute inset-x-0 bottom-0 z-20 flex h-[78dvh] flex-col rounded-t-2xl border-t border-white/10 bg-panel/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_rgba(0,0,0,0.5)] backdrop-blur md:hidden ${
        dragging ? 'transition-none' : 'transition-transform duration-200 ease-out'
      }`}
      style={{ transform: `translateY(${translateY})` }}
    >
      <button
        type="button"
        aria-expanded={snap === 'expanded'}
        aria-controls="controls-sheet"
        aria-label={snap === 'expanded' ? 'Collapse controls' : 'Expand controls'}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onHandleKeyDown}
        className="flex h-7 touch-none select-none items-center justify-center"
      >
        <span className="h-1 w-10 rounded-full bg-white/25" />
      </button>

      {snap === 'peek' && (
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRackU(Math.max(MIN_U, rackU - 1))}
              className="grid h-11 w-11 place-items-center rounded-md bg-white/5 text-lg text-white/80 hover:bg-white/10"
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-semibold text-white/80">{rackU}U</span>
            <button
              type="button"
              onClick={() => setRackU(Math.min(MAX_U, rackU + 1))}
              className="grid h-11 w-11 place-items-center rounded-md bg-white/5 text-lg text-white/80 hover:bg-white/10"
            >
              +
            </button>
          </div>
          <span className="text-xs text-white/50">{count} parts</span>
        </div>
      )}

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
        <ControlsPanel footer={<AdPanel variant="inline" />} />
      </div>
    </section>
  )
}
