import { MAX_U, MIN_U } from '../../domain/constants'
import { useBuildStore } from '../../store/use-build-store'

export function SizeControl() {
  const rackU = useBuildStore((s) => s.rackU)
  const setRackU = useBuildStore((s) => s.setRackU)

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
    </div>
  )
}
