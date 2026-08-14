import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { __resetMemoryRepository, MemoryRepository } from '@/lib/data/memory-repository'
import { DataProvider, useData } from '@/lib/data/provider'
import type { DataRepository } from '@/lib/data/repository'
import { RepositoryError } from '@/lib/data/repository'

function Probe() {
  const { status, error, habits, notifications, createHabit, toggleCompletion } = useData()

  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="error">{error?.message ?? ''}</p>
      <p data-testid="count">{habits.length}</p>
      <p data-testid="first-completions">{habits[0]?.completedDates.join(',') ?? ''}</p>
      <p data-testid="reminders">{String(notifications.enabled)}</p>
      <button type="button" onClick={() => createHabit({ name: 'Added habit' })}>
        add
      </button>
      <button
        type="button"
        onClick={() => toggleCompletion(habits[0]?.id ?? 'missing', '2026-03-13').catch(() => {})}
      >
        toggle
      </button>
    </div>
  )
}

function renderProvider(repository: DataRepository) {
  render(
    <DataProvider ownerId="owner-1" repository={repository}>
      <Probe />
    </DataProvider>,
  )
}

/**
 * A complete repository that delegates to the in-memory adapter, with the parts
 * a test wants to control swapped out. Spreading the class instance would drop
 * its prototype methods, so every call is forwarded explicitly.
 */
function stubRepository(overrides: Partial<DataRepository> = {}): DataRepository {
  const inner = new MemoryRepository({ ownerId: 'owner-1' })

  return {
    initialise: () => inner.initialise(),
    listHabits: () => inner.listHabits(),
    createHabit: (input) => inner.createHabit(input),
    toggleCompletion: (habitId, isoDate) => inner.toggleCompletion(habitId, isoDate),
    deleteHabit: (habitId) => inner.deleteHabit(habitId),
    listEnrollments: () => inner.listEnrollments(),
    startJourney: (journeyId, startedIso) => inner.startJourney(journeyId, startedIso),
    getNotificationPreferences: () => inner.getNotificationPreferences(),
    setNotificationsEnabled: (enabled) => inner.setNotificationsEnabled(enabled),
    setNotificationType: (type, enabled) => inner.setNotificationType(type, enabled),
    ...overrides,
  }
}

beforeEach(() => __resetMemoryRepository())

describe('DataProvider', () => {
  it('loads everything the screens need, then reports ready', async () => {
    renderProvider(new MemoryRepository({ ownerId: 'owner-1' }))

    expect(screen.getByTestId('status')).toHaveTextContent('loading')

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))
    expect(Number(screen.getByTestId('count').textContent)).toBeGreaterThan(0)
    expect(screen.getByTestId('reminders')).toHaveTextContent('true')
  })

  it('adds a created habit to the list', async () => {
    renderProvider(new MemoryRepository({ ownerId: 'owner-1' }))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))

    const before = Number(screen.getByTestId('count').textContent)
    await userEvent.click(screen.getByRole('button', { name: 'add' }))

    await waitFor(() => expect(Number(screen.getByTestId('count').textContent)).toBe(before + 1))
  })

  it('applies a completion immediately, before the write resolves', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })

    const slow = stubRepository({
      toggleCompletion: async (habitId, isoDate) => {
        await gate
        return new MemoryRepository({ ownerId: 'owner-1' }).toggleCompletion(habitId, isoDate)
      },
    })

    renderProvider(slow)
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))

    await userEvent.click(screen.getByRole('button', { name: 'toggle' }))

    // Optimistic: the tick is on screen while the repository is still working.
    await waitFor(() =>
      expect(screen.getByTestId('first-completions')).toHaveTextContent('2026-03-13'),
    )

    release()
  })

  it('rolls the completion back when the write fails', async () => {
    const failing = stubRepository({
      toggleCompletion: async () => {
        throw new RepositoryError('offline')
      },
    })

    renderProvider(failing)
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'))
    const before = screen.getByTestId('first-completions').textContent

    await userEvent.click(screen.getByRole('button', { name: 'toggle' }))

    await waitFor(() => expect(screen.getByTestId('first-completions').textContent).toBe(before))
  })

  it('surfaces a repository that cannot start', async () => {
    const broken = stubRepository({
      initialise: async () => {
        throw new RepositoryError('Could not open the local database')
      },
    })

    renderProvider(broken)

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'))
    expect(screen.getByTestId('error')).toHaveTextContent('Could not open the local database')
  })

  it('refuses to be used outside the provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Probe />)).toThrow(/useData must be used inside/)

    consoleError.mockRestore()
  })
})
