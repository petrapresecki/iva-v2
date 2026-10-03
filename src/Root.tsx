import { lazy, Suspense } from 'react'
import { usePath } from '@/lib/router'
import App from './App'

// v3 (the keyring) lives on its own route with its own styles and scroll
const V3App = lazy(() => import('@/v3/V3App'))

export default function Root() {
  const path = usePath()
  if (path === '/v3' || path.startsWith('/v3/'))
    return (
      <Suspense fallback={null}>
        <V3App />
      </Suspense>
    )
  return <App />
}
