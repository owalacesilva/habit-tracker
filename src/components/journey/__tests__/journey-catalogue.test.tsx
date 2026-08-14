import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JourneyCatalogue } from '@/components/journey/journey-catalogue'
import { __resetMemoryRepository, MemoryRepository } from '@/lib/data/memory-repository'
import { DataProvider } from '@/lib/data/provider'
import en from '@/lib/i18n/dictionaries/en'
import { listJourneys } from '@/lib/journeys'
import type { Journey } from '@/types/journey'

const labels = {
  recommendedTitle: en.journey.recommendedTitle,
  recommendedBody: en.journey.recommendedBody,
  recommendedBadge: en.journey.recommendedBadge,
  allTitle: en.journey.allTitle,
  durationDays: en.journey.durationDays,
  habitCount: en.journey.habitCount,
  levelGentle: en.journey.levelGentle,
  levelSteady: en.journey.levelSteady,
  levelBold: en.journey.levelBold,
  start: en.journey.start,
  continue: en.journey.continue,
  inProgress: en.journey.inProgress,
  progress: en.journey.progress,
  emptyTitle: en.journey.emptyTitle,
  emptyBody: en.journey.emptyBody,
  loading: en.common.loading,
  errorTitle: en.common.errorTitle,
  errorBody: en.common.errorBody,
  retry: en.common.retry,
}

let catalogue: Journey[]

beforeAll(async () => {
  catalogue = await listJourneys()
})

beforeEach(() => __resetMemoryRepository())

function renderCatalogue(repository = new MemoryRepository({ ownerId: 'owner-1' })) {
  render(
    <DataProvider ownerId="owner-1" repository={repository}>
      <JourneyCatalogue journeys={catalogue} locale="en" labels={labels} />
    </DataProvider>,
  )
  return repository
}

describe('JourneyCatalogue', () => {
  it('shows the placeholder until the enrolment state is known', () => {
    renderCatalogue()
    expect(screen.getByRole('status', { name: en.common.loading })).toBeInTheDocument()
  })

  it('recommends from the habits the user actually keeps', async () => {
    renderCatalogue()

    const recommended = await screen.findByRole('region', {
      name: en.journey.recommendedTitle,
    })
    expect(recommended).toBeInTheDocument()
    expect(screen.getAllByText(en.journey.recommendedBadge).length).toBeGreaterThan(0)
  })

  it('persists an enrolment and switches the card to "continue"', async () => {
    const repository = renderCatalogue()

    const start = (await screen.findAllByRole('button', { name: en.journey.start }))[0]
    await userEvent.click(start)

    await waitFor(async () => {
      expect(await repository.listEnrollments()).toHaveLength(1)
    })
    expect(await screen.findByRole('button', { name: en.journey.continue })).toBeInTheDocument()
  })

  it('surfaces a failure with a retry', async () => {
    const broken = Object.assign(new MemoryRepository({ ownerId: 'owner-1' }), {
      initialise: async () => {
        throw new Error('offline')
      },
    })

    renderCatalogue(broken)

    expect(await screen.findByRole('alert')).toHaveTextContent(en.common.errorTitle)
  })
})
