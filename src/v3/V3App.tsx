import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { initLenis, destroyLenis, getLenis } from '@/lib/lenis'
import { back, navigate, usePath } from '@/lib/router'
import PixelCursor from '@/components/kit/pixel-cursor/PixelCursor'
import { ABOUT_BG, HOME_BG, about, getProject, projects, showreel, type V3Project } from './content'
import { AboutPage, ProjectPage } from './pages'
import { Marquee, Print } from './ui'
import './v3.css'

const Keyring3D = lazy(() => import('./Keyring3D'))

const FONTS = 'https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@50..150,100..900&family=Unbounded:wght@400..900&family=DM+Mono:wght@400;500&display=swap'

type Route = { page: 'home' } | { page: 'work'; id: string } | { page: 'about' }

function parseV3(path: string): Route {
  if (path.startsWith('/v3/about')) return { page: 'about' }
  const work = path.match(/^\/v3\/work\/([^/]+)/)
  if (work && getProject(work[1])) return { page: 'work', id: work[1] }
  return { page: 'home' }
}

type Origin = { x: number; y: number }
const centre = (): Origin => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
// Checked once: every getContext() call creates a WebGL context, and browsers drop the
// oldest (the keyring's) once there are too many
const HAS_WEBGL = (() => {
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
})()

export default function V3App() {
  const route = parseV3(usePath())
  const project = route.page === 'work' ? getProject(route.id) : undefined
  const [hovered, setHovered] = useState<V3Project | null>(null)
  const origin = useRef<Origin | null>(null)

  // Fonts, page colour and smooth scroll belong to this version only
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONTS
    document.head.append(link)
    const bg = document.body.style.background
    document.body.style.background = HOME_BG
    initLenis()
    return () => {
      link.remove()
      document.body.style.background = bg
      destroyLenis()
    }
  }, [])

  const overlay = route.page === 'about' ? { key: 'about', color: ABOUT_BG } : project ? { key: project.id, color: project.bg } : null

  useEffect(() => {
    const lenis = getLenis()
    if (overlay) lenis?.stop()
    else lenis?.start()
  }, [overlay?.key]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && route.page !== 'home' && back('/v3')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [route.page])

  const takeOrigin = () => {
    const o = origin.current ?? centre()
    origin.current = null
    return o
  }

  const go = (path: string, e?: React.MouseEvent) => {
    origin.current = e ? { x: e.clientX, y: e.clientY } : centre()
    navigate(path)
  }
  const close = () => back('/v3')

  return (
    <div className="v3">
      <div className="v3-grain" aria-hidden />
      <PixelCursor interactive="a, button, [role='button'], [data-charm]" />

      <header className="v3-header v3-label">
        <button className="v3-pill v3-pill--ink" onClick={e => (route.page === 'home' ? getLenis()?.scrollTo(0) : go('/v3', e))}>
          IVA PRESEČKI
        </button>
        <nav className="v3-nav">
          <button className="v3-pill" aria-current={route.page !== 'about' ? 'page' : undefined} onClick={() => (route.page === 'home' ? getLenis()?.scrollTo(0) : close())}>
            PORTFOLIO
          </button>
          <button className="v3-pill" aria-current={route.page === 'about' ? 'page' : undefined} onClick={e => go('/v3/about', e)}>
            ABOUT
          </button>
        </nav>
      </header>

      <main>
        <section className="v3-stage" style={{ backgroundColor: hovered?.bg ?? HOME_BG }}>
          <Marquee text={`${hovered ? hovered.title : 'PROJECTS'} ✺ `} className="v3-stage__marquee" />
          {HAS_WEBGL ? (
            <Suspense fallback={null}>
              <Keyring3D
                detached={project?.id}
                onHover={setHovered}
                onSnap={(p, x, y) => {
                  setHovered(null)
                  origin.current = { x, y }
                  navigate(`/v3/work/${p.id}`)
                }}
              />
            </Suspense>
          ) : (
            <ul className="v3-fallback">
              {projects.map(p => (
                <li key={p.id}>
                  <button className="v3-pill" onClick={e => go(`/v3/work/${p.id}`, e)}>
                    {p.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="v3-stage__hint v3-label v3-pill">GRAB A CHARM · PULL IT OFF THE RING</p>
          {hovered && (
            <div className="v3-stage__info v3-label" key={hovered.id}>
              <span>{hovered.n} / 04</span>
              <Print text={hovered.category} delay={60} />
              <Print text={String(hovered.year)} delay={200} />
            </div>
          )}
        </section>

        <section className="v3-reel">
          <div className="v3-frame v3-reel__frame">
            <span className="v3-tape v3-tape--tl" />
            <video src={showreel} autoPlay muted loop playsInline />
            <span className="v3-tape v3-tape--br" />
          </div>
          <div className="v3-contact">
            <span>Contact</span>
            <a href={`mailto:${about.email}`}>{about.email}</a>
          </div>
        </section>
      </main>

      <Flood target={overlay} takeOrigin={takeOrigin}>
        {key =>
          key === 'about' ? (
            <AboutPage onClose={close} />
          ) : (
            <ProjectPage key={key} project={getProject(key)!} onClose={close} onGo={(path, e) => go(path, e)} />
          )
        }
      </Flood>
    </div>
  )
}

type Target = { key: string; color: string } | null

/**
 * A circle of flat colour that floods out from where you clicked (or where the charm
 * snapped off) and holds the project or about page; closing shrinks it back.
 */
function Flood({ target, takeOrigin, children }: { target: Target; takeOrigin: () => Origin; children: (key: string) => React.ReactNode }) {
  const el = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const from = useRef<Origin>(centre())
  const [under, setUnder] = useState<string | null>(null)

  // Keep showing the last page while the flood closes
  const [closing, setClosing] = useState<Target>(null)
  const [prev, setPrev] = useState<Target>(target)
  if (target?.key !== prev?.key) {
    setPrev(target)
    if (!target && prev) setClosing(prev)
    if (target && prev) setUnder(prev.color)
    if (target) setClosing(null)
  }
  const shown = target ?? closing

  useLayoutEffect(() => {
    const node = el.current
    if (!node || !target) return
    const o = takeOrigin()
    from.current = o
    if (scroller.current) scroller.current.scrollTop = 0
    const r = Math.hypot(Math.max(o.x, window.innerWidth - o.x), Math.max(o.y, window.innerHeight - o.y))
    if (prefersReducedMotion()) {
      gsap.set(node, { clipPath: 'none' })
      gsap.delayedCall(0, () => setUnder(null))
      return
    }
    const tween = gsap.fromTo(node, { clipPath: `circle(0px at ${o.x}px ${o.y}px)` }, { clipPath: `circle(${r}px at ${o.x}px ${o.y}px)`, duration: 0.85, ease: 'expo.out', onComplete: () => setUnder(null) })
    return () => void tween.kill()
  }, [target?.key]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const node = el.current
    if (!node || !closing) return
    const o = from.current
    if (prefersReducedMotion()) {
      gsap.delayedCall(0, () => setClosing(null))
      return
    }
    const tween = gsap.to(node, { clipPath: `circle(0px at ${o.x}px ${o.y}px)`, duration: 0.6, ease: 'expo.inOut', onComplete: () => setClosing(null) })
    return () => void tween.kill()
  }, [closing])

  if (!shown) return null
  return (
    <>
      {under && <div className="v3-flood v3-flood--under" style={{ background: under }} />}
      <div ref={el} className="v3-flood" style={{ background: shown.color }}>
        <div ref={scroller} className="v3-flood__scroll" data-lenis-prevent>
          {children(shown.key)}
        </div>
      </div>
    </>
  )
}
