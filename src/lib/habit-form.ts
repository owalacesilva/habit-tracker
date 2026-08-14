import { z } from 'zod'

import type { NewHabitInput, Weekday } from '@/types/habit'

/** Shared by the form and by anything else that accepts habit input. */
export const newHabitSchema = z.object({
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

export type ParseResult =
  | { success: true; input: NewHabitInput }
  | { success: false; error: string }

/** Turn the submitted form into habit input, or into a message for the field. */
export function parseHabitForm(formData: FormData): ParseResult {
  const parsed = newHabitSchema.safeParse({
    name: formData.get('name'),
    durationMinutes: formData.get('durationMinutes') || 10,
    repeatDays: formData.getAll('repeatDays'),
    remindersEnabled: formData.get('remindersEnabled') === 'on',
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' }
  }

  return {
    success: true,
    input: {
      name: parsed.data.name,
      durationMinutes: parsed.data.durationMinutes,
      repeatDays: parsed.data.repeatDays as Weekday[],
      remindersEnabled: parsed.data.remindersEnabled,
    },
  }
}
