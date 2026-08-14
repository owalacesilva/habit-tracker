'use client'

import { JourneyList, type JourneyListLabels } from '@/components/journey/journey-list'
import { JourneyListSkeleton } from '@/components/journey/journey-list-skeleton'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/states'
import { useData } from '@/lib/data/provider'
import { toISODate } from '@/lib/date'
import type { Locale } from '@/lib/i18n/config'
import { recommendJourneys, toJourneyViews } from '@/lib/journeys'
import type { Journey } from '@/types/journey'

export interface JourneyCatalogueLabels extends JourneyListLabels {
  loading: string
  errorTitle: string
  errorBody: string
  retry: string
}

export interface JourneyCatalogueProps {
  /** Editorial content, rendered on the server and passed down. */
  journeys: Journey[]
  locale: Locale
  labels: JourneyCatalogueLabels
}

/** Static catalogue plus the enrolment state, which is user data. */
export function JourneyCatalogue({ journeys, locale, labels }: JourneyCatalogueProps) {
  // Recommendations read the user's habits, which now live in the browser.
  const { habits, enrollments, status, error, reload, startJourney } = useData()

  if (status === 'loading') return <JourneyListSkeleton label={labels.loading} />

  if (status === 'error') {
    return (
      <ErrorState
        title={labels.errorTitle}
        body={error?.message ?? labels.errorBody}
        action={
          <Button size="sm" onClick={reload}>
            {labels.retry}
          </Button>
        }
      />
    )
  }

  const views = toJourneyViews(journeys, {
    locale,
    recommendedIds: recommendJourneys(journeys, habits).map((journey) => journey.id),
    enrollments,
  })

  return (
    <JourneyList
      journeys={views}
      labels={labels}
      onStart={(journeyId) => startJourney(journeyId, toISODate(new Date()))}
    />
  )
}
