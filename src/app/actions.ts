'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { requireUser } from '@/auth'
import { parseISODate } from '@/lib/date'
import { createHabit, toggleCompletion } from '@/lib/habits'
import type { Weekday } from '@/types/habit'

/** Tick or untick a habit for a given day. */
export async function toggleHabitAction(habitId: string, isoDate: string) {
  const user = await requireUser()
  const completed = toggleCompletion(user.id, habitId, parseISODate(isoDate))
  revalidatePath('/')
  revalidatePath('/progress')
  return completed
}

const newHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Give your habit a name')
    .max(60, 'Keep the name under 60 characters'),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(1)
    .max(24 * 60),
  repeatDays: z.array(z.coerce.number().int().min(0).max(6)),
  remindersEnabled: z.boolean(),
})

export interface HabitFormState {
  error?: string
}

export async function createHabitAction(
  _prevState: HabitFormState,
  formData: FormData,
): Promise<HabitFormState> {
  const user = await requireUser()

  const parsed = newHabitSchema.safeParse({
    name: formData.get('name'),
    durationMinutes: formData.get('durationMinutes') || 10,
    repeatDays: formData.getAll('repeatDays'),
    remindersEnabled: formData.get('remindersEnabled') === 'on',
  })

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Please check the form',
    }
  }

  createHabit(user.id, {
    name: parsed.data.name,
    durationMinutes: parsed.data.durationMinutes,
    repeatDays: parsed.data.repeatDays as Weekday[],
    remindersEnabled: parsed.data.remindersEnabled,
  })

  revalidatePath('/')
  redirect('/')
}
