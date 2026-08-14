import type { Metadata } from 'next'
import { JourneyCatalogue } from '@/components/journey/journey-catalogue'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ScreenHeader } from '@/components/layout/screen-header'
import { listJourneys } from '@/lib/journeys'
import { getI18n, getScreenSettings } from '@/lib/server-settings'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.journey.title }
}

export const dynamic = 'force-dynamic'

export default async function JourneyPage() {
  const [{ locale, t }, journeys] = await Promise.all([getScreenSettings(), listJourneys()])

  return (
    <>
      <main className="app-shell app-shell-nav gap-6 px-5 pt-8">
        <ScreenHeader title={t.journey.title} subtitle={t.journey.subtitle} />

        {/* The catalogue is editorial content; enrolment is user data, so the
            recommendations are computed client-side from the stored habits. */}
        <JourneyCatalogue
          journeys={journeys}
          locale={locale}
          labels={{
            recommendedTitle: t.journey.recommendedTitle,
            recommendedBody: t.journey.recommendedBody,
            recommendedBadge: t.journey.recommendedBadge,
            allTitle: t.journey.allTitle,
            durationDays: t.journey.durationDays,
            habitCount: t.journey.habitCount,
            levelGentle: t.journey.levelGentle,
            levelSteady: t.journey.levelSteady,
            levelBold: t.journey.levelBold,
            start: t.journey.start,
            continue: t.journey.continue,
            inProgress: t.journey.inProgress,
            progress: t.journey.progress,
            emptyTitle: t.journey.emptyTitle,
            emptyBody: t.journey.emptyBody,
            loading: t.common.loading,
            errorTitle: t.common.errorTitle,
            errorBody: t.common.errorBody,
            retry: t.common.retry,
          }}
        />
      </main>

      <BottomNav labels={t.nav} />
    </>
  )
}
