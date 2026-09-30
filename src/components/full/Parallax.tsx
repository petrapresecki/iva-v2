import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import type { Media as MediaItem } from '@/data/projects'
import LazyVideo from '@/components/ui/LazyVideo'

interface ParallaxProps {
  media: MediaItem
  className?: string
  // Fraction of the frame height the inner media travels
  amount?: number
}

/** Donut-style window: a rounded frame with the media drifting inside it on scroll. */
export default function Parallax({ media, className = '', amount = 0.14 }: ParallaxProps) {
  const frame = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-inner]',
        { yPercent: -amount * 100 },
        {
          yPercent: amount * 100,
          ease: 'none',
          scrollTrigger: { trigger: frame.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    },
    { scope: frame },
  )

  return (
    <div ref={frame} data-media className={`overflow-hidden rounded-[10px] bg-mist ${className}`}>
      <div data-inner className="h-[130%] -translate-y-[11.5%]">
        {media.type === 'video' ? (
          <LazyVideo src={media.src} className="h-full w-full object-cover" />
        ) : (
          <img src={media.src} alt={media.alt ?? ''} loading="lazy" className="h-full w-full object-cover" />
        )}
      </div>
    </div>
  )
}
