import { lazy, Suspense } from 'react'
import { usePath } from '@/lib/router'
import { V3_ROOT } from '@/v3/base'

// v3 (the keyring) lives on its own route with its own styles and scroll. In the deployed build
// it is the whole site, and the earlier versions aren't built at all.
const V3App = lazy(() => import('@/v3/V3App'))
// a constant at build time, so the deployed build drops the earlier versions entirely
const App = V3_ROOT ? null : lazy(() => import('./App'))

// old links to /v3/... land on the same page at the root
const { pathname } = window.location
if (V3_ROOT && (pathname === '/v3' || pathname.startsWith('/v3/'))) window.history.replaceState(null, '', pathname.slice(3) || '/')

export default function Root() {
  const path = usePath()
  if (!App || path === '/v3' || path.startsWith('/v3/'))
    return (
      <Suspense fallback={null}>
        <V3App />
      </Suspense>
    )
  return (
    <Suspense fallback={null}>
      <App />
    </Suspense>
  )
}
