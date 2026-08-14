/**
 * @jest-environment node
 */
const auth = jest.fn()

jest.mock('@/auth', () => ({ auth }))

async function loadSession(source: string) {
  process.env.NEXT_PUBLIC_DATA_SOURCE = source
  jest.resetModules()
  return import('@/lib/session')
}

beforeEach(() => jest.clearAllMocks())

describe('getSessionUser', () => {
  it('returns nobody in local mode, without loading NextAuth', async () => {
    const { getSessionUser } = await loadSession('indexeddb')

    await expect(getSessionUser()).resolves.toBeNull()
    expect(auth).not.toHaveBeenCalled()
  })

  it('returns the signed-in user in API mode', async () => {
    auth.mockResolvedValue({ user: { id: 'user-1', name: 'Budi', email: 'demo@habit.app' } })
    const { getSessionUser } = await loadSession('api')

    await expect(getSessionUser()).resolves.toMatchObject({ id: 'user-1', name: 'Budi' })
    expect(auth).toHaveBeenCalled()
  })

  it('returns nobody when the API-mode session has expired', async () => {
    auth.mockResolvedValue(null)
    const { getSessionUser } = await loadSession('api')

    await expect(getSessionUser()).resolves.toBeNull()
  })
})

describe('getDisplayName', () => {
  it('is empty in local mode, so the greeting drops the name', async () => {
    const { getDisplayName } = await loadSession('indexeddb')
    await expect(getDisplayName()).resolves.toBe('')
  })

  it('is the session name in API mode', async () => {
    auth.mockResolvedValue({ user: { id: 'user-1', name: 'Budi' } })
    const { getDisplayName } = await loadSession('api')

    await expect(getDisplayName()).resolves.toBe('Budi')
  })
})
