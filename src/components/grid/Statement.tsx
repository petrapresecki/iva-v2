import Goo from '@/components/ui/Goo'
import Label from '@/components/ui/Label'
import { navigate } from '@/lib/router'
import { site } from '@/data/site'

// Bleibtgleich-style: each line hangs off a different column and melts in as it scrolls into view
const lines = [
  { text: 'I see design', col: 'md:col-start-2' },
  { text: 'as a constantly', col: 'md:col-start-4' },
  { text: 'evolving field,', col: 'md:col-start-3' },
  { text: 'shaped by new', col: 'md:col-start-4' },
  { text: 'techniques and', col: 'md:col-start-2' },
  { text: 'current trends.', col: 'md:col-start-4' },
]

export default function Statement() {
  return (
    <section className="relative px-4 py-[22vh] md:px-5">
      {/* The axis */}
      <div className="absolute top-0 bottom-0 left-[calc(37.5%+2px)] hidden w-px bg-ink md:block" />

      <Label className="relative mb-12 bg-white pr-2 md:mb-16">Approach</Label>
      <div className="grid grid-cols-8 gap-x-4">
        <div className="col-span-8 grid grid-cols-8 gap-x-4">
          {lines.map(line => (
            <Goo
              key={line.text}
              as="p"
              className={`relative col-span-8 bg-white text-[clamp(44px,6.6vw,124px)] leading-[0.9] font-medium tracking-[-0.05em] ${line.col} md:col-end-9`}
            >
              {line.text}
            </Goo>
          ))}
        </div>
        <div className="col-span-8 mt-16 grid grid-cols-8 gap-x-4">
          <p className="col-span-8 max-w-[34ch] text-[15px] leading-snug font-medium md:col-span-3 md:col-start-5">
            {site.approach}
          </p>
          <button
            onClick={() => navigate('/about')}
            className="caption col-span-8 mt-6 w-fit border-b border-ink pb-0.5 transition-colors hover:border-accent md:col-span-2 md:col-start-5"
          >
            More about me →
          </button>
        </div>
      </div>
    </section>
  )
}
