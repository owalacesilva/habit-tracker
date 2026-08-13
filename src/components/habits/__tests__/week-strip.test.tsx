import { render, screen } from '@testing-library/react'

import { WeekStrip } from '@/components/habits/week-strip'
import en from '@/lib/i18n/dictionaries/en'

// Thursday 13 March 2025.
const THURSDAY = new Date(2025, 2, 13)

describe('WeekStrip', () => {
  it('renders Monday through Sunday', () => {
    render(<WeekStrip selected={THURSDAY} label={en.home.selectDay} />)

    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(7)
  })

  it('is labelled for screen readers', () => {
    render(<WeekStrip selected={THURSDAY} label={en.home.selectDay} />)
    expect(screen.getByRole('navigation', { name: en.home.selectDay })).toBeInTheDocument()
  })

  it('marks the selected day', () => {
    render(<WeekStrip selected={THURSDAY} label={en.home.selectDay} />)

    expect(screen.getByRole('link', { name: '13' })).toHaveAttribute('aria-current', 'date')
    expect(screen.getByRole('link', { name: '12' })).not.toHaveAttribute('aria-current')
  })

  it('links each day to its own date param', () => {
    render(<WeekStrip selected={THURSDAY} label={en.home.selectDay} />)

    expect(screen.getByRole('link', { name: '12' })).toHaveAttribute('href', '/?date=2025-03-12')
  })

  it('links today to the bare route so the URL stays clean', () => {
    const today = new Date()
    render(<WeekStrip selected={today} label={en.home.selectDay} />)

    expect(screen.getByRole('link', { name: `${today.getDate()}` })).toHaveAttribute('href', '/')
  })

  it('starts the week on Sunday when the preference says so', () => {
    render(<WeekStrip selected={THURSDAY} label={en.home.selectDay} weekStartsOn={6} />)

    const days = screen.getAllByRole('link').map((link) => link.textContent)
    expect(days[0]).toBe('9')
    expect(days[6]).toBe('15')
  })

  it('names the weekdays in the active language', () => {
    render(<WeekStrip selected={THURSDAY} label={en.home.selectDay} locale="pt-BR" />)

    expect(screen.getByText(/seg/i)).toBeInTheDocument()
  })
})
