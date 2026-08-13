import { render, screen } from '@testing-library/react'

import { HabitList } from '@/components/habits/habit-list'
import type { Habit } from '@/types/habit'

const habit = (overrides: Partial<Habit> = {}): Habit => ({
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
  ...overrides,
})

const onToggle = jest.fn().mockResolvedValue(true)

describe('HabitList', () => {
  it('prompts the user when nothing is scheduled', () => {
    render(<HabitList items={[]} isoDate="2025-03-13" onToggle={onToggle} />)

    expect(screen.getByText(/nothing scheduled/i)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('renders one row per habit', () => {
    render(
      <HabitList
        items={[
          { habit: habit(), completed: false, streak: 3 },
          { habit: habit({ id: 'walk', name: 'Go for a short walk' }), completed: true, streak: 1 },
        ]}
        isoDate="2025-03-13"
        onToggle={onToggle}
      />,
    )

    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    expect(screen.getByText('Go for a short walk')).toBeInTheDocument()
  })
})
