import { toISODate, toWeekday } from '@/lib/date'
import { currentPersona, personaHabits } from '@/lib/mocks/personas'
import type { ChartTone, Habit, HabitProgress, NewHabitInput, Weekday } from '@/types/habit'

/**
 * In-memory habit store.
 *
 * This is deliberately the only place that knows how habits are persisted, so
 * swapping it for a database (Prisma/Drizzle + Postgres) is a single-file
 * change. Data resets whenever the server restarts.
 */

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]

// Filler words that never make a good chart label.
const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'go',
  'for',
  'to',
  'of',
  'do',
  'my',
  'get',
  'short',
  'long',
  'quick',
  'little',
  'big',
])

/**
 * Best-effort one-word label, e.g. "Go for a short walk" → "Walk".
 * Seeded habits carry an explicit `shortName`; this is the fallback for
 * habits created from the form.
 */
export function shortLabel(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const word =
    words.find((candidate) => {
      const normalised = candidate.toLowerCase()
      return !STOP_WORDS.has(normalised) && !/^\d+$/.test(normalised)
    }) ??
    words[0] ??
    ''
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/**
 * Starting data for a user. The persona is fixture data for manual testing —
 * see `src/lib/mocks/personas.ts`; it defaults to the original demo routine.
 */
function seed(userId: string): Habit[] {
  return personaHabits(currentPersona(), userId)
}

const store = new Map<string, Habit[]>()

function habitsFor(userId: string): Habit[] {
  let habits = store.get(userId)
  if (!habits) {
    habits = seed(userId)
    store.set(userId, habits)
  }
  return habits
}

export function listHabits(userId: string): Habit[] {
  return habitsFor(userId).map((habit) => ({ ...habit }))
}

/** Habits scheduled for the given day, in display order. */
export function listHabitsForDate(userId: string, date: Date): Habit[] {
  const weekday = toWeekday(date)
  return listHabits(userId).filter((habit) => habit.repeatDays.includes(weekday))
}

export function isCompletedOn(habit: Habit, date: Date): boolean {
  return habit.completedDates.includes(toISODate(date))
}

/** Toggle a day on/off and return the resulting completion state. */
export function toggleCompletion(userId: string, habitId: string, date: Date): boolean {
  const habit = habitsFor(userId).find((candidate) => candidate.id === habitId)
  if (!habit) throw new Error(`Unknown habit: ${habitId}`)

  const iso = toISODate(date)
  const index = habit.completedDates.indexOf(iso)
  if (index >= 0) {
    habit.completedDates.splice(index, 1)
    return false
  }
  habit.completedDates.push(iso)
  return true
}

export function createHabit(userId: string, input: NewHabitInput): Habit {
  const habit: Habit = {
    id: `${Date.now().toString(36)}-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    userId,
    name: input.name,
    shortName: input.shortName ?? shortLabel(input.name),
    icon: input.icon ?? '⭐',
    accent: input.accent ?? 'walk',
    durationMinutes: input.durationMinutes ?? 10,
    repeatDays: input.repeatDays?.length ? input.repeatDays : ALL_DAYS,
    remindersEnabled: input.remindersEnabled ?? true,
    completedDates: [],
  }
  habitsFor(userId).push(habit)
  return habit
}

/**
 * Consecutive completed days ending today (or yesterday — a habit still counts
 * as a live streak until the current day is over).
 */
export function currentStreak(habit: Habit, reference: Date = new Date()): number {
  const done = new Set(habit.completedDates)
  const cursor = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate())

  if (!done.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!done.has(toISODate(cursor))) return 0
  }

  let streak = 0
  while (done.has(toISODate(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Share of the week's scheduled days that were completed, 0–100. */
export function weeklyCompletion(habit: Habit, weekDates: Date[]): number {
  const scheduled = weekDates.filter((date) => habit.repeatDays.includes(toWeekday(date)))
  if (scheduled.length === 0) return 0
  const completed = scheduled.filter((date) => isCompletedOn(habit, date)).length
  return Math.round((completed / scheduled.length) * 100)
}

const CHART_TONES: ChartTone[] = ['walking', 'running', 'meditation', 'drink']

/** Top four habits of the week, shaped for the progress chart. */
export function weeklyProgress(userId: string, weekDates: Date[]): HabitProgress[] {
  return listHabits(userId)
    .slice(0, 4)
    .map((habit, index) => ({
      label: habit.shortName,
      percentage: weeklyCompletion(habit, weekDates),
      tone: CHART_TONES[index % CHART_TONES.length],
    }))
}

/** Reset helper for tests — never called by the app itself. */
export function __resetStore() {
  store.clear()
}
