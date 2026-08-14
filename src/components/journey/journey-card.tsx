import { Button } from '@/components/ui/button'
import { format } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { HabitAccent } from '@/types/habit'
import type { JourneyLevel, JourneyView } from '@/types/journey'

const ACCENT_CLASS: Record<HabitAccent, string> = {
  water: 'bg-habit-water',
  meditate: 'bg-habit-meditate',
  stretch: 'bg-habit-stretch',
  walk: 'bg-habit-walk',
}

export interface JourneyCardLabels {
  recommendedBadge: string
  durationDays: string
  habitCount: string
  levelGentle: string
  levelSteady: string
  levelBold: string
  start: string
  continue: string
  inProgress: string
  progress: string
}

function levelLabel(level: JourneyLevel, labels: JourneyCardLabels): string {
  if (level === 'gentle') return labels.levelGentle
  if (level === 'steady') return labels.levelSteady
  return labels.levelBold
}

export interface JourneyCardProps {
  journey: JourneyView
  labels: JourneyCardLabels
  /** Enrols the user; the data layer persists it. */
  onStart: (journeyId: string) => void | Promise<void>
  /** Recommended cards get a brand outline so the section reads at a glance. */
  highlighted?: boolean
}

export function JourneyCard({ journey, labels, onStart, highlighted = false }: JourneyCardProps) {
  const started = journey.progress !== null

  return (
    <article
      className={cn(
        'card flex flex-col gap-3 p-4',
        highlighted && 'border-2 border-brand-300 bg-brand-50',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl',
            ACCENT_CLASS[journey.accent],
          )}
        >
          {journey.icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
            <h3 className="text-balance font-bold text-ink text-sm">{journey.title}</h3>
            {journey.recommended && (
              <span className="rounded-pill bg-brand-500 px-2 py-0.5 font-semibold text-[10px] text-white">
                {labels.recommendedBadge}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-ink-muted text-xs leading-relaxed">
            {journey.description}
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap items-center gap-1.5 font-medium text-[11px] text-ink-muted">
        <li className="rounded-pill bg-sand-100 px-2.5 py-1">
          {format(labels.durationDays, { count: journey.durationDays })}
        </li>
        <li className="rounded-pill bg-sand-100 px-2.5 py-1">
          {format(labels.habitCount, { count: journey.habitCount })}
        </li>
        <li className="rounded-pill bg-sand-100 px-2.5 py-1">
          {levelLabel(journey.level, labels)}
        </li>
      </ul>

      {journey.progress && (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-[11px]">
            <span className="font-semibold text-brand-600">{labels.inProgress}</span>
            <span className="text-ink-muted">
              {format(labels.progress, {
                done: journey.progress.day,
                total: journey.progress.total,
              })}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={journey.progress.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={journey.title}
            className="h-1.5 w-full overflow-hidden rounded-pill bg-sand-200"
          >
            <span
              className="block h-full rounded-pill bg-brand-500"
              style={{ width: `${journey.progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      <Button
        type="button"
        variant={started ? 'ghost' : 'primary'}
        size="sm"
        onClick={() => onStart(journey.id)}
        className={cn('w-full', started && 'border border-sand-200 shadow-none')}
      >
        {started ? labels.continue : labels.start}
      </Button>
    </article>
  )
}
