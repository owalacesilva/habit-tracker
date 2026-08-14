import { isLocalMode } from '@/lib/data/config'

export interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
}

/**
 * The signed-in user, or `null` in local mode.
 *
 * Local mode has no backend to authenticate against, so NextAuth is not even
 * loaded — the dynamic import keeps it (and its `AUTH_SECRET` requirement) out
 * of an autonomous deployment.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (isLocalMode()) return null

  const { auth } = await import('@/auth')
  const session = await auth()
  return (session?.user as SessionUser | undefined) ?? null
}

/** Display name for the greeting; empty in local mode until a profile exists. */
export async function getDisplayName(): Promise<string> {
  const user = await getSessionUser()
  return user?.name ?? ''
}
