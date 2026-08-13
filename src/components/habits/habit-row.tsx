'use client'

import { useOptimistic, useTransition } from 'react'

import { CheckIcon, ClockIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import type { Habit, HabitAccent } from '@/types/habit'

const ACCENT_CLASS: Record<HabitAccent, string> = {
  water: 'bg-habit-water',
  meditate: 'bg-habit-meditate',
  stretch: 'bg-habit-stretch',
  walk: 'bg-habit-walk',
}

export interface HabitRowProps {
  habit: Habit
  isoDate: string
  completed: boolean
  streak: number
  /** Server action; the row ticks optimistically while it runs. */
  onToggle: (habitId: string, isoDate: string) => Promise<boolean>
}

export function HabitRow({ habit, isoDate, completed, streak, onToggle }: HabitRowProps) {
  // Falls back to `completed` once the action settles and the server revalidates,
  // which also rolls the tick back when the write fails.
  const [checked, setChecked] = useOptimistic(completed)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      setChecked(!completed)
      try {
        await onToggle(habit.id, isoDate)
      } catch (error) {
        console.error('Could not update habit', error)
      }
    })
  }

  return (
    <li className="relative flex items-center gap-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-busy={isPending}
        aria-label={`Mark "${habit.name}" as ${checked ? 'not done' : 'done'}`}
        onClick={toggle}
        className={cn(
          'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          checked
            ? 'animate-check-pop border-brand-500 bg-brand-500 text-white'
            : 'border-sand-300 bg-surface',
        )}
      >
        {checked && <CheckIcon className="h-3.5 w-3.5" />}
      </button>

      <div
        className={cn(
          'card flex flex-1 items-center gap-3 px-3 py-3 transition-opacity',
          checked && 'opacity-70',
        )}
      >
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
          <p className={cn('truncate text-sm font-semibold', checked && 'line-through')}>
            {habit.name}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            Streak {streak} {streak === 1 ? 'day' : 'days'}
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-1 rounded-pill bg-sand-100 px-2.5 py-1.5 text-[11px] font-medium text-ink-muted">
          <ClockIcon className="h-3.5 w-3.5" />
          {habit.durationMinutes} min
        </span>
      </div>
    </li>
  )
}
