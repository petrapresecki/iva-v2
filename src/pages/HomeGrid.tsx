import { useEffect } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import type { WorkVariant } from '@/hooks/useChoice'
import HeroGrid from '@/components/grid/HeroGrid'
import Statement from '@/components/grid/Statement'
import WorkSection from '@/components/work/WorkSection'
import EmailFooter from '@/components/grid/EmailFooter'

// Grid version: Aspen grid hero, Bleibtgleich typography, switchable work section
export default function HomeGrid({ paused, work }: { paused: boolean; work: WorkVariant }) {
  // Work layouts differ in height, so everything below needs its scroll positions recalculated
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [work])

  return (
    <>
      <HeroGrid paused={paused} />
      <Statement />
      <WorkSection variant={work} />
      <EmailFooter />
    </>
  )
}
