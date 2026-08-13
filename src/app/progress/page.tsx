import type { Metadata } from 'next'

import { requireUser } from '@/auth'
import { SheetHeader } from '@/components/layout/sheet-header'
import { PointsCard } from '@/components/progress/points-card'
import { ProgressChart } from '@/components/progress/progress-chart'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { formatDuration, weekStrip } from '@/lib/date'
import { listHabits, weeklyProgress } from '@/lib/habits'

export const metadata: Metadata = { title: 'Progress' }
export const dynamic = 'force-dynamic'

/** 10 points per completed day — a placeholder rule until scoring is designed. */
const POINTS_PER_COMPLETION = 10

export default async function ProgressPage() {
  const user = await requireUser()

  const now = new Date()
  const week = weekStrip(now)
  const weekDates = week.map((day) => day.date)
  const weekIsoDates = new Set(week.map((day) => day.iso))

  const habits = listHabits(user.id)
  const completionsThisWeek = habits.flatMap((habit) =>
    habit.completedDates.filter((iso) => weekIsoDates.has(iso)),
  ).length

  const minutesThisWeek = habits.reduce(
    (total, habit) =>
      total +
      habit.completedDates.filter((iso) => weekIsoDates.has(iso)).length * habit.durationMinutes,
    0,
  )

  return (
    <main className="app-shell justify-between gap-8 px-0 pt-8">
      <div className="flex flex-col gap-8 px-5">
        <SheetHeader title="Your progress and insights" />
        <ProgressChart items={weeklyProgress(user.id, weekDates)} />
      </div>

      <div className="mt-auto flex flex-col gap-4">
        <PointsCard
          points={completionsThisWeek * POINTS_PER_COMPLETION}
          stats={[
            { label: 'Completed', value: `${completionsThisWeek}` },
            { label: 'Habits', value: `${habits.length}` },
            { label: 'Time', value: formatDuration(minutesThisWeek) },
          ]}
        />
        <div className="px-5 pb-6 text-center">
          <SignOutButton />
        </div>
      </div>
    </main>
  )
}
