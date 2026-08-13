import type { ReactNode } from 'react'

import { Skeleton, SkeletonText, SkeletonTile } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  /** Emoji or icon shown above the copy. */
  icon?: ReactNode
  title: string
  body?: string
  /** Primary way out of the empty state. */
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'card flex flex-col items-center gap-2 text-balance px-6 py-10 text-center',
        className,
      )}
    >
      {icon && (
        <span aria-hidden="true" className="text-3xl">
          {icon}
        </span>
      )}
      <p className="font-semibold text-ink text-sm">{title}</p>
      {body && <p className="max-w-xs text-ink-muted text-xs">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export interface ErrorStateProps {
  title: string
  body?: string
  /** Usually a retry button supplied by the route's error boundary. */
  action?: ReactNode
  className?: string
}

export function ErrorState({ title, body, action, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'card flex flex-col items-center gap-2 text-balance px-6 py-10 text-center',
        className,
      )}
    >
      <span aria-hidden="true" className="text-3xl">
        ⚠️
      </span>
      <p className="font-semibold text-ink text-sm">{title}</p>
      {body && <p className="max-w-xs text-ink-muted text-xs">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export { Skeleton }

export interface SkeletonRegionProps {
  /** Announced while the placeholder is on screen, e.g. "Loading…". */
  label: string
  children: ReactNode
  className?: string
}

/**
 * Wrapper every skeleton uses: a polite busy region, so a screen reader says
 * "Loading…" once instead of reading a pile of empty boxes.
 */
export function SkeletonRegion({ label, children, className }: SkeletonRegionProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={className}>
      {/* The library marks every placeholder as its own live region; hiding the
          shapes leaves exactly one announcement — this region's label. */}
      <div aria-hidden="true" className="contents">
        {children}
      </div>
    </div>
  )
}

export interface SkeletonListProps {
  /** How many placeholder rows to draw. */
  rows?: number
  label: string
  className?: string
}

/**
 * Generic card-list placeholder, shaped like the rows it stands in for: an icon
 * tile, a title and a supporting line. Feature screens have their own closer
 * match (see `HabitListSkeleton`, `JourneyListSkeleton`, `StatisticsSkeleton`).
 */
export function SkeletonList({ rows = 3, label, className }: SkeletonListProps) {
  return (
    <SkeletonRegion label={label} className={cn('space-y-3', className)}>
      {Array.from({ length: rows }, (_, index) => index).map((index) => (
        <div key={index} className="card flex items-center gap-3 px-4 py-4">
          <SkeletonTile />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonText width="64%" height={13} />
            <SkeletonText width="36%" height={10} />
          </div>
        </div>
      ))}
    </SkeletonRegion>
  )
}
