import { useId, useRef } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from '@/lib/gsap'

interface GooProps {
  children: string
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span'
  className?: string
  delay?: number
  // Scroll container when used inside the project drawer
  scroller?: React.RefObject<HTMLElement | null>
  start?: string
  // Reveal immediately instead of on scroll
  immediate?: boolean
}

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * "Melt" reveal from bleibtgleich.dev: each line starts as an invisible blur,
 * thickens into a gooey blob (blur + alpha threshold), then snaps sharp.
 */
export default function Goo({
  children,
  as: Tag = 'p',
  className = '',
  delay = 0,
  scroller,
  start = 'top 92%',
  immediate = false,
}: GooProps) {
  const root = useRef<HTMLElement>(null)
  const defs = useRef<SVGDefsElement>(null)
  const uid = useId().replace(/:/g, '')

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      let revealed = false

      SplitText.create(root.current!, {
        type: 'lines',
        linesClass: 'goo-line',
        tag: 'span',
        autoSplit: true,
        onSplit(self) {
          defs.current!.replaceChildren()
          if (revealed) return

          const lines = self.lines as HTMLElement[]
          const tl = gsap.timeline({ paused: true, delay, onComplete: () => (revealed = true) })

          lines.forEach((line, i) => {
            const filter = document.createElementNS(SVG_NS, 'filter')
            filter.id = `goo-${uid}-${i}`
            filter.setAttribute('x', '-20%')
            filter.setAttribute('y', '-60%')
            filter.setAttribute('width', '140%')
            filter.setAttribute('height', '220%')
            const blur = document.createElementNS(SVG_NS, 'feGaussianBlur')
            const matrix = document.createElementNS(SVG_NS, 'feColorMatrix')
            matrix.setAttribute('type', 'matrix')
            filter.append(blur, matrix)
            defs.current!.append(filter)
            line.style.filter = `url(#${filter.id})`

            const state = { std: 50, a: 20, b: -8 }
            const apply = () => {
              blur.setAttribute('stdDeviation', String(state.std))
              matrix.setAttribute('values', `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${state.a} ${state.b}`)
            }
            apply()

            const at = i * 0.1
            tl.to(state, { std: 0, duration: 1.2, ease: 'power2.out', onUpdate: apply }, at)
              .to(state, { a: 1, b: 0, duration: 0.42, ease: 'none', onUpdate: apply }, at + 0.78)
              .call(() => (line.style.filter = 'none'), [], at + 1.25)
          })

          if (immediate) tl.play()
          else
            ScrollTrigger.create({
              trigger: root.current,
              start,
              once: true,
              scroller: scroller?.current ?? undefined,
              onEnter: () => tl.play(),
            })
          return tl
        },
      })
    },
    { scope: root },
  )

  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute size-0">
        <defs ref={defs} />
      </svg>
      <Tag
        ref={(el: HTMLElement | null) => {
          root.current = el
        }}
        className={className}
      >
        {children}
      </Tag>
    </>
  )
}
