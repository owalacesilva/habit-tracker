import Link from 'next/link'

import { cn } from '@/lib/utils'

export interface FilterChip {
  id: string
  label: string
  href: string
}

export interface FilterChipsProps {
  items: FilterChip[]
  activeId: string
  /** Accessible name for the filter row, e.g. "Filter statistics". */
  label: string
  className?: string
}

/**
 * Horizontal filter row of links. Unlike `Tabs` this does not switch a panel —
 * it narrows the data inside one, so it is a navigation landmark rather than a
 * tablist. Scrolls instead of shrinking, which keeps long translations legible.
 */
export function FilterChips({ items, activeId, label, className }: FilterChipsProps) {
  return (
    <nav aria-label={label} className={cn('no-scrollbar -mx-1 overflow-x-auto px-1', className)}>
      <ul className="flex w-max min-w-full gap-2">
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'flex min-h-9 items-center whitespace-nowrap rounded-pill border px-3.5 font-semibold text-xs transition-colors',
                  active
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-sand-200 bg-surface text-ink-muted hover:border-brand-200 hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
