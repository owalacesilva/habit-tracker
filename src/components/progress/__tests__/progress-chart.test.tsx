import { render, screen } from '@testing-library/react'

import { ProgressChart } from '@/components/progress/progress-chart'

import type { HabitProgress } from '@/types/habit'

const items: HabitProgress[] = [
  { label: 'Walking', percentage: 48, tone: 'walking' },
  { label: 'Running', percentage: 0, tone: 'running' },
]

describe('ProgressChart', () => {
  it('labels every column for screen readers', () => {
    render(<ProgressChart items={items} />)

    expect(screen.getByRole('img', { name: 'Walking: 48% complete this week' })).toBeInTheDocument()
    expect(screen.getByText('Walking')).toBeInTheDocument()
  })

  it('shows the percentage on the bar', () => {
    render(<ProgressChart items={items} />)

    expect(screen.getByText('48%')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('keeps an empty bar visible with a minimum height', () => {
    render(<ProgressChart items={[items[1]]} />)

    const bar = screen.getByText('0%').parentElement
    expect(bar).toHaveStyle({ height: '12%' })
  })
})
