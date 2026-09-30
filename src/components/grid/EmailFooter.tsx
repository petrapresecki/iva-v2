import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { navigate } from '@/lib/router'
import { site } from '@/data/site'
import Label from '@/components/ui/Label'
import RollText from '@/components/ui/RollText'

const [user, domain] = site.email.split('@')

/**
 * Compact footer. When it comes into view, the email's name and domain fly in
 * from opposite edges and meet in the middle. At rest the address is always whole.
 */
export default function EmailFooter() {
  const footer = useRef<HTMLElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const left = useRef<HTMLSpanElement>(null)
  const right = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const l = left.current!
    const r = right.current!
    // Time-based rather than scrubbed, so the merge always completes even when
    // the page can't scroll any further
    gsap
      .timeline({
        scrollTrigger: {
          trigger: footer.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
        defaults: { duration: 1.4, ease: 'expo.inOut' },
      })
      // offsetLeft is measured from the row (the positioned parent) and ignores transforms
      .from(l, { x: () => -l.offsetLeft }, 0)
      .from(r, { x: () => row.current!.clientWidth - r.offsetLeft - r.offsetWidth }, 0)
  })

  return (
    <footer ref={footer} className="border-t border-ink px-4 pt-5 pb-5 md:px-5">
      <Label>Contact</Label>

      <div
        ref={row}
        className="relative my-14 flex justify-center text-[clamp(28px,5.2vw,100px)] font-medium tracking-[-0.05em] whitespace-nowrap md:my-20"
      >
        {/* One link, so hovering anywhere rolls both halves together */}
        <a href={`mailto:${site.email}`} aria-label={site.email} className="group flex">
          <span ref={left}>
            <RollText text={user} />
          </span>
          <span ref={right}>
            <RollText text={`@${domain}`} />
          </span>
        </a>
      </div>

      <div className="caption flex flex-wrap justify-between gap-4">
        <span>© 2026 {site.name}</span>
        <div className="flex gap-6">
          <button onClick={() => navigate('/about')} className="group">
            <RollText text="About" />
          </button>
          <a href={`mailto:${site.email}`} className="group">
            <RollText text="E-mail" />
          </a>
        </div>
      </div>
    </footer>
  )
}
