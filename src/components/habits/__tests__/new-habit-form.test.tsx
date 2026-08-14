import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { NewHabitForm } from '@/components/habits/new-habit-form'
import { __resetMemoryRepository, MemoryRepository } from '@/lib/data/memory-repository'
import { DataProvider } from '@/lib/data/provider'
import { weekdayInitials } from '@/lib/date'
import en from '@/lib/i18n/dictionaries/en'

const push = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: (path: string) => push(path) }) }))

const labels = {
  nameLabel: en.newHabit.nameLabel,
  namePlaceholder: en.newHabit.namePlaceholder,
  goalLabel: en.newHabit.goalLabel,
  goalDate: en.newHabit.goalDate,
  duration: en.newHabit.duration,
  repeatLabel: en.newHabit.repeatLabel,
  repeatEveryDay: en.newHabit.repeatEveryDay,
  repeatOnDay: en.newHabit.repeatOnDay,
  remindersLabel: en.newHabit.remindersLabel,
  save: en.newHabit.save,
  saving: en.newHabit.saving,
  minutes: en.common.minutesShort,
}

function renderForm() {
  const repository = new MemoryRepository({ ownerId: 'owner-1' })
  render(
    <DataProvider ownerId="owner-1" repository={repository}>
      <NewHabitForm labels={labels} weekdayInitials={weekdayInitials('en')} />
    </DataProvider>,
  )
  return repository
}

beforeEach(() => {
  __resetMemoryRepository()
  push.mockClear()
})

describe('NewHabitForm', () => {
  it('stores the habit and returns to the routine', async () => {
    const repository = renderForm()

    await userEvent.type(screen.getByLabelText(en.newHabit.nameLabel), 'Read ten pages')
    await userEvent.click(screen.getByRole('button', { name: en.newHabit.save }))

    await waitFor(async () => {
      const names = (await repository.listHabits()).map((habit) => habit.name)
      expect(names).toContain('Read ten pages')
    })
    expect(push).toHaveBeenCalledWith('/')
  })

  it('keeps the user on the form when the name is too short', async () => {
    const repository = renderForm()

    await userEvent.type(screen.getByLabelText(en.newHabit.nameLabel), 'a')
    await userEvent.click(screen.getByRole('button', { name: en.newHabit.save }))

    expect(await screen.findByText('Give your habit a name')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
    expect((await repository.listHabits()).some((habit) => habit.name === 'a')).toBe(false)
  })

  it('saves only the selected repeat days', async () => {
    const repository = renderForm()

    await userEvent.type(screen.getByLabelText(en.newHabit.nameLabel), 'Weekend run')
    await userEvent.click(screen.getByRole('checkbox', { name: en.newHabit.repeatEveryDay }))
    await userEvent.click(screen.getAllByRole('checkbox', { name: /^Repeat on day/ })[5])
    await userEvent.click(screen.getAllByRole('checkbox', { name: /^Repeat on day/ })[6])
    await userEvent.click(screen.getByRole('button', { name: en.newHabit.save }))

    await waitFor(async () => {
      const created = (await repository.listHabits()).find((habit) => habit.name === 'Weekend run')
      expect(created?.repeatDays).toEqual([5, 6])
    })
  })
})
