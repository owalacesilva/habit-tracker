import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LoginForm } from '@/components/auth/login-form'
import { ReminderBanner } from '@/components/habits/reminder-banner'
import { SheetHeader } from '@/components/layout/sheet-header'
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration'
import type { LoginState } from '@/app/login/actions'

describe('SheetHeader', () => {
  it('renders the title and a close link back to the given route', () => {
    render(<SheetHeader title="New habit" closeHref="/progress" />)

    expect(screen.getByRole('heading', { name: 'New habit' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Close' })).toHaveAttribute('href', '/progress')
  })

  it('closes to the home screen by default', () => {
    render(<SheetHeader title="Your progress" />)
    expect(screen.getByRole('link', { name: 'Close' })).toHaveAttribute('href', '/')
  })
})

describe('ReminderBanner', () => {
  it('offers the reminder call to action', () => {
    render(<ReminderBanner />)

    expect(screen.getByRole('heading', { name: 'Set the reminder' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Set Now' })).toBeInTheDocument()
  })
})

describe('LoginForm', () => {
  it('submits the credentials to the action', async () => {
    const action = jest.fn<Promise<LoginState>, [LoginState, FormData]>().mockResolvedValue({})
    render(<LoginForm action={action} defaultEmail="demo@habit.app" />)

    await userEvent.type(screen.getByLabelText('Password'), 'demo1234')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(action).toHaveBeenCalled())
    const submitted = action.mock.calls[0][1]
    expect(submitted.get('email')).toBe('demo@habit.app')
    expect(submitted.get('password')).toBe('demo1234')
  })

  it('surfaces a failed sign-in', async () => {
    const action = jest
      .fn<Promise<LoginState>, [LoginState, FormData]>()
      .mockResolvedValue({ error: 'Wrong email or password' })
    render(<LoginForm action={action} defaultEmail="demo@habit.app" />)

    await userEvent.type(screen.getByLabelText('Password'), 'nope1234')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Wrong email or password')).toBeInTheDocument()
  })
})

describe('ServiceWorkerRegistration', () => {
  const register = jest.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    })
  })

  it('does not register in development or test builds', () => {
    render(<ServiceWorkerRegistration />)
    expect(register).not.toHaveBeenCalled()
  })

  it('registers the worker at the root scope in production', () => {
    const nodeEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true })

    render(<ServiceWorkerRegistration />)

    expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/' })
    Object.defineProperty(process.env, 'NODE_ENV', { value: nodeEnv, configurable: true })
  })
})
