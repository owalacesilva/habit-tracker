import { JourneyCard, type JourneyCardLabels } from '@/components/journey/journey-card'
import { EmptyState } from '@/components/ui/states'
import type { JourneyView } from '@/types/journey'

export interface JourneyListLabels extends JourneyCardLabels {
  recommendedTitle: string
  recommendedBody: string
  allTitle: string
  emptyTitle: string
  emptyBody: string
}

export interface JourneyListProps {
  journeys: JourneyView[]
  labels: JourneyListLabels
  action: (formData: FormData) => Promise<void>
}

/**
 * Two groups, visually distinct: the recommendations sit in their own labelled
 * section with outlined cards, everything else follows in a plain list.
 */
export function JourneyList({ journeys, labels, action }: JourneyListProps) {
  if (journeys.length === 0) {
    return <EmptyState icon="🧭" title={labels.emptyTitle} body={labels.emptyBody} />
  }

  const recommended = journeys.filter((journey) => journey.recommended)
  const rest = journeys.filter((journey) => !journey.recommended)

  return (
    <div className="flex flex-col gap-8">
      {recommended.length > 0 && (
        <section aria-labelledby="journey-recommended" className="flex flex-col gap-3">
          <div>
            <h2 id="journey-recommended" className="text-lg font-bold text-ink">
              {labels.recommendedTitle}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">{labels.recommendedBody}</p>
          </div>
          {recommended.map((journey) => (
            <JourneyCard
              key={journey.id}
              journey={journey}
              labels={labels}
              action={action}
              highlighted
            />
          ))}
        </section>
      )}

      {rest.length > 0 && (
        <section aria-labelledby="journey-all" className="flex flex-col gap-3">
          <h2 id="journey-all" className="text-lg font-bold text-ink">
            {labels.allTitle}
          </h2>
          {rest.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} labels={labels} action={action} />
          ))}
        </section>
      )}
    </div>
  )
}
