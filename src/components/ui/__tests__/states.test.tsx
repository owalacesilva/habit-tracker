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
        action={<button>Add</button>}
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
    render(<ErrorState title={en.common.errorTitle} action={<button>{en.common.retry}</button>} />)

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

  it('hides the placeholders from assistive tech', () => {
    const { container } = render(<Skeleton className="h-3" />)

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
})
