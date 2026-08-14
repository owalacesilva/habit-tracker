import type { Metadata } from 'next'

import { NewHabitForm } from '@/components/habits/new-habit-form'
import { NewHabitIllustration } from '@/components/icons'
import { SheetHeader } from '@/components/layout/sheet-header'
import { weekdayInitials } from '@/lib/date'
import { getI18n } from '@/lib/server-settings'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.newHabit.title }
}

export default async function NewHabitPage() {
  const { locale, t } = await getI18n()

  return (
    <main className="app-shell gap-6 px-5 pt-8 pb-8">
      <SheetHeader title={t.newHabit.title} closeLabel={t.common.close} />

      <NewHabitIllustration className="mx-auto h-32 w-40 animate-rise-in" />

      <NewHabitForm
        weekdayInitials={weekdayInitials(locale)}
        labels={{
          nameLabel: t.newHabit.nameLabel,
          namePlaceholder: t.newHabit.namePlaceholder,
          goalLabel: t.newHabit.goalLabel,
          goalDate: t.newHabit.goalDate,
          duration: t.newHabit.duration,
          repeatLabel: t.newHabit.repeatLabel,
          repeatEveryDay: t.newHabit.repeatEveryDay,
          repeatOnDay: t.newHabit.repeatOnDay,
          remindersLabel: t.newHabit.remindersLabel,
          save: t.newHabit.save,
          saving: t.newHabit.saving,
          minutes: t.common.minutesShort,
        }}
      />
    </main>
  )
}
