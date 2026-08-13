import type { ReactNode } from 'react'

import {
  GeneralStatistics,
  type GeneralStatisticsLabels,
} from '@/components/history/general-statistics'
import {
  HabitStatisticsList,
  type HabitStatisticsListLabels,
  type HabitStatisticsRow,
} from '@/components/history/habit-statistics-list'
import { PointsCard, type PointsStat } from '@/components/progress/points-card'
import { ProgressChart } from '@/components/progress/progress-chart'
import { EmptyState } from '@/components/ui/states'
import type { GeneralStatistics as GeneralStatisticsData } from '@/lib/statistics'
import type { HabitProgress } from '@/types/habit'

export interface StatisticsPanelLabels extends GeneralStatisticsLabels {
  pointsEarned: string
  forThisWeek: string
  points: string
  chartLabel: string
  emptyTitle: string
  emptyBody: string
  breakdown: HabitStatisticsListLabels
}

export interface StatisticsPanelProps {
  general: GeneralStatisticsData
  habits: HabitStatisticsRow[]
  progress: HabitProgress[]
  points: number
  stats: PointsStat[]
  labels: StatisticsPanelLabels
  locale?: string
  /** Share action, supplied by the page so this panel stays presentational. */
  action?: ReactNode
}

export function StatisticsPanel({
  general,
  habits,
  progress,
  points,
  stats,
  labels,
  locale,
  action,
}: StatisticsPanelProps) {
  // Nothing was ever due in this period, so there is no rate to report and no
  // chart to draw — say so instead of showing a wall of zeros.
  if (general.scheduled === 0) {
    return <EmptyState icon="📊" title={labels.emptyTitle} body={labels.emptyBody} />
  }

  return (
    <div className="flex flex-col gap-6">
      <GeneralStatistics statistics={general} labels={labels} />

      {progress.length > 0 && <ProgressChart items={progress} labelTemplate={labels.chartLabel} />}

      <HabitStatisticsList rows={habits} labels={labels.breakdown} />

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
