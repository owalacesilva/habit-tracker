import { render, screen } from '@testing-library/react'

import { AchievementsPanel } from '@/components/history/achievements-panel'
import { HabitsPanel } from '@/components/history/habits-panel'
import { StatisticsPanel } from '@/components/history/statistics-panel'
import type { Achievement } from '@/lib/achievements'
import { weekdayInitials } from '@/lib/date'
import en from '@/lib/i18n/dictionaries/en'
import type { Habit } from '@/types/habit'

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'water',
    userId: 'test-user',
    name: 'Drink a glass of water',
    shortName: 'Water',
    icon: '🥤',
    accent: 'water',
    durationMinutes: 5,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    remindersEnabled: true,
    completedDates: ['2026-03-10', '2026-03-11'],
    ...overrides,
  }
}

describe('StatisticsPanel', () => {
  const labels = {
    pointsEarned: en.history.statistics.pointsEarned,
    forThisWeek: en.history.statistics.periodThisWeek,
    points: en.history.statistics.points,
    chartLabel: en.history.statistics.chartLabel,
    emptyTitle: en.history.statistics.emptyTitle,
    emptyBody: en.history.statistics.emptyBody,
    currentStreak: en.history.statistics.currentStreak,
    currentStreakUnit: en.history.statistics.currentStreakUnit,
    completedHabits: en.history.statistics.completedHabits,
    completedUnit: en.history.statistics.completedUnit,
    completionRate: en.history.statistics.completionRate,
    perfectDays: en.history.statistics.perfectDays,
    perfectDaysHint: en.history.statistics.perfectDaysHint,
    dayOne: en.common.dayOne,
    dayOther: en.common.dayOther,
    breakdown: {
      title: en.history.statistics.habitBreakdown,
      habitStreak: en.history.statistics.habitStreak,
      habitCompleted: en.history.statistics.habitCompleted,
      dayOne: en.common.dayOne,
      dayOther: en.common.dayOther,
    },
  }

  const general = {
    currentStreak: 5,
    completed: 12,
    scheduled: 20,
    completionRate: 60,
    perfectDays: 3,
    activeHabits: 4,
    minutes: 145,
    days: 7,
  }

  const breakdown = [
    {
      statistics: {
        habitId: 'water',
        name: 'Drink a glass of water',
        currentStreak: 5,
        completed: 6,
        scheduled: 7,
        completionRate: 86,
        minutes: 30,
      },
      icon: '🥤',
      accent: 'water' as const,
    },
  ]

  it('leads with the general statistics', () => {
    render(
      <StatisticsPanel
        general={general}
        habits={breakdown}
        progress={[{ label: 'Water', percentage: 40, tone: 'walking' }]}
        points={120}
        stats={[{ label: en.history.statistics.completed, value: '12' }]}
        labels={labels}
      />,
    )

    expect(screen.getByText(en.history.statistics.currentStreak)).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText(en.history.statistics.perfectDays)).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('breaks the period down per habit', () => {
    render(
      <StatisticsPanel
        general={general}
        habits={breakdown}
        progress={[]}
        points={0}
        stats={[]}
        labels={labels}
      />,
    )

    expect(screen.getByText(en.history.statistics.habitBreakdown)).toBeInTheDocument()
    expect(screen.getByText('Drink a glass of water')).toBeInTheDocument()
    expect(screen.getByText('86%')).toBeInTheDocument()
    expect(screen.getByText(/Streak 5 days · 6\/7 done/)).toBeInTheDocument()
  })

  it('hides the chart when nothing was completed', () => {
    render(
      <StatisticsPanel
        general={{ ...general, completed: 0 }}
        habits={breakdown}
        progress={[]}
        points={0}
        stats={[]}
        labels={labels}
      />,
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText(en.history.statistics.currentStreak)).toBeInTheDocument()
  })

  it('explains a period where nothing was ever due', () => {
    render(
      <StatisticsPanel
        general={{ ...general, scheduled: 0, completed: 0 }}
        habits={[]}
        progress={[]}
        points={0}
        stats={[]}
        labels={labels}
      />,
    )

    expect(screen.getByText(en.history.statistics.emptyTitle)).toBeInTheDocument()
    expect(screen.queryByText(en.history.statistics.habitBreakdown)).not.toBeInTheDocument()
  })

  it('renders the share action it is given', () => {
    render(
      <StatisticsPanel
        general={general}
        habits={breakdown}
        progress={[]}
        points={120}
        stats={[]}
        labels={labels}
        action={<button type="button">{en.history.statistics.share}</button>}
      />,
    )

    expect(screen.getByRole('button', { name: en.history.statistics.share })).toBeInTheDocument()
  })
})

describe('HabitsPanel', () => {
  const labels = {
    scheduleEveryDay: en.history.habits.scheduleEveryDay,
    completionRate: en.history.habits.completionRate,
    totalCompletions: en.history.habits.totalCompletions,
    streakOne: en.home.streakOne,
    streakOther: en.home.streakOther,
    emptyTitle: en.history.habits.emptyTitle,
    emptyBody: en.history.habits.emptyBody,
  }

  it('summarises each habit', () => {
    render(
      <HabitsPanel
        items={[{ habit: habit(), streak: 4, weeklyCompletion: 57 }]}
        labels={labels}
        weekdayInitials={weekdayInitials('en')}
      />,
    )

    expect(screen.getByText('Drink a glass of water')).toBeInTheDocument()
    expect(screen.getByText(en.history.habits.scheduleEveryDay)).toBeInTheDocument()
    expect(screen.getByText('Streak 4 days')).toBeInTheDocument()
    expect(screen.getByText('57% this week')).toBeInTheDocument()
    expect(screen.getByText('2 completions')).toBeInTheDocument()
  })

  it('spells out a partial schedule', () => {
    render(
      <HabitsPanel
        items={[
          {
            habit: habit({ repeatDays: [0, 2, 4] }),
            streak: 0,
            weeklyCompletion: 0,
          },
        ]}
        labels={labels}
        weekdayInitials={weekdayInitials('en')}
      />,
    )

    expect(screen.getByText('M W F')).toBeInTheDocument()
  })

  it('explains an empty list', () => {
    render(<HabitsPanel items={[]} labels={labels} weekdayInitials={weekdayInitials('en')} />)

    expect(screen.getByText(en.history.habits.emptyTitle)).toBeInTheDocument()
  })
})

describe('AchievementsPanel', () => {
  const copy = {
    firstStep: {
      title: en.history.achievements.firstStepTitle,
      body: en.history.achievements.firstStepBody,
    },
    weekWarrior: {
      title: en.history.achievements.weekWarriorTitle,
      body: en.history.achievements.weekWarriorBody,
    },
    halfCentury: {
      title: en.history.achievements.halfCenturyTitle,
      body: en.history.achievements.halfCenturyBody,
    },
    routineBuilder: {
      title: en.history.achievements.routineBuilderTitle,
      body: en.history.achievements.routineBuilderBody,
    },
    earlyBird: {
      title: en.history.achievements.earlyBirdTitle,
      body: en.history.achievements.earlyBirdBody,
    },
  }

  const labels = {
    unlocked: en.history.achievements.unlocked,
    locked: en.history.achievements.locked,
    progress: en.history.achievements.progress,
    emptyTitle: en.history.achievements.emptyTitle,
    emptyBody: en.history.achievements.emptyBody,
  }

  const achievement = (overrides: Partial<Achievement> = {}): Achievement => ({
    id: 'weekWarrior',
    icon: '🔥',
    current: 3,
    target: 7,
    unlocked: false,
    ...overrides,
  })

  it('shows progress towards a locked achievement', () => {
    render(<AchievementsPanel achievements={[achievement()]} copy={copy} labels={labels} />)

    expect(screen.getByText(en.history.achievements.locked)).toBeInTheDocument()
    expect(screen.getByText('3 / 7')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3')
  })

  it('drops the progress bar once unlocked', () => {
    render(
      <AchievementsPanel
        achievements={[achievement({ current: 7, unlocked: true })]}
        copy={copy}
        labels={labels}
      />,
    )

    expect(screen.getByText(en.history.achievements.unlocked)).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('explains an empty list', () => {
    render(<AchievementsPanel achievements={[]} copy={copy} labels={labels} />)

    expect(screen.getByText(en.history.achievements.emptyTitle)).toBeInTheDocument()
  })
})
