import Link from 'next/link'

import { toggleHabitAction } from '@/app/actions'
import { requireUser } from '@/auth'
import { HabitList } from '@/components/habits/habit-list'
import { ReminderBanner } from '@/components/habits/reminder-banner'
import { WeekStrip } from '@/components/habits/week-strip'
import { ChartIcon, PlusIcon } from '@/components/icons'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ScreenHeader } from '@/components/layout/screen-header'
import { formatLongDate, greeting, parseISODate, toISODate } from '@/lib/date'
import { currentStreak, isCompletedOn, listHabitsForDate } from '@/lib/habits'
import { getScreenSettings } from '@/lib/server-settings'

export const dynamic = 'force-dynamic'

const GREETING_KEY = {
  Morning: 'greetingMorning',
  Afternoon: 'greetingAfternoon',
  Evening: 'greetingEvening',
} as const

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const [user, { locale, t, weekStartsOn }, { date }] = await Promise.all([
    requireUser(),
    getScreenSettings(),
    searchParams,
  ])

  const now = new Date()
  const selected = parseISODate(date, now)
  const habits = listHabitsForDate(user.id, selected)

  const items = habits.map((habit) => ({
    habit,
    completed: isCompletedOn(habit, selected),
    streak: currentStreak(habit, now),
  }))

  return (
    <>
      <main className="app-shell app-shell-nav gap-6 px-5 pt-8">
        <ScreenHeader
          title={`${t.home[GREETING_KEY[greeting(now)]]}, ${user.name ?? ''}`.trim()}
          subtitle={formatLongDate(selected, locale)}
          trailing={
            <>
              <Link
                href="/history"
                aria-label={t.home.progressLink}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-card transition-colors hover:bg-sand-100"
              >
                <ChartIcon className="h-5 w-5" />
              </Link>
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-xl"
              >
                🐯
              </span>
            </>
          }
        />

        <WeekStrip
          selected={selected}
          label={t.home.selectDay}
          weekStartsOn={weekStartsOn}
          locale={locale}
        />

        <ReminderBanner
          labels={{
            title: t.home.reminderTitle,
            body: t.home.reminderBody,
            cta: t.home.reminderCta,
          }}
        />

        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-bold text-ink text-lg">{t.home.dailyRoutine}</h2>
            <Link
              href="/history?tab=habits"
              className="shrink-0 font-medium text-ink-muted text-xs hover:text-ink"
            >
              {t.common.seeAll}
            </Link>
          </div>

          <HabitList
            items={items}
            isoDate={toISODate(selected)}
            labels={{
              streakOne: t.home.streakOne,
              streakOther: t.home.streakOther,
              markDone: t.home.markDone,
              markNotDone: t.home.markNotDone,
              minutes: t.common.minutesShort,
              emptyTitle: t.home.emptyTitle,
              emptyBody: t.home.emptyBody,
            }}
            onToggle={toggleHabitAction}
          />
        </section>

        {/* FAB, lifted above the persistent navigation. */}
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto h-0 max-w-app">
          <Link
            href="/habits/new"
            aria-label={t.home.addHabit}
            className="pointer-events-auto absolute right-5 bottom-[calc(6rem+env(safe-area-inset-bottom))] flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-fab transition-colors hover:bg-brand-600"
          >
            <PlusIcon className="h-6 w-6" />
          </Link>
        </div>
      </main>

      <BottomNav labels={t.nav} />
    </>
  )
}
