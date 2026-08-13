import type { Metadata } from 'next'

import { createHabitAction } from '@/app/actions'
import { HabitForm } from '@/components/habits/habit-form'
import { NewHabitIllustration } from '@/components/icons'
import { SheetHeader } from '@/components/layout/sheet-header'

export const metadata: Metadata = { title: 'New habit' }

export default function NewHabitPage() {
  return (
    <main className="app-shell gap-6 px-5 pt-8 pb-8">
      <SheetHeader title="New habit" />

      <NewHabitIllustration className="mx-auto h-32 w-40 animate-rise-in" />

      <HabitForm action={createHabitAction} />
    </main>
  )
}
