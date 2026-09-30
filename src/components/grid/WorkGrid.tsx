import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { navigate } from '@/lib/router'
import { projects } from '@/data/projects'
import Media from '@/components/ui/Media'
import RollText from '@/components/ui/RollText'

export default function WorkGrid() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      // "Work … 25—26" pulls apart to the full width as the section scrolls in
      const heading = root.current!.querySelector<HTMLElement>('[data-heading]')!
      gsap.fromTo(
        heading,
        { width: () => heading.scrollWidth },
        {
          width: '100%',
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'top 20%', scrub: true, invalidateOnRefresh: true },
        },
      )

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
      <div className="px-4 md:px-5">
        <div
          data-heading
          className="flex gap-[0.3em] justify-between text-[clamp(56px,8.4vw,160px)] leading-[0.9] font-medium tracking-[-0.05em] whitespace-nowrap"
        >
          <h2>Work</h2>
          <span>25—26</span>
        </div>
      </div>

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
