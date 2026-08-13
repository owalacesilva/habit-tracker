import Link from 'next/link'

import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  href: string
}

export interface TabsProps {
  items: TabItem[]
  activeId: string
  /** Accessible name for the tab strip, e.g. "History sections". */
  label: string
  /** id of the element holding the active panel. */
  panelId: string
  className?: string
}

/**
 * URL-driven tabs: each tab is a real link, so a section can be shared,
 * bookmarked and rendered on the server. Horizontal scrolling keeps long
 * translations from squashing the labels.
 */
export function Tabs({ items, activeId, label, panelId, className }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'no-scrollbar -mx-1 flex gap-1 overflow-x-auto rounded-pill bg-sand-100 p-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === activeId
        return (
          <Link
            key={item.id}
            href={item.href}
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={active}
            aria-controls={panelId}
            className={cn(
              'flex min-h-11 flex-1 items-center justify-center rounded-pill px-3 text-center text-xs font-semibold whitespace-nowrap transition-colors',
              active
                ? 'bg-surface text-ink shadow-card'
                : 'text-ink-muted hover:bg-surface/60 hover:text-ink',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}

export interface TabPanelProps {
  id: string
  labelledBy: string
  children: React.ReactNode
  className?: string
}

export function TabPanel({ id, labelledBy, children, className }: TabPanelProps) {
  return (
    <div role="tabpanel" id={id} aria-labelledby={labelledBy} tabIndex={-1} className={className}>
      {children}
    </div>
  )
}
