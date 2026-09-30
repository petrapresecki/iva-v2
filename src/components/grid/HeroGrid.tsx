import DitherTrail from '@/components/effects/DitherTrail'
import Showcase from '@/components/showcase/Showcase'
import Goo from '@/components/ui/Goo'
import Label from '@/components/ui/Label'
import { getLenis } from '@/lib/lenis'
import { site } from '@/data/site'

/**
 * Aspen-style hero: edge-to-edge cells split by 1px lines. Solid cells cover the
 * dither canvas; the empty cell is a window onto it (move the mouse there).
 */
export default function HeroGrid({ paused }: { paused: boolean }) {
  return (
    <section className="relative border-b border-ink">
      <DitherTrail className="absolute inset-0 h-full w-full" />

      <div className="relative grid grid-cols-1 md:h-svh md:grid-cols-4 md:grid-rows-[58fr_42fr]">
        <div className="flex min-h-[62svh] flex-col justify-between border-b border-ink bg-white px-4 pt-20 pb-4 md:col-span-2 md:min-h-0 md:border-r md:px-5 md:pt-24 md:pb-5">
          <Label>
            {site.role} — {site.location}
          </Label>
          <h1 className="font-display text-[clamp(68px,9.6vw,176px)] leading-[0.84] font-semibold tracking-[-0.03em]">
            <Goo as="span" immediate delay={0.3} className="block">
              Iva
            </Goo>
            <Goo as="span" immediate delay={0.42} className="block">
              Presečki
            </Goo>
          </h1>
        </div>

        <Showcase paused={paused} className="h-[78svh] border-b border-ink md:col-span-2 md:row-span-2 md:h-auto md:border-b-0" />

        {/* Window onto the dither + trail */}
        <div className="h-[26svh] border-b border-ink md:h-auto md:border-r md:border-b-0" />

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
