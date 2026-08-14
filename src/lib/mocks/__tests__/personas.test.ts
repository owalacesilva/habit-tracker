import { toISODate } from '@/lib/date'
import {
  currentPersona,
  DEFAULT_PERSONA,
  isPersona,
  PERSONAS,
  parsePersona,
  personaHabits,
} from '@/lib/mocks/personas'
import { generalStatistics, resolvePeriod } from '@/lib/statistics'

const TODAY = new Date(2026, 2, 13)

describe('persona selection', () => {
  it('accepts every published persona', () => {
    PERSONAS.forEach((persona) => {
      expect(isPersona(persona)).toBe(true)
      expect(parsePersona(persona)).toBe(persona)
    })
  })

  it('falls back to the demo persona', () => {
    expect(parsePersona('nonsense')).toBe(DEFAULT_PERSONA)
    expect(parsePersona(undefined)).toBe('demo')
    expect(isPersona(3)).toBe(false)
  })

  it('reads the environment variable', () => {
    expect(currentPersona({ MOCK_PERSONA: 'power' })).toBe('power')
    expect(currentPersona({})).toBe('demo')
  })
})

describe('personaHabits', () => {
  it('gives the demo persona the original routine', () => {
    const habits = personaHabits('demo', 'user', TODAY)

    expect(habits).toHaveLength(5)
    expect(habits[0].id).toBe('water')
    expect(habits[0].completedDates).toEqual([toISODate(TODAY)])
    expect(habits[4].completedDates).toEqual([])
  })

  it('gives the empty persona nothing, for testing empty states', () => {
    expect(personaHabits('empty', 'user', TODAY)).toEqual([])
  })

  it('scales history with the persona', () => {
    const starter = personaHabits('starter', 'user', TODAY)
    const power = personaHabits('power', 'user', TODAY)

    expect(starter).toHaveLength(2)
    expect(power).toHaveLength(6)

    const completions = (habits: ReturnType<typeof personaHabits>) =>
      habits.reduce((total, habit) => total + habit.completedDates.length, 0)

    expect(completions(starter)).toBeLessThan(completions(power))
    expect(completions(power)).toBeGreaterThan(50)
  })

  it('is deterministic, so a bug found while testing reproduces', () => {
    expect(personaHabits('regular', 'user', TODAY)).toEqual(personaHabits('regular', 'user', TODAY))
  })

  it('guarantees the streak each persona advertises', () => {
    const days = resolvePeriod('all-time', personaHabits('power', 'user', TODAY), TODAY)
    const stats = generalStatistics(personaHabits('power', 'user', TODAY), days, TODAY)

    expect(stats.currentStreak).toBeGreaterThanOrEqual(21)
    expect(stats.perfectDays).toBeGreaterThan(0)
    expect(stats.completionRate).toBeGreaterThan(80)
  })

  it('leaves the starter persona short of the bigger achievements', () => {
    const habits = personaHabits('starter', 'user', TODAY)
    const days = resolvePeriod('all-time', habits, TODAY)

    expect(generalStatistics(habits, days, TODAY).completed).toBeLessThan(50)
  })

  it('never dates a completion in the future', () => {
    const habits = personaHabits('power', 'user', TODAY)
    const today = toISODate(TODAY)

    habits.forEach((habit) => {
      habit.completedDates.forEach((iso) => {
        expect(iso <= today).toBe(true)
      })
    })
  })

  it('only completes days the habit was scheduled for', () => {
    const habits = personaHabits('regular', 'user', TODAY)

    habits.forEach((habit) => {
      habit.completedDates.forEach((iso) => {
        const [year, month, day] = iso.split('-').map(Number)
        const weekday = ((new Date(year, month - 1, day).getDay() + 6) % 7) as 0
        expect(habit.repeatDays).toContain(weekday)
      })
    })
  })
})
