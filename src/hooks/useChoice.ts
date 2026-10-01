import { useState } from 'react'

export const HERO_VARIANTS = ['grid', 'full'] as const
export const WORK_VARIANTS = ['rows', 'index', 'strips'] as const

export type HeroVariant = (typeof HERO_VARIANTS)[number]
export type WorkVariant = (typeof WORK_VARIANTS)[number]

/**
 * A design choice that can be set with a URL param (e.g. ?work=index) and is
 * remembered in localStorage while comparing directions.
 */
export function useChoice<T extends string>(param: string, options: readonly T[], fallback: T) {
  const key = `iva-${param}-variant`
  const [value, setValue] = useState<T>(() => {
    const fromUrl = new URLSearchParams(window.location.search).get(param)
    if (options.includes(fromUrl as T)) return fromUrl as T
    try {
      const stored = localStorage.getItem(key)
      return options.includes(stored as T) ? (stored as T) : fallback
    } catch {
      return fallback
    }
  })

  const set = (next: T) => {
    setValue(next)
    try {
      localStorage.setItem(key, next)
    } catch {
      // Private mode: the choice just won't persist
    }
  }
  return [value, set] as const
}
