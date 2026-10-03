import { useState } from 'react'
import Showcase from '@/components/showcase/Showcase'
import WorkReveal from '@/components/effects/WorkReveal'
import Goo from '@/components/ui/Goo'
import Label from '@/components/ui/Label'
import RollText from '@/components/ui/RollText'
import { getLenis } from '@/lib/lenis'
import { navigate } from '@/lib/router'
import { projects } from '@/data/projects'
import { site } from '@/data/site'

const slides = projects.map(p => p.reveal)

/**
 * Aspen-style hero: edge-to-edge cells split by 1px lines. The reveal cell
 * cycles through her projects printed in dots; moving over it uncovers the real
 * image, and hovering it lights up that project's cards in the 3D swirl.
 */
export default function HeroGrid({ paused }: { paused: boolean }) {
  const [slide, setSlide] = useState(0)
  const [hoveringReveal, setHoveringReveal] = useState(false)
  const current = projects[slide]
  // While the reveal cell is hovered, its project's cards stay lit in the swirl
  const highlight = hoveringReveal ? current.id : null

  return (
    <section className="border-b border-ink">
      <div className="grid grid-cols-1 md:h-svh md:grid-cols-4 md:grid-rows-[58fr_42fr]">
        <div className="flex min-h-[62svh] flex-col justify-between border-b border-ink px-4 pt-20 pb-4 md:col-span-2 md:min-h-0 md:border-r md:px-5 md:pt-24 md:pb-5">
          <Label>Portfolio 2025—26</Label>
          <div>
            {/* Her name lives in the nav; the hero introduces her instead of repeating it */}
            <Goo
              as="h1"
              immediate
              delay={0.3}
              className="max-w-[17ch] text-balance text-[clamp(34px,3.9vw,68px)] leading-[1.02] font-medium tracking-[-0.04em]"
            >
              {site.intro}
            </Goo>
            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-ink pt-3 md:mt-10">
              {site.facts.map(fact => (
                <div key={fact.label}>
                  <dt className="caption text-gray">{fact.label}</dt>
                  <dd className="mt-1 text-[15px] leading-tight font-medium md:text-[16px]">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <Showcase
          paused={paused}
          highlight={highlight}
          className="h-[78svh] border-b border-ink md:col-span-2 md:row-span-2 md:h-auto md:border-b-0"
        />

        {/* Her work in dots: move to reveal, click to open */}
        <button
          onClick={() => navigate(`/work/${current.id}`)}
          onMouseEnter={() => setHoveringReveal(true)}
          onMouseLeave={() => setHoveringReveal(false)}
          aria-label={`Open ${current.title}`}
          className="relative h-[42svh] overflow-hidden border-b border-ink text-left md:h-auto md:border-r md:border-b-0"
        >
          <WorkReveal slides={slides} onSlide={setSlide} className="absolute inset-0 h-full w-full" />
          <span className="caption pointer-events-none absolute inset-x-3 top-3 flex justify-between md:inset-x-4 md:top-4">
            <span className="bg-white px-1.5 py-0.5">
              ({current.index}) {current.title}
            </span>
          </span>
          <span className="caption pointer-events-none absolute inset-x-3 bottom-3 flex justify-between md:inset-x-4 md:bottom-4">
            <span className="bg-white px-1.5 py-0.5">
              {current.category.split(',')[0]} · {current.year}
            </span>
            <span className="bg-accent px-1.5 py-0.5">Open →</span>
          </span>
        </button>

        {/* A friendly teaser for the About page */}
        <div className="flex min-h-[34svh] flex-col justify-between gap-6 border-ink bg-accent px-4 py-4 md:min-h-0 md:border-r md:px-5 md:py-5">
          <div>
            <p className="text-[clamp(44px,4.6vw,84px)] leading-[0.9] font-medium tracking-[-0.05em]">{site.greeting}</p>
            <p className="mt-4 max-w-[30ch] text-[16px] leading-snug font-medium md:text-[clamp(15px,1.15vw,19px)]">
              {site.hello}
            </p>
          </div>
          <div className="caption flex items-center justify-between border-t border-ink pt-3">
            <button onClick={() => navigate('/about')} className="group">
              <RollText text="About me →" />
            </button>
            <button onClick={() => getLenis()?.scrollTo('#work', { duration: 1.4 })} className="group">
              <RollText text="Work ↓" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
