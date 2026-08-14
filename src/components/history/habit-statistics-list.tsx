import { format, plural } from '@/lib/i18n'
import type { HabitStatistics } from '@/lib/statistics'
import { cn } from '@/lib/utils'
import type { HabitAccent } from '@/types/habit'

const ACCENT_CLASS: Record<HabitAccent, string> = {
  water: 'bg-habit-water',
  meditate: 'bg-habit-meditate',
  stretch: 'bg-habit-stretch',
  walk: 'bg-habit-walk',
}

export interface HabitStatisticsRow {
  statistics: HabitStatistics
  icon: string
  accent: HabitAccent
}

export interface HabitStatisticsListLabels {
  title: string
  habitStreak: string
  habitCompleted: string
  dayOne: string
  dayOther: string
}

export interface HabitStatisticsListProps {
  rows: HabitStatisticsRow[]
  labels: HabitStatisticsListLabels
}

/** Per-habit breakdown: streak, completions and rate for the chosen period. */
export function HabitStatisticsList({ rows, labels }: HabitStatisticsListProps) {
  if (rows.length === 0) return null

  return (
    <section aria-labelledby="habit-breakdown" className="flex flex-col gap-3">
      <h3 id="habit-breakdown" className="font-bold text-ink text-sm">
        {labels.title}
      </h3>

      <ul className="flex flex-col gap-2">
        {rows.map(({ statistics, icon, accent }) => (
          <li key={statistics.habitId} className="card flex items-center gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base',
                ACCENT_CLASS[accent],
              )}
            >
              {icon}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <p className="truncate font-medium text-ink text-sm">{statistics.name}</p>
                <p className="shrink-0 font-semibold text-brand-600 text-xs">
                  {statistics.completionRate}%
                </p>
              </div>

              <div
                role="progressbar"
                aria-valuenow={statistics.completionRate}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={statistics.name}
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-sand-200"
              >
                <span
                  className="block h-full rounded-pill bg-brand-500"
                  style={{ width: `${statistics.completionRate}%` }}
                />
              </div>

              <p className="mt-1.5 text-[11px] text-ink-muted">
                {format(labels.habitStreak, {
                  count: plural(statistics.currentStreak, labels.dayOne, labels.dayOther),
                })}
                {' · '}
                {format(labels.habitCompleted, {
                  completed: statistics.completed,
                  scheduled: statistics.scheduled,
                })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
