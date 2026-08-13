import { Button } from '@/components/ui/button'

export interface PointsStat {
  label: string
  value: string
}

export interface PointsCardProps {
  points: number
  stats: PointsStat[]
}

export function PointsCard({ points, stats }: PointsCardProps) {
  return (
    <section className="flex flex-col gap-5 rounded-t-sheet bg-surface px-5 pt-6 pb-6 shadow-card">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">Points Earned</h2>
          <p className="text-xs text-ink-muted">For this week</p>
        </div>
        <p className="text-sm font-medium text-ink-muted">
          <span className="text-2xl font-bold text-brand-500">
            {points.toLocaleString('en-US')}
          </span>{' '}
          Points
        </p>
      </header>

      <dl className="grid grid-cols-3 divide-x divide-sand-200 rounded-card border border-sand-200 py-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 px-2">
            <dt className="text-[11px] text-ink-muted">{stat.label}</dt>
            <dd className="text-sm font-bold text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <Button size="lg" className="w-full">
        Share Progress
      </Button>
    </section>
  )
}
