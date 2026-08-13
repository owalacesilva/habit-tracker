import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { LoginState } from '@/app/login/actions'
import { LoginForm } from '@/components/auth/login-form'
import { ReminderBanner } from '@/components/habits/reminder-banner'
import { SheetHeader } from '@/components/layout/sheet-header'
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration'
import en from '@/lib/i18n/dictionaries/en'

describe('SheetHeader', () => {
  it('renders the title and a close link back to the given route', () => {
    render(<SheetHeader title="New habit" closeLabel={en.common.close} closeHref="/history" />)

    expect(screen.getByRole('heading', { name: 'New habit' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: en.common.close })).toHaveAttribute('href', '/history')
  })

  it('closes to the home screen by default', () => {
    render(<SheetHeader title="Your progress" closeLabel={en.common.close} />)
    expect(screen.getByRole('link', { name: en.common.close })).toHaveAttribute('href', '/')
  })
})

describe('ReminderBanner', () => {
  it('offers the reminder call to action', () => {
    render(
      <ReminderBanner
        labels={{
          title: en.home.reminderTitle,
          body: en.home.reminderBody,
          cta: en.home.reminderCta,
        }}
      />,
    )

    expect(screen.getByRole('heading', { name: en.home.reminderTitle })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: en.home.reminderCta })).toBeInTheDocument()
  })
})

describe('LoginForm', () => {
  const labels = {
    email: en.login.email,
    password: en.login.password,
    submit: en.login.submit,
    submitting: en.login.submitting,
  }

  it('submits the credentials to the action', async () => {
    const action = jest.fn<Promise<LoginState>, [LoginState, FormData]>().mockResolvedValue({})
    render(<LoginForm action={action} labels={labels} defaultEmail="demo@habit.app" />)

    await userEvent.type(screen.getByLabelText(en.login.password), 'demo1234')
    await userEvent.click(screen.getByRole('button', { name: en.login.submit }))

    await waitFor(() => expect(action).toHaveBeenCalled())
    const submitted = action.mock.calls[0][1]
    expect(submitted.get('email')).toBe('demo@habit.app')
    expect(submitted.get('password')).toBe('demo1234')
  })

  it('surfaces a failed sign-in', async () => {
    const action = jest
      .fn<Promise<LoginState>, [LoginState, FormData]>()
      .mockResolvedValue({ error: en.login.failed })
    render(<LoginForm action={action} labels={labels} defaultEmail="demo@habit.app" />)

    await userEvent.type(screen.getByLabelText(en.login.password), 'nope1234')
    await userEvent.click(screen.getByRole('button', { name: en.login.submit }))

    expect(await screen.findByText(en.login.failed)).toBeInTheDocument()
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
