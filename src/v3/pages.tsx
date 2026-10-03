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
      // letters rise while the title stretches from condensed to wide
      const title = root.current!.querySelector<HTMLElement>('.v3-project__title')!
      const width = { w: 62 }
      gsap.fromTo('.v3-project__title .v3-ch', { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.04, delay: 0.15 })
      gsap.to(width, { w: 110, duration: 1.2, ease: 'expo.out', delay: 0.2, onUpdate: () => void (title.style.fontStretch = `${width.w}%`) })
      gsap.from('.v3-row > *, .v3-project__hero, .v3-project__desc', { y: 60, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, delay: 0.3 })
    },
    { scope: root, dependencies: [project.id] },
  )

  return (
    <div ref={root} className="v3-project" style={{ color: project.ink }}>
      <h1 className="v3-project__title" style={{ color: project.titleInk, fontSize: `min(clamp(84px, 21vw, 360px), ${(112 / project.title.length).toFixed(2)}vw)` }} aria-label={project.title}>
        {[...project.title].map((c, k) => (
          <span key={k} className="v3-ch" aria-hidden>
            {c}
          </span>
        ))}
      </h1>
      <div className="v3-row v3-small">
        <span>{project.n} / 04</span>
        <span>{project.category}</span>
        <span>{project.year}</span>
        <span>{project.tools.join(', ')}</span>
      </div>
      <div className="v3-project__hero">
        <video src={project.hero} autoPlay muted loop playsInline />
      </div>
      <div className="v3-project__desc v3-text">
        {project.desc.map(t => (
          <p key={t.slice(0, 24)}>{t}</p>
        ))}
      </div>
      <div className="v3-gallery">
        {project.gallery.map((row, r) => (
          <div key={r} className={`v3-gallery__row ${row.length > 1 ? 'is-pair' : ''}`}>
            {row.map(item => (
              // a pair shares one height: each side is as wide as its aspect ratio asks
              <div key={item.src} className="v3-frame" style={item.ratio ? { flex: `${item.ratio} 1 0`, aspectRatio: item.ratio } : undefined}>
                <Media item={item} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <nav className="v3-row v3-small v3-project__nav">
        {prev ? (
          <button className="v3-link" onClick={e => onGo(`/v3/work/${prev.id}`, e)}>
            ← previous project
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button className="v3-link" onClick={e => onGo(`/v3/work/${next.id}`, e)}>
            next project →
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
      gsap.from('.v3-about__hi', { yPercent: 60, opacity: 0, duration: 0.9, ease: 'back.out(1.8)', delay: 0.15 })
      gsap.from('.v3-row, .v3-about__bio', { y: 50, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, delay: 0.3 })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="v3-about">
      <h1 className="v3-about__hi">{about.hi}</h1>
      <div className="v3-row v3-small">
        <a className="v3-link" href={`mailto:${about.email}`}>
          {about.email}
        </a>
      </div>
      <div className="v3-about__bio v3-text">
        {about.bio.map(t => (
          <p key={t.slice(0, 24)}>{t}</p>
        ))}
      </div>
      <div className="v3-row v3-small v3-about__ex">
        <b>{about.exhibitionsTitle}</b>
        {about.exhibitions.map(t => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  )
}
