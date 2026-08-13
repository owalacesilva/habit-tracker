import { cn } from '@/lib/utils'
import type { ChartTone, HabitProgress } from '@/types/habit'

const TONE_CLASS: Record<ChartTone, string> = {
  walking: 'bg-chart-walking',
  running: 'bg-chart-running',
  meditation: 'bg-chart-meditation',
  drink: 'bg-chart-drink',
}

/** Empty columns still need a visible cap, or the chart reads as broken. */
const MIN_BAR_HEIGHT = 12

export interface ProgressChartProps {
  items: HabitProgress[]
  className?: string
}

/** Rounded column chart: a hatched track with a filled pill on top. */
export function ProgressChart({ items, className }: ProgressChartProps) {
  return (
    <div className={cn('flex items-end justify-between gap-3', className)}>
      {items.map((item) => (
        <figure key={item.label} className="flex flex-1 flex-col items-center gap-3">
          <div
            className="relative h-56 w-full overflow-hidden rounded-pill bg-chart-track bg-[repeating-linear-gradient(45deg,rgba(255,255,255,.55)_0_6px,transparent_6px_12px)]"
            role="img"
            aria-label={`${item.label}: ${item.percentage}% complete this week`}
          >
            <div
              className={cn(
                'absolute inset-x-0 bottom-0 flex items-end justify-center rounded-pill pb-3',
                TONE_CLASS[item.tone],
              )}
              style={{ height: `${Math.max(Math.min(item.percentage, 100), MIN_BAR_HEIGHT)}%` }}
            >
              <span className="text-xs font-semibold text-white">{item.percentage}%</span>
            </div>
          </div>
          <figcaption className="text-xs font-medium text-ink-muted">{item.label}</figcaption>
        </figure>
      ))}
    </div>
  )
}
