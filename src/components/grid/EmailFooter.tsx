import { useRef } from 'react'
import { ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { navigate } from '@/lib/router'
import { useTextScramble } from '@/hooks/useTextScramble'
import { site } from '@/data/site'
import Label from '@/components/ui/Label'
import RollText from '@/components/ui/RollText'

/**
 * Compact footer. The email decodes through random characters when it
 * scrolls into view (the scramble from her original site) and again on hover.
 */
export default function EmailFooter() {
  const link = useRef<HTMLAnchorElement>(null)
  const { displayText, trigger } = useTextScramble({ text: site.email, charDelay: 40, cycleSpeed: 35 })
  const reduced = prefersReducedMotion()

  useGSAP(() => {
    if (reduced) return
    ScrollTrigger.create({ trigger: link.current, start: 'top 92%', once: true, onEnter: trigger })
  }, [trigger])

  return (
    <footer className="border-t border-ink px-4 pt-5 pb-5 md:px-5">
      <Label>Contact</Label>

      <div className="my-14 flex justify-center md:my-20">
        <a
          ref={link}
          href={`mailto:${site.email}`}
          aria-label={site.email}
          onMouseEnter={() => !reduced && trigger()}
          className="group relative text-[clamp(28px,5.2vw,100px)] leading-[1.1] font-medium tracking-[-0.05em] whitespace-nowrap"
        >
          <span aria-hidden>{reduced ? site.email : displayText || ' '}</span>
          <span className="absolute inset-x-0 -bottom-1 h-[0.06em] origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
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
