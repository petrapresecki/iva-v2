import { useState } from 'react'
import WorkReveal from '@/components/effects/WorkReveal'
import Goo from '@/components/ui/Goo'
import RollText from '@/components/ui/RollText'
import { getLenis } from '@/lib/lenis'
import { navigate } from '@/lib/router'
import { projects } from '@/data/projects'
import { site } from '@/data/site'

const slides = projects.map(p => p.reveal)
const INTERVAL = 4.5

/**
 * Full-screen version of the dotted reveal: her projects printed in large dots,
 * dissolving from one to the next. Moving over it uncovers the real image;
 * clicking opens the project currently showing.
 */
export default function HeroFull({ paused }: { paused: boolean }) {
  const [slide, setSlide] = useState(0)
  const current = projects[slide]

  return (
    <section className="relative h-svh overflow-hidden">
      <button
        onClick={() => navigate(`/work/${current.id}`)}
        aria-label={`Open ${current.title}`}
        className="absolute inset-0"
      >
        <WorkReveal
          slides={slides}
          dot={3}
          brush={110}
          interval={INTERVAL}
          paused={paused}
          onSlide={setSlide}
          className="h-full w-full"
        />
      </button>

      {/* Which project is showing */}
      <p className="caption pointer-events-none absolute top-[72px] left-4 z-10 bg-white px-1.5 py-0.5 md:top-[84px] md:left-5">
        ({current.index}) {current.title} — {current.category.split(',')[0]} · {current.year}
      </p>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-3 px-4 pb-4 md:flex-row md:items-end md:justify-between md:px-5 md:pb-5">
        {/* Her name lives in the nav; the hero introduces her instead of repeating it */}
        <div className="bg-white px-3 pt-2 pb-3 md:px-4 md:pt-3 md:pb-4">
          <Goo
            as="h1"
            immediate
            delay={0.4}
            className="max-w-[16ch] text-balance text-[clamp(32px,4vw,72px)] leading-[1.02] font-medium tracking-[-0.04em]"
          >
            {site.intro}
          </Goo>
        </div>
        <div className="caption pointer-events-auto flex gap-2">
          <button onClick={() => navigate(`/work/${current.id}`)} className="group rounded-full bg-accent px-4 py-2">
            <RollText text={`Open ${current.title} →`} />
          </button>
          <button
            onClick={() => getLenis()?.scrollTo('#work', { duration: 1.4 })}
            className="group rounded-full border border-ink bg-white px-4 py-2"
          >
            <RollText text="Scroll for work ↓" />
          </button>
        </div>
      </div>
    </section>
  )
}
