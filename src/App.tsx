import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollTrigger } from '@/lib/gsap'
import { initLenis, destroyLenis, getLenis } from '@/lib/lenis'
import { parseRoute, usePath } from '@/lib/router'
import { getProject } from '@/data/projects'
import CustomCursor from '@/components/ui/CustomCursor'
import Nav from '@/components/layout/Nav'
import HeroToggle from '@/components/layout/HeroToggle'
import { useHeroVariant } from '@/hooks/useHeroVariant'
import ProjectDrawer from '@/components/project/ProjectDrawer'
import HomeGrid from '@/pages/HomeGrid'
import HomeFull from '@/pages/HomeFull'
import About from '@/pages/About'

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.35 },
}

export default function App() {
  const route = parseRoute(usePath())
  const [hero, setHero] = useHeroVariant()
  const project = route.page === 'home' ? getProject(route.projectId) : undefined

  useEffect(() => {
    initLenis()
    return () => destroyLenis()
  }, [])

  // Freeze the page underneath while a project drawer is open
  useEffect(() => {
    const lenis = getLenis()
    if (project) lenis?.stop()
    else lenis?.start()
  }, [project])

  const onPageSwap = () => {
    getLenis()?.scrollTo(0, { immediate: true })
    ScrollTrigger.refresh()
  }

  return (
    <>
      <CustomCursor />
      <Nav page={route.page} />

      <AnimatePresence mode="wait" onExitComplete={onPageSwap}>
        {route.page === 'about' ? (
          <motion.main key="about" {...fade}>
            <About />
          </motion.main>
        ) : (
          <motion.main key={`home-${hero}`} {...fade}>
            {hero === 'grid' ? <HomeGrid paused={!!project} /> : <HomeFull paused={!!project} />}
          </motion.main>
        )}
      </AnimatePresence>

      <AnimatePresence>{project && <ProjectDrawer key="drawer" project={project} />}</AnimatePresence>

      {route.page === 'home' && !project && <HeroToggle value={hero} onChange={setHero} />}
    </>
  )
}
