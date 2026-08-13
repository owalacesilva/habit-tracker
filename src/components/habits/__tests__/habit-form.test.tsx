import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HabitForm } from '@/components/habits/habit-form'
import type { HabitFormState } from '@/app/actions'

function renderForm(action = jest.fn<Promise<HabitFormState>, [HabitFormState, FormData]>()) {
  action.mockResolvedValue({})
  render(<HabitForm action={action} />)
  return { action }
}

const dayButtons = () => screen.getAllByRole('checkbox', { name: /^Repeat on day/ })

describe('HabitForm', () => {
  it('starts with every day selected', () => {
    renderForm()

    expect(dayButtons()).toHaveLength(7)
    dayButtons().forEach((day) => expect(day).toBeChecked())
  })

  it('toggles a single day off', async () => {
    renderForm()

    await userEvent.click(dayButtons()[0])

    expect(dayButtons()[0]).not.toBeChecked()
    expect(dayButtons()[1]).toBeChecked()
  })

  it('clears every day when "repeat every day" is unticked', async () => {
    renderForm()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Repeat every day' }))

    dayButtons().forEach((day) => expect(day).not.toBeChecked())
  })

  it('keeps the goal fields disabled until a goal is set', async () => {
    renderForm()

    expect(screen.getByLabelText('Goal date')).toBeDisabled()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Set a goal' }))

    expect(screen.getByLabelText('Goal date')).toBeEnabled()
  })

  it('submits the habit name and the selected days', async () => {
    const { action } = renderForm()

    await userEvent.type(screen.getByLabelText('Name your habit'), 'Morning Meditations')
    await userEvent.click(dayButtons()[6])
    await userEvent.click(screen.getByRole('button', { name: /save habit/i }))

    await waitFor(() => expect(action).toHaveBeenCalled())

    const submitted = action.mock.calls[0][1]
    expect(submitted.get('name')).toBe('Morning Meditations')
    expect(submitted.getAll('repeatDays')).toEqual(['0', '1', '2', '3', '4', '5'])
    expect(submitted.get('remindersEnabled')).toBe('on')
  })

  it('shows the error returned by the action', async () => {
    const action = jest.fn<Promise<HabitFormState>, [HabitFormState, FormData]>()
    action.mockResolvedValue({ error: 'Give your habit a name' })
    render(<HabitForm action={action} />)

    await userEvent.type(screen.getByLabelText('Name your habit'), 'ab')
    await userEvent.click(screen.getByRole('button', { name: /save habit/i }))

    expect(await screen.findByText('Give your habit a name')).toBeInTheDocument()
  })
})
