import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { navigate } from '@/lib/router'
import { projects } from '@/data/projects'
import Media from '@/components/ui/Media'
import RollText from '@/components/ui/RollText'
import WorkHeading from './WorkHeading'

/** Aspen-style rows: a title cell plus three snippets per project, split by 1px lines. */
export default function WorkRows() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('[data-row]').forEach(row => {
        gsap.from(row.querySelectorAll('[data-cell]'), {
          y: 80,
          opacity: 0,
          duration: 1.2,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: row, start: 'top 85%' },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="work" className="pt-[8vh]">
      <WorkHeading />

      <div className="mt-10 border-t border-ink md:mt-14">
        {projects.map(project => (
          <div
            key={project.id}
            data-row
            role="button"
            onClick={() => navigate(`/work/${project.id}`)}
            className="group grid grid-cols-2 border-b border-ink md:h-[58svh] md:grid-cols-4"
          >
            <div
              data-cell
              className="col-span-2 flex min-h-[34svh] flex-col justify-between border-b border-ink px-4 py-4 transition-colors duration-300 group-hover:bg-accent md:col-span-1 md:min-h-0 md:border-r md:border-b-0 md:px-5 md:py-5"
            >
              <p className="caption flex justify-between">
                <span>({project.index})</span>
                <span>{project.year}</span>
              </p>
              <div>
                <h3 className="text-[clamp(44px,4.6vw,84px)] leading-[0.9] font-medium tracking-[-0.05em]">
                  <RollText text={project.title} />
                </h3>
                <p className="mt-3 max-w-[24ch] text-[15px] leading-snug font-medium">{project.category}</p>
                <p className="caption mt-6 flex items-center gap-2">
                  Open project <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </p>
              </div>
            </div>
            {project.snippets.map((media, i) => (
              <div
                key={media.src}
                data-cell
                className={`overflow-hidden border-ink ${i === 0 ? 'col-span-2 aspect-video md:col-span-1 md:aspect-auto' : 'aspect-[4/5] md:aspect-auto'} ${
                  i < 2 ? 'border-r' : ''
                } ${i === 0 ? 'border-b md:border-b-0' : ''}`}
              >
                <Media
                  media={media}
                  sized={false}
                  rounded={false}
                  className="h-full w-full transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
