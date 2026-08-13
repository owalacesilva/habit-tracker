/**
 * `Response.redirect` is a platform API, so run this one outside jsdom.
 *
 * @jest-environment node
 */
import { authConfig } from '@/auth.config'

const authorized = authConfig.callbacks.authorized
type AuthorizedParams = Parameters<typeof authorized>[0]

function request(pathname: string, loggedIn: boolean) {
  return {
    auth: loggedIn ? { user: { id: 'user-1', name: 'Budi' }, expires: '' } : null,
    request: { nextUrl: new URL(`http://localhost:3000${pathname}`) },
  } as unknown as AuthorizedParams
}

describe('authorized callback', () => {
  it('lets a signed-in user through', () => {
    expect(authorized(request('/', true))).toBe(true)
    expect(authorized(request('/progress', true))).toBe(true)
  })

  it('blocks an anonymous request to a protected page', () => {
    expect(authorized(request('/', false))).toBe(false)
    expect(authorized(request('/habits/new', false))).toBe(false)
  })

  it('keeps the login page open to anonymous visitors', () => {
    expect(authorized(request('/login', false))).toBe(true)
  })

  it('redirects a signed-in user away from the login page', () => {
    const result = authorized(request('/login', true))

    expect(result).toBeInstanceOf(Response)
    expect((result as Response).headers.get('location')).toBe('http://localhost:3000/')
  })
})

describe('session callbacks', () => {
  it('carries the user id from the token into the session', () => {
    const jwt = authConfig.callbacks.jwt
    const session = authConfig.callbacks.session

    const token = jwt({ token: {}, user: { id: 'user-1' } } as never) as { sub?: string }
    expect(token.sub).toBe('user-1')

    const result = session({
      session: { user: { id: '' } },
      token: { sub: 'user-1' },
    } as never) as { user: { id: string } }
    expect(result.user.id).toBe('user-1')
  })
})
