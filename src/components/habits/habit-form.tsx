'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { CalendarIcon, ChevronDownIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { CheckBox } from '@/components/ui/check-box'
import { Switch } from '@/components/ui/switch'
import { TextField } from '@/components/ui/text-field'
import type { HabitFormState } from '@/lib/habit-form'
import { format } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export interface HabitFormLabels {
  nameLabel: string
  namePlaceholder: string
  goalLabel: string
  goalDate: string
  duration: string
  repeatLabel: string
  repeatEveryDay: string
  repeatOnDay: string
  remindersLabel: string
  save: string
  saving: string
  minutes: string
}

export interface HabitFormProps {
  action: (state: HabitFormState, formData: FormData) => Promise<HabitFormState>
  labels: HabitFormLabels
  /** Monday-first single letters for the repeat picker, from the active locale. */
  weekdayInitials: string[]
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

function SubmitButton({ save, saving }: { save: string; saving: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? saving : save}
    </Button>
  )
}

export function HabitForm({ action, labels, weekdayInitials }: HabitFormProps) {
  // The weekday index is the identity here, so name it up front rather than
  // keying a list on its position.
  const weekdays = weekdayInitials.map((initial, index) => ({ day: index, initial }))
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
        label={labels.nameLabel}
        name="name"
        placeholder={labels.namePlaceholder}
        required
        maxLength={60}
        error={state.error}
      />

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="font-medium text-ink text-sm">{labels.goalLabel}</span>
          <CheckBox name="goalEnabled" label={labels.goalLabel} onCheckedChange={setGoalEnabled} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            name="goalDate"
            type="date"
            aria-label={labels.goalDate}
            disabled={!goalEnabled}
            adornment={<CalendarIcon className="h-5 w-5" />}
          />
          <div className="relative">
            <select
              name="durationMinutes"
              aria-label={labels.duration}
              disabled={!goalEnabled}
              defaultValue="10"
              className={cn(
                'h-14 w-full appearance-none rounded-card border border-sand-200 bg-surface px-4 pr-10',
                'text-ink text-sm focus:border-brand-300 focus:outline-none disabled:text-ink-soft',
              )}
            >
              {[5, 10, 15, 20, 30, 45, 60].map((minutes) => (
                <option key={minutes} value={minutes}>
                  {format(labels.minutes, { count: minutes })}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-ink-muted" />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="font-medium text-ink text-sm">{labels.repeatLabel}</span>
          <CheckBox
            name="repeatAll"
            label={labels.repeatEveryDay}
            defaultChecked
            onCheckedChange={(checked) => setRepeatDays(checked ? ALL_DAYS : [])}
          />
        </div>
        <div className="flex justify-between gap-1">
          {weekdays.map(({ day, initial }) => {
            const active = repeatDays.includes(day)
            return (
              <button
                key={day}
                type="button"
                role="checkbox"
                aria-checked={active}
                aria-label={format(labels.repeatOnDay, { day: day + 1 })}
                onClick={() => toggleDay(day)}
                className={cn(
                  'h-11 w-11 rounded-full font-semibold text-sm transition-colors',
                  active
                    ? 'bg-ink text-canvas'
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

      <section className="flex items-center justify-between gap-3">
        <span className="font-medium text-ink text-sm">{labels.remindersLabel}</span>
        <Switch name="remindersEnabled" label={labels.remindersLabel} defaultChecked />
      </section>

      <div className="mt-auto pt-2">
        <SubmitButton save={labels.save} saving={labels.saving} />
      </div>
    </form>
  )
}
