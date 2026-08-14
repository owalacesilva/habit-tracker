import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'

import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration'
import { DataProvider } from '@/lib/data/provider'
import { getScreenSettings } from '@/lib/server-settings'
import { getSessionUser } from '@/lib/session'
import { themeAttribute } from '@/lib/theme'
import './globals.css'

// Exposed as a CSS variable that `--font-sans` (see globals.css) points at.
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: {
    default: 'Habit Tracker',
    template: '%s · Habit Tracker',
  },
  description: 'Build better routines, one day at a time.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Habit Tracker',
  appleWebApp: {
    capable: true,
    title: 'Habits',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  // Matches --color-canvas in each scheme so the browser chrome blends in.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF4EE' },
    { media: '(prefers-color-scheme: dark)', color: '#17120F' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read on the server so the first paint already uses the chosen theme and
  // language — a client-side read would flash the wrong one.
  const [{ locale, theme, general }, user] = await Promise.all([
    getScreenSettings(),
    getSessionUser(),
  ])

  return (
    <html
      lang={locale}
      data-theme={themeAttribute(theme)}
      data-reduce-motion={general.reduceMotion ? 'true' : undefined}
      className={sans.variable}
    >
      <body className="font-sans">
        {/* Owns every read and write of user data. `null` means local mode,
            where the provider resolves a device id on the client. */}
        <DataProvider ownerId={user?.id ?? null}>{children}</DataProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
