'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireUser } from '@/auth'
import { getJourney, startJourney } from '@/lib/journeys'

const startSchema = z.object({ journeyId: z.string().min(1) })

/** Enrol the current user; already-started journeys keep their start date. */
export async function startJourneyAction(formData: FormData) {
  const user = await requireUser()
  const parsed = startSchema.safeParse({ journeyId: formData.get('journeyId') })

  if (!parsed.success || !getJourney(parsed.data.journeyId)) {
    throw new Error('Unknown journey')
  }

  startJourney(user.id, parsed.data.journeyId)
  revalidatePath('/journey')
}
