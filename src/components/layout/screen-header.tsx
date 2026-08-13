import type { ReactNode } from 'react'

export interface ScreenHeaderProps {
  title: string
  subtitle?: string
  /** Optional action rendered on the trailing edge (avatar, icon button…). */
  trailing?: ReactNode
}

/** Shared page header so every primary screen starts the same way. */
export function ScreenHeader({ title, subtitle, trailing }: ScreenHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-balance font-bold text-3xl text-ink leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-muted text-xs">{subtitle}</p>}
      </div>
      {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
    </header>
  )
}
