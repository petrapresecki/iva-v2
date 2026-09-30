import { navigate } from '@/lib/router'
import { getProject } from '@/data/projects'
import Marquee from '@/components/ui/Marquee'

// Each discipline links to the projects it appears in
const disciplines = [
  { title: 'Branding & visual identity', projects: ['rool', 'apuro', 'gabagool'] },
  { title: 'Packaging', projects: ['apuro', 'gabagool'] },
  { title: 'Editorial & cover design', projects: ['booklet'] },
  { title: 'Motion & animation', projects: ['rool', 'apuro', 'gabagool'] },
  { title: '3D modelling', projects: ['rool', 'apuro', 'booklet'] },
]

const words = ['Branding', 'Packaging', 'Editorial', 'Motion', '3D']

export default function Disciplines() {
  return (
    <section className="pt-[18vh]">
      <h2 className="px-4 text-[clamp(72px,12vw,184px)] leading-[0.95] font-medium tracking-[-0.05em] md:px-5">
        Disciplines
      </h2>

      <Marquee duration={18} className="mt-4 bg-accent py-1">
        {words.map(word => (
          <span key={word} className="caption flex items-center gap-8 pr-8 text-[13px]">
            {word} <span aria-hidden>✦</span>
          </span>
        ))}
      </Marquee>

      <ul className="mt-10 px-4 md:ml-[33.333%] md:px-5">
        {disciplines.map((d, i) => (
          <li
            key={d.title}
            className="group grid grid-cols-[3ch_1fr] gap-x-4 gap-y-2 border-t border-ink py-4 transition-colors duration-300 last:border-b hover:border-accent md:grid-cols-[3ch_1fr_1fr] md:py-5"
          >
            <span className="caption pt-1.5">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-[22px] leading-tight font-medium tracking-[-0.02em] transition-transform duration-500 ease-out-expo group-hover:translate-x-2 md:text-[28px]">
              {d.title}
            </span>
            <span className="col-start-2 flex flex-wrap gap-x-3 text-[14px] text-gray md:col-start-3 md:justify-end md:pt-2">
              {d.projects.map(id => {
                const project = getProject(id)!
                return (
                  <button key={id} onClick={() => navigate(`/work/${id}`)} className="underline-offset-4 hover:text-ink hover:underline">
                    {project.title}
                  </button>
                )
              })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
