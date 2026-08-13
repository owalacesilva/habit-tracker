import { HabitRow, type HabitRowLabels } from '@/components/habits/habit-row'
import { EmptyState } from '@/components/ui/states'
import type { Habit } from '@/types/habit'

export interface HabitListItem {
  habit: Habit
  completed: boolean
  streak: number
}

export interface HabitListProps {
  items: HabitListItem[]
  isoDate: string
  labels: HabitRowLabels & { emptyTitle: string; emptyBody: string }
  onToggle: (habitId: string, isoDate: string) => Promise<boolean>
}

export function HabitList({ items, isoDate, labels, onToggle }: HabitListProps) {
  if (items.length === 0) {
    return <EmptyState icon="🌱" title={labels.emptyTitle} body={labels.emptyBody} />
  }

  return (
    <ol className="relative space-y-3">
      {/* Dotted timeline linking the check circles. */}
      <span
        aria-hidden="true"
        className="absolute top-6 bottom-6 left-[11px] border-sand-300 border-l border-dashed"
      />
      {items.map(({ habit, completed, streak }) => (
        <HabitRow
          key={habit.id}
          habit={habit}
          isoDate={isoDate}
          completed={completed}
          streak={streak}
          labels={labels}
          onToggle={onToggle}
        />
      ))}
    </ol>
  )
}
