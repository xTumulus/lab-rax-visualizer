import { MAX_U, MIN_U } from '../../domain/constants'
import { EXTENSION_U, MAX_SEGMENT_U, resolveLayout } from '../../domain/layout'
import { overallSizeMm } from '../../domain/models'
import type { JoinMode } from '../../domain/types'
import { useBuildStore } from '../../store/use-build-store'

const NBSP = ' '
const SECTION_NAMES = ['Bottom section', 'Middle section']

const JOIN_OPTIONS: { id: JoinMode; label: string }[] = [
  { id: 'joiners', label: 'Joiners' },
  { id: 'extensions', label: 'Extension modules' },
]

/** "282 w x 350 h x 235 d" with non-breaking spaces so it only wraps between groups. */
function sizeText(w: number, h: number, d: number, unit: string, fmt: (n: number) => string) {
  return [`${fmt(w)}${unit}w`, `${fmt(h)}${unit}h`, `${fmt(d)}${unit}d`].join(`${NBSP}x${NBSP}`)
}

export function SizeControl() {
  const rackU = useBuildStore((s) => s.rackU)
  const setRackU = useBuildStore((s) => s.setRackU)
  const withFeet = useBuildStore((s) => s.toggles.feet)
  const withHandles = useBuildStore((s) => s.toggles.handles)
  const joinMode = useBuildStore((s) => s.joinMode)
  const setJoinMode = useBuildStore((s) => s.setJoinMode)
  const splitPrefs = useBuildStore((s) => s.splits)
  const setSplit = useBuildStore((s) => s.setSplit)

  const size = overallSizeMm(rackU, withFeet, withHandles)
  const metric = sizeText(size.width, size.height, size.depth, '', (n) => String(Math.round(n)))
  const imperial = `(${sizeText(size.width, size.height, size.depth, '"', (n) => (n / 25.4).toFixed(1))})`

  const layout = resolveLayout(rackU, joinMode, splitPrefs)
  const splittable = layout.splits > 0
  const topU = layout.segments[layout.segments.length - 1]

  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Rack size</span>
        <span className="rounded bg-accent/20 px-2 py-0.5 text-sm font-semibold text-accent">
          {rackU}U
        </span>
      </div>
      <input
        type="range"
        min={MIN_U}
        max={MAX_U}
        step={1}
        value={rackU}
        onChange={(e) => setRackU(Number(e.target.value))}
        className="w-full accent-accent pointer-coarse:py-2"
      />
      <div className="mt-1 flex justify-between text-[10px] text-white/40">
        <span>{MIN_U}U</span>
        <span>{MAX_U}U</span>
      </div>
      <p className="mt-2 border-t border-white/5 pt-2 text-xs">
        <span className="text-white/50">Overall Size:</span>{' '}
        <span className="font-semibold text-white/80">{metric}</span>{' '}
        <span className="text-white/60">{imperial}</span>
      </p>

      <div className="mt-3 border-t border-white/5 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Rail sections</span>
          {!splittable && (
            <span className="text-[10px] text-white/40">Racks up to {MAX_SEGMENT_U}U use one rail</span>
          )}
        </div>

        <div role="radiogroup" aria-label="Join sections with" className="mb-3 grid grid-cols-2 gap-1">
          {JOIN_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={joinMode === o.id}
              disabled={!splittable}
              onClick={() => setJoinMode(o.id)}
              className={`rounded px-2 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                joinMode === o.id ? 'bg-accent/25 font-semibold text-accent' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {(splittable ? layout.bounds : [{ min: 0, max: MAX_SEGMENT_U, value: Math.min(rackU, MAX_SEGMENT_U) }]).map(
          (b, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor={`split-${i}`} className="text-white/60">
                  {SECTION_NAMES[i]}
                </label>
                <span className="font-semibold text-white/80">{b.value}U</span>
              </div>
              <input
                id={`split-${i}`}
                type="range"
                min={b.min}
                max={b.max}
                step={1}
                value={b.value}
                disabled={!splittable || b.min === b.max}
                onChange={(e) => setSplit(i as 0 | 1, Number(e.target.value))}
                className="w-full accent-accent disabled:opacity-40 pointer-coarse:py-2"
              />
            </div>
          ),
        )}

        {splittable && (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Top section</span>
              <span className="font-semibold text-white/80">{topU}U</span>
            </div>
            {joinMode === 'extensions' && (
              <p className="mt-1 text-[11px] text-white/50">
                {layout.splits * EXTENSION_U}U of extension modules ({layout.splits * 2} total)
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
