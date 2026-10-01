import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { navigate } from '@/lib/router'
import { projects } from '@/data/projects'
import Goo from '@/components/ui/Goo'
import LazyVideo from '@/components/ui/LazyVideo'
import Media from '@/components/ui/Media'
import WorkHeading from './WorkHeading'

/**
 * Bleibtgleich-style index: the titles are the layout. Hovering a row wipes it
 * green (like the project list on her original site) and a window with that
 * project's video trails the pointer, tilting with its speed.
 */
export default function WorkIndex() {
  const root = useRef<HTMLElement>(null)
  const preview = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const [shown, setShown] = useState(0)

  useGSAP(
    () => {
      const el = preview.current!
      const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' })
      const tilt = gsap.quickTo(el, 'rotation', { duration: 0.5, ease: 'power3' })
      let lastX = 0
      const onMove = (e: PointerEvent) => {
        xTo(e.clientX)
        yTo(e.clientY)
        tilt(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4))
        lastX = e.clientX
      }
      window.addEventListener('pointermove', onMove)
      return () => window.removeEventListener('pointermove', onMove)
    },
    { scope: root },
  )

  const enter = (i: number) => {
    setActive(i)
    setShown(i)
  }

  return (
    <section ref={root} id="work" className="pt-[8vh] pb-[6vh]">
      <WorkHeading />

      <ul className="mt-10 border-t border-ink md:mt-14" onMouseLeave={() => setActive(null)}>
        {projects.map((project, i) => (
          <li key={project.id} className="border-b border-ink">
            <button
              onMouseEnter={() => enter(i)}
              onFocus={() => enter(i)}
              onBlur={() => setActive(null)}
              onClick={() => navigate(`/work/${project.id}`)}
              className="group relative block w-full overflow-hidden px-4 py-4 text-left md:px-5 md:py-5"
            >
              <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-500 ease-out-expo group-hover:translate-y-0" />
              <span className="relative grid grid-cols-[auto_1fr] items-end gap-x-4 md:grid-cols-[6ch_1fr_auto]">
                <span className="caption self-start md:pt-3">({project.index})</span>
                <Goo
                  as="span"
                  className="block text-[clamp(64px,11.5vw,220px)] leading-[0.84] font-medium tracking-[-0.055em] transition-transform duration-500 ease-out-expo group-hover:translate-x-[0.12em]"
                >
                  {project.title}
                </Goo>
                <span className="caption col-start-2 mt-3 flex gap-4 md:col-start-3 md:mt-0 md:flex-col md:items-end md:gap-1 md:pb-3 md:text-right">
                  <span>{project.category}</span>
                  <span className="text-gray group-hover:text-ink">{project.year}</span>
                </span>
              </span>
            </button>
            {/* Touch screens can't hover, so show the clip inline */}
            <div className="px-4 pb-4 md:hidden">
              <Media media={project.snippets[0]} />
            </div>
          </li>
        ))}
      </ul>

      {/* Floating preview, all clips mounted so switching rows doesn't reload them */}
      <div ref={preview} className="pointer-events-none fixed top-0 left-0 z-30 hidden md:block">
        <div
          className={`relative aspect-video w-[30vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[10px] bg-ink transition-[clip-path] duration-500 ease-out-expo ${
            active === null ? '[clip-path:inset(50%_50%_50%_50%_round_10px)]' : '[clip-path:inset(0%_0%_0%_0%_round_10px)]'
          }`}
        >
          {projects.map((project, i) => (
            <div
              key={project.id}
              className={`absolute inset-0 transition-opacity duration-300 ${i === shown ? 'opacity-100' : 'opacity-0'}`}
            >
              <LazyVideo src={project.snippets[0].src} className="h-full w-full object-cover" />
            </div>
          ))}
          <span className="caption absolute bottom-2 left-2 rounded-full bg-accent px-2 py-1">
            {projects[shown].title} →
          </span>
        </div>
      </div>
    </section>
  )
}
