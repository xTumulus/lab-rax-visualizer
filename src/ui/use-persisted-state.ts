import { useState } from 'react'

/**
 * A boolean backed by localStorage under `key`, for view-only UI state that
 * shouldn't live in the zustand build store (e.g. it must never leak into
 * share URLs or exports). Reads/writes are wrapped in try/catch — Safari
 * private mode throws on both.
 */
export function usePersistedBoolean(key: string, defaultValue: boolean): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored === null ? defaultValue : stored === 'true'
    } catch {
      return defaultValue
    }
  })

  const set = (v: boolean) => {
    setValue(v)
    try {
      localStorage.setItem(key, String(v))
    } catch {
      // localStorage unavailable (e.g. Safari private mode) — in-memory only
    }
  }

  return [value, set]
}
