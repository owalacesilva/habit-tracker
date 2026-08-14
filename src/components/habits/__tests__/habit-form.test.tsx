import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { HabitFormState } from '@/app/actions'
import { HabitForm } from '@/components/habits/habit-form'
import { weekdayInitials } from '@/lib/date'
import en from '@/lib/i18n/dictionaries/en'

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

function renderForm(action = jest.fn<Promise<HabitFormState>, [HabitFormState, FormData]>()) {
  action.mockResolvedValue({})
  render(<HabitForm action={action} labels={labels} weekdayInitials={weekdayInitials('en')} />)
  return { action }
}

const dayButtons = () => screen.getAllByRole('checkbox', { name: /^Repeat on day/ })

describe('HabitForm', () => {
  it('starts with every day selected', () => {
    renderForm()

    expect(dayButtons()).toHaveLength(7)
    dayButtons().forEach((day) => {
      expect(day).toBeChecked()
    })
  })

  it('labels the days in the active locale', () => {
    const action = jest.fn<Promise<HabitFormState>, [HabitFormState, FormData]>()
    action.mockResolvedValue({})
    render(<HabitForm action={action} labels={labels} weekdayInitials={weekdayInitials('pt-BR')} />)

    // Portuguese starts the week with "S" (segunda) and has "Q" for quarta.
    expect(dayButtons()[2]).toHaveTextContent('Q')
  })

  it('toggles a single day off', async () => {
    renderForm()

    await userEvent.click(dayButtons()[0])

    expect(dayButtons()[0]).not.toBeChecked()
    expect(dayButtons()[1]).toBeChecked()
  })

  it('clears every day when "repeat every day" is unticked', async () => {
    renderForm()

    await userEvent.click(screen.getByRole('checkbox', { name: en.newHabit.repeatEveryDay }))

    dayButtons().forEach((day) => {
      expect(day).not.toBeChecked()
    })
  })

  it('keeps the goal fields disabled until a goal is set', async () => {
    renderForm()

    expect(screen.getByLabelText(en.newHabit.goalDate)).toBeDisabled()

    await userEvent.click(screen.getByRole('checkbox', { name: en.newHabit.goalLabel }))

    expect(screen.getByLabelText(en.newHabit.goalDate)).toBeEnabled()
  })

  it('submits the habit name and the selected days', async () => {
    const { action } = renderForm()

    await userEvent.type(screen.getByLabelText(en.newHabit.nameLabel), 'Morning Meditations')
    await userEvent.click(dayButtons()[6])
    await userEvent.click(screen.getByRole('button', { name: en.newHabit.save }))

    await waitFor(() => expect(action).toHaveBeenCalled())

    const submitted = action.mock.calls[0][1]
    expect(submitted.get('name')).toBe('Morning Meditations')
    expect(submitted.getAll('repeatDays')).toEqual(['0', '1', '2', '3', '4', '5'])
    expect(submitted.get('remindersEnabled')).toBe('on')
  })

  it('shows the error returned by the action', async () => {
    const action = jest.fn<Promise<HabitFormState>, [HabitFormState, FormData]>()
    action.mockResolvedValue({ error: 'Give your habit a name' })
    render(<HabitForm action={action} labels={labels} weekdayInitials={weekdayInitials('en')} />)

    await userEvent.type(screen.getByLabelText(en.newHabit.nameLabel), 'ab')
    await userEvent.click(screen.getByRole('button', { name: en.newHabit.save }))

    expect(await screen.findByText('Give your habit a name')).toBeInTheDocument()
  })
})
