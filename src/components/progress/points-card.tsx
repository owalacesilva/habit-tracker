import type { ReactNode } from 'react'

export interface PointsStat {
  label: string
  value: string
}

export interface PointsCardProps {
  points: number
  stats: PointsStat[]
  labels: {
    title: string
    subtitle: string
    points: string
  }
  locale?: string
  /** Primary action, e.g. the share button. */
  action?: ReactNode
}

export function PointsCard({ points, stats, labels, locale = 'en', action }: PointsCardProps) {
  return (
    <section className="flex flex-col gap-5 rounded-sheet bg-surface px-5 py-6 shadow-card">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-ink">{labels.title}</h2>
          <p className="text-xs text-ink-muted">{labels.subtitle}</p>
        </div>
        <p className="shrink-0 text-sm font-medium text-ink-muted">
          <span className="text-2xl font-bold text-brand-500">{points.toLocaleString(locale)}</span>{' '}
          {labels.points}
        </p>
      </header>

      <dl className="grid grid-cols-3 divide-x divide-sand-200 rounded-card border border-sand-200 py-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 px-2 text-center">
            <dt className="text-[11px] text-ink-muted">{stat.label}</dt>
            <dd className="text-sm font-bold text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {action}
    </section>
  )
}
