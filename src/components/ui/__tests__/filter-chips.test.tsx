import { render, screen } from '@testing-library/react'

import { FilterChips } from '@/components/ui/filter-chips'
import en from '@/lib/i18n/dictionaries/en'
import { STATISTICS_PERIODS } from '@/lib/statistics'

const items = STATISTICS_PERIODS.map((period) => ({
  id: period,
  label: period,
  href: `/history?tab=statistics&period=${period}`,
}))

describe('FilterChips', () => {
  it('renders one chip per period inside a labelled nav', () => {
    render(
      <FilterChips items={items} activeId="this-week" label={en.history.statistics.filterLabel} />,
    )

    expect(
      screen.getByRole('navigation', { name: en.history.statistics.filterLabel }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })

  it('marks the active filter for assistive tech and the eye', () => {
    render(
      <FilterChips items={items} activeId="last-week" label={en.history.statistics.filterLabel} />,
    )

    const active = screen.getByRole('link', { name: 'last-week' })
    expect(active).toHaveAttribute('aria-current', 'true')
    expect(active.className).toContain('bg-brand-500')

    const inactive = screen.getByRole('link', { name: 'all-time' })
    expect(inactive).not.toHaveAttribute('aria-current')
  })

  it('keeps the filter in the URL so a view can be shared', () => {
    render(
      <FilterChips items={items} activeId="this-week" label={en.history.statistics.filterLabel} />,
    )

    expect(screen.getByRole('link', { name: 'all-time' })).toHaveAttribute(
      'href',
      '/history?tab=statistics&period=all-time',
    )
  })
})
