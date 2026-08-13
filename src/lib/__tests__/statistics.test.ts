import { toISODate } from '@/lib/date'
import {
  countPerfectDays,
  DEFAULT_PERIOD,
  eachDay,
  firstCompletionDate,
  generalStatistics,
  habitStatistics,
  overallStreak,
  parseStatisticsPeriod,
  resolvePeriod,
} from '@/lib/statistics'
import type { Habit } from '@/types/habit'

// Friday 13 March 2026.
const TODAY = new Date(2026, 2, 13)

const iso = (offset: number) =>
  toISODate(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - offset))

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    userId: 'test-user',
    name: 'Read',
    shortName: 'Read',
    icon: '📚',
    accent: 'walk',
    durationMinutes: 10,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    remindersEnabled: false,
    completedDates: [],
    ...overrides,
  }
}

const lastWeekDays = eachDay(new Date(2026, 2, 9), TODAY)

describe('eachDay', () => {
  it('is inclusive at both ends', () => {
    const days = eachDay(new Date(2026, 2, 9), new Date(2026, 2, 11))
    expect(days.map(toISODate)).toEqual(['2026-03-09', '2026-03-10', '2026-03-11'])
  })

  it('returns a single day for the same date', () => {
    expect(eachDay(TODAY, TODAY)).toHaveLength(1)
  })

  it('returns nothing when the range is inverted', () => {
    expect(eachDay(TODAY, new Date(2026, 2, 1))).toHaveLength(0)
  })
})

describe('parseStatisticsPeriod', () => {
  it('accepts the known periods', () => {
    expect(parseStatisticsPeriod('last-week')).toBe('last-week')
    expect(parseStatisticsPeriod('all-time')).toBe('all-time')
  })

  it('falls back to the default', () => {
    expect(parseStatisticsPeriod('yesterday')).toBe(DEFAULT_PERIOD)
    expect(parseStatisticsPeriod(undefined)).toBe('this-week')
  })
})

describe('resolvePeriod', () => {
  it('covers the current week up to today, not beyond', () => {
    // Friday: Monday-to-Friday, because Saturday has not happened yet and
    // would otherwise count as a missed day.
    const days = resolvePeriod('this-week', [], TODAY)
    expect(days).toHaveLength(5)
    expect(toISODate(days[0])).toBe('2026-03-09')
    expect(toISODate(days[4])).toBe('2026-03-13')
  })

  it('follows the week-start preference', () => {
    const days = resolvePeriod('this-week', [], TODAY, 6)
    expect(toISODate(days[0])).toBe('2026-03-08')
    expect(toISODate(days[days.length - 1])).toBe('2026-03-13')
  })

  it('covers the seven days before this week', () => {
    const days = resolvePeriod('last-week', [], TODAY)
    expect(days).toHaveLength(7)
    expect(toISODate(days[0])).toBe('2026-03-02')
    expect(toISODate(days[6])).toBe('2026-03-08')
  })

  it('covers four weeks, ending today', () => {
    expect(resolvePeriod('last-4-weeks', [], TODAY)).toHaveLength(26)
  })

  it('starts all time at the first completion', () => {
    const days = resolvePeriod('all-time', [habit({ completedDates: ['2026-01-05'] })], TODAY)
    expect(toISODate(days[0])).toBe('2026-01-05')
  })

  it('falls back to this week when there is no history', () => {
    expect(resolvePeriod('all-time', [], TODAY)).toHaveLength(5)
  })
})

describe('firstCompletionDate', () => {
  it('finds the oldest completion across habits', () => {
    const habits = [
      habit({ id: 'a', completedDates: ['2026-02-10', '2026-03-01'] }),
      habit({ id: 'b', completedDates: ['2026-01-20'] }),
    ]
    expect(toISODate(firstCompletionDate(habits) as Date)).toBe('2026-01-20')
  })

  it('is null without any history', () => {
    expect(firstCompletionDate([habit()])).toBeNull()
  })
})

