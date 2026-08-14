import { render, screen } from '@testing-library/react'

import { ProgressChart } from '@/components/progress/progress-chart'
import en from '@/lib/i18n/dictionaries/en'
import ptBR from '@/lib/i18n/dictionaries/pt-BR'
import type { HabitProgress } from '@/types/habit'

const items: HabitProgress[] = [
  { label: 'Walking', percentage: 48, tone: 'walking' },
  { label: 'Running', percentage: 0, tone: 'running' },
]

const template = en.history.statistics.chartLabel

describe('ProgressChart', () => {
  it('labels every column for screen readers', () => {
    render(<ProgressChart items={items} labelTemplate={template} />)

    expect(screen.getByRole('img', { name: 'Walking: 48% complete this week' })).toBeInTheDocument()
    expect(screen.getByText('Walking')).toBeInTheDocument()
  })

  it('translates the accessible label', () => {
    render(<ProgressChart items={items} labelTemplate={ptBR.history.statistics.chartLabel} />)

    expect(
      screen.getByRole('img', { name: 'Walking: 48% concluído nesta semana' }),
    ).toBeInTheDocument()
  })

  it('shows the percentage on the bar', () => {
    render(<ProgressChart items={items} labelTemplate={template} />)

    expect(screen.getByText('48%')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('keeps an empty bar visible with a minimum height', () => {
    render(<ProgressChart items={[items[1]]} labelTemplate={template} />)

    const bar = screen.getByText('0%').parentElement
    expect(bar).toHaveStyle({ height: '12%' })
  })

  it('pairs each bar colour with a readable label colour', () => {
    render(<ProgressChart items={items} labelTemplate={template} />)

    // The `-on` token is what keeps the in-bar text legible in dark mode.
    const bar = screen.getByText('48%').parentElement
    expect(bar).toHaveClass('bg-chart-walking', 'text-chart-walking-on')
  })
})
