import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import cursorSvg from '@/assets/cursor.svg'
import cursorHoverSvg from '@/assets/cursor-hover.svg'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(pointer: fine)').matches &&
      window.matchMedia('(hover: hover)').matches &&
      !('ontouchstart' in window)
    )
  })

  useEffect(() => {
    if (!enabled) return

    const cursor = cursorRef.current
    if (!cursor) return

    gsap.set(cursor, { xPercent: -50, yPercent: -50, x: -100, y: -100 })

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out',
      })

      const target = e.target as HTMLElement
      setHovering(
        !!target.closest('a, button, [role="button"], input, select, textarea, label, [tabindex]')
      )
    }

    const onMouseLeave = () => {
      gsap.to(cursor, { opacity: 0, duration: 0.2 })
    }

    const onMouseEnter = () => {
      gsap.to(cursor, { opacity: 1, duration: 0.2 })
    }

    // Kill cursor immediately if a touch is detected
    const onTouchStart = () => {
      setEnabled(false)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      window.removeEventListener('touchstart', onTouchStart)
    }

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)
    window.addEventListener('touchstart', onTouchStart, { once: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      window.removeEventListener('touchstart', onTouchStart)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999]"
    >
      <img
        src={hovering ? cursorHoverSvg : cursorSvg}
        alt=""
        width={hovering ? 75 : 40}
        height={hovering ? 88 : 37}
        draggable={false}
        className="transition-all duration-150"
      />
    </div>
  )
}