describe('habitStatistics', () => {
  it('counts completions against the days the habit was due', () => {
    const weekdaysOnly = habit({
      repeatDays: [0, 1, 2, 3, 4],
      completedDates: ['2026-03-09', '2026-03-10'],
    })

    expect(habitStatistics(weekdaysOnly, lastWeekDays, TODAY)).toMatchObject({
      completed: 2,
      scheduled: 5,
      completionRate: 40,
    })
  })

  it('reports minutes invested', () => {
    const done = habit({ durationMinutes: 15, completedDates: [iso(0), iso(1)] })
    expect(habitStatistics(done, lastWeekDays, TODAY).minutes).toBe(30)
  })

  it('keeps the streak independent of the selected period', () => {
    const streaking = habit({ completedDates: [iso(0), iso(1), iso(2)] })

    // A period that excludes those days still reports the live streak.
    const older = eachDay(new Date(2026, 1, 1), new Date(2026, 1, 7))
    expect(habitStatistics(streaking, older, TODAY)).toMatchObject({
      currentStreak: 3,
      completed: 0,
      completionRate: 0,
    })
  })

  it('is zero, not NaN, when the habit was never due', () => {
    const sundayOnly = habit({ repeatDays: [6] })
    const weekdays = eachDay(new Date(2026, 2, 9), new Date(2026, 2, 13))

    expect(habitStatistics(sundayOnly, weekdays, TODAY)).toMatchObject({
      scheduled: 0,
      completionRate: 0,
    })
  })
})

describe('countPerfectDays', () => {
  it('counts days where every due habit was completed', () => {
    const habits = [
      habit({ id: 'a', completedDates: [iso(1), iso(2)] }),
      habit({ id: 'b', completedDates: [iso(1)] }),
    ]

    expect(countPerfectDays(habits, lastWeekDays)).toBe(1)
  })

  it('ignores days where nothing was due', () => {
    const sundayOnly = habit({ repeatDays: [6], completedDates: [] })
    const weekdays = eachDay(new Date(2026, 2, 9), new Date(2026, 2, 13))

    expect(countPerfectDays([sundayOnly], weekdays)).toBe(0)
  })

  it('is zero without habits', () => {
    expect(countPerfectDays([], lastWeekDays)).toBe(0)
  })
})

describe('overallStreak', () => {
  it('counts consecutive days with at least one completion', () => {
    const habits = [
      habit({ id: 'a', completedDates: [iso(0), iso(2)] }),
      habit({ id: 'b', completedDates: [iso(1)] }),
    ]

    expect(overallStreak(habits, TODAY)).toBe(3)
  })

  it('still counts a streak that ended yesterday', () => {
    expect(overallStreak([habit({ completedDates: [iso(1)] })], TODAY)).toBe(1)
  })

  it('is zero when the last completion is older than yesterday', () => {
    expect(overallStreak([habit({ completedDates: [iso(3)] })], TODAY)).toBe(0)
  })

  it('is zero without habits', () => {
    expect(overallStreak([], TODAY)).toBe(0)
  })
})

describe('generalStatistics', () => {
  it('aggregates the headline numbers', () => {
    const habits = [
      habit({ id: 'a', durationMinutes: 10, completedDates: [iso(0), iso(1)] }),
      habit({ id: 'b', durationMinutes: 20, completedDates: [iso(1)] }),
    ]

    expect(generalStatistics(habits, lastWeekDays, TODAY)).toMatchObject({
      completed: 3,
      scheduled: 10,
      completionRate: 30,
      perfectDays: 1,
      activeHabits: 2,
      minutes: 40,
      days: 5,
    })
  })

  it('reports zeros for an account with no habits', () => {
    expect(generalStatistics([], lastWeekDays, TODAY)).toMatchObject({
      currentStreak: 0,
      completed: 0,
      scheduled: 0,
      completionRate: 0,
      perfectDays: 0,
      activeHabits: 0,
    })
  })
})
