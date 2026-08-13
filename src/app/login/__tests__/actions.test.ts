/**
 * @jest-environment node
 */
import { AuthError } from 'next-auth'

import { loginAction } from '@/app/login/actions'
import { signIn } from '@/auth'

// next-auth is ESM-only; a stub keeps the action unit-testable under Jest.
jest.mock('next-auth', () => ({
  AuthError: class AuthError extends Error {},
}))
jest.mock('@/auth', () => ({ signIn: jest.fn() }))

const signInMock = signIn as jest.MockedFunction<typeof signIn>

function credentials(email: string, password: string) {
  const data = new FormData()
  data.append('email', email)
  data.append('password', password)
  return data
}

beforeEach(() => jest.clearAllMocks())

describe('loginAction', () => {
  it('signs in with the submitted credentials', async () => {
    await loginAction({}, credentials('demo@habit.app', 'demo1234'))

    expect(signInMock).toHaveBeenCalledWith('credentials', {
      email: 'demo@habit.app',
      password: 'demo1234',
      redirectTo: '/',
    })
  })

  it('turns an auth failure into a form error', async () => {
    signInMock.mockRejectedValueOnce(new AuthError('CredentialsSignin'))

    await expect(loginAction({}, credentials('demo@habit.app', 'wrong-one'))).resolves.toEqual({
      error: 'Wrong email or password',
    })
  })

  it('rethrows the redirect that a successful sign-in raises', async () => {
    // `signIn` signals success by throwing NEXT_REDIRECT — it must not be swallowed.
    signInMock.mockRejectedValueOnce(new Error('NEXT_REDIRECT'))

    await expect(loginAction({}, credentials('demo@habit.app', 'demo1234'))).rejects.toThrow(
      'NEXT_REDIRECT',
    )
  })
})
