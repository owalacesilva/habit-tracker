import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'
import { z } from 'zod'

import { authConfig } from '@/auth.config'
import { findUserByEmail, verifyPassword } from '@/lib/users'

export const credentialsSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const providers: NextAuthConfig['providers'] = [
  Credentials({
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw)
      if (!parsed.success) return null

      const user = findUserByEmail(parsed.data.email)
      if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) return null

      return { id: user.id, email: user.email, name: user.name }
    },
  }),
]

// Registered only when configured, so the app boots without OAuth credentials.
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
})

/** Session user for server components; middleware guarantees one exists. */
export async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')
  return session.user as {
    id: string
    name?: string | null
    email?: string | null
  }
}
