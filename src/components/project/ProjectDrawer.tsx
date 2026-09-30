import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { back, navigate } from '@/lib/router'
import { projects, type Project } from '@/data/projects'
import Goo from '@/components/ui/Goo'
import Media from '@/components/ui/Media'
import RollText from '@/components/ui/RollText'
import Label from '@/components/ui/Label'

interface ContentProps {
  project: Project
  scroller: React.RefObject<HTMLDivElement | null>
}

function ProjectContent({ project, scroller }: ContentProps) {
  const root = useRef<HTMLElement>(null)
  const i = projects.indexOf(project)
  const prev = projects[(i - 1 + projects.length) % projects.length]
  const next = projects[(i + 1) % projects.length]

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-hero]', { clipPath: 'inset(12% 6% 12% 6% round 10px)', duration: 1.4, ease: 'expo.out', delay: 0.55 })
      gsap.from('[data-fade]', { y: 30, opacity: 0, duration: 1, stagger: 0.08, delay: 0.7 })

      // Gallery items open like a shutter as they scroll in
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => {
        gsap.from(el, {
          clipPath: 'inset(18% 0% 18% 0% round 10px)',
          y: 60,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, scroller: scroller.current, start: 'top 92%' },
        })
      })
    },
    { scope: root },
  )

  const go = (p: Project) => navigate(`/work/${p.id}`, { replace: true })

  return (
    <article ref={root} className="px-4 pt-24 pb-6 md:px-5 md:pt-28">
      <div data-fade className="caption grid grid-cols-3 border-b border-ink pb-3">
        <span>({project.index})</span>
        <span className="text-center">{project.category}</span>
        <span className="text-right">{project.year}</span>
      </div>

      <Goo
        as="h1"
        immediate
        delay={0.35}
        className="mt-5 text-[clamp(72px,17vw,280px)] leading-[0.84] font-medium tracking-[-0.055em]"
      >
        {project.title}
      </Goo>

      <div data-hero className="mt-6 md:mt-8">
        <Media media={project.hero} />
      </div>

      <section className="mt-16 grid gap-8 md:mt-28 md:grid-cols-12">
        <div data-fade className="md:col-span-3">
          <Label>About the project</Label>
        </div>
        <div className="md:col-span-8 md:col-start-5">
          <div className="space-y-6 text-[20px] leading-[1.25] font-medium tracking-[-0.02em] md:text-[27px]">
            {project.description.map((paragraph, k) => (
              <p key={k}>{paragraph}</p>
            ))}
          </div>
          <ul className="mt-10 flex flex-wrap gap-2">
            {project.tools.map(tool => (
              <li
                key={tool}
                className="rounded-full border border-ink px-4 py-2 text-[14px] font-medium transition-colors hover:bg-accent md:text-[15px]"
              >
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 flex flex-col gap-3 md:mt-28 md:gap-5">
        {project.gallery.map((row, r) => (
          <div key={r} className={`grid gap-3 md:gap-5 ${row.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {row.map(media => (
              <div key={media.src} data-reveal>
                <Media media={media} />
              </div>
            ))}
          </div>
        ))}
      </section>

      <nav className="mt-24 grid grid-cols-2 border-t border-ink md:mt-32">
        {[
          { p: prev, label: 'Previous project', align: 'text-left' },
          { p: next, label: 'Next project', align: 'text-right border-l border-ink' },
        ].map(({ p, label, align }) => (
          <button key={label} onClick={() => go(p)} className={`group py-6 md:py-8 ${align} ${align.includes('right') ? 'pl-4' : 'pr-4'}`}>
            <span className="caption block text-gray">{label}</span>
            <span className="mt-2 block text-[clamp(36px,6vw,96px)] leading-[0.9] font-medium tracking-[-0.05em] group-hover:text-ink">
              <RollText text={p.title} />
            </span>
          </button>
        ))}
      </nav>
    </article>
  )
}

export default function ProjectDrawer({ project }: { project: Project }) {
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo(0, 0)
  }, [project.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && back('/')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <motion.div
      ref={scroller}
      data-lenis-prevent
      className="fixed inset-0 z-40 overflow-y-auto bg-white"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
    >
      <button
        onClick={() => back('/')}
        aria-label="Back to portfolio"
        className="group/back fixed top-1/2 left-3 z-50 -translate-y-1/2 rounded-full border border-ink/15 bg-white/80 p-3 backdrop-blur transition-colors hover:border-ink hover:bg-accent md:left-5"
      >
        <svg className="size-4 transition-transform group-hover/back:-translate-x-0.5 md:size-5" viewBox="0 0 20 20" fill="none">
          <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <ProjectContent key={project.id} project={project} scroller={scroller} />
    </motion.div>
  )
}
