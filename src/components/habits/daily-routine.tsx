'use client'

import { HabitList } from '@/components/habits/habit-list'
import { HabitListSkeleton } from '@/components/habits/habit-list-skeleton'
import type { HabitRowLabels } from '@/components/habits/habit-row'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/states'
import { useHabits } from '@/lib/data/provider'
import { parseISODate } from '@/lib/date'
import { currentStreak, habitsForDate, isCompletedOn } from '@/lib/habits'

export interface DailyRoutineLabels extends HabitRowLabels {
  emptyTitle: string
  emptyBody: string
  loading: string
  errorTitle: string
  errorBody: string
  retry: string
}

export interface DailyRoutineProps {
  /** Selected day, `yyyy-mm-dd`, from the URL. */
  isoDate: string
  labels: DailyRoutineLabels
}

/**
 * The habit checklist, reading from the local-first data layer.
 *
 * Everything here runs in the browser, which is what lets the app work with no
 * backend: `useHabits()` is the same whether the records come from IndexedDB or
 * from an external API.
 */
export function DailyRoutine({ isoDate, labels }: DailyRoutineProps) {
  const { habits, status, error, reload, toggleCompletion } = useHabits()

  if (status === 'loading') return <HabitListSkeleton label={labels.loading} />

  if (status === 'error') {
    return (
      <ErrorState
        title={labels.errorTitle}
        body={error?.message ?? labels.errorBody}
        action={
          <Button size="sm" onClick={reload}>
            {labels.retry}
          </Button>
        }
      />
    )
  }

  const selected = parseISODate(isoDate)
  const now = new Date()

  const items = habitsForDate(habits, selected).map((habit) => ({
    habit,
    completed: isCompletedOn(habit, selected),
    streak: currentStreak(habit, now),
  }))

  return <HabitList items={items} isoDate={isoDate} labels={labels} onToggle={toggleCompletion} />
}
