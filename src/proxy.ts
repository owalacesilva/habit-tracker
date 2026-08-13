import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

/**
 * Route protection. `proxy.ts` is the Next.js 16 replacement for `middleware.ts`.
 *
 * It is a first line of defence only — server actions and route handlers still
 * call `requireUser()` themselves, because a matcher change must never be able
 * to silently expose a mutation.
 */
export default NextAuth(authConfig).auth

export const config = {
  // Everything except NextAuth's own routes, Next internals and PWA assets.
  matcher: [
    '/((?!api/auth|api/health|_next/static|_next/image|icons|manifest.webmanifest|sw.js|offline.html|favicon.ico).*)',
  ],
}
