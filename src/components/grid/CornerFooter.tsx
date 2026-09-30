import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { navigate } from '@/lib/router'
import { site } from '@/data/site'
import Goo from '@/components/ui/Goo'
import Label from '@/components/ui/Label'
import RollText from '@/components/ui/RollText'

/**
 * Bleibtgleich-style footer: "iva" and "presečki" sit faded in the bottom
 * corners the whole way down, then slide together into one word at the end.
 */
export default function CornerFooter() {
  const footer = useRef<HTMLElement>(null)
  const left = useRef<HTMLSpanElement>(null)
  const right = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const l = left.current!
    const r = right.current!
    const targetLeft = () => (window.innerWidth - l.offsetWidth - r.offsetWidth) / 2
    gsap
      .timeline({
        scrollTrigger: {
          trigger: footer.current,
          start: 'top 70%',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      .to(l, { x: () => targetLeft() - l.offsetLeft, opacity: 1, ease: 'none' }, 0)
      .to(r, { x: () => targetLeft() + l.offsetWidth - r.offsetLeft, opacity: 1, ease: 'none' }, 0)
  })

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[5] flex justify-between px-4 pb-3 font-display text-[clamp(44px,7.5vw,140px)] leading-[0.8] font-semibold tracking-[-0.03em] select-none md:px-5">
        <span ref={left} className="opacity-[0.08]">
          iva
        </span>
        <span ref={right} className="opacity-[0.08]">
          presečki
        </span>
      </div>

      <footer ref={footer} className="relative flex min-h-svh flex-col border-t border-ink px-4 pt-6 pb-[16vw] md:px-5">
        <Label>Contact</Label>
        <a
          href={`mailto:${site.email}`}
          className="group mt-[16vh] w-fit text-[clamp(34px,6.4vw,120px)] leading-none font-medium tracking-[-0.045em]"
        >
          <Goo as="span">{site.email}</Goo>
        </a>
        <div className="caption mt-auto flex flex-wrap justify-between gap-4 pt-16">
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
    </>
  )
}
