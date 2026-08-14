import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'

import { authConfig } from '@/auth.config'
import { isLocalMode } from '@/lib/data/config'

/**
 * Route protection. `proxy.ts` is the Next.js 16 replacement for `middleware.ts`.
 *
 * In local mode the data lives in the browser and there is no server to
 * authenticate against, so there is nothing to gate: the app opens straight
 * into the routine. In API mode this is the same NextAuth guard as before — a
 * first line of defence, with every route handler still checking for itself.
 */
export default isLocalMode() ? () => NextResponse.next() : NextAuth(authConfig).auth

export const config = {
  // Everything except NextAuth's own routes, Next internals and PWA assets.
  matcher: [
    '/((?!api/auth|api/health|_next/static|_next/image|icons|manifest.webmanifest|sw.js|offline.html|favicon.ico).*)',
  ],
}
