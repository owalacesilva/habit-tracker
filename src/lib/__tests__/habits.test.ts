import { toISODate, weekStrip } from '@/lib/date'
import {
  __resetStore,
  createHabit,
  currentStreak,
  isCompletedOn,
  listHabits,
  listHabitsForDate,
  shortLabel,
  toggleCompletion,
  weeklyCompletion,
  weeklyProgress,
} from '@/lib/habits'
import type { Habit } from '@/types/habit'

const USER = 'test-user'

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    userId: USER,
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

beforeEach(() => __resetStore())

describe('listHabits', () => {
  it('seeds a demo routine for a new user', () => {
    expect(listHabits(USER).length).toBeGreaterThan(0)
  })

  it('returns copies, so callers cannot mutate the store', () => {
    const [habit] = listHabits(USER)
    habit.name = 'mutated'
    expect(listHabits(USER)[0].name).not.toBe('mutated')
  })

  it('keeps users isolated', () => {
    createHabit(USER, { name: 'Only mine' })
    expect(listHabits('someone-else').some((h) => h.name === 'Only mine')).toBe(false)
  })
})

describe('listHabitsForDate', () => {
  it('only returns habits scheduled for that weekday', () => {
    __resetStore()
    createHabit(USER, { name: 'Weekend run', repeatDays: [5, 6] })

    const saturday = new Date(2025, 2, 15)
    const monday = new Date(2025, 2, 10)

    expect(listHabitsForDate(USER, saturday).some((h) => h.name === 'Weekend run')).toBe(true)
    expect(listHabitsForDate(USER, monday).some((h) => h.name === 'Weekend run')).toBe(false)
  })
})

describe('toggleCompletion', () => {
  const day = new Date(2025, 2, 13)

  it('ticks an open habit and unticks a completed one', () => {
    const habit = createHabit(USER, { name: 'Toggle me' })

    expect(toggleCompletion(USER, habit.id, day)).toBe(true)
    expect(listHabits(USER).find((h) => h.id === habit.id)?.completedDates).toContain('2025-03-13')

    expect(toggleCompletion(USER, habit.id, day)).toBe(false)
    expect(listHabits(USER).find((h) => h.id === habit.id)?.completedDates).not.toContain(
      '2025-03-13',
    )
  })

  it('throws for an unknown habit', () => {
    expect(() => toggleCompletion(USER, 'nope', day)).toThrow(/Unknown habit/)
  })
})

describe('currentStreak', () => {
  const today = new Date(2025, 2, 13)
  const iso = (offset: number) =>
    toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset))

  it('counts consecutive days ending today', () => {
    const habit = makeHabit({ completedDates: [iso(0), iso(1), iso(2)] })
    expect(currentStreak(habit, today)).toBe(3)
  })

  it('still counts a streak that ended yesterday', () => {
    const habit = makeHabit({ completedDates: [iso(1), iso(2)] })
    expect(currentStreak(habit, today)).toBe(2)
  })

  it('stops at the first gap', () => {
    const habit = makeHabit({ completedDates: [iso(0), iso(2), iso(3)] })
    expect(currentStreak(habit, today)).toBe(1)
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
    const habit = makeHabit({
      repeatDays: [0],
      completedDates: ['2025-03-11'],
    })
    expect(weeklyCompletion(habit, week)).toBe(0)
  })

  it('is zero when the habit is never scheduled', () => {
    expect(weeklyCompletion(makeHabit({ repeatDays: [] }), week)).toBe(0)
  })
})

describe('weeklyProgress', () => {
  it('returns at most four chart entries with distinct tones', () => {
    const week = weekStrip(new Date(2025, 2, 13)).map((day) => day.date)
    const progress = weeklyProgress(USER, week)

    expect(progress.length).toBeLessThanOrEqual(4)
    expect(new Set(progress.map((item) => item.tone)).size).toBe(progress.length)
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
  ])('%s → %s', (name, expected) => {
    expect(shortLabel(name)).toBe(expected)
  })

  it('skips filler words and bare numbers', () => {
    expect(shortLabel('Do 30 push-ups')).toBe('Push-ups')
  })

  it('uses the derived label for habits created from the form', () => {
    const habit = createHabit(USER, { name: 'Go for a long run' })
    expect(habit.shortName).toBe('Run')
  })
})
