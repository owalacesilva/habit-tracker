import type { Metadata } from 'next'

import { requireUser } from '@/auth'
import { AchievementsPanel } from '@/components/history/achievements-panel'
import { HabitsPanel } from '@/components/history/habits-panel'
import { StatisticsPanel } from '@/components/history/statistics-panel'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ScreenHeader } from '@/components/layout/screen-header'
import { ShareButton } from '@/components/ui/share-button'
import { TabPanel, Tabs } from '@/components/ui/tabs'
import { computeAchievements } from '@/lib/achievements'
import { formatDuration, weekdayInitials, weekStrip } from '@/lib/date'
import { currentStreak, listHabits, weeklyCompletion, weeklyProgress } from '@/lib/habits'
import { getI18n, getScreenSettings } from '@/lib/server-settings'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.history.title }
}
export const dynamic = 'force-dynamic'

const TABS = ['statistics', 'habits', 'achievements'] as const
export type HistoryTab = (typeof TABS)[number]

export function parseHistoryTab(value: string | undefined): HistoryTab {
  return TABS.find((tab) => tab === value) ?? 'statistics'
}

/** 10 points per completed day — a placeholder rule until scoring is designed. */
const POINTS_PER_COMPLETION = 10

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const [user, { locale, t, weekStartsOn }, { tab }] = await Promise.all([
    requireUser(),
    getScreenSettings(),
    searchParams,
  ])

  const activeTab = parseHistoryTab(tab)
  const now = new Date()
  const week = weekStrip(now, weekStartsOn, locale)
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

  const achievementCopy = t.history.achievements

  const panels: Record<HistoryTab, React.ReactNode> = {
    statistics: (
      <StatisticsPanel
        // With nothing ticked this week the chart would be four empty bars —
        // the empty state says more.
        progress={completionsThisWeek > 0 ? weeklyProgress(user.id, weekDates) : []}
        points={completionsThisWeek * POINTS_PER_COMPLETION}
        locale={locale}
        stats={[
          { label: t.history.statistics.completed, value: `${completionsThisWeek}` },
          { label: t.history.statistics.habits, value: `${habits.length}` },
          { label: t.history.statistics.time, value: formatDuration(minutesThisWeek) },
        ]}
        labels={{
          pointsEarned: t.history.statistics.pointsEarned,
          forThisWeek: t.history.statistics.forThisWeek,
          points: t.history.statistics.points,
          chartLabel: t.history.statistics.chartLabel,
          emptyTitle: t.history.statistics.emptyTitle,
          emptyBody: t.history.statistics.emptyBody,
        }}
        action={
          <ShareButton
            size="lg"
            className="w-full"
            title={t.settings.social.shareTitle}
            text={t.settings.social.shareText}
            labels={{ copied: t.settings.social.copied, failed: t.settings.social.failed }}
          >
            {t.history.statistics.share}
          </ShareButton>
        }
      />
    ),
    habits: (
      <HabitsPanel
        weekdayInitials={weekdayInitials(locale)}
        items={habits.map((habit) => ({
          habit,
          streak: currentStreak(habit, now),
          weeklyCompletion: weeklyCompletion(habit, weekDates),
        }))}
        labels={{
          scheduleEveryDay: t.history.habits.scheduleEveryDay,
          completionRate: t.history.habits.completionRate,
          totalCompletions: t.history.habits.totalCompletions,
          streakOne: t.home.streakOne,
          streakOther: t.home.streakOther,
          emptyTitle: t.history.habits.emptyTitle,
          emptyBody: t.history.habits.emptyBody,
        }}
      />
    ),
    achievements: (
      <AchievementsPanel
        achievements={computeAchievements(habits, now)}
        copy={{
          firstStep: {
            title: achievementCopy.firstStepTitle,
            body: achievementCopy.firstStepBody,
          },
          weekWarrior: {
            title: achievementCopy.weekWarriorTitle,
            body: achievementCopy.weekWarriorBody,
          },
          halfCentury: {
            title: achievementCopy.halfCenturyTitle,
            body: achievementCopy.halfCenturyBody,
          },
          routineBuilder: {
            title: achievementCopy.routineBuilderTitle,
            body: achievementCopy.routineBuilderBody,
          },
          earlyBird: {
            title: achievementCopy.earlyBirdTitle,
            body: achievementCopy.earlyBirdBody,
          },
        }}
        labels={{
          unlocked: achievementCopy.unlocked,
          locked: achievementCopy.locked,
          progress: achievementCopy.progress,
          emptyTitle: achievementCopy.emptyTitle,
          emptyBody: achievementCopy.emptyBody,
        }}
      />
    ),
  }

  return (
    <>
      <main className="app-shell app-shell-nav gap-5 px-5 pt-8">
        <ScreenHeader title={t.history.title} subtitle={t.history.subtitle} />

        <Tabs
          items={[
            { id: 'statistics', label: t.history.tabStatistics, href: '/history?tab=statistics' },
            { id: 'habits', label: t.history.tabHabits, href: '/history?tab=habits' },
            {
              id: 'achievements',
              label: t.history.tabAchievements,
              href: '/history?tab=achievements',
            },
          ]}
          activeId={activeTab}
          label={t.history.tabsLabel}
          panelId="history-panel"
        />

        <TabPanel id="history-panel" labelledBy={`tab-${activeTab}`}>
          {panels[activeTab]}
        </TabPanel>
      </main>

      <BottomNav labels={t.nav} />
    </>
  )
}
