import type { Metadata } from 'next'

import { requireUser } from '@/auth'
import { AchievementsPanel } from '@/components/history/achievements-panel'
import { HabitsPanel } from '@/components/history/habits-panel'
import { StatisticsPanel } from '@/components/history/statistics-panel'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ScreenHeader } from '@/components/layout/screen-header'
import { FilterChips } from '@/components/ui/filter-chips'
import { ShareButton } from '@/components/ui/share-button'
import { TabPanel, Tabs } from '@/components/ui/tabs'
import { computeAchievements } from '@/lib/achievements'
import { formatDuration, weekdayInitials, weekStrip } from '@/lib/date'
import { currentStreak, listHabits, weeklyCompletion, weeklyProgress } from '@/lib/habits'
import { getI18n, getScreenSettings } from '@/lib/server-settings'
import {
  generalStatistics,
  habitStatistics,
  parseStatisticsPeriod,
  resolvePeriod,
  STATISTICS_PERIODS,
  type StatisticsPeriod,
} from '@/lib/statistics'

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
  searchParams: Promise<{ tab?: string; period?: string }>
}) {
  const [user, { locale, t, weekStartsOn }, { tab, period }] = await Promise.all([
    requireUser(),
    getScreenSettings(),
    searchParams,
  ])

  const activeTab = parseHistoryTab(tab)
  const activePeriod = parseStatisticsPeriod(period)
  const now = new Date()
  const week = weekStrip(now, weekStartsOn, locale)
  const weekDates = week.map((day) => day.date)
  const habits = listHabits(user.id)

  // The filter only narrows Statistics; the other tabs always show everything.
  const periodDays = resolvePeriod(activePeriod, habits, now, weekStartsOn)
  const general = generalStatistics(habits, periodDays, now)
  const habitBreakdown = habits.map((habit) => ({
    statistics: habitStatistics(habit, periodDays, now),
    icon: habit.icon,
    accent: habit.accent,
  }))

  const PERIOD_LABEL: Record<StatisticsPeriod, string> = {
    'this-week': t.history.statistics.periodThisWeek,
    'last-week': t.history.statistics.periodLastWeek,
    'last-4-weeks': t.history.statistics.periodLast4Weeks,
    'all-time': t.history.statistics.periodAllTime,
  }

  const achievementCopy = t.history.achievements

  const panels: Record<HistoryTab, React.ReactNode> = {
    statistics: (
      <StatisticsPanel
        general={general}
        habits={habitBreakdown}
        // With nothing ticked in the period the chart would be empty bars —
        // the numbers above already say that.
        progress={general.completed > 0 ? weeklyProgress(user.id, weekDates) : []}
        points={general.completed * POINTS_PER_COMPLETION}
        locale={locale}
        stats={[
          { label: t.history.statistics.completed, value: `${general.completed}` },
          { label: t.history.statistics.habits, value: `${general.activeHabits}` },
          { label: t.history.statistics.time, value: formatDuration(general.minutes) },
        ]}
        labels={{
          pointsEarned: t.history.statistics.pointsEarned,
          forThisWeek: PERIOD_LABEL[activePeriod],
          points: t.history.statistics.points,
          chartLabel: t.history.statistics.chartLabel,
          emptyTitle: t.history.statistics.emptyTitle,
          emptyBody: t.history.statistics.emptyBody,
          currentStreak: t.history.statistics.currentStreak,
          currentStreakUnit: t.history.statistics.currentStreakUnit,
          completedHabits: t.history.statistics.completedHabits,
          completedUnit: t.history.statistics.completedUnit,
          completionRate: t.history.statistics.completionRate,
          perfectDays: t.history.statistics.perfectDays,
          perfectDaysHint: t.history.statistics.perfectDaysHint,
          dayOne: t.common.dayOne,
          dayOther: t.common.dayOther,
          breakdown: {
            title: t.history.statistics.habitBreakdown,
            habitStreak: t.history.statistics.habitStreak,
            habitCompleted: t.history.statistics.habitCompleted,
            dayOne: t.common.dayOne,
            dayOther: t.common.dayOther,
          },
        }}
        action={
          <ShareButton
            size="lg"
            className="w-full"
            title={t.settings.social.shareTitle}
            text={t.settings.social.shareText}
            labels={{
              copied: t.settings.social.copied,
              failed: t.settings.social.failed,
            }}
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
            {
              id: 'statistics',
              label: t.history.tabStatistics,
              href: '/history?tab=statistics',
            },
            {
              id: 'habits',
              label: t.history.tabHabits,
              href: '/history?tab=habits',
            },
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

        {activeTab === 'statistics' && (
          <FilterChips
            label={t.history.statistics.filterLabel}
            activeId={activePeriod}
            items={STATISTICS_PERIODS.map((option) => ({
              id: option,
              label: PERIOD_LABEL[option],
              href: `/history?tab=statistics&period=${option}`,
            }))}
          />
        )}

        <TabPanel id="history-panel" labelledBy={`tab-${activeTab}`}>
          {panels[activeTab]}
        </TabPanel>
      </main>

      <BottomNav labels={t.nav} />
    </>
  )
}
