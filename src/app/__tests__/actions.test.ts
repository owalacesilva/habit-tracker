import { createHabitAction, toggleHabitAction } from '@/app/actions'
import { __resetStore, isCompletedOn, listHabits } from '@/lib/habits'
import { parseISODate } from '@/lib/date'

jest.mock('@/auth', () => ({
  requireUser: jest.fn().mockResolvedValue({ id: 'test-user', name: 'Budi' }),
}))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    // Mirrors the real implementation, which throws to unwind the render.
    throw new Error('NEXT_REDIRECT')
  }),
}))

function formData(entries: Array<[string, string]>) {
  const data = new FormData()
  entries.forEach(([key, value]) => data.append(key, value))
  return data
}

beforeEach(() => {
  __resetStore()
  jest.clearAllMocks()
})

describe('toggleHabitAction', () => {
  it('ticks and unticks the habit for the given day', async () => {
    await expect(toggleHabitAction('water', '2025-03-13')).resolves.toBe(true)

    const habit = listHabits('test-user').find((candidate) => candidate.id === 'water')!
    expect(isCompletedOn(habit, parseISODate('2025-03-13'))).toBe(true)

    await expect(toggleHabitAction('water', '2025-03-13')).resolves.toBe(false)
  })

  it('revalidates the screens that show habits', async () => {
    const { revalidatePath } = jest.requireMock('next/cache')

    await toggleHabitAction('water', '2025-03-13')

    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/progress')
  })
})

describe('createHabitAction', () => {
  it('rejects a name that is too short', async () => {
    const state = await createHabitAction({}, formData([['name', 'a']]))

    expect(state.error).toMatch(/name/i)
    expect(listHabits('test-user').some((habit) => habit.name === 'a')).toBe(false)
  })

  it('creates the habit and redirects home', async () => {
    const data = formData([
      ['name', 'Read a chapter'],
      ['durationMinutes', '20'],
      ['repeatDays', '0'],
      ['repeatDays', '2'],
      ['remindersEnabled', 'on'],
    ])

    await expect(createHabitAction({}, data)).rejects.toThrow('NEXT_REDIRECT')

    const created = listHabits('test-user').find((habit) => habit.name === 'Read a chapter')
    expect(created).toMatchObject({
      durationMinutes: 20,
      repeatDays: [0, 2],
      remindersEnabled: true,
    })
  })

  it('defaults to every day when no repeat day is selected', async () => {
    const data = formData([
      ['name', 'Stretch'],
      ['durationMinutes', '10'],
    ])

    await expect(createHabitAction({}, data)).rejects.toThrow('NEXT_REDIRECT')

    const created = listHabits('test-user').find((habit) => habit.name === 'Stretch')
    expect(created?.repeatDays).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})
