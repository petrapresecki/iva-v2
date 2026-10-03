import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/kit/gsap'
import defaultCursor from './cursor.svg'
import defaultHover from './cursor-hover.svg'

export interface PixelCursorProps {
  /** Image for the resting cursor and for hovering links/buttons */
  src?: string
  hoverSrc?: string
  size?: [number, number]
  hoverSize?: [number, number]
  /** Elements that switch the cursor to its hover state */
  interactive?: string
}

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, [tabindex]'

/** Custom image cursor (Iva's green pixel hand by default). Hidden on touch screens. */
export default function PixelCursor({
  src = defaultCursor,
  hoverSrc = defaultHover,
  size = [40, 37],
  hoverSize = [75, 88],
  interactive = INTERACTIVE,
}: PixelCursorProps) {
  const cursor = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)
  const [enabled, setEnabled] = useState(
    () => typeof window !== 'undefined' && matchMedia('(pointer: fine)').matches && matchMedia('(hover: hover)').matches,
  )

  useEffect(() => {
    if (!enabled) return
    const el = cursor.current!
    document.documentElement.classList.add('kit-cursor-none')
    gsap.set(el, { xPercent: -50, yPercent: -50, x: -100, y: -100 })
    const xTo = gsap.quickTo(el, 'x', { duration: 0.15, ease: 'power2.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.15, ease: 'power2.out' })

    const move = (e: MouseEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      setHovering(!!(e.target as Element).closest?.(interactive))
    }
    const leave = () => gsap.to(el, { opacity: 0, duration: 0.2 })
    const enter = () => gsap.to(el, { opacity: 1, duration: 0.2 })
    const touch = () => setEnabled(false)

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseleave', leave)
    document.addEventListener('mouseenter', enter)
    window.addEventListener('touchstart', touch, { once: true })
    return () => {
      document.documentElement.classList.remove('kit-cursor-none')
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', leave)
      document.removeEventListener('mouseenter', enter)
      window.removeEventListener('touchstart', touch)
    }
  }, [enabled, interactive])

  if (!enabled) return null
  const [w, h] = hovering ? hoverSize : size
  return (
    <div ref={cursor} className="pointer-events-none fixed top-0 left-0 z-[9999]">
      <img src={hovering ? hoverSrc : src} alt="" width={w} height={h} draggable={false} className="transition-all duration-150" />
    </div>
  )
}
