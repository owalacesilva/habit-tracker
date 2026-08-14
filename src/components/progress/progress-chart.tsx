import { format } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { ChartTone, HabitProgress } from '@/types/habit'

/** Bar colour plus the label colour that stays readable on it, in both themes. */
const TONE_CLASS: Record<ChartTone, string> = {
  walking: 'bg-chart-walking text-chart-walking-on',
  running: 'bg-chart-running text-chart-running-on',
  meditation: 'bg-chart-meditation text-chart-meditation-on',
  drink: 'bg-chart-drink text-chart-drink-on',
}

/** Empty columns still need a visible cap, or the chart reads as broken. */
const MIN_BAR_HEIGHT = 12

export interface ProgressChartProps {
  items: HabitProgress[]
  /** Template with `{label}` and `{percentage}`, e.g. "{label}: {percentage}% …". */
  labelTemplate: string
  className?: string
}

/** Rounded column chart: a hatched track with a filled pill on top. */
export function ProgressChart({ items, labelTemplate, className }: ProgressChartProps) {
  return (
    <div className={cn('flex items-end justify-between gap-3', className)}>
      {items.map((item) => (
        <figure key={item.label} className="flex flex-1 flex-col items-center gap-3">
          <div
            className="relative h-56 w-full overflow-hidden rounded-pill bg-[repeating-linear-gradient(45deg,rgba(255,255,255,.28)_0_6px,transparent_6px_12px)] bg-chart-track"
            role="img"
            aria-label={format(labelTemplate, {
              label: item.label,
              percentage: item.percentage,
            })}
          >
            <div
              className={cn(
                'absolute inset-x-0 bottom-0 flex items-end justify-center rounded-pill pb-3',
                TONE_CLASS[item.tone],
              )}
              style={{
                height: `${Math.max(Math.min(item.percentage, 100), MIN_BAR_HEIGHT)}%`,
              }}
            >
              <span className="font-semibold text-xs">{item.percentage}%</span>
            </div>
          </div>
          <figcaption className="w-full truncate text-center font-medium text-ink-muted text-xs">
            {item.label}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
