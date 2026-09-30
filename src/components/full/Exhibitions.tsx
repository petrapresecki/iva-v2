import { useEffect, useState } from 'react'
import { projects } from '@/data/projects'
import { site } from '@/data/site'
import { prefersReducedMotion } from '@/lib/gsap'

const stills = projects.flatMap(p => p.cards)

// Sticker that flips through her work like a flipbook
function Flipbook() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = setInterval(() => setI(n => (n + 1) % stills.length), 700)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="w-[150px] -rotate-6 overflow-hidden rounded-[10px] border-4 border-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] md:w-[171px]">
      <img src={stills[i]} alt="" className="aspect-[3/4] w-full object-cover" />
      {/* Preload the next still so flips don't flash */}
      <link rel="prefetch" href={stills[(i + 1) % stills.length]} />
    </div>
  )
}

export default function Exhibitions() {
  return (
    <section className="grid gap-12 px-4 py-[18vh] md:grid-cols-12 md:gap-6 md:px-5">
      <div className="self-start md:sticky md:top-24 md:col-span-5">
        <Flipbook />
        <h2 className="mt-10 text-[clamp(36px,3.4vw,50px)] leading-[1.02] font-semibold tracking-[-0.02em]">Exhibitions</h2>
        <p className="text-[clamp(36px,3.4vw,50px)] leading-[1.02] tracking-[-0.02em] text-gray">Where the work was shown.</p>
      </div>

      <ul className="md:col-span-7">
        {site.exhibitions.map((item, i) => (
          <li
            key={item}
            className="group relative flex items-baseline gap-6 overflow-hidden border-t border-ink py-6 last:border-b md:py-8"
          >
            <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-500 ease-out-expo group-hover:translate-y-0" />
            <span className="caption relative">({String(i + 1).padStart(2, '0')})</span>
            <span className="relative text-[clamp(26px,3vw,44px)] leading-tight font-medium tracking-[-0.03em]">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
