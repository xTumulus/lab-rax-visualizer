import { useEffect, useState } from 'react'

/**
 * Tracks `(pointer: coarse)` live, not just on mount — Chrome device-mode and
 * hybrid laptop/tablet mode switches flip this at runtime, and a stale value
 * would silently disable every coarse-pointer behavior.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  )

  useEffect(() => {
    const mql = window.matchMedia('(pointer: coarse)')
    const onChange = () => setCoarse(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return coarse
}
