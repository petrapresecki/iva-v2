import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { navigate, usePath } from '@/lib/router'
import PixelCursor from '@/components/kit/pixel-cursor/PixelCursor'
import { ABOUT_BG, HOME_BG, about, getProject, projects, type V3Project } from './content'
import { AboutPage, ProjectPage } from './pages'
import { Print } from './ui'
import cursor from './cursor-bw.svg'
import cursorHover from './cursor-hover-bw.svg'
import { V3, V3_HOME } from './base'
import './v3.css'

const Keyring3D = lazy(() => import('./Keyring3D'))

const FONTS = 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Archivo:wdth,wght@62..125,100..900&family=Inter+Tight:wght@500&display=swap'

type Route = { page: 'home' } | { page: 'work'; id: string } | { page: 'about' }

function parseV3(path: string): Route {
  if (path.startsWith(`${V3}/about`)) return { page: 'about' }
  const work = path.slice(V3.length).match(/^\/work\/([^/]+)/)
  if (work && getProject(work[1])) return { page: 'work', id: work[1] }
  return { page: 'home' }
}

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

  // Fonts and page colour belong to this version only
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONTS
    document.head.append(link)
    const bg = document.body.style.background
    const overscroll = document.documentElement.style.overscrollBehavior
    document.body.style.background = HOME_BG
    document.documentElement.style.overscrollBehavior = 'none' // pulling a charm down mustn't reload the page
    return () => {
      link.remove()
      document.body.style.background = bg
      document.documentElement.style.overscrollBehavior = overscroll
    }
  }, [])

  const overlay: Target = route.page === 'about' ? { key: 'about', color: ABOUT_BG } : project ? { key: project.id, color: project.bg } : null
  // the header takes the ink of whatever page it sits on
  const headerInk = project && route.page === 'work' ? project.ink : 'var(--ink)'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && route.page !== 'home' && navigate(V3_HOME)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [route.page])

  const go = (path: string) => navigate(path)
  // Straight home, not history.back(): after previous/next that would land on another project
  const close = () => navigate(V3_HOME)

  return (
    <div className="v3">
      <PixelCursor src={cursor} hoverSrc={cursorHover} interactive="a, button, [role='button'], [data-charm]" />

      <header className="v3-header v3-label" style={{ color: headerInk }}>
        <button className="v3-header__name" onClick={() => route.page !== 'home' && close()}>
          IVA PRESEČKI
        </button>
        <span className="v3-header__col v3-hide-sm">SERVICES</span>
        <span className="v3-header__col v3-header__services v3-hide-sm">
          BRANDING, VISUAL IDENTITY, PACKAGING,
          <br />
          EDITORIAL, 3D, ANIMATION
        </span>
        <span className="v3-header__col v3-header__based v3-hide-sm">BASED IN ZAGREB</span>
        <nav className="v3-nav">
          {route.page === 'home' ? (
            <button onClick={() => go(`${V3}/about`)}>INFO</button>
          ) : (
            <button onClick={close}>CLOSE</button>
          )}
        </nav>
      </header>

      <main>
        <section className={`v3-stage ${hovered ? 'is-hovering' : ''}`}>
          {HAS_WEBGL ? (
            <Suspense fallback={null}>
              <Keyring3D
                detached={project?.id}
                onHover={setHovered}
                onSnap={p => {
                  setHovered(null)
                  navigate(`${V3}/work/${p.id}`)
                }}
              />
            </Suspense>
          ) : (
            <ul className="v3-fallback">
              {projects.map(p => (
                <li key={p.id}>
                  <button className="v3-fallback__item" onClick={() => go(`${V3}/work/${p.id}`)}>
                    {p.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="v3-stage__hint v3-label">
            <span className="v3-only-hover">GRAB A CHARM · PULL IT OFF THE RING</span>
            <span className="v3-only-touch">TAP OR PULL A CHARM</span>
          </p>
          <div className="v3-stage__corner v3-label">
            {hovered && (
              <div className="v3-stage__info" key={hovered.id}>
                <span>{hovered.n}.</span>
                <Print text={hovered.title.toUpperCase()} />
                <Print text={hovered.category.toUpperCase()} delay={60} />
                <Print text={String(hovered.year)} delay={200} />
              </div>
            )}
            <a className="v3-stage__contact" href={`mailto:${about.email}`}>
              <span>CONTACT</span>
              <span className="v3-stage__email">{about.email.toUpperCase()}</span>
            </a>
          </div>
        </section>
      </main>

      <Flood target={overlay}>
        {key =>
          key === 'about' ? (
            <AboutPage />
          ) : (
            <ProjectPage key={key} project={getProject(key)!} onGo={go} />
          )
        }
      </Flood>
    </div>
  )
}

type Target = { key: string; color: string } | null

/**
 * The project or about page, on its own flat colour, fading in over the keyring; closing
 * fades it back out.
 */
function Flood({ target, children }: { target: Target; children: (key: string) => React.ReactNode }) {
  const el = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
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
    if (scroller.current) scroller.current.scrollTop = 0
    if (prefersReducedMotion()) {
      gsap.set(node, { opacity: 1 })
      gsap.delayedCall(0, () => setUnder(null))
      return
    }
    const tween = gsap.fromTo(node, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out', onComplete: () => setUnder(null) })
    return () => void tween.kill()
  }, [target?.key]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const node = el.current
    if (!node || !closing) return
    if (prefersReducedMotion()) {
      gsap.delayedCall(0, () => setClosing(null))
      return
    }
    const tween = gsap.to(node, { opacity: 0, duration: 0.4, ease: 'power2.inOut', onComplete: () => setClosing(null) })
    return () => void tween.kill()
  }, [closing])

  if (!shown) return null
  return (
    <>
      {under && <div className="v3-flood v3-flood--under" style={{ background: under }} />}
      <div ref={el} className="v3-flood" style={{ background: shown.color }}>
        <div ref={scroller} className="v3-flood__scroll">
          {children(shown.key)}
        </div>
      </div>
    </>
  )
}
