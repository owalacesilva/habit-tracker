import { Skeleton, SkeletonText, SkeletonTile } from '@/components/ui/skeleton'
import { SkeletonRegion } from '@/components/ui/states'

export interface HabitListSkeletonProps {
  rows?: number
  label: string
}

/**
 * Mirrors `HabitList`: the dotted timeline, the check circle and a card with an
 * icon tile, name, streak and duration chip. Same geometry as the real rows, so
 * nothing shifts when the data arrives.
 */
export function HabitListSkeleton({ rows = 4, label }: HabitListSkeletonProps) {
  return (
    <SkeletonRegion label={label}>
      <ol className="relative space-y-3">
        <span
          aria-hidden="true"
          className="absolute top-6 bottom-6 left-[11px] border-sand-300 border-l border-dashed"
        />
        {Array.from({ length: rows }, (_, index) => index).map((index) => (
          <li key={index} className="relative flex items-center gap-3">
            <span className="relative z-10">
              <Skeleton width={24} height={24} borderRadius="9999px" />
            </span>

            <div className="card flex flex-1 items-center gap-3 px-3 py-3">
              <SkeletonTile />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonText width="62%" height={13} />
                <SkeletonText width="34%" height={10} />
              </div>
              <Skeleton width={62} height={28} />
            </div>
          </li>
        ))}
      </ol>
    </SkeletonRegion>
  )
}
