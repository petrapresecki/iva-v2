import { useState } from 'react'

export type HeroVariant = 'grid' | 'full'

const KEY = 'iva-hero-variant'

function initial(): HeroVariant {
  const param = new URLSearchParams(window.location.search).get('hero')
  if (param === 'grid' || param === 'full') return param
  try {
    return localStorage.getItem(KEY) === 'full' ? 'full' : 'grid'
  } catch {
    return 'grid'
  }
}

export function useHeroVariant() {
  const [variant, setVariant] = useState<HeroVariant>(initial)
  const set = (next: HeroVariant) => {
    setVariant(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Private mode: the choice just won't persist
    }
  }
  return [variant, set] as const
}
