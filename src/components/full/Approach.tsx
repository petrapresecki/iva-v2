import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { navigate } from '@/lib/router'
import { site } from '@/data/site'
import Parallax from './Parallax'
import RollText from '@/components/ui/RollText'
import Label from '@/components/ui/Label'

/**
 * The "mask": text in mix-blend-difference, revealed letter by letter as you
 * scroll. Where it passes over the videos it inverts them, so it reads as cut out.
 */
export default function Approach() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-char]',
        { color: '#2e2e2e' },
        {
          color: '#ffffff',
          stagger: 0.02,
          ease: 'none',
          scrollTrigger: { trigger: '[data-mask]', start: 'top 80%', end: 'bottom 35%', scrub: true },
        },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative mt-[18vh] overflow-hidden bg-ink px-4 py-[20vh] text-white md:px-5">
      <Parallax
        media={{ type: 'video', src: '/videos/apuro/apuro-splash.mp4', ratio: '4 / 5' }}
        className="absolute top-[10vh] right-4 aspect-[4/5] w-[44vw] md:right-5 md:w-[30vw]"
      />
      <Parallax
        media={{ type: 'video', src: '/videos/gabagool/gabagool-blobs-motion.mp4', ratio: '858 / 1080' }}
        className="absolute bottom-[8vh] left-4 aspect-[858/1080] w-[40vw] md:left-[5vw] md:w-[26vw]"
      />

      <p
        data-mask
        aria-label={site.approach}
        className="relative max-w-[1040px] text-[clamp(36px,5.5vw,80px)] leading-[1] tracking-[-0.027em] mix-blend-difference md:ml-[14vw]"
      >
        {site.approach.split(' ').map((word, w) => (
          <span key={w} aria-hidden className="inline-block whitespace-nowrap">
            {[...word].map((char, c) => (
              <span key={c} data-char>
                {char}
              </span>
            ))}
            &nbsp;
          </span>
        ))}
      </p>

      <div className="relative mt-16 flex items-end justify-between md:ml-[14vw]">
        <Label>Approach</Label>
        <button
          onClick={() => navigate('/about')}
          className="group rounded-full border border-white px-5 py-2 text-[14px] font-medium tracking-[0.04em] uppercase transition-colors hover:bg-accent hover:text-ink"
        >
          <RollText text="More about me" />
        </button>
      </div>
    </section>
  )
}
