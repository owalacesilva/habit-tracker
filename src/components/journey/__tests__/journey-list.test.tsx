import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JourneyCard } from '@/components/journey/journey-card'
import { JourneyList, type JourneyListLabels } from '@/components/journey/journey-list'
import en from '@/lib/i18n/dictionaries/en'
import type { JourneyView } from '@/types/journey'

const labels: JourneyListLabels = {
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
}

function view(overrides: Partial<JourneyView> = {}): JourneyView {
  return {
    id: 'hydration-reset',
    icon: '💧',
    accent: 'water',
    level: 'gentle',
    durationDays: 14,
    habitCount: 3,
    title: 'Hydration Reset',
    description: 'Two weeks to make drinking water automatic.',
    recommended: false,
    progress: null,
    ...overrides,
  }
}

const action = jest.fn()

describe('JourneyCard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows what the journey is and what it asks of you', () => {
    render(<JourneyCard journey={view()} labels={labels} action={action} />)

    expect(screen.getByRole('heading', { name: 'Hydration Reset' })).toBeInTheDocument()
    expect(screen.getByText(/two weeks/i)).toBeInTheDocument()
    expect(screen.getByText('14 days')).toBeInTheDocument()
    expect(screen.getByText('3 habits')).toBeInTheDocument()
    expect(screen.getByText(en.journey.levelGentle)).toBeInTheDocument()
  })

  it('invites you to start when you have not', () => {
    render(<JourneyCard journey={view()} labels={labels} action={action} />)

    expect(screen.getByRole('button', { name: en.journey.start })).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('shows progress once started', () => {
    render(
      <JourneyCard
        journey={view({ progress: { day: 3, total: 14, percentage: 21 } })}
        labels={labels}
        action={action}
      />,
    )

    expect(screen.getByRole('button', { name: en.journey.continue })).toBeInTheDocument()
    expect(screen.getByText('3 of 14 days')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '21')
  })

  it('carries the journey id to the action', async () => {
    render(<JourneyCard journey={view()} labels={labels} action={action} />)

    await userEvent.click(screen.getByRole('button', { name: en.journey.start }))

    expect(action).toHaveBeenCalled()
    expect(action.mock.calls[0][0].get('journeyId')).toBe('hydration-reset')
  })

  it('badges a recommended journey', () => {
    render(<JourneyCard journey={view({ recommended: true })} labels={labels} action={action} />)

    expect(screen.getByText(en.journey.recommendedBadge)).toBeInTheDocument()
  })
})

describe('JourneyList', () => {
  it('separates recommendations from the rest of the catalogue', () => {
    render(
      <JourneyList
        journeys={[
          view({ id: 'a', title: 'Recommended one', recommended: true }),
          view({ id: 'b', title: 'Ordinary one' }),
        ]}
        labels={labels}
        action={action}
      />,
    )

    const recommended = screen.getByRole('region', {
      name: en.journey.recommendedTitle,
    })
    expect(
      within(recommended).getByRole('heading', { name: 'Recommended one' }),
    ).toBeInTheDocument()
    expect(within(recommended).queryByRole('heading', { name: 'Ordinary one' })).toBeNull()

    const all = screen.getByRole('region', { name: en.journey.allTitle })
    expect(within(all).getByRole('heading', { name: 'Ordinary one' })).toBeInTheDocument()
  })

  it('outlines the recommended cards so the difference is visible', () => {
    const { container } = render(
      <JourneyList journeys={[view({ recommended: true })]} labels={labels} action={action} />,
    )

    expect(container.querySelector('article')?.className).toContain('border-brand-300')
  })

  it('hides the recommended section when there is nothing to recommend', () => {
    render(<JourneyList journeys={[view()]} labels={labels} action={action} />)

    expect(screen.queryByRole('region', { name: en.journey.recommendedTitle })).toBeNull()
    expect(screen.getByRole('region', { name: en.journey.allTitle })).toBeInTheDocument()
  })

  it('explains an empty catalogue', () => {
    render(<JourneyList journeys={[]} labels={labels} action={action} />)

    expect(screen.getByText(en.journey.emptyTitle)).toBeInTheDocument()
    expect(screen.getByText(en.journey.emptyBody)).toBeInTheDocument()
  })
})
