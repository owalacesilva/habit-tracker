import { startOfWeek, toISODate, toWeekday } from '@/lib/date'
import { currentStreak } from '@/lib/habits'
import type { Habit, Weekday } from '@/types/habit'

/**
 * Statistics are always computed over an explicit list of days, so the same
 * functions serve the week filter, a month, or all time without special cases.
 */
export const STATISTICS_PERIODS = ['this-week', 'last-week', 'last-4-weeks', 'all-time'] as const

export type StatisticsPeriod = (typeof STATISTICS_PERIODS)[number]

export const DEFAULT_PERIOD: StatisticsPeriod = 'this-week'

export function parseStatisticsPeriod(value: string | undefined | null): StatisticsPeriod {
  return STATISTICS_PERIODS.find((period) => period === value) ?? DEFAULT_PERIOD
}

/** Inclusive list of days between two dates, oldest first. */
export function eachDay(from: Date, to: Date): Date[] {
  const days: Date[] = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const last = new Date(to.getFullYear(), to.getMonth(), to.getDate())

  while (cursor <= last) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

/** Oldest completion on record, used as the start of "all time". */
export function firstCompletionDate(habits: Habit[]): Date | null {
  const isoDates = habits.flatMap((habit) => habit.completedDates).sort()
  if (isoDates.length === 0) return null

  const [year, month, day] = isoDates[0].split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Days covered by each filter choice, oldest first.
 *
 * A period never runs past today: counting days that have not happened yet as
 * "due" would report a completion rate that drops every morning.
 */
export function resolvePeriod(
  period: StatisticsPeriod,
  habits: Habit[],
  today: Date = new Date(),
  weekStartsOn: Weekday = 0,
): Date[] {
  const weekStart = startOfWeek(today, weekStartsOn)
  const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  switch (period) {
    case 'last-week': {
      const from = new Date(weekStart)
      from.setDate(from.getDate() - 7)
      const to = new Date(weekStart)
      to.setDate(to.getDate() - 1)
      return eachDay(from, to)
    }
    case 'last-4-weeks': {
      const from = new Date(weekStart)
      from.setDate(from.getDate() - 21)
      return eachDay(from, endOfWeek)
    }
    case 'all-time': {
      const first = firstCompletionDate(habits)
      return eachDay(first ?? weekStart, endOfWeek)
    }
    default:
      return eachDay(weekStart, endOfWeek)
  }
}

function isScheduled(habit: Habit, date: Date): boolean {
  return habit.repeatDays.includes(toWeekday(date))
}

function isDone(habit: Habit, date: Date): boolean {
  return habit.completedDates.includes(toISODate(date))
}

export interface HabitStatistics {
  habitId: string
  name: string
  /** Consecutive days up to today — independent of the selected period. */
  currentStreak: number
  /** Completions inside the period. */
  completed: number
  /** Days the habit was due inside the period. */
  scheduled: number
  /** `completed / scheduled`, 0–100. */
  completionRate: number
  /** Minutes invested inside the period. */
  minutes: number
}

export function habitStatistics(
  habit: Habit,
  days: Date[],
  today: Date = new Date(),
): HabitStatistics {
  const scheduledDays = days.filter((day) => isScheduled(habit, day))
  const completed = scheduledDays.filter((day) => isDone(habit, day)).length

  return {
    habitId: habit.id,
    name: habit.name,
    currentStreak: currentStreak(habit, today),
    completed,
    scheduled: scheduledDays.length,
    completionRate:
      scheduledDays.length === 0 ? 0 : Math.round((completed / scheduledDays.length) * 100),
    minutes: completed * habit.durationMinutes,
  }
}

/** Days inside the period where every scheduled habit was completed. */
export function countPerfectDays(habits: Habit[], days: Date[]): number {
  if (habits.length === 0) return 0

  return days.filter((day) => {
    const due = habits.filter((habit) => isScheduled(habit, day))
    return due.length > 0 && due.every((habit) => isDone(habit, day))
  }).length
}

/**
 * Consecutive days ending today — or yesterday, since today is still in
 * progress — on which at least one habit was completed.
 */
export function overallStreak(habits: Habit[], today: Date = new Date()): number {
  if (habits.length === 0) return 0

  const done = new Set(habits.flatMap((habit) => habit.completedDates))
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())

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

export interface GeneralStatistics {
  currentStreak: number
  completed: number
  scheduled: number
  completionRate: number
  perfectDays: number
  activeHabits: number
  minutes: number
  days: number
}

/** The headline numbers for the selected period. */
export function generalStatistics(
  habits: Habit[],
  days: Date[],
  today: Date = new Date(),
): GeneralStatistics {
  const perHabit = habits.map((habit) => habitStatistics(habit, days, today))

  const completed = perHabit.reduce((total, entry) => total + entry.completed, 0)
  const scheduled = perHabit.reduce((total, entry) => total + entry.scheduled, 0)

  return {
    currentStreak: overallStreak(habits, today),
    completed,
    scheduled,
    completionRate: scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100),
    perfectDays: countPerfectDays(habits, days),
    activeHabits: habits.length,
    minutes: perHabit.reduce((total, entry) => total + entry.minutes, 0),
    days: days.length,
  }
}
