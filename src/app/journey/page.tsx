import type { Metadata } from 'next'
import { Suspense } from 'react'

import { startJourneyAction } from '@/app/journey/actions'
import { requireUser } from '@/auth'
import { JourneyList, type JourneyListLabels } from '@/components/journey/journey-list'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ScreenHeader } from '@/components/layout/screen-header'
import { SkeletonList } from '@/components/ui/states'
import type { Dictionary } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n/config'
import { listHabits } from '@/lib/habits'
import { listEnrollments, listJourneys, recommendJourneys, toJourneyViews } from '@/lib/journeys'
import { getI18n, getScreenSettings } from '@/lib/server-settings'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.journey.title }
}
export const dynamic = 'force-dynamic'

function listLabels(t: Dictionary): JourneyListLabels {
  return {
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
  }
}

/** Streams in behind the header, so the screen paints before the catalogue does. */
async function JourneyCatalogue({ locale, t }: { locale: Locale; t: Dictionary }) {
  const user = await requireUser()
  const journeys = await listJourneys()
  const habits = listHabits(user.id)

  const views = toJourneyViews(journeys, {
    locale,
    recommendedIds: recommendJourneys(journeys, habits).map((journey) => journey.id),
    enrollments: listEnrollments(user.id),
  })

  return <JourneyList journeys={views} labels={listLabels(t)} action={startJourneyAction} />
}

export default async function JourneyPage() {
  const { locale, t } = await getScreenSettings()

  return (
    <>
      <main className="app-shell app-shell-nav gap-6 px-5 pt-8">
        <ScreenHeader title={t.journey.title} subtitle={t.journey.subtitle} />

        <Suspense fallback={<SkeletonList rows={3} label={t.common.loading} />}>
          <JourneyCatalogue locale={locale} t={t} />
        </Suspense>
      </main>

      <BottomNav labels={t.nav} />
    </>
  )
}
