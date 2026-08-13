import { computeAchievements, hasPerfectDay, unlockedCount } from '@/lib/achievements'
import { toISODate } from '@/lib/date'
import type { Habit } from '@/types/habit'

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

function byId(habits: Habit[], id: string) {
  return computeAchievements(habits, TODAY).find((entry) => entry.id === id)!
}

describe('computeAchievements', () => {
  it('locks everything for a brand new account', () => {
    const achievements = computeAchievements([], TODAY)

    expect(achievements).toHaveLength(5)
    expect(unlockedCount(achievements)).toBe(0)
  })

  it('unlocks the first step on the first completion', () => {
    expect(byId([habit({ completedDates: [iso(0)] })], 'firstStep')).toMatchObject({
      unlocked: true,
      current: 1,
      target: 1,
    })
  })

  it('tracks progress towards a seven-day streak', () => {
    const streaking = habit({ completedDates: [iso(0), iso(1), iso(2)] })

    expect(byId([streaking], 'weekWarrior')).toMatchObject({
      unlocked: false,
      current: 3,
      target: 7,
    })
  })

  it('unlocks the streak badge at seven days', () => {
    const streaking = habit({
      completedDates: [iso(0), iso(1), iso(2), iso(3), iso(4), iso(5), iso(6)],
    })

    expect(byId([streaking], 'weekWarrior').unlocked).toBe(true)
  })

  it('never reports more progress than the target', () => {
    const many = habit({
      completedDates: Array.from({ length: 80 }, (_, i) => iso(i)),
    })

    expect(byId([many], 'halfCentury')).toMatchObject({
      current: 50,
      target: 50,
      unlocked: true,
    })
  })

  it('counts habits for the routine builder', () => {
    const habits = [habit({ id: 'a' }), habit({ id: 'b' }), habit({ id: 'c' })]

    expect(byId(habits, 'routineBuilder')).toMatchObject({
      current: 3,
      unlocked: false,
    })
    expect(byId([...habits, habit({ id: 'd' })], 'routineBuilder').unlocked).toBe(true)
  })
})

describe('hasPerfectDay', () => {
  it('is true when every habit due that day was completed', () => {
    const habits = [
      habit({ id: 'a', completedDates: [iso(1)] }),
      habit({ id: 'b', completedDates: [iso(1)] }),
    ]

    expect(hasPerfectDay(habits, TODAY)).toBe(true)
  })

  it('is false when one habit was missed', () => {
    const habits = [
      habit({ id: 'a', completedDates: [iso(1)] }),
      habit({ id: 'b', completedDates: [] }),
    ]

    expect(hasPerfectDay(habits, TODAY)).toBe(false)
  })

  it('ignores days where nothing was scheduled', () => {
    // Scheduled on Mondays only; 13 March 2026 is a Friday.
    const mondayOnly = habit({ repeatDays: [0], completedDates: [] })

    expect(hasPerfectDay([mondayOnly], TODAY, 3)).toBe(false)
  })

  it('is false without any habits', () => {
    expect(hasPerfectDay([], TODAY)).toBe(false)
  })

  it('only looks back over the given window', () => {
    const old = habit({ completedDates: [iso(40)] })

    expect(hasPerfectDay([old], TODAY, 30)).toBe(false)
    expect(hasPerfectDay([old], TODAY, 45)).toBe(true)
  })
})
