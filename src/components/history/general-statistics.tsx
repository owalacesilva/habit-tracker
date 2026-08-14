import { format, plural } from '@/lib/i18n'
import type { GeneralStatistics as GeneralStatisticsData } from '@/lib/statistics'
import { cn } from '@/lib/utils'

export interface GeneralStatisticsLabels {
  currentStreak: string
  currentStreakUnit: string
  completedHabits: string
  completedUnit: string
  completionRate: string
  perfectDays: string
  perfectDaysHint: string
  dayOne: string
  dayOther: string
}

export interface GeneralStatisticsProps {
  statistics: GeneralStatisticsData
  labels: GeneralStatisticsLabels
}

interface TileProps {
  label: string
  value: string
  hint: string
  accent?: boolean
}

function Tile({ label, value, hint, accent = false }: TileProps) {
  return (
    <div className="card flex flex-col gap-0.5 px-4 py-3.5">
      <p className="font-medium text-[11px] text-ink-muted">{label}</p>
      <p className={cn('font-bold text-2xl', accent ? 'text-brand-500' : 'text-ink')}>{value}</p>
      <p className="text-[11px] text-ink-soft">{hint}</p>
    </div>
  )
}

/** Headline numbers for the selected period: streak, volume, rate, perfect days. */
export function GeneralStatistics({ statistics, labels }: GeneralStatisticsProps) {
  return (
    <section className="grid grid-cols-2 gap-3">
      <Tile
        accent
        label={labels.currentStreak}
        value={`${statistics.currentStreak}`}
        hint={labels.currentStreakUnit}
      />
      <Tile
        label={labels.completedHabits}
        value={`${statistics.completed}`}
        hint={format(labels.completedUnit, { scheduled: statistics.scheduled })}
      />
      <Tile
        label={labels.completionRate}
        value={`${statistics.completionRate}%`}
        hint={plural(statistics.days, labels.dayOne, labels.dayOther)}
      />
      <Tile
        label={labels.perfectDays}
        value={`${statistics.perfectDays}`}
        hint={labels.perfectDaysHint}
      />
    </section>
  )
}
