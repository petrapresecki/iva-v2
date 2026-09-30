import Goo from '@/components/ui/Goo'
import Label from '@/components/ui/Label'
import RollText from '@/components/ui/RollText'
import { site } from '@/data/site'

const BODY = 'text-[clamp(26px,3.3vw,54px)] leading-[1.06] font-medium tracking-[-0.035em]'

export default function About() {
  return (
    <div className="min-h-svh px-4 pt-28 pb-16 md:px-5 md:pt-32">
      <Goo
        as="h1"
        immediate
        delay={0.4}
        className="text-[clamp(110px,24vw,420px)] leading-[0.82] font-medium tracking-[-0.065em]"
      >
        {site.greeting}
      </Goo>

      <section className="mt-[14vh] grid gap-y-8 md:grid-cols-12">
        <Label className="md:col-span-3 md:pt-3">About</Label>
        <div className={`space-y-[0.9em] md:col-span-9 ${BODY}`}>
          {site.bio.map((paragraph, i) => (
            <Goo key={i}>{paragraph}</Goo>
          ))}
        </div>
      </section>

      <section className="mt-[18vh] grid gap-y-8 md:grid-cols-12">
        <Label className="md:col-span-3 md:pt-5">Exhibitions</Label>
        <ul className="md:col-span-9">
          {site.exhibitions.map(item => (
            <li key={item} className="border-t border-ink py-4 last:border-b">
              <Goo as="span" className={`block ${BODY}`}>
                {item}
              </Goo>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-[18vh] grid gap-y-8 md:grid-cols-12">
        <Label className="md:col-span-3 md:pt-4">Contact</Label>
        <a
          href={`mailto:${site.email}`}
          className="group w-fit text-[clamp(30px,5.6vw,104px)] leading-none font-medium tracking-[-0.045em] md:col-span-9"
        >
          <RollText text={site.email} />
        </a>
      </section>
    </div>
  )
}
