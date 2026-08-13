import type { Metadata } from 'next'

import { loginAction } from '@/app/login/actions'
import { LoginForm } from '@/components/auth/login-form'
import { getI18n } from '@/lib/server-settings'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.login.submit }
}

export default async function LoginPage() {
  const { t } = await getI18n()
  const demoEmail = process.env.DEMO_USER_EMAIL ?? 'demo@habit.app'
  const demoPassword = process.env.DEMO_USER_PASSWORD ?? 'demo1234'

  return (
    <main className="app-shell justify-center gap-8 px-5 py-10">
      <header className="text-center">
        <span aria-hidden className="text-4xl">
          🌱
        </span>
        <h1 className="mt-4 text-3xl leading-tight font-bold text-ink">{t.login.title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{t.login.subtitle}</p>
      </header>

      <LoginForm
        action={loginAction}
        defaultEmail={demoEmail}
        labels={{
          email: t.login.email,
          password: t.login.password,
          submit: t.login.submit,
          submitting: t.login.submitting,
        }}
      />

      <p className="rounded-card bg-sand-100 px-4 py-3 text-center text-xs text-ink-muted">
        {t.login.demoHint} <span className="font-medium text-ink">{demoEmail}</span> /{' '}
        <span className="font-medium text-ink">{demoPassword}</span>
      </p>
    </main>
  )
}
