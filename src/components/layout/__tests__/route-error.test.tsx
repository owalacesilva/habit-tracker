import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RouteError } from '@/components/layout/route-error'
import en from '@/lib/i18n/dictionaries/en'
import ptBR from '@/lib/i18n/dictionaries/pt-BR'

describe('RouteError', () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    document.documentElement.lang = ''
    jest.clearAllMocks()
  })

  afterAll(() => consoleError.mockRestore())

  it('explains the failure and offers a retry', async () => {
    const reset = jest.fn()
    render(<RouteError error={new Error('boom')} reset={reset} />)

    expect(screen.getByRole('alert')).toHaveTextContent(en.common.errorTitle)

    await userEvent.click(screen.getByRole('button', { name: en.common.retry }))
    expect(reset).toHaveBeenCalled()
  })

  it('logs the error for debugging', () => {
    const error = new Error('boom')
    render(<RouteError error={error} reset={jest.fn()} />)

    expect(consoleError).toHaveBeenCalledWith(error)
  })

  it('speaks the language of the document', () => {
    document.documentElement.lang = 'pt-BR'
    render(<RouteError error={new Error('boom')} reset={jest.fn()} />)

    expect(screen.getByRole('alert')).toHaveTextContent(ptBR.common.errorTitle)
    expect(screen.getByRole('button', { name: ptBR.common.retry })).toBeInTheDocument()
  })
})
