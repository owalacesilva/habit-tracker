import type { Locale } from '@/lib/i18n/config'
import type { HabitAccent } from '@/types/habit'

/** How demanding a journey is, shown as a badge on the card. */
export type JourneyLevel = 'gentle' | 'steady' | 'bold'

export interface JourneyContent {
  title: string
  description: string
}

export interface Journey {
  id: string
  icon: string
  accent: HabitAccent
  level: JourneyLevel
  durationDays: number
  habitCount: number
  /** Habit tones this journey builds on — drives the recommendations. */
  focus: HabitAccent[]
  /** Journey copy is content, not UI chrome, so it travels with the record. */
  content: Record<Locale, JourneyContent>
}

export interface JourneyEnrollment {
  journeyId: string
  /** Local `yyyy-mm-dd` of the day the user started. */
  startedIso: string
}

export interface JourneyProgress {
  day: number
  total: number
  percentage: number
}

/** A journey resolved for one user in one language — what the UI renders. */
export interface JourneyView {
  id: string
  icon: string
  accent: HabitAccent
  level: JourneyLevel
  durationDays: number
  habitCount: number
  title: string
  description: string
  recommended: boolean
  progress: JourneyProgress | null
}
