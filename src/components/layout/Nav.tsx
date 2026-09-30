import { motion } from 'framer-motion'
import { navigate } from '@/lib/router'
import { getLenis } from '@/lib/lenis'

interface NavProps {
  page: 'home' | 'about'
}

// The whole nav uses mix-blend-difference (the "mask" from the original site):
// white paints as black on white, and inverts over images and dark sections.
// #fa00bc is the difference-complement of the accent, so hover fills read green on white.
function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-full border border-white px-4 py-1.5 text-[13px] font-medium tracking-[0.04em] md:px-6 md:py-2 md:text-[15px] ${
        active ? 'bg-white text-black' : 'text-white'
      }`}
    >
      {!active && (
        <span className="absolute inset-0 origin-left scale-x-0 rounded-full bg-[#fa00bc] transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
      )}
      <span className="relative">{label}</span>
    </button>
  )
}

export default function Nav({ page }: NavProps) {
  const goHome = () => {
    if (window.location.pathname === '/') getLenis()?.scrollTo('#work', { duration: 1.4 })
    else navigate('/')
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-4 text-white mix-blend-difference md:px-5 md:py-5"
    >
      <button onClick={() => navigate('/')} className="pointer-events-auto font-display text-[15px] font-semibold tracking-[0.03em] md:text-[18px]">
        IVA PRESEČKI
      </button>
      <nav className="pointer-events-auto flex gap-2">
        <Pill label="PORTFOLIO" active={page === 'home'} onClick={goHome} />
        <Pill label="ABOUT" active={page === 'about'} onClick={() => navigate('/about')} />
      </nav>
    </motion.header>
  )
}
