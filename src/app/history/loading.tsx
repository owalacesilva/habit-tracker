import { Skeleton, SkeletonList } from '@/components/ui/states'

/** Route-level placeholder: header, tab strip and list, in the final layout. */
export default function HistoryLoading() {
  return (
    <main className="app-shell app-shell-nav gap-5 px-5 pt-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36 rounded-card" />
        <Skeleton className="h-3 w-52" />
      </div>
      <Skeleton className="h-12 w-full rounded-pill" />
      <SkeletonList rows={3} label="Loading" />
    </main>
  )
}
