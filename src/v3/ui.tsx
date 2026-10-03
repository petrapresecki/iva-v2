import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import type { Media as MediaItem } from './content'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/'

/**
 * Prints text like a label maker (the kit's scramble-text, reworked): printed characters
 * are final, unprinted ones don't exist yet, only the print head jitters, and a green
 * block caret rides it. Re-key it to print again.
 */
export function Print({ text, delay = 0, charDelay = 18, className }: { text: string; delay?: number; charDelay?: number; className?: string }) {
  const el = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = el.current
    if (!node) return
    if (prefersReducedMotion()) {
      node.textContent = text
      return
    }
    let raf = 0
    let i = 0
    let last = 0
    let caretTween: gsap.core.Tween | undefined
    node.textContent = ''
    const frame = (t: number) => {
      if (!last) last = t
      if (t - last >= charDelay) {
        i++
        last = t
      }
      const head = i < text.length && text[i] !== ' ' ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : ''
      node.textContent = text.slice(0, i) + head
      const caret = document.createElement('span')
      caret.className = 'v3-caret'
      node.append(caret)
      if (i < text.length) raf = requestAnimationFrame(frame)
      else caretTween = gsap.to(caret, { opacity: 0, duration: 0.12, repeat: 3, yoyo: true, delay: 0.1, onComplete: () => caret.remove() })
    }
    const start = window.setTimeout(() => (raf = requestAnimationFrame(frame)), delay)
    return () => {
      window.clearTimeout(start)
      cancelAnimationFrame(raf)
      caretTween?.kill()
    }
  }, [text, delay, charDelay])

  return <span ref={el} className={className} aria-label={text} />
}

/** Image or muted looping video; videos only play near the viewport (the kit's lazy-video) */
export function Media({ item, className }: { item: MediaItem; className?: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const isVideo = item.src.endsWith('.mp4')

  useEffect(() => {
    const el = video.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {})
        else el.pause()
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [item.src])

  if (!isVideo) return <img src={item.src} alt={item.alt ?? ''} loading="lazy" className={className} />
  return <video ref={video} src={item.src} muted loop playsInline preload="metadata" className={className} />
}

/** Endless horizontal ticker (CSS, like the kit's marquee) at the same slow speed whatever the text */
export function Marquee({ text, className, speed = 60 }: { text: string; className?: string; speed?: number }) {
  const track = useRef<HTMLDivElement>(null)

  // The track slides by half its width per loop, so the duration follows the text's length
  useLayoutEffect(() => {
    const measure = () => {
      const el = track.current
      if (el) el.style.animationDuration = `${el.scrollWidth / 2 / speed}s`
    }
    measure()
    document.fonts?.ready.then(measure) // the display face changes the width once it loads
  }, [text, speed])

  // Two identical halves, so sliding the track by -50% loops seamlessly
  return (
    <div className={`v3-marquee ${className ?? ''}`}>
      <div ref={track} className="v3-marquee__track">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} aria-hidden={i > 0 || undefined}>
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}
