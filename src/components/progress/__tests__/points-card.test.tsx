import { render, screen } from '@testing-library/react'

import { PointsCard } from '@/components/progress/points-card'

describe('PointsCard', () => {
  it('formats the points total', () => {
    render(<PointsCard points={1842} stats={[]} />)

    expect(screen.getByText('1,842')).toBeInTheDocument()
    expect(screen.getByText(/for this week/i)).toBeInTheDocument()
  })

  it('renders each stat as a term/definition pair', () => {
    render(
      <PointsCard
        points={0}
        stats={[
          { label: 'Completed', value: '4' },
          { label: 'Time', value: '7h 30m' },
        ]}
      />,
    )

    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('7h 30m')).toBeInTheDocument()
  })

  it('offers the share action', () => {
    render(<PointsCard points={0} stats={[]} />)

    expect(screen.getByRole('button', { name: /share progress/i })).toBeInTheDocument()
  })
})
