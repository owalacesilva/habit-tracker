import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-safe half of the NextAuth setup.
 *
 * The middleware imports this file, so it must not pull in Node-only APIs
 * (crypto, database drivers, …). Providers live in `src/auth.ts`.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user)
      const isAuthPage = nextUrl.pathname.startsWith('/login')

      if (isAuthPage) {
        return isLoggedIn ? Response.redirect(new URL('/', nextUrl)) : true
      }
      return isLoggedIn
    },
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      return token
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
