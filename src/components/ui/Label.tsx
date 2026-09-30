import type { ReactNode } from 'react'

/** Small uppercase caption led by a green square. */
export default function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`caption flex items-center gap-2 ${className}`}>
      <span className="size-2 shrink-0 bg-accent" />
      {children}
    </p>
  )
}
