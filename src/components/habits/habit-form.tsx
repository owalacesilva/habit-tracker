'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { CalendarIcon, ChevronDownIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { CheckBox } from '@/components/ui/check-box'
import { Switch } from '@/components/ui/switch'
import { TextField } from '@/components/ui/text-field'
import { WEEKDAY_INITIALS } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { HabitFormState } from '@/app/actions'

export interface HabitFormProps {
  action: (state: HabitFormState, formData: FormData) => Promise<HabitFormState>
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? 'Saving…' : 'Save Habit'}
    </Button>
  )
}

export function HabitForm({ action }: HabitFormProps) {
  const [state, formAction] = useActionState(action, {} as HabitFormState)
  const [repeatDays, setRepeatDays] = useState<number[]>(ALL_DAYS)
  const [goalEnabled, setGoalEnabled] = useState(false)

  function toggleDay(day: number) {
    setRepeatDays((current) =>
      current.includes(day) ? current.filter((value) => value !== day) : [...current, day],
    )
  }

  return (
    <form action={formAction} className="flex flex-1 flex-col gap-6">
      <TextField
        label="Name your habit"
        name="name"
        placeholder="Morning Meditations"
        required
        maxLength={60}
        error={state.error}
      />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-ink">Set a goal</span>
          <CheckBox name="goalEnabled" label="Set a goal" onCheckedChange={setGoalEnabled} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            name="goalDate"
            type="date"
            aria-label="Goal date"
            disabled={!goalEnabled}
            adornment={<CalendarIcon className="h-5 w-5" />}
          />
          <div className="relative">
            <select
              name="durationMinutes"
              aria-label="Duration in minutes"
              disabled={!goalEnabled}
              defaultValue="10"
              className={cn(
                'h-14 w-full appearance-none rounded-card border border-sand-200 bg-surface px-4 pr-10',
                'text-sm text-ink focus:border-brand-300 focus:outline-none disabled:text-ink-soft',
              )}
            >
              {[5, 10, 15, 20, 30, 45, 60].map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} min
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-ink-muted" />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-ink">Repeat days</span>
          <CheckBox
            name="repeatAll"
            label="Repeat every day"
            defaultChecked
            onCheckedChange={(checked) => setRepeatDays(checked ? ALL_DAYS : [])}
          />
        </div>
        <div className="flex justify-between gap-1">
          {WEEKDAY_INITIALS.map((initial, day) => {
            const active = repeatDays.includes(day)
            return (
              <button
                key={`${initial}-${day}`}
                type="button"
                role="checkbox"
                aria-checked={active}
                aria-label={`Repeat on day ${day + 1}`}
                onClick={() => toggleDay(day)}
                className={cn(
                  'h-11 w-11 rounded-full text-sm font-semibold transition-colors',
                  active
                    ? 'bg-ink text-white'
                    : 'border border-sand-200 bg-surface text-ink hover:border-brand-200',
                )}
              >
                {initial}
              </button>
            )
          })}
        </div>
        {repeatDays.map((day) => (
          <input key={day} type="hidden" name="repeatDays" value={day} />
        ))}
      </section>

      <section className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">Get reminders</span>
        <Switch name="remindersEnabled" label="Get reminders" defaultChecked />
      </section>

      <div className="mt-auto pt-2">
        <SubmitButton />
      </div>
    </form>
  )
}
