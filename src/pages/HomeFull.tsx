import HeroFull from '@/components/full/HeroFull'
import Intro from '@/components/full/Intro'
import SelectedWork from '@/components/full/SelectedWork'
import Disciplines from '@/components/full/Disciplines'
import Approach from '@/components/full/Approach'
import Exhibitions from '@/components/full/Exhibitions'
import TickerFooter from '@/components/full/TickerFooter'

// Full-screen version: k95-style 3D hero, then donut-studio composition below
export default function HomeFull({ paused }: { paused: boolean }) {
  return (
    <>
      <HeroFull paused={paused} />
      <Intro />
      <SelectedWork />
      <Disciplines />
      <Approach />
      <Exhibitions />
      <TickerFooter />
    </>
  )
}
