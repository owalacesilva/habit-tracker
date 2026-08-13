import { Skeleton, SkeletonList } from '@/components/ui/states'

/** Route-level placeholder: mirrors the Journey layout while it streams in. */
export default function JourneyLoading() {
  return (
    <main className="app-shell app-shell-nav gap-6 px-5 pt-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40 rounded-card" />
        <Skeleton className="h-3 w-56" />
      </div>
      <SkeletonList rows={3} label="Loading" />
    </main>
  )
}
