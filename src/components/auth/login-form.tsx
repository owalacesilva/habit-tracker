'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import type { LoginState } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'

export interface LoginFormLabels {
  email: string
  password: string
  submit: string
  submitting: string
}

export interface LoginFormProps {
  action: (state: LoginState, formData: FormData) => Promise<LoginState>
  labels: LoginFormLabels
  defaultEmail?: string
}

function SubmitButton({ submit, submitting }: { submit: string; submitting: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? submitting : submit}
    </Button>
  )
}

export function LoginForm({ action, labels, defaultEmail }: LoginFormProps) {
  const [state, formAction] = useActionState(action, {} as LoginState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label={labels.email}
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        defaultValue={defaultEmail}
        required
      />
      <TextField
        label={labels.password}
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        minLength={8}
        error={state.error}
      />
      <SubmitButton submit={labels.submit} submitting={labels.submitting} />
    </form>
  )
}
