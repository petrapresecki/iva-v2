import Showcase from '@/components/showcase/Showcase'
import Goo from '@/components/ui/Goo'
import { getLenis } from '@/lib/lenis'
import { site } from '@/data/site'

export default function HeroFull({ paused }: { paused: boolean }) {
  return (
    <section className="relative h-svh">
      <div className="absolute inset-0">
        <Showcase fill paused={paused} hint={false} className="h-full" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-6 px-4 pb-4 text-white md:px-5 md:pb-5">
        <h1 className="text-[clamp(56px,9.4vw,176px)] leading-[0.84] font-medium tracking-[-0.055em]">
          <Goo as="span" immediate delay={0.4} className="block">
            Iva
          </Goo>
          <Goo as="span" immediate delay={0.52} className="block">
            Presečki
          </Goo>
        </h1>
        <div className="caption hidden flex-col items-end gap-1 text-right md:flex">
          <span>
            {site.role} — {site.location}
          </span>
          <span className="text-white/50">Drag to spin · Click a card</span>
          <button
            onClick={() => getLenis()?.scrollTo('#work', { duration: 1.4 })}
            className="pointer-events-auto mt-3 rounded-full border border-white px-4 py-1.5 transition-colors hover:bg-accent hover:text-ink"
          >
            Scroll for work ↓
          </button>
        </div>
      </div>
    </section>
  )
}
