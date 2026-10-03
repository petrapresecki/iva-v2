import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { about, projects, type V3Project } from './content'
import { Media } from './ui'

type Go = (path: string, e: React.MouseEvent) => void

export function ProjectPage({ project, onGo }: { project: V3Project; onGo: Go }) {
  const root = useRef<HTMLDivElement>(null)
  const i = projects.indexOf(project)
  const prev = projects[i - 1]
  const next = projects[i + 1]

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // the title rises out of its line, then the page settles in under it
      gsap.from('.v3-project__title .v3-ch', { yPercent: 105, duration: 0.9, ease: 'expo.out', stagger: 0.03, delay: 0.2 })
      gsap.from('.v3-project__labels span, .v3-project__hero, .v3-project__body > *', { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, delay: 0.35 })
    },
    { scope: root, dependencies: [project.id] },
  )

  return (
    <div ref={root} className="v3-project" style={{ color: project.ink }}>
      <div className="v3-project__labels v3-label">
        <span>{project.n} / 04</span>
        <span>{project.category}</span>
        <span>{project.year}</span>
      </div>
      <h1 className="v3-project__title" style={{ color: project.titleInk, fontSize: `min(clamp(64px, 13vw, 220px), ${(170 / project.title.length).toFixed(2)}vw)` }} aria-label={project.title}>
        {[...project.title].map((c, k) => (
          <span key={k} className="v3-ch" aria-hidden>
            {c}
          </span>
        ))}
      </h1>
      <div className="v3-project__hero">
        <video src={project.hero} autoPlay muted loop playsInline />
      </div>
      <div className="v3-project__body">
        <div className="v3-project__desc">
          {project.desc.map(t => (
            <p key={t.slice(0, 24)}>{t}</p>
          ))}
          <div className="v3-tools v3-label">
            {project.tools.map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="v3-gallery">
        {project.gallery.map((row, r) => (
          <div key={r} className={`v3-gallery__row ${row.length > 1 ? 'is-pair' : ''}`}>
            {row.map(item => (
              <Media key={item.src} item={item} />
            ))}
          </div>
        ))}
      </div>
      <nav className="v3-project__nav v3-label">
        {prev ? (
          <button className="v3-btn" onClick={e => onGo(`/v3/work/${prev.id}`, e)}>
            previous project
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button className="v3-btn" onClick={e => onGo(`/v3/work/${next.id}`, e)}>
            next project
          </button>
        )}
      </nav>
    </div>
  )
}

export function AboutPage() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.v3-about__hi', { yPercent: 40, opacity: 0, duration: 0.9, ease: 'expo.out', delay: 0.2 })
      gsap.from('.v3-about__mail, .v3-about__bio p, .v3-about__ex', { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, delay: 0.35 })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="v3-about">
      <h1 className="v3-about__hi">{about.hi}</h1>
      <a className="v3-btn v3-label v3-about__mail" href={`mailto:${about.email}`}>
        E-MAIL
      </a>
      <div className="v3-about__bio">
        {about.bio.map(t => (
          <p key={t.slice(0, 24)}>{t}</p>
        ))}
      </div>
      <div className="v3-about__ex v3-label">
        <b>{about.exhibitionsTitle}</b>
        {about.exhibitions.map(t => (
          <div key={t}>{t}</div>
        ))}
      </div>
    </div>
  )
}
