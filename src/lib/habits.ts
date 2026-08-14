import { toISODate, toWeekday } from '@/lib/date'
import type { ChartTone, Habit, HabitProgress, NewHabitInput, Weekday } from '@/types/habit'

/**
 * Habit domain logic — pure functions over habit arrays.
 *
 * Persistence lives behind `DataRepository` (see `src/lib/data`), so the same
 * rules apply whether the records came from IndexedDB, an external API or the
 * in-memory adapter.
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

/** Build a habit record from form input. Adapters persist what this returns. */
export function buildHabit(ownerId: string, input: NewHabitInput, now: Date = new Date()): Habit {
  return {
    id: `${now.getTime().toString(36)}-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    userId: ownerId,
    name: input.name,
    shortName: input.shortName ?? shortLabel(input.name),
    icon: input.icon ?? '⭐',
    accent: input.accent ?? 'walk',
    durationMinutes: input.durationMinutes ?? 10,
    repeatDays: input.repeatDays?.length ? input.repeatDays : ALL_DAYS,
    remindersEnabled: input.remindersEnabled ?? true,
    completedDates: [],
  }
}

/** Add or remove a completion, returning a new record — never mutating. */
export function toggleCompletionDate(
  habit: Habit,
  isoDate: string,
): { habit: Habit; completed: boolean } {
  const completed = !habit.completedDates.includes(isoDate)
  const completedDates = completed
    ? [...habit.completedDates, isoDate]
    : habit.completedDates.filter((entry) => entry !== isoDate)

  return { habit: { ...habit, completedDates }, completed }
}

/** Habits scheduled for the given day, in display order. */
export function habitsForDate(habits: Habit[], date: Date): Habit[] {
  const weekday = toWeekday(date)
  return habits.filter((habit) => habit.repeatDays.includes(weekday))
}

export function isCompletedOn(habit: Habit, date: Date): boolean {
  return habit.completedDates.includes(toISODate(date))
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
export function weeklyProgress(habits: Habit[], weekDates: Date[]): HabitProgress[] {
  return habits.slice(0, 4).map((habit, index) => ({
    label: habit.shortName,
    percentage: weeklyCompletion(habit, weekDates),
    tone: CHART_TONES[index % CHART_TONES.length],
  }))
}
