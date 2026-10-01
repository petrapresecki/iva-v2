import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

/** "Work … 25—26" pulls apart to the full width as it scrolls in (bleibtgleich.dev). */
export default function WorkHeading() {
  const heading = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const el = heading.current!
    gsap.fromTo(
      el,
      { width: () => el.scrollWidth },
      {
        width: '100%',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 25%', scrub: true, invalidateOnRefresh: true },
      },
    )
  })

  return (
    <div className="px-4 md:px-5">
      <div
        ref={heading}
        className="flex justify-between gap-[0.3em] text-[clamp(56px,8.4vw,160px)] leading-[0.9] font-medium tracking-[-0.05em] whitespace-nowrap"
      >
        <h2>Work</h2>
        <span>25—26</span>
      </div>
    </div>
  )
}
