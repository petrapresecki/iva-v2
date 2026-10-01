import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { navigate } from '@/lib/router'
import { projects } from '@/data/projects'
import LazyVideo from '@/components/ui/LazyVideo'
import RollText from '@/components/ui/RollText'
import WorkHeading from './WorkHeading'

/**
 * All the work in one screen: four strips of video side by side. Resting
 * strips sit in black and white (like the dotted cell in the hero); the one
 * under the pointer widens and comes into full colour.
 */
export default function WorkStrips() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      gsap.from('[data-strip]', {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 1.4,
        stagger: 0.1,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: '[data-strips]', start: 'top 80%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="work" className="pt-[8vh] pb-[8vh]">
      <WorkHeading />

      <div
        data-strips
        className="mt-10 flex flex-col border-y border-ink md:mt-14 md:h-[82svh] md:flex-row"
      >
        {projects.map((project, i) => {
          const open = i === active
          return (
            <button
              key={project.id}
              data-strip
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => navigate(`/work/${project.id}`)}
              style={{ flexGrow: open ? 4 : 1 }}
              className="group relative h-[46svh] min-w-0 basis-0 overflow-hidden border-b border-ink text-left transition-[flex-grow] duration-700 ease-out-expo last:border-0 md:h-auto md:border-r md:border-b-0"
            >
              <LazyVideo
                src={project.snippets[0].src}
                className={`absolute inset-0 h-full w-full object-cover transition-[filter,scale] duration-700 ease-out-expo ${
                  open ? 'scale-100 grayscale-0' : 'scale-110 grayscale'
                }`}
              />
              <span
                className={`absolute inset-0 bg-white transition-opacity duration-700 ${open ? 'opacity-0' : 'opacity-25'}`}
              />

              {/* Labels: a vertical title while narrow, full details once open */}
              <span className="caption absolute top-3 left-3 bg-white px-1.5 py-0.5 md:top-4 md:left-4">
                ({project.index})
              </span>
              <span
                className={`absolute bottom-4 left-3 hidden text-[clamp(28px,2.6vw,44px)] leading-none font-medium tracking-[-0.04em] whitespace-nowrap text-white mix-blend-difference transition-opacity duration-300 [writing-mode:vertical-rl] md:block md:rotate-180 ${
                  open ? 'opacity-0' : 'opacity-100 delay-200'
                }`}
              >
                {project.title}
              </span>
              <span
                className={`absolute inset-x-3 bottom-3 flex items-end justify-between gap-4 transition-[opacity,translate] duration-500 md:inset-x-4 md:bottom-4 ${
                  open ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-4 opacity-100 md:opacity-0'
                }`}
              >
                <span className="bg-white px-3 pt-2 pb-3">
                  <span className="block text-[clamp(36px,4.2vw,76px)] leading-[0.9] font-medium tracking-[-0.05em]">
                    <RollText text={project.title} />
                  </span>
                  <span className="caption mt-2 block">
                    {project.category} · {project.year}
                  </span>
                </span>
                <span className="caption shrink-0 bg-accent px-2 py-1">Open →</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
