import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'

import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration'
import { getScreenSettings } from '@/lib/server-settings'
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
  const { locale, theme, general } = await getScreenSettings()

  return (
    <html
      lang={locale}
      data-theme={themeAttribute(theme)}
      data-reduce-motion={general.reduceMotion ? 'true' : undefined}
      className={sans.variable}
    >
      <body className="font-sans">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
