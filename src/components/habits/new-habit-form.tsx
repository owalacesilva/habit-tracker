'use client'

import { useRouter } from 'next/navigation'

import { HabitForm, type HabitFormLabels } from '@/components/habits/habit-form'
import { useHabits } from '@/lib/data/provider'
import { type HabitFormState, parseHabitForm } from '@/lib/habit-form'

export interface NewHabitFormProps {
  labels: HabitFormLabels
  weekdayInitials: string[]
}

/**
 * Creates the habit through the data layer, then returns to the routine.
 *
 * Replaces the previous server action: with the store in the browser there is
 * nothing to post to, and this works offline for free.
 */
export function NewHabitForm({ labels, weekdayInitials }: NewHabitFormProps) {
  const { createHabit } = useHabits()
  const router = useRouter()

  async function submit(_state: HabitFormState, formData: FormData): Promise<HabitFormState> {
    const parsed = parseHabitForm(formData)
    if (!parsed.success) return { error: parsed.error }

    try {
      await createHabit(parsed.input)
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }

    router.push('/')
    return {}
  }

  return <HabitForm action={submit} labels={labels} weekdayInitials={weekdayInitials} />
}
