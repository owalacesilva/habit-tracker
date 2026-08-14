import { render, screen } from '@testing-library/react'

import { PointsCard } from '@/components/progress/points-card'
import en from '@/lib/i18n/dictionaries/en'

const labels = {
  title: en.history.statistics.pointsEarned,
  subtitle: en.history.statistics.forThisWeek,
  points: en.history.statistics.points,
}

describe('PointsCard', () => {
  it('formats the points total for the active locale', () => {
    render(<PointsCard points={1842} stats={[]} labels={labels} />)

    expect(screen.getByText('1,842')).toBeInTheDocument()
    expect(screen.getByText(en.history.statistics.forThisWeek)).toBeInTheDocument()
  })

  it('uses the number grouping of the active locale', () => {
    render(<PointsCard points={1842} stats={[]} labels={labels} locale="pt-BR" />)

    expect(screen.getByText('1.842')).toBeInTheDocument()
  })

  it('renders each stat as a term/definition pair', () => {
    render(
      <PointsCard
        points={0}
        stats={[
          { label: 'Completed', value: '4' },
          { label: 'Time', value: '7h 30m' },
        ]}
        labels={labels}
      />,
    )

    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('7h 30m')).toBeInTheDocument()
  })

  it('renders the action it is given', () => {
    render(
      <PointsCard
        points={0}
        stats={[]}
        labels={labels}
        action={<button type="button">Share</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })
})
