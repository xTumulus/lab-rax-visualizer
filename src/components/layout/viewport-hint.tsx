import { useCoarsePointer } from '../../ui/use-coarse-pointer'

export function ViewportHint({ className }: { className?: string }) {
  const coarse = useCoarsePointer()

  return (
    <div className={`pointer-events-none rounded bg-black/40 px-2 py-1 text-[10px] text-white/40 ${className ?? ''}`}>
      {coarse
        ? 'drag to orbit · pinch to zoom · two-finger drag to pan'
        : 'drag to orbit · scroll to zoom · right-drag to pan'}
    </div>
  )
}
