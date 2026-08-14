import { render, screen } from '@testing-library/react'

import { HabitListSkeleton } from '@/components/habits/habit-list-skeleton'
import { StatisticsSkeleton } from '@/components/history/statistics-skeleton'
import { JourneyListSkeleton } from '@/components/journey/journey-list-skeleton'
import en from '@/lib/i18n/dictionaries/en'

const label = en.common.loading

/** Every placeholder is a `.react-loading-skeleton` span from the library. */
const parts = (root: HTMLElement) => root.querySelectorAll('.react-loading-skeleton')

describe('skeleton regions', () => {
  it.each([
    ['habits', <HabitListSkeleton key="h" label={label} />],
    ['journeys', <JourneyListSkeleton key="j" label={label} />],
    ['statistics', <StatisticsSkeleton key="s" label={label} />],
  ])('announces %s as busy exactly once', (_name, element) => {
    render(element)

    const status = screen.getByRole('status', { name: label })
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(screen.getAllByRole('status')).toHaveLength(1)
  })
})

describe('HabitListSkeleton', () => {
  it('mirrors a habit row: check circle, tile, two lines and a chip', () => {
    const { container } = render(<HabitListSkeleton rows={1} label={label} />)

    const row = container.querySelector('li') as HTMLElement
    const shapes = Array.from(parts(row)).map((node) => (node as HTMLElement).style.height)

    expect(shapes).toEqual(['24px', '44px', '13px', '10px', '28px'])
  })

  it('keeps the dotted timeline, so the list does not jump when it loads', () => {
    const { container } = render(<HabitListSkeleton label={label} />)

    expect(container.querySelector('.border-dashed')).toBeInTheDocument()
    expect(container.querySelectorAll('li')).toHaveLength(4)
  })
})

describe('JourneyListSkeleton', () => {
  it('lays out the recommended section and the catalogue', () => {
    const { container } = render(<JourneyListSkeleton label={label} />)

    expect(container.querySelectorAll('section')).toHaveLength(2)
    expect(container.querySelectorAll('article')).toHaveLength(4)
  })

  it('shapes a card like a journey card', () => {
    const { container } = render(<JourneyListSkeleton label={label} />)

    const card = container.querySelector('article') as HTMLElement
    // Tile, title, two description lines, three chips and the CTA.
    expect(parts(card)).toHaveLength(8)
  })
})

describe('StatisticsSkeleton', () => {
  it('lays out four tiles, a chart and a breakdown', () => {
    const { container } = render(<StatisticsSkeleton label={label} />)

    expect(container.querySelectorAll('.grid > .card')).toHaveLength(4)
    expect(container.querySelectorAll('li')).toHaveLength(3)
  })

  it('varies the chart columns so the placeholder reads as a chart', () => {
    const { container } = render(<StatisticsSkeleton label={label} />)

    const bars = Array.from(container.querySelectorAll('.h-56 .react-loading-skeleton'))
      .map((node) => (node as HTMLElement).style.height)
      .filter((height) => height.endsWith('%'))

    expect(bars).toEqual(['58%', '86%', '38%', '70%'])
    expect(new Set(bars).size).toBe(bars.length)
  })
})
