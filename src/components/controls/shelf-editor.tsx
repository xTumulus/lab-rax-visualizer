import { SHELF_TYPES } from '../../domain/constants'
import { findFirstGap, maxDownGrowth, sumU } from '../../domain/shelves'
import type { ShelfType } from '../../domain/types'
import { useBuildStore } from '../../store/use-build-store'
import { PalettePicker } from '../../ui/palette-picker'

export function ShelfEditor() {
  const rackU = useBuildStore((s) => s.rackU)
  const palette = useBuildStore((s) => s.palette)
  const shelves = useBuildStore((s) => s.shelves)
  const setShelfType = useBuildStore((s) => s.setShelfType)
  const setShelfStyle = useBuildStore((s) => s.setShelfStyle)
  const addShelf = useBuildStore((s) => s.addShelf)
  const removeShelf = useBuildStore((s) => s.removeShelf)

  const used = sumU(shelves)
  // "Full" means no gap anywhere fits even a 1U shelf — shelves don't have
  // to be contiguous, so this isn't just `used >= rackU`.
  const full = findFirstGap(shelves, rackU, 1) === null

  // Display top-to-bottom, matching the rack itself, regardless of the
  // order shelves were added in.
  const sorted = [...shelves].sort((a, b) => b.startU - a.startU)

  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Shelves</span>
        <span className="text-xs text-white/50">
          {used}U / {rackU}U
        </span>
      </div>

      <div className="scroll-thin max-h-72 space-y-2 overflow-y-auto pr-1 pointer-coarse:max-h-none">
        {sorted.length === 0 && (
          <p className="rounded bg-black/20 p-2 text-center text-[11px] text-white/40">
            No shelves — add one below.
          </p>
        )}
        {sorted.map((shelf) => {
          const topRow = shelf.startU + shelf.u - 1
          const cap = Math.max(shelf.u, maxDownGrowth(shelves, shelf.id, topRow))
          const options = SHELF_TYPES.filter((t) => t.u <= cap)
          // Row numbers count down from the top of the rack (1 = topmost),
          // independent of `startU`'s bottom-up indexing.
          const topRowNum = rackU - topRow
          const bottomRowNum = rackU - shelf.startU
          const rowLabel = shelf.u === 1 ? `Row ${topRowNum}` : `Rows ${topRowNum}-${bottomRowNum}`
          return (
            <div key={shelf.id} className="flex items-center gap-2 rounded bg-black/30 p-2">
              <span className="w-14 text-[10px] text-white/40">{rowLabel}</span>
              <select
                value={shelf.shelfType}
                onChange={(e) => setShelfType(shelf.id, e.target.value as ShelfType)}
                className="h-7 rounded bg-black/40 px-1 text-xs text-white outline-none ring-1 ring-white/10 pointer-coarse:h-11"
              >
                {options.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>

              <div className="ml-auto flex items-center gap-1">
                <PalettePicker
                  color={shelf.color}
                  palette={palette}
                  onSelect={(color) => setShelfStyle(shelf.id, { color })}
                />
                <button
                  type="button"
                  onClick={() => removeShelf(shelf.id)}
                  className="grid rounded px-1.5 text-white/40 hover:bg-red-500/20 hover:text-red-300 pointer-coarse:h-11 pointer-coarse:w-11 pointer-coarse:place-items-center"
                  title="Remove shelf"
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={addShelf}
          disabled={full}
          className="flex-1 rounded bg-accent/20 px-2 py-1.5 text-xs font-medium text-accent hover:bg-accent/30 disabled:opacity-40 pointer-coarse:py-3"
        >
          + Add shelf
        </button>
      </div>
      {full && (
        <p className="mt-1 text-[10px] text-white/40">
          No room left — remove or shrink a shelf to add another.
        </p>
      )}
    </div>
  )
}
