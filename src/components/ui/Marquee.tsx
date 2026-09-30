import type { ReactNode } from 'react'

interface MarqueeProps {
  children: ReactNode
  // Seconds per loop
  duration?: number
  className?: string
}

/** Infinite horizontal loop: the track holds two copies and slides by half. */
export default function Marquee({ children, duration = 30, className = '' }: MarqueeProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="flex w-max animate-[marquee_linear_infinite]" style={{ animationDuration: `${duration}s` }}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
