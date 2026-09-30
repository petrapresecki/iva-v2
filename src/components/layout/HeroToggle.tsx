import type { HeroVariant } from '@/hooks/useHeroVariant'

// Temporary switcher while choosing between the two directions
export default function HeroToggle({ value, onChange }: { value: HeroVariant; onChange: (v: HeroVariant) => void }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 gap-1 rounded-full bg-ink/90 p-1 text-[12px] text-white shadow-lg backdrop-blur">
      {(['grid', 'full'] as const).map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`rounded-full px-3 py-1.5 whitespace-nowrap transition-colors ${
            v === value ? 'bg-accent text-ink' : 'text-white/60 hover:text-white'
          }`}
        >
          {v === 'grid' ? 'Grid version' : 'Full-screen version'}
        </button>
      ))}
    </div>
  )
}
