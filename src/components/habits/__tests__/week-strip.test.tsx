import { render, screen } from '@testing-library/react'

import { WeekStrip } from '@/components/habits/week-strip'
import { toISODate } from '@/lib/date'

// Thursday 13 March 2025.
const THURSDAY = new Date(2025, 2, 13)

describe('WeekStrip', () => {
  it('renders Monday through Sunday', () => {
    render(<WeekStrip selected={THURSDAY} />)

    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(7)
  })

  it('marks the selected day', () => {
    render(<WeekStrip selected={THURSDAY} />)

    const selected = screen.getByRole('link', { name: '13' })
    expect(selected).toHaveAttribute('aria-current', 'date')
    expect(screen.getByRole('link', { name: '12' })).not.toHaveAttribute('aria-current')
  })

  it('links each day to its own date param', () => {
    render(<WeekStrip selected={THURSDAY} />)

    expect(screen.getByRole('link', { name: '12' })).toHaveAttribute('href', '/?date=2025-03-12')
  })

  it('links today to the bare route so the URL stays clean', () => {
    const today = new Date()
    render(<WeekStrip selected={today} />)

    expect(screen.getByRole('link', { name: `${today.getDate()}` })).toHaveAttribute('href', '/')
    expect(toISODate(today)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
