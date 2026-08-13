import Link from 'next/link'

import { toggleHabitAction } from '@/app/actions'
import { requireUser } from '@/auth'
import { HabitList } from '@/components/habits/habit-list'
import { ReminderBanner } from '@/components/habits/reminder-banner'
import { WeekStrip } from '@/components/habits/week-strip'
import { ChartIcon, PlusIcon } from '@/components/icons'
import { formatLongDate, greeting, isSameDay, parseISODate, toISODate } from '@/lib/date'
import { currentStreak, isCompletedOn, listHabitsForDate } from '@/lib/habits'

export const dynamic = 'force-dynamic'

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const user = await requireUser()
  const { date } = await searchParams

  const now = new Date()
  const selected = parseISODate(date, now)
  const habits = listHabitsForDate(user.id, selected)

  const items = habits.map((habit) => ({
    habit,
    completed: isCompletedOn(habit, selected),
    streak: currentStreak(habit, now),
  }))

  return (
    <main className="app-shell gap-6 px-5 pt-8 pb-28">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl leading-tight font-bold text-ink">
            {greeting(now)}, {user.name ?? 'there'}
          </h1>
          <p className="mt-1 text-xs text-ink-muted">{formatLongDate(selected)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/progress"
            aria-label="Your progress and insights"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-card transition-colors hover:bg-sand-100"
          >
            <ChartIcon className="h-5 w-5" />
          </Link>
          <span
            aria-hidden
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-xl"
            title={user.name ?? undefined}
          >
            🐯
          </span>
        </div>
      </header>

      <WeekStrip selected={selected} />

      <ReminderBanner />

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-ink">
            {isSameDay(selected, now) ? 'Daily routine' : formatLongDate(selected).split(',')[0]}
          </h2>
          <Link href="/progress" className="text-xs font-medium text-ink-muted hover:text-ink">
            See all
          </Link>
        </div>

        <HabitList items={items} isoDate={toISODate(selected)} onToggle={toggleHabitAction} />
      </section>

      {/* FAB, pinned to the bottom of the phone-width column. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 mx-auto h-0 max-w-app">
        <Link
          href="/habits/new"
          aria-label="Add a habit"
          className="pointer-events-auto absolute right-5 bottom-8 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-fab transition-colors hover:bg-brand-600"
        >
          <PlusIcon className="h-6 w-6" />
        </Link>
      </div>
    </main>
  )
}
