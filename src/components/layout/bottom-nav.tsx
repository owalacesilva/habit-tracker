'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType, SVGProps } from 'react'

import { HistoryIcon, HomeIcon, JourneyIcon, SettingsIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

export interface NavLabels {
  home: string
  journey: string
  history: string
  settings: string
  label: string
}

const DESTINATIONS = [
  { key: 'home', href: '/', Icon: HomeIcon },
  { key: 'journey', href: '/journey', Icon: JourneyIcon },
  { key: 'history', href: '/history', Icon: HistoryIcon },
  { key: 'settings', href: '/settings', Icon: SettingsIcon },
] as const satisfies ReadonlyArray<{
  key: keyof Omit<NavLabels, 'label'>
  href: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}>

/** `/journey/xyz` keeps the Journey tab lit; `/` only matches exactly. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export interface BottomNavProps {
  labels: NavLabels
}

/**
 * Persistent navigation. Pinned to the bottom of the phone-width column so it
 * stays reachable one-handed, and labelled in text as well as icon so the
 * destinations survive translation and stay legible.
 */
export function BottomNav({ labels }: BottomNavProps) {
  const pathname = usePathname() ?? '/'

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-app px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <nav
        aria-label={labels.label}
        className="pointer-events-auto flex items-stretch justify-between gap-1 rounded-pill border border-sand-200 bg-surface/95 p-1.5 shadow-card backdrop-blur"
      >
        {DESTINATIONS.map(({ key, href, Icon }) => {
          const active = isActivePath(pathname, href)
          return (
            <Link
              key={key}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-pill px-2 py-1.5 transition-colors',
                active
                  ? 'bg-brand-500 text-white'
                  : 'text-ink-muted hover:bg-sand-100 hover:text-ink',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="font-semibold text-[11px] leading-tight">{labels[key]}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
