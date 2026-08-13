import { JourneyListSkeleton } from '@/components/journey/journey-list-skeleton'
import { SkeletonText } from '@/components/ui/skeleton'
import { getI18n } from '@/lib/server-settings'

/** Route-level placeholder: mirrors the Journey layout while it streams in. */
export default async function JourneyLoading() {
  const { t } = await getI18n()

  return (
    <main className="app-shell app-shell-nav gap-6 px-5 pt-8">
      <div className="space-y-2">
        <SkeletonText width="45%" height={30} />
        <SkeletonText width="72%" height={11} />
      </div>
      <JourneyListSkeleton label={t.common.loading} />
    </main>
  )
}
