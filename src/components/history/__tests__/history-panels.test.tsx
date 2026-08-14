import { render, screen } from '@testing-library/react'

import { HistoryPanels } from '@/components/history/history-panels'
import { __resetMemoryRepository, MemoryRepository } from '@/lib/data/memory-repository'
import { DataProvider } from '@/lib/data/provider'
import type { DataRepository } from '@/lib/data/repository'
import { toISODate } from '@/lib/date'
import en from '@/lib/i18n/dictionaries/en'

function renderPanels(
  tab: 'statistics' | 'habits' | 'achievements',
  repository: DataRepository = new MemoryRepository({ ownerId: 'owner-1' }),
) {
  render(
    <DataProvider ownerId="owner-1" repository={repository}>
      <HistoryPanels
        tab={tab}
        period="this-week"
        periodLabel={en.history.statistics.periodThisWeek}
        locale="en"
        weekStartsOn={0}
        t={en}
      />
    </DataProvider>,
  )
}

/** Complete repository delegating to memory, with one part swapped out. */
function stubRepository(overrides: Partial<DataRepository>): DataRepository {
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

describe('HistoryPanels', () => {
  it('shows a chart-shaped placeholder while statistics load', () => {
    renderPanels('statistics')
    expect(screen.getByRole('status', { name: en.common.loading })).toBeInTheDocument()
  })

  it('derives the statistics from the stored habits', async () => {
    const repository = new MemoryRepository({ ownerId: 'owner-1' })
    await repository.initialise()
    const [habit] = await repository.listHabits()
    await repository.toggleCompletion(habit.id, toISODate(new Date()))

    renderPanels('statistics', repository)

    expect(await screen.findByText(en.history.statistics.currentStreak)).toBeInTheDocument()
    expect(screen.getByText(en.history.statistics.perfectDays)).toBeInTheDocument()
  })

  it('lists every habit on the habits tab', async () => {
    renderPanels('habits')

    expect(await screen.findByText('Drink a glass of water')).toBeInTheDocument()
    expect(screen.getByText('Go for a short walk')).toBeInTheDocument()
  })

  it('computes achievements from the same data', async () => {
    renderPanels('achievements')

    expect(await screen.findByText(en.history.achievements.firstStepTitle)).toBeInTheDocument()
    expect(screen.getAllByText(en.history.achievements.locked).length).toBeGreaterThan(0)
  })

  it('offers a retry when the store cannot be read', async () => {
    const broken = stubRepository({
      initialise: async () => {
        throw new Error('Could not open the local database')
      },
    })

    renderPanels('habits', broken)

    expect(await screen.findByRole('alert')).toHaveTextContent(en.common.errorTitle)
    expect(screen.getByRole('button', { name: en.common.retry })).toBeInTheDocument()
  })
})
