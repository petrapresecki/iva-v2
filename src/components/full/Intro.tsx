import { navigate } from '@/lib/router'
import { site } from '@/data/site'
import { projects } from '@/data/projects'
import Parallax from './Parallax'
import RollText from '@/components/ui/RollText'

const tools = [...new Set(projects.flatMap(p => p.tools))]

// The second paragraph of her bio, split so the statement leads
const [, rest] = site.bio[1].split(site.statement.replace(/\.$/, '') + '. ')

export default function Intro() {
  return (
    <section className="px-4 pt-5 pb-[14vh] md:px-5">
      <div className="caption grid grid-cols-3">
        <span>{site.role}</span>
        <span className="text-center">(IP® — 01)</span>
        <span className="text-right">Based in {site.location}</span>
      </div>

      <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-12 md:gap-6">
        <Parallax
          media={{ type: 'video', src: '/videos/rool/rool-sivo-anim.mp4', ratio: '858 / 1080' }}
          className="aspect-[5/7] md:col-span-4"
        />
        <div className="flex flex-col justify-between gap-10 md:col-span-7 md:col-start-6">
          <p className="text-[clamp(28px,3.4vw,50px)] leading-[1.03] tracking-[-0.02em]">
            {site.statement} <span className="text-gray">{rest}</span>
          </p>
          <button
            onClick={() => navigate('/about')}
            className="group w-fit rounded-full border border-ink px-5 py-2 text-[14px] font-medium tracking-[0.04em] uppercase transition-colors hover:bg-accent"
          >
            <RollText text="About me" />
          </button>
        </div>
      </div>

      {/* Checkerboard of the tools she works with */}
      <div className="mt-20 md:mt-28">
        <p className="caption mb-3">(Tools)</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => {
            // Even cells in a 2×5 grid form a checkerboard: five filled, one per tool
            const filled = i % 2 === 0
            const tool = filled ? tools[i / 2] : null
            return (
              <div
                key={i}
                className={`flex aspect-[5/3] items-end rounded-[10px] border border-ink p-3 text-[15px] leading-tight font-medium ${
                  filled ? 'bg-accent' : 'hidden md:flex'
                }`}
              >
                {tool}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
