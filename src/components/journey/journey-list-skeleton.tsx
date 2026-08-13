import { Skeleton, SkeletonText, SkeletonTile } from '@/components/ui/skeleton'
import { SkeletonRegion } from '@/components/ui/states'

/** One card: tile, title, two description lines, meta chips and the CTA. */
function JourneyCardSkeleton() {
  return (
    <article className="card flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <SkeletonTile size={48} />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonText width="55%" height={13} />
          <SkeletonText width="100%" height={10} />
          <SkeletonText width="78%" height={10} />
        </div>
      </div>

      <div className="flex gap-1.5">
        <Skeleton width={64} height={26} />
        <Skeleton width={72} height={26} />
        <Skeleton width={58} height={26} />
      </div>

      <Skeleton height={36} />
    </article>
  )
}

export interface JourneyListSkeletonProps {
  label: string
}

/**
 * Mirrors the Journey screen: a recommended section with two outlined cards,
 * then the rest of the catalogue — so the sections do not appear from nowhere.
 */
export function JourneyListSkeleton({ label }: JourneyListSkeletonProps) {
  return (
    <SkeletonRegion label={label} className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="space-y-1.5">
          <SkeletonText width="52%" height={16} />
          <SkeletonText width="70%" height={10} />
        </div>
        <JourneyCardSkeleton />
        <JourneyCardSkeleton />
      </section>

      <section className="flex flex-col gap-3">
        <SkeletonText width="38%" height={16} />
        <JourneyCardSkeleton />
        <JourneyCardSkeleton />
      </section>
    </SkeletonRegion>
  )
}
