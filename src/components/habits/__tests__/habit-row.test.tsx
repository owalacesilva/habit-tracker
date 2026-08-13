import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HabitRow } from '@/components/habits/habit-row'
import type { Habit } from '@/types/habit'

const habit: Habit = {
  id: 'water',
  userId: 'test-user',
  name: 'Drink a glass of water',
  shortName: 'Water',
  icon: '🥤',
  accent: 'water',
  durationMinutes: 5,
  repeatDays: [0, 1, 2, 3, 4, 5, 6],
  remindersEnabled: true,
  completedDates: [],
}

function renderRow(props: Partial<React.ComponentProps<typeof HabitRow>> = {}) {
  const onToggle = jest.fn().mockResolvedValue(true)
  render(
    <HabitRow
      habit={habit}
      isoDate="2025-03-13"
      completed={false}
      streak={3}
      onToggle={onToggle}
      {...props}
    />,
  )
  return { onToggle }
}

describe('HabitRow', () => {
  it('shows the habit name, streak and duration', () => {
    renderRow()

    expect(screen.getByText('Drink a glass of water')).toBeInTheDocument()
    expect(screen.getByText('Streak 3 days')).toBeInTheDocument()
    expect(screen.getByText('5 min')).toBeInTheDocument()
  })

  it('uses the singular form for a one-day streak', () => {
    renderRow({ streak: 1 })
    expect(screen.getByText('Streak 1 day')).toBeInTheDocument()
  })

  it('renders a completed habit as checked', () => {
    renderRow({ completed: true })
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls the toggle action with the habit id and date', async () => {
    const { onToggle } = renderRow()

    await userEvent.click(screen.getByRole('checkbox'))

    expect(onToggle).toHaveBeenCalledWith('water', '2025-03-13')
  })

  it('ticks optimistically while the action is in flight', async () => {
    let finish!: (value: boolean) => void
    const inFlight = new Promise<boolean>((resolve) => {
      finish = resolve
    })
    renderRow({ onToggle: jest.fn().mockReturnValue(inFlight) })

    await userEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeChecked())

    // Always settle the action: React entangles pending async transitions, so a
    // dangling one would stall the next test.
    finish(true)
    await waitFor(() => expect(screen.getByRole('checkbox')).toHaveAttribute('aria-busy', 'false'))
  })

  it('rolls the tick back when the action fails', async () => {
    const onToggle = jest.fn().mockRejectedValue(new Error('offline'))
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    renderRow({ onToggle })

    await userEvent.click(screen.getByRole('checkbox'))

    // No revalidated prop arrives, so the optimistic tick reverts to `completed`.
    await waitFor(() => expect(screen.getByRole('checkbox')).not.toBeChecked())
    consoleError.mockRestore()
  })
})
