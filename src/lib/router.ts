import { useSyncExternalStore } from 'react'

// Tiny history router: the site only has /, /about and /work/:id

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener('popstate', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('popstate', callback)
  }
}

export function navigate(path: string, { replace = false } = {}) {
  if (path === window.location.pathname) return
  const state = { fromApp: true }
  if (replace) window.history.replaceState(state, '', path)
  else window.history.pushState(state, '', path)
  listeners.forEach(listener => listener())
}

/** Go back if we navigated here inside the app, otherwise go to `fallback`. */
export function back(fallback = '/') {
  if (window.history.state?.fromApp) window.history.back()
  else navigate(fallback, { replace: true })
}

export function usePath() {
  return useSyncExternalStore(subscribe, () => window.location.pathname)
}

export type Route = { page: 'home'; projectId?: string } | { page: 'about' }

export function parseRoute(path: string): Route {
  if (path.startsWith('/about')) return { page: 'about' }
  const work = path.match(/^\/work\/([^/]+)/)
  return { page: 'home', projectId: work?.[1] }
}
