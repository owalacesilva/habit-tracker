import { render, screen } from '@testing-library/react'

import { BottomNav, isActivePath } from '@/components/layout/bottom-nav'
import en from '@/lib/i18n/dictionaries/en'
import ptBR from '@/lib/i18n/dictionaries/pt-BR'

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }))

const { usePathname } = jest.requireMock('next/navigation')

function renderNav(pathname: string, labels = en.nav) {
  usePathname.mockReturnValue(pathname)
  render(<BottomNav labels={labels} />)
}

describe('isActivePath', () => {
  it('matches home only exactly', () => {
    expect(isActivePath('/', '/')).toBe(true)
    expect(isActivePath('/journey', '/')).toBe(false)
  })

  it('keeps a section active on its sub-routes', () => {
    expect(isActivePath('/journey', '/journey')).toBe(true)
    expect(isActivePath('/journey/hydration-reset', '/journey')).toBe(true)
    expect(isActivePath('/journeys-archive', '/journey')).toBe(false)
  })
})

describe('BottomNav', () => {
  beforeEach(() => jest.clearAllMocks())

  it('offers the four primary destinations', () => {
    renderNav('/')

    const nav = screen.getByRole('navigation', { name: en.nav.label })
    expect(nav).toBeInTheDocument()
    ;[en.nav.home, en.nav.journey, en.nav.history, en.nav.settings].forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    })
  })

  it('marks the current destination for assistive tech', () => {
    renderNav('/history')

    expect(screen.getByRole('link', { name: en.nav.history })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: en.nav.home })).not.toHaveAttribute('aria-current')
  })

  it('highlights the active destination visually too', () => {
    renderNav('/settings')

    expect(screen.getByRole('link', { name: en.nav.settings }).className).toContain('bg-brand-500')
    expect(screen.getByRole('link', { name: en.nav.home }).className).not.toContain('bg-brand-500')
  })

  it('stays on the Journey tab inside a journey', () => {
    renderNav('/journey/hydration-reset')

    expect(screen.getByRole('link', { name: en.nav.journey })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('renders in the active language', () => {
    renderNav('/', ptBR.nav)

    expect(screen.getByRole('link', { name: 'Início' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
  })

  it('survives a null pathname', () => {
    usePathname.mockReturnValue(null)
    render(<BottomNav labels={en.nav} />)

    expect(screen.getByRole('link', { name: en.nav.home })).toHaveAttribute('aria-current', 'page')
  })
})
