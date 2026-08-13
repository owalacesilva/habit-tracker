import { EmptyState } from '@/components/ui/states'
import { format, plural } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { Habit, HabitAccent } from '@/types/habit'

const ACCENT_CLASS: Record<HabitAccent, string> = {
  water: 'bg-habit-water',
  meditate: 'bg-habit-meditate',
  stretch: 'bg-habit-stretch',
  walk: 'bg-habit-walk',
}

export interface HabitsPanelItem {
  habit: Habit
  streak: number
  weeklyCompletion: number
}

export interface HabitsPanelLabels {
  scheduleEveryDay: string
  completionRate: string
  totalCompletions: string
  streakOne: string
  streakOther: string
  emptyTitle: string
  emptyBody: string
}

export interface HabitsPanelProps {
  items: HabitsPanelItem[]
  labels: HabitsPanelLabels
  /** Monday-first single letters for the schedule summary. */
  weekdayInitials: string[]
}

function scheduleText(habit: Habit, labels: HabitsPanelLabels, initials: string[]): string {
  if (habit.repeatDays.length === 7) return labels.scheduleEveryDay
  return habit.repeatDays
    .slice()
    .sort((a, b) => a - b)
    .map((day) => initials[day])
    .join(' ')
}

/** Every habit the user keeps, with how it is going — not tied to one day. */
export function HabitsPanel({ items, labels, weekdayInitials }: HabitsPanelProps) {
  if (items.length === 0) {
    return <EmptyState icon="📋" title={labels.emptyTitle} body={labels.emptyBody} />
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map(({ habit, streak, weeklyCompletion }) => (
        <li key={habit.id} className="card flex items-start gap-3 p-4">
          <span
            aria-hidden
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg',
              ACCENT_CLASS[habit.accent],
            )}
          >
            {habit.icon}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-balance text-ink">{habit.name}</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {scheduleText(habit, labels, weekdayInitials)}
            </p>

            <ul className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium text-ink-muted">
              <li className="rounded-pill bg-sand-100 px-2.5 py-1 text-brand-600">
                {plural(streak, labels.streakOne, labels.streakOther)}
              </li>
              <li className="rounded-pill bg-sand-100 px-2.5 py-1">
                {format(labels.completionRate, { percentage: weeklyCompletion })}
              </li>
              <li className="rounded-pill bg-sand-100 px-2.5 py-1">
                {format(labels.totalCompletions, { count: habit.completedDates.length })}
              </li>
            </ul>
          </div>
        </li>
      ))}
    </ul>
  )
}
