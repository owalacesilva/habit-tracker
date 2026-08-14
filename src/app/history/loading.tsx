import { StatisticsSkeleton } from '@/components/history/statistics-skeleton'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { getI18n } from '@/lib/server-settings'

/** Route-level placeholder: header, tab strip, filter row and the panel. */
export default async function HistoryLoading() {
  const { t } = await getI18n()

  return (
    <main className="app-shell app-shell-nav gap-5 px-5 pt-8">
      <div className="space-y-2">
        <SkeletonText width="38%" height={30} />
        <SkeletonText width="66%" height={11} />
      </div>

      <Skeleton height={48} />

      <div className="flex gap-2">
        <Skeleton width={92} height={36} />
        <Skeleton width={92} height={36} />
        <Skeleton width={108} height={36} />
      </div>

      <StatisticsSkeleton label={t.common.loading} />
    </main>
  )
}
