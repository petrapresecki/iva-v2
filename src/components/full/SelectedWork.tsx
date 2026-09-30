import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { navigate } from '@/lib/router'
import { projects, type Project } from '@/data/projects'
import Marquee from '@/components/ui/Marquee'
import Media from '@/components/ui/Media'
import RollText from '@/components/ui/RollText'

// Deliberately asymmetric placements on a 12-column grid, like donut-studio.com
const slots = [
  'md:col-start-1 md:col-span-6 md:mt-[100px]',
  'md:col-start-8 md:col-span-5',
  'md:col-start-3 md:col-span-7 md:mt-[6vh]',
  'md:col-start-7 md:col-span-6 md:mt-[4vh]',
]

function WorkCard({ project, className }: { project: Project; className: string }) {
  return (
    <button data-card onClick={() => navigate(`/work/${project.id}`)} className={`group col-span-12 text-left ${className}`}>
      <div className="relative overflow-hidden rounded-[10px] bg-ink">
        <Media
          media={project.snippets[0]}
          rounded={false}
          className="transition-opacity duration-500 group-hover:opacity-60"
        />
        {/* Hover band: a hairline that grows into a green strip with the category */}
        <div className="absolute inset-x-0 top-1/2 flex h-px -translate-y-1/2 items-center justify-center overflow-hidden bg-white/0 transition-[height,background-color] duration-500 ease-out-expo group-hover:h-7 group-hover:bg-accent">
          <span className="caption text-ink opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100">
            {project.category}
          </span>
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[17px] font-medium md:text-[19px]">
        <RollText text={project.title} />
        <span>({project.index})</span>
      </div>
    </button>
  )
}

export default function SelectedWork() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('[data-card]').forEach(card => {
        gsap.from(card, { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%' } })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="work" className="pt-[10vh]">
      <Marquee duration={28}>
        <span className="pr-[0.35em] text-[clamp(96px,14vw,204px)] leading-[1.05] font-medium tracking-[-0.05em] whitespace-nowrap">
          Selected Work©
        </span>
      </Marquee>
      <div className="mx-4 h-px bg-ink md:mx-5" />

      <p className="mx-4 mt-6 max-w-[520px] text-[17px] leading-[1.35] md:mx-5 md:text-[19px]">
        Exploring how digital media practices can <mark className="bg-accent px-0.5">intersect</mark>,{' '}
        <mark className="bg-accent px-0.5">integrate</mark> and <mark className="bg-accent px-0.5">enhance</mark> one
        another, across branding, packaging, motion and 3D.
      </p>

      <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-10 px-4 md:mt-8 md:px-5">
        {projects.map((project, i) => (
          <WorkCard key={project.id} project={project} className={slots[i % slots.length]} />
        ))}
      </div>
    </section>
  )
}
