'use client'

import { AchievementsPanel } from '@/components/history/achievements-panel'
import { HabitsPanel } from '@/components/history/habits-panel'
import { StatisticsPanel } from '@/components/history/statistics-panel'
import { StatisticsSkeleton } from '@/components/history/statistics-skeleton'
import { Button } from '@/components/ui/button'
import { ShareButton } from '@/components/ui/share-button'
import { ErrorState, SkeletonList } from '@/components/ui/states'
import { computeAchievements } from '@/lib/achievements'
import { useHabits } from '@/lib/data/provider'
import { formatDuration, weekdayInitials, weekStrip } from '@/lib/date'
import { currentStreak, weeklyCompletion, weeklyProgress } from '@/lib/habits'
import type { Dictionary } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n/config'
import {
  generalStatistics,
  habitStatistics,
  resolvePeriod,
  type StatisticsPeriod,
} from '@/lib/statistics'
import type { Weekday } from '@/types/habit'

/** 10 points per completed day — a placeholder rule until scoring is designed. */
const POINTS_PER_COMPLETION = 10

export type HistoryTab = 'statistics' | 'habits' | 'achievements'

export interface HistoryPanelsProps {
  tab: HistoryTab
  period: StatisticsPeriod
  periodLabel: string
  locale: Locale
  weekStartsOn: Weekday
  t: Dictionary
}

/**
 * All three tabs read the same habit list from the data layer and derive their
 * numbers client-side, so History works offline exactly like the routine does.
 */
export function HistoryPanels({
  tab,
  period,
  periodLabel,
  locale,
  weekStartsOn,
  t,
}: HistoryPanelsProps) {
  const { habits, status, error, reload } = useHabits()

  if (status === 'loading') {
    return tab === 'statistics' ? (
      <StatisticsSkeleton label={t.common.loading} />
    ) : (
      <SkeletonList rows={4} label={t.common.loading} />
    )
  }

  if (status === 'error') {
    return (
      <ErrorState
        title={t.common.errorTitle}
        body={error?.message ?? t.common.errorBody}
        action={
          <Button size="sm" onClick={reload}>
            {t.common.retry}
          </Button>
        }
      />
    )
  }

  const now = new Date()
  const week = weekStrip(now, weekStartsOn, locale)
  const weekDates = week.map((day) => day.date)

  if (tab === 'habits') {
    return (
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
    )
  }

  if (tab === 'achievements') {
    const copy = t.history.achievements

    return (
      <AchievementsPanel
        achievements={computeAchievements(habits, now)}
        copy={{
          firstStep: { title: copy.firstStepTitle, body: copy.firstStepBody },
          weekWarrior: { title: copy.weekWarriorTitle, body: copy.weekWarriorBody },
          halfCentury: { title: copy.halfCenturyTitle, body: copy.halfCenturyBody },
          routineBuilder: { title: copy.routineBuilderTitle, body: copy.routineBuilderBody },
          earlyBird: { title: copy.earlyBirdTitle, body: copy.earlyBirdBody },
        }}
        labels={{
          unlocked: copy.unlocked,
          locked: copy.locked,
          progress: copy.progress,
          emptyTitle: copy.emptyTitle,
          emptyBody: copy.emptyBody,
        }}
      />
    )
  }

  const periodDays = resolvePeriod(period, habits, now, weekStartsOn)
  const general = generalStatistics(habits, periodDays, now)

  return (
    <StatisticsPanel
      general={general}
      habits={habits.map((habit) => ({
        statistics: habitStatistics(habit, periodDays, now),
        icon: habit.icon,
        accent: habit.accent,
      }))}
      progress={general.completed > 0 ? weeklyProgress(habits, weekDates) : []}
      points={general.completed * POINTS_PER_COMPLETION}
      locale={locale}
      stats={[
        { label: t.history.statistics.completed, value: `${general.completed}` },
        { label: t.history.statistics.habits, value: `${general.activeHabits}` },
        { label: t.history.statistics.time, value: formatDuration(general.minutes) },
      ]}
      labels={{
        pointsEarned: t.history.statistics.pointsEarned,
        forThisWeek: periodLabel,
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
          labels={{ copied: t.settings.social.copied, failed: t.settings.social.failed }}
        >
          {t.history.statistics.share}
        </ShareButton>
      }
    />
  )
}
