import type { ReactNode } from 'react'

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
        'card flex flex-col items-center gap-2 px-6 py-10 text-center text-balance',
        className,
      )}
    >
      {icon && (
        <span aria-hidden className="text-3xl">
          {icon}
        </span>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {body && <p className="max-w-xs text-xs text-ink-muted">{body}</p>}
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
        'card flex flex-col items-center gap-2 px-6 py-10 text-center text-balance',
        className,
      )}
    >
      <span aria-hidden className="text-3xl">
        ⚠️
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {body && <p className="max-w-xs text-xs text-ink-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/** Neutral placeholder block used to compose loading skeletons. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('block animate-pulse rounded-pill bg-sand-200', className)} />
  )
}

export interface SkeletonListProps {
  /** How many placeholder rows to draw. */
  rows?: number
  label: string
  className?: string
}

/**
 * Loading placeholder for a list of cards. Announced politely as busy so a
 * screen reader says "Loading…" instead of reading empty boxes.
 */
export function SkeletonList({ rows = 3, label, className }: SkeletonListProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={cn('space-y-3', className)}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="card flex items-center gap-3 px-4 py-4">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
