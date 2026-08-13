'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import type { LoginState } from '@/app/login/actions'

export interface LoginFormProps {
  action: (state: LoginState, formData: FormData) => Promise<LoginState>
  defaultEmail?: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  )
}

export function LoginForm({ action, defaultEmail }: LoginFormProps) {
  const [state, formAction] = useActionState(action, {} as LoginState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        defaultValue={defaultEmail}
        required
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        minLength={8}
        error={state.error}
      />
      <SubmitButton />
    </form>
  )
}
