import { HERO_VARIANTS, WORK_VARIANTS, type HeroVariant, type WorkVariant } from '@/hooks/useChoice'

const heroLabels: Record<HeroVariant, string> = { grid: 'Grid version', full: 'Full-screen version' }
const workLabels: Record<WorkVariant, string> = { rows: 'Rows', index: 'Index', strips: 'Strips' }

function Options<T extends string>({
  options,
  labels,
  value,
  onChange,
}: {
  options: readonly T[]
  labels: Record<T, string>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1">
      {options.map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`rounded-full px-3 py-1.5 whitespace-nowrap transition-colors ${
            v === value ? 'bg-accent text-ink' : 'text-white/60 hover:text-white'
          }`}
        >
          {labels[v]}
        </button>
      ))}
    </div>
  )
}

interface VariantSwitcherProps {
  hero: HeroVariant
  onHero: (v: HeroVariant) => void
  work: WorkVariant
  onWork: (v: WorkVariant) => void
}

// Temporary switcher while choosing between directions
export default function VariantSwitcher({ hero, onHero, work, onWork }: VariantSwitcherProps) {
  return (
    <div className="fixed bottom-4 left-1/2 z-[60] flex max-w-[calc(100vw-24px)] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-[20px] bg-ink/90 p-1 text-[12px] text-white shadow-lg backdrop-blur">
      <Options options={HERO_VARIANTS} labels={heroLabels} value={hero} onChange={onHero} />
      {hero === 'grid' && (
        <div className="flex items-center gap-1 border-white/15 pl-1 sm:border-l">
          <span className="px-2 text-white/40">Work</span>
          <Options options={WORK_VARIANTS} labels={workLabels} value={work} onChange={onWork} />
        </div>
      )}
    </div>
  )
}
