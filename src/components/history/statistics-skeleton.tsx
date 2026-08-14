import { Skeleton, SkeletonText, SkeletonTile } from '@/components/ui/skeleton'
import { SkeletonRegion } from '@/components/ui/states'

/** Bar heights that read as a chart rather than a fence. */
const BAR_HEIGHTS = ['58%', '86%', '38%', '70%']

function StatTileSkeleton() {
  return (
    <div className="card flex flex-col gap-2 px-4 py-3.5">
      <SkeletonText width="62%" height={10} />
      <SkeletonText width="40%" height={24} />
      <SkeletonText width="72%" height={10} />
    </div>
  )
}

function BreakdownRowSkeleton() {
  return (
    <li className="card flex items-center gap-3 px-4 py-3">
      <SkeletonTile size={36} />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonText width="58%" height={12} />
        <Skeleton height={6} />
        <SkeletonText width="44%" height={10} />
      </div>
    </li>
  )
}

export interface StatisticsSkeletonProps {
  label: string
}

/**
 * Mirrors the Statistics tab: the four headline tiles, the column chart and the
 * per-habit breakdown. The chart columns use different heights so the
 * placeholder reads as a chart while it loads.
 */
export function StatisticsSkeleton({ label }: StatisticsSkeletonProps) {
  return (
    <SkeletonRegion label={label} className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>

      <div className="flex h-56 items-end justify-between gap-3">
        {BAR_HEIGHTS.map((height) => (
          <div key={height} className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-full w-full items-end">
              <Skeleton height={height} width="100%" />
            </div>
            <SkeletonText width="70%" height={10} />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <SkeletonText width="30%" height={13} />
        <ul className="flex flex-col gap-2">
          <BreakdownRowSkeleton />
          <BreakdownRowSkeleton />
          <BreakdownRowSkeleton />
        </ul>
      </div>
    </SkeletonRegion>
  )
}
