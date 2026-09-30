import HeroGrid from '@/components/grid/HeroGrid'
import Statement from '@/components/grid/Statement'
import WorkGrid from '@/components/grid/WorkGrid'
import EmailFooter from '@/components/grid/EmailFooter'

// Grid version: Aspen grid hero, Bleibtgleich typography, Aspen work grid
export default function HomeGrid({ paused }: { paused: boolean }) {
  return (
    <>
      <HeroGrid paused={paused} />
      <Statement />
      <WorkGrid />
      <EmailFooter />
    </>
  )
}
