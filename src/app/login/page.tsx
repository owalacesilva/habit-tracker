import type { Metadata } from 'next'

import { loginAction } from '@/app/login/actions'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  const demoEmail = process.env.DEMO_USER_EMAIL ?? 'demo@habit.app'
  const demoPassword = process.env.DEMO_USER_PASSWORD ?? 'demo1234'

  return (
    <main className="app-shell justify-center gap-8 px-5 py-10">
      <header className="text-center">
        <span aria-hidden className="text-4xl">
          🌱
        </span>
        <h1 className="mt-4 text-3xl leading-tight font-bold text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-muted">Build better routines, one day at a time.</p>
      </header>

      <LoginForm action={loginAction} defaultEmail={demoEmail} />

      <p className="rounded-card bg-sand-100 px-4 py-3 text-center text-xs text-ink-muted">
        Demo account — <span className="font-medium text-ink">{demoEmail}</span> /{' '}
        <span className="font-medium text-ink">{demoPassword}</span>
      </p>
    </main>
  )
}
