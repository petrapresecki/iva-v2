import { useState } from 'react'
import Showcase from '@/components/showcase/Showcase'
import WorkReveal from '@/components/effects/WorkReveal'
import Goo from '@/components/ui/Goo'
import Label from '@/components/ui/Label'
import { getLenis } from '@/lib/lenis'
import { navigate } from '@/lib/router'
import { projects } from '@/data/projects'
import { site } from '@/data/site'

// One strong image per project for the dithered reveal cell
const revealImages: Record<string, string> = {
  rool: '/images/rool/rool-composition.jpg',
  apuro: '/images/apuro/apuro-bottles-dark.jpg',
  booklet: '/images/booklet/booklet-spread-6.jpg',
  gabagool: '/images/gabagool/gabagool-showcase.webp',
}
const slides = projects.map(p => revealImages[p.id])

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
          <Label>
            {site.role} — {site.location}
          </Label>
          <h1 className="text-[clamp(68px,9.8vw,180px)] leading-[0.84] font-medium tracking-[-0.055em]">
            <Goo as="span" immediate delay={0.3} className="block">
              Iva
            </Goo>
            <Goo as="span" immediate delay={0.42} className="block">
              Presečki
            </Goo>
          </h1>
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

        <div className="flex min-h-[34svh] flex-col justify-between gap-8 border-ink bg-accent px-4 py-4 md:min-h-0 md:border-r md:px-5 md:py-5">
          <p className="text-[20px] leading-[1.15] font-medium tracking-[-0.02em] md:text-[clamp(18px,1.6vw,26px)]">
            Branding, packaging, motion and 3D, integrating animation, 3D and classic 2D practices into cohesive
            product presentations.
          </p>
          <button
            onClick={() => getLenis()?.scrollTo('#work', { duration: 1.4 })}
            className="caption flex items-center justify-between border-t border-ink pt-3 text-left"
          >
            Scroll for work <span aria-hidden>↓</span>
          </button>
        </div>
      </div>
    </section>
  )
}
