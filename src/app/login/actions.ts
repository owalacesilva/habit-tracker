'use server'

import { AuthError } from 'next-auth'
import { signIn } from '@/auth'

export interface LoginState {
  error?: string
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn('credentials', {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      redirectTo: '/',
    })
    return {}
  } catch (error) {
    // `signIn` throws a redirect on success — only swallow real auth errors.
    if (error instanceof AuthError) {
      return { error: 'Wrong email or password' }
    }
    throw error
  }
}
