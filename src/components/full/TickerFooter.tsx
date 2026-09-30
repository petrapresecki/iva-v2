import { getLenis } from '@/lib/lenis'
import { navigate } from '@/lib/router'
import { projects } from '@/data/projects'
import { site } from '@/data/site'
import FitText from '@/components/ui/FitText'
import Marquee from '@/components/ui/Marquee'
import RollText from '@/components/ui/RollText'

const stills = projects.flatMap(p => p.cards)
const heights = ['h-[140px]', 'h-[258px]', 'h-[190px]', 'h-[220px]', 'h-[160px]']

export default function TickerFooter() {
  return (
    <footer className="overflow-hidden border-t border-ink pt-[8vh]">
      <Marquee duration={60}>
        <div className="flex items-start gap-2.5 pr-2.5">
          {stills.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              className={`${heights[i % heights.length]} aspect-[3/4] w-auto rounded-[10px] object-cover`}
            />
          ))}
        </div>
      </Marquee>

      <div className="mt-20 flex flex-col items-center gap-6 px-4 text-center">
        <p className="caption">(Contact)</p>
        <a href={`mailto:${site.email}`} className="group text-[clamp(28px,4.4vw,64px)] leading-none font-medium tracking-[-0.04em]">
          <RollText text={site.email} />
        </a>
        <button
          onClick={() => getLenis()?.scrollTo(0, { duration: 1.6 })}
          className="group mt-2 rounded-full border border-ink px-5 py-2 text-[14px] font-medium tracking-[0.04em] uppercase transition-colors hover:bg-accent"
        >
          <RollText text="Back to top" />
        </button>
        <div className="caption mt-6 flex gap-6">
          <button onClick={() => getLenis()?.scrollTo('#work', { duration: 1.4 })} className="group">
            <RollText text="Work" />
          </button>
          <button onClick={() => navigate('/about')} className="group">
            <RollText text="About" />
          </button>
          <span>© 2026</span>
        </div>
      </div>

      {/* Giant wordmark, cut off by the bottom edge */}
      <div className="mt-16 h-[15.5vw] overflow-hidden pt-[3vw]">
        <FitText text="IVA PRESEČKI" className="px-2 font-display font-semibold tracking-[-0.02em]" />
      </div>
    </footer>
  )
}
