import { toISODate } from '@/lib/date'
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config'
import type { Habit } from '@/types/habit'
import type {
  Journey,
  JourneyContent,
  JourneyEnrollment,
  JourneyProgress,
  JourneyView,
} from '@/types/journey'

/**
 * Journey catalogue.
 *
 * Async on purpose: journeys are editorial content that will come from a CMS or
 * database, and the screen already renders the Suspense/loading path for it.
 */
const CATALOGUE: Journey[] = [
  {
    id: 'hydration-reset',
    icon: '💧',
    accent: 'water',
    level: 'gentle',
    durationDays: 14,
    habitCount: 3,
    focus: ['water'],
    content: {
      en: {
        title: 'Hydration Reset',
        description: 'Two weeks to make drinking water automatic, one glass at a time.',
      },
      'pt-BR': {
        title: 'Reset da hidratação',
        description: 'Duas semanas para beber água virar automático, um copo por vez.',
      },
      es: {
        title: 'Reinicio de hidratación',
        description: 'Dos semanas para que beber agua sea automático, vaso a vaso.',
      },
    },
  },
  {
    id: 'morning-momentum',
    icon: '🌅',
    accent: 'walk',
    level: 'steady',
    durationDays: 21,
    habitCount: 4,
    focus: ['walk', 'stretch'],
    content: {
      en: {
        title: 'Morning Momentum',
        description: 'Wake up into a routine that carries you through the day.',
      },
      'pt-BR': {
        title: 'Impulso da manhã',
        description: 'Acorde dentro de uma rotina que sustenta o resto do dia.',
      },
      es: {
        title: 'Impulso matutino',
        description: 'Despierta con una rutina que te sostiene todo el día.',
      },
    },
  },
  {
    id: 'mindful-evenings',
    icon: '🌙',
    accent: 'meditate',
    level: 'gentle',
    durationDays: 10,
    habitCount: 2,
    focus: ['meditate'],
    content: {
      en: {
        title: 'Mindful Evenings',
        description: 'Wind down with short practices that make sleep easier.',
      },
      'pt-BR': {
        title: 'Noites tranquilas',
        description: 'Desacelere com práticas curtas que facilitam o sono.',
      },
      es: {
        title: 'Noches conscientes',
        description: 'Baja el ritmo con prácticas cortas que facilitan el sueño.',
      },
    },
  },
  {
    id: 'movement-basics',
    icon: '🤸',
    accent: 'stretch',
    level: 'steady',
    durationDays: 28,
    habitCount: 5,
    focus: ['stretch', 'walk'],
    content: {
      en: {
        title: 'Movement Basics',
        description: 'Four weeks of gentle mobility to undo the desk.',
      },
      'pt-BR': {
        title: 'Movimento essencial',
        description: 'Quatro semanas de mobilidade leve para desfazer a cadeira.',
      },
      es: {
        title: 'Movimiento esencial',
        description: 'Cuatro semanas de movilidad suave para deshacer el escritorio.',
      },
    },
  },
  {
    id: 'deep-focus',
    icon: '🎯',
    accent: 'meditate',
    level: 'bold',
    durationDays: 30,
    habitCount: 6,
    focus: ['meditate'],
    content: {
      en: {
        title: 'Deep Focus',
        description: 'A demanding month to rebuild attention and finish what you start.',
      },
      'pt-BR': {
        title: 'Foco profundo',
        description: 'Um mês exigente para reconstruir a atenção e terminar o que começa.',
      },
      es: {
        title: 'Foco profundo',
        description: 'Un mes exigente para recuperar la atención y terminar lo que empiezas.',
      },
    },
  },
]

/** Simulates the async boundary a CMS or database would introduce. */
export async function listJourneys(): Promise<Journey[]> {
  return CATALOGUE.map((journey) => ({ ...journey }))
}

export function getJourney(id: string): Journey | null {
  return CATALOGUE.find((journey) => journey.id === id) ?? null
}

/** Falls back to the default language when a translation is missing. */
export function journeyContent(journey: Journey, locale: Locale): JourneyContent {
  return journey.content[locale] ?? journey.content[DEFAULT_LOCALE]
}

/**
 * Recommend journeys that build on tones the user already keeps, so the
 * "Recommended for you" section is grounded in real behaviour. Falls back to
 * the shortest journeys for a user with no habits yet.
 */
export function recommendJourneys(journeys: Journey[], habits: Habit[], limit = 2): Journey[] {
  const tones = new Set(habits.map((habit) => habit.accent))

  const scored = journeys
    .map((journey) => ({
      journey,
      score: journey.focus.filter((tone) => tones.has(tone)).length,
    }))
    .sort((a, b) => b.score - a.score || a.journey.durationDays - b.journey.durationDays)

  return scored.slice(0, limit).map((entry) => entry.journey)
}

const enrollments = new Map<string, JourneyEnrollment[]>()

export function listEnrollments(userId: string): JourneyEnrollment[] {
  return (enrollments.get(userId) ?? []).map((entry) => ({ ...entry }))
}

/** Starting an already-started journey keeps the original start date. */
export function startJourney(
  userId: string,
  journeyId: string,
  today: Date = new Date(),
): JourneyEnrollment {
  const current = enrollments.get(userId) ?? []
  const existing = current.find((entry) => entry.journeyId === journeyId)
  if (existing) return { ...existing }

  const enrollment: JourneyEnrollment = { journeyId, startedIso: toISODate(today) }
  enrollments.set(userId, [...current, enrollment])
  return { ...enrollment }
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Day 1 is the start date itself; progress never exceeds the journey length. */
export function journeyProgress(
  enrollment: JourneyEnrollment,
  durationDays: number,
  today: Date = new Date(),
): JourneyProgress {
  const [year, month, day] = enrollment.startedIso.split('-').map(Number)
  const start = new Date(year, month - 1, day).getTime()
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  const elapsed = Math.floor((now - start) / DAY_MS) + 1
  const current = Math.min(Math.max(elapsed, 1), durationDays)

  return {
    day: current,
    total: durationDays,
    percentage: Math.round((current / durationDays) * 100),
  }
}

/** Shape the catalogue for one user in one language. */
export function toJourneyViews(
  journeys: Journey[],
  {
    locale,
    recommendedIds,
    enrollments: userEnrollments,
    today = new Date(),
  }: {
    locale: Locale
    recommendedIds: string[]
    enrollments: JourneyEnrollment[]
    today?: Date
  },
): JourneyView[] {
  const recommended = new Set(recommendedIds)

  return journeys.map((journey) => {
    const content = journeyContent(journey, locale)
    const enrollment = userEnrollments.find((entry) => entry.journeyId === journey.id)

    return {
      id: journey.id,
      icon: journey.icon,
      accent: journey.accent,
      level: journey.level,
      durationDays: journey.durationDays,
      habitCount: journey.habitCount,
      title: content.title,
      description: content.description,
      recommended: recommended.has(journey.id),
      progress: enrollment ? journeyProgress(enrollment, journey.durationDays, today) : null,
    }
  })
}

/** Reset helper for tests — never called by the app itself. */
export function __resetJourneyStore() {
  enrollments.clear()
}
