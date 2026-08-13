import { HabitRow } from '@/components/habits/habit-row'
import type { Habit } from '@/types/habit'

export interface HabitListItem {
  habit: Habit
  completed: boolean
  streak: number
}

export interface HabitListProps {
  items: HabitListItem[]
  isoDate: string
  onToggle: (habitId: string, isoDate: string) => Promise<boolean>
}

export function HabitList({ items, isoDate, onToggle }: HabitListProps) {
  if (items.length === 0) {
    return (
      <p className="card px-4 py-6 text-center text-sm text-ink-muted">
        Nothing scheduled for this day. Tap + to add a habit.
      </p>
    )
  }

  return (
    <ol className="relative space-y-3">
      {/* Dotted timeline linking the check circles. */}
      <span
        aria-hidden
        className="absolute top-6 bottom-6 left-[11px] border-l border-dashed border-sand-300"
      />
      {items.map(({ habit, completed, streak }) => (
        <HabitRow
          key={habit.id}
          habit={habit}
          isoDate={isoDate}
          completed={completed}
          streak={streak}
          onToggle={onToggle}
        />
      ))}
    </ol>
  )
}
