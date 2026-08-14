import { toISODate, weekStrip } from '@/lib/date'
import {
  buildHabit,
  currentStreak,
  habitsForDate,
  isCompletedOn,
  shortLabel,
  toggleCompletionDate,
  weeklyCompletion,
  weeklyProgress,
} from '@/lib/habits'
import type { Habit } from '@/types/habit'

const OWNER = 'test-user'

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    userId: OWNER,
    name: 'Read a chapter',
    shortName: 'Read',
    icon: '📚',
    accent: 'walk',
    durationMinutes: 20,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    remindersEnabled: false,
    completedDates: [],
    ...overrides,
  }
}

describe('buildHabit', () => {
  const now = new Date(2026, 2, 13)

  it('fills in the defaults a form does not collect', () => {
    expect(buildHabit(OWNER, { name: 'Read ten pages' }, now)).toMatchObject({
      userId: OWNER,
      name: 'Read ten pages',
      shortName: 'Read',
      icon: '⭐',
      durationMinutes: 10,
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      remindersEnabled: true,
      completedDates: [],
    })
  })

  it('keeps what the form did collect', () => {
    expect(
      buildHabit(OWNER, { name: 'Swim', durationMinutes: 45, repeatDays: [1, 3] }, now),
    ).toMatchObject({ durationMinutes: 45, repeatDays: [1, 3] })
  })

  it('derives an id from the name and the moment', () => {
    expect(buildHabit(OWNER, { name: 'Read ten pages' }, now).id).toMatch(/-read-ten-pages$/)
  })
})

describe('toggleCompletionDate', () => {
  it('ticks an open day and unticks a completed one', () => {
    const open = makeHabit()

    const ticked = toggleCompletionDate(open, '2026-03-13')
    expect(ticked.completed).toBe(true)
    expect(ticked.habit.completedDates).toEqual(['2026-03-13'])

    const unticked = toggleCompletionDate(ticked.habit, '2026-03-13')
    expect(unticked.completed).toBe(false)
    expect(unticked.habit.completedDates).toEqual([])
  })

  it('never mutates the record it was given', () => {
    const habit = makeHabit()
    toggleCompletionDate(habit, '2026-03-13')

    expect(habit.completedDates).toEqual([])
  })
})

describe('habitsForDate', () => {
  it('only returns habits scheduled for that weekday', () => {
    const weekend = makeHabit({ id: 'weekend', repeatDays: [5, 6] })
    const daily = makeHabit({ id: 'daily' })

    const saturday = new Date(2026, 2, 14)
    const monday = new Date(2026, 2, 9)

    expect(habitsForDate([weekend, daily], saturday).map((h) => h.id)).toEqual(['weekend', 'daily'])
    expect(habitsForDate([weekend, daily], monday).map((h) => h.id)).toEqual(['daily'])
  })
})

describe('currentStreak', () => {
  const today = new Date(2025, 2, 13)
  const iso = (offset: number) =>
    toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset))

  it('counts consecutive days ending today', () => {
    expect(currentStreak(makeHabit({ completedDates: [iso(0), iso(1), iso(2)] }), today)).toBe(3)
  })

  it('still counts a streak that ended yesterday', () => {
    expect(currentStreak(makeHabit({ completedDates: [iso(1), iso(2)] }), today)).toBe(2)
  })

  it('stops at the first gap', () => {
    expect(currentStreak(makeHabit({ completedDates: [iso(0), iso(2), iso(3)] }), today)).toBe(1)
  })

  it('is zero when nothing recent was completed', () => {
    expect(currentStreak(makeHabit({ completedDates: [iso(5)] }), today)).toBe(0)
    expect(currentStreak(makeHabit(), today)).toBe(0)
  })
})

describe('weeklyCompletion', () => {
  const week = weekStrip(new Date(2025, 2, 13)).map((day) => day.date)

  it('is the share of scheduled days that were completed', () => {
    const habit = makeHabit({
      repeatDays: [0, 1, 2, 3],
      completedDates: ['2025-03-10', '2025-03-11'],
    })
    expect(weeklyCompletion(habit, week)).toBe(50)
  })

  it('ignores completions on unscheduled days', () => {
    expect(
      weeklyCompletion(makeHabit({ repeatDays: [0], completedDates: ['2025-03-11'] }), week),
    ).toBe(0)
  })

  it('is zero when the habit is never scheduled', () => {
    expect(weeklyCompletion(makeHabit({ repeatDays: [] }), week)).toBe(0)
  })
})

describe('weeklyProgress', () => {
  it('returns at most four chart entries with distinct tones', () => {
    const week = weekStrip(new Date(2025, 2, 13)).map((day) => day.date)
    const habits = ['a', 'b', 'c', 'd', 'e'].map((id) => makeHabit({ id, shortName: id }))

    const progress = weeklyProgress(habits, week)

    expect(progress).toHaveLength(4)
    expect(new Set(progress.map((item) => item.tone)).size).toBe(4)
    progress.forEach((item) => {
      expect(item.percentage).toBeGreaterThanOrEqual(0)
      expect(item.percentage).toBeLessThanOrEqual(100)
    })
  })
})

describe('isCompletedOn', () => {
  it('matches on the local ISO date', () => {
    const habit = makeHabit({ completedDates: ['2025-03-13'] })
    expect(isCompletedOn(habit, new Date(2025, 2, 13, 22))).toBe(true)
    expect(isCompletedOn(habit, new Date(2025, 2, 14))).toBe(false)
  })
})

describe('shortLabel', () => {
  it.each([
    ['Go for a short walk', 'Walk'],
    ['Stretch for 10 minutes', 'Stretch'],
    ['drink a glass of water', 'Drink'],
    ['The morning pages', 'Morning'],
    ['Do 30 push-ups', 'Push-ups'],
  ])('%s → %s', (name, expected) => {
    expect(shortLabel(name)).toBe(expected)
  })
})
