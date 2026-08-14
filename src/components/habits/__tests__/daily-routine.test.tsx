import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DailyRoutine } from '@/components/habits/daily-routine'
import { __resetMemoryRepository, MemoryRepository } from '@/lib/data/memory-repository'
import { DataProvider } from '@/lib/data/provider'
import type { DataRepository } from '@/lib/data/repository'
import { toISODate } from '@/lib/date'
import en from '@/lib/i18n/dictionaries/en'

const labels = {
  streakOne: en.home.streakOne,
  streakOther: en.home.streakOther,
  markDone: en.home.markDone,
  markNotDone: en.home.markNotDone,
  minutes: en.common.minutesShort,
  emptyTitle: en.home.emptyTitle,
  emptyBody: en.home.emptyBody,
  loading: en.common.loading,
  errorTitle: en.common.errorTitle,
  errorBody: en.common.errorBody,
  retry: en.common.retry,
}

const today = toISODate(new Date())

function renderRoutine(repository: DataRepository, isoDate = today) {
  render(
    <DataProvider ownerId="owner-1" repository={repository}>
      <DailyRoutine isoDate={isoDate} labels={labels} />
    </DataProvider>,
  )
}

beforeEach(() => __resetMemoryRepository())

describe('DailyRoutine', () => {
  it('shows the loading placeholder before the store answers', () => {
    renderRoutine(new MemoryRepository({ ownerId: 'owner-1' }))

    expect(screen.getByRole('status', { name: en.common.loading })).toBeInTheDocument()
  })

  it('lists the habits scheduled for the day', async () => {
    renderRoutine(new MemoryRepository({ ownerId: 'owner-1' }))

    expect(await screen.findByText('Drink a glass of water')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
  })

  it('writes a completion through the data layer', async () => {
    const repository = new MemoryRepository({ ownerId: 'owner-1' })
    renderRoutine(repository)

    const row = await screen.findByRole('checkbox', {
      name: `Mark "Go for a short walk" as done`,
    })
    await userEvent.click(row)

    await waitFor(async () => {
      const stored = (await repository.listHabits()).find((habit) => habit.id === 'walk')
      expect(stored?.completedDates).toContain(today)
    })
  })

  it('explains a day with nothing scheduled', async () => {
    const repository = new MemoryRepository({ ownerId: 'owner-1' })
    await repository.initialise()
    for (const habit of await repository.listHabits()) await repository.deleteHabit(habit.id)

    renderRoutine(repository)

    expect(await screen.findByText(en.home.emptyTitle)).toBeInTheDocument()
  })

  it('offers a retry when the store cannot be opened', async () => {
    let attempts = 0
    const repository = new MemoryRepository({ ownerId: 'owner-1' })
    const flaky = {
      ...repository,
      initialise: async () => {
        attempts += 1
        if (attempts === 1) throw new Error('Could not open the local database')
        return repository.initialise()
      },
      listHabits: () => repository.listHabits(),
      listEnrollments: () => repository.listEnrollments(),
      getNotificationPreferences: () => repository.getNotificationPreferences(),
    } as DataRepository

    renderRoutine(flaky)

    const retry = await screen.findByRole('button', { name: en.common.retry })
    expect(screen.getByRole('alert')).toHaveTextContent('Could not open the local database')

    await userEvent.click(retry)

    expect(await screen.findByText('Drink a glass of water')).toBeInTheDocument()
  })
})
