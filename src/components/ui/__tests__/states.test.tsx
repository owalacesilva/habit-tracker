import { render, screen } from '@testing-library/react'

import { EmptyState, ErrorState, Skeleton, SkeletonList } from '@/components/ui/states'
import en from '@/lib/i18n/dictionaries/en'

describe('EmptyState', () => {
  it('shows the title, body and action', () => {
    render(
      <EmptyState
        icon="🌱"
        title={en.home.emptyTitle}
        body={en.home.emptyBody}
        action={<button type="button">Add</button>}
      />,
    )

    expect(screen.getByText(en.home.emptyTitle)).toBeInTheDocument()
    expect(screen.getByText(en.home.emptyBody)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('works with only a title', () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })
})

describe('ErrorState', () => {
  it('announces itself as an alert', () => {
    render(<ErrorState title={en.common.errorTitle} body={en.common.errorBody} />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(en.common.errorTitle)
    expect(alert).toHaveTextContent(en.common.errorBody)
  })

  it('renders a retry action when given one', () => {
    render(
      <ErrorState
        title={en.common.errorTitle}
        action={<button type="button">{en.common.retry}</button>}
      />,
    )

    expect(screen.getByRole('button', { name: en.common.retry })).toBeInTheDocument()
  })
})

describe('SkeletonList', () => {
  it('announces that content is loading', () => {
    render(<SkeletonList label={en.common.loading} />)

    const status = screen.getByRole('status', { name: en.common.loading })
    expect(status).toHaveAttribute('aria-busy', 'true')
  })

  it('draws the requested number of placeholder rows', () => {
    const { container } = render(<SkeletonList rows={5} label={en.common.loading} />)

    expect(container.querySelectorAll('.card')).toHaveLength(5)
  })

  it('is shaped like the rows it stands in for', () => {
    const { container } = render(<SkeletonList rows={1} label={en.common.loading} />)

    // Icon tile plus two lines of text — not one anonymous grey slab.
    const row = container.querySelector('.card') as HTMLElement
    const parts = row.querySelectorAll('.react-loading-skeleton')
    expect(parts).toHaveLength(3)
    expect((parts[0] as HTMLElement).style.height).toBe('44px')
  })

  it('takes its colours from the design tokens, so it follows the theme', () => {
    const { container } = render(<SkeletonList rows={1} label={en.common.loading} />)

    // The library sets a grey default on its own class, so the tokens have to
    // arrive as inline custom properties to win — and to resolve per theme.
    const placeholder = container.querySelector('.react-loading-skeleton') as HTMLElement
    expect(placeholder.style.getPropertyValue('--base-color')).toBe('var(--color-skeleton)')
    expect(placeholder.style.getPropertyValue('--highlight-color')).toBe(
      'var(--color-skeleton-highlight)',
    )
  })

  it('renders a standalone placeholder', () => {
    const { container } = render(<Skeleton width={40} />)

    expect(container.querySelector('.react-loading-skeleton')).toBeInTheDocument()
  })
})
