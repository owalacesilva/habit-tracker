import type { ReactNode } from 'react'

import { PointsCard, type PointsStat } from '@/components/progress/points-card'
import { ProgressChart } from '@/components/progress/progress-chart'
import { EmptyState } from '@/components/ui/states'
import type { HabitProgress } from '@/types/habit'

export interface StatisticsPanelLabels {
  pointsEarned: string
  forThisWeek: string
  points: string
  chartLabel: string
  emptyTitle: string
  emptyBody: string
}

export interface StatisticsPanelProps {
  progress: HabitProgress[]
  points: number
  stats: PointsStat[]
  labels: StatisticsPanelLabels
  locale?: string
  /** Share action, supplied by the page so this panel stays presentational. */
  action?: ReactNode
}

export function StatisticsPanel({
  progress,
  points,
  stats,
  labels,
  locale,
  action,
}: StatisticsPanelProps) {
  if (progress.length === 0) {
    return <EmptyState icon="📊" title={labels.emptyTitle} body={labels.emptyBody} />
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressChart items={progress} labelTemplate={labels.chartLabel} />
      <PointsCard
        points={points}
        stats={stats}
        locale={locale}
        action={action}
        labels={{
          title: labels.pointsEarned,
          subtitle: labels.forThisWeek,
          points: labels.points,
        }}
      />
    </div>
  )
}
