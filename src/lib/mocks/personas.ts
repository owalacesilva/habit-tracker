import { toISODate, toWeekday } from '@/lib/date'
import type { Habit, Weekday } from '@/types/habit'

/**
 * Fixture data for manual testing.
 *
 * Every screen behaves differently depending on how much history exists, and
 * an empty account is the easiest state to forget. Pick a persona with the
 * `MOCK_PERSONA` environment variable — `MOCK_PERSONA=power make dev` — and the
 * demo user is seeded with that history instead of the default one.
 *
 * The generator is seeded, so a persona always produces the same data: a bug
 * found while testing can be reproduced exactly.
 */
export const PERSONAS = ['demo', 'empty', 'starter', 'regular', 'power'] as const

export type Persona = (typeof PERSONAS)[number]

export const DEFAULT_PERSONA: Persona = 'demo'
export const PERSONA_ENV = 'MOCK_PERSONA'

export function isPersona(value: unknown): value is Persona {
  return typeof value === 'string' && (PERSONAS as readonly string[]).includes(value)
}

export function parsePersona(value: string | undefined | null): Persona {
  return isPersona(value) ? value : DEFAULT_PERSONA
}

/** Persona selected for this process. */
export function currentPersona(env: Record<string, string | undefined> = process.env): Persona {
  return parsePersona(env[PERSONA_ENV])
}

/** Deterministic 0–1 generator (mulberry32) so a persona is reproducible. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]

interface HabitBlueprint {
  id: string
  name: string
  shortName: string
  icon: string
  accent: Habit['accent']
  durationMinutes: number
  repeatDays: Weekday[]
}

const BLUEPRINTS: HabitBlueprint[] = [
  {
    id: 'water',
    name: 'Drink a glass of water',
    shortName: 'Water',
    icon: '🥤',
    accent: 'water',
    durationMinutes: 5,
    repeatDays: ALL_DAYS,
  },
  {
    id: 'meditate',
    name: 'Meditate to relax',
    shortName: 'Meditate',
    icon: '🧘',
    accent: 'meditate',
    durationMinutes: 15,
    repeatDays: ALL_DAYS,
  },
  {
    id: 'stretch',
    name: 'Stretch for 10 minutes',
    shortName: 'Stretch',
    icon: '🤸',
    accent: 'stretch',
    durationMinutes: 10,
    repeatDays: [0, 1, 2, 3, 4],
  },
  {
    id: 'walk',
    name: 'Go for a short walk',
    shortName: 'Walk',
    icon: '🚶',
    accent: 'walk',
    durationMinutes: 20,
    repeatDays: ALL_DAYS,
  },
  {
    id: 'journal',
    name: 'Write down 3 wins',
    shortName: 'Journal',
    icon: '📓',
    accent: 'meditate',
    durationMinutes: 5,
    repeatDays: [0, 2, 4],
  },
  {
    id: 'read',
    name: 'Read ten pages',
    shortName: 'Read',
    icon: '📚',
    accent: 'stretch',
    durationMinutes: 20,
    repeatDays: ALL_DAYS,
  },
]

interface PersonaShape {
  /** How many blueprints to use. */
  habits: number
  /** Days of history to generate. */
  history: number
  /** Chance a scheduled day was completed, 0–1. */
  adherence: number
  /** Days at the end that are always completed, to guarantee a streak. */
  streak: number
}

const SHAPES: Record<Exclude<Persona, 'demo' | 'empty'>, PersonaShape> = {
  starter: { habits: 2, history: 5, adherence: 0.5, streak: 1 },
  regular: { habits: 4, history: 35, adherence: 0.7, streak: 4 },
  power: { habits: 6, history: 84, adherence: 0.92, streak: 21 },
}

function buildHistory(
  blueprint: HabitBlueprint,
  shape: PersonaShape,
  today: Date,
  random: () => number,
): string[] {
  const completed: string[] = []

  for (let offset = shape.history - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    if (!blueprint.repeatDays.includes(toWeekday(date))) continue

    // The last `streak` days are always done, so the streak is predictable.
    const guaranteed = offset < shape.streak
    if (guaranteed || random() < shape.adherence) completed.push(toISODate(date))
  }

  return completed
}

/** The habits (and history) a persona starts with. */
export function personaHabits(persona: Persona, userId: string, today: Date = new Date()): Habit[] {
  if (persona === 'empty') return []

  if (persona === 'demo') {
    // The original hand-written seed: a routine mid-way through today.
    const iso = toISODate(today)
    return BLUEPRINTS.slice(0, 5).map((blueprint, index) => ({
      ...blueprint,
      userId,
      remindersEnabled: index < 2,
      completedDates: index < 2 ? [iso] : [],
    }))
  }

  const shape = SHAPES[persona]
  const random = seededRandom(persona.length * 7919)

  return BLUEPRINTS.slice(0, shape.habits).map((blueprint) => ({
    ...blueprint,
    userId,
    remindersEnabled: true,
    completedDates: buildHistory(blueprint, shape, today, random),
  }))
}
