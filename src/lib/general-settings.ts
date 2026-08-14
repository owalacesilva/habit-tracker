import type { Weekday } from '@/types/habit'

/**
 * Device-level preferences that must be known before the first paint, so they
 * live in cookies next to the theme rather than in the per-user store.
 */
export const WEEK_STARTS = ['monday', 'sunday'] as const
export type WeekStart = (typeof WEEK_STARTS)[number]

export const WEEK_START_COOKIE = 'habit_week_start'
export const REDUCE_MOTION_COOKIE = 'habit_reduce_motion'

export const DEFAULT_WEEK_START: WeekStart = 'monday'

export function isWeekStart(value: unknown): value is WeekStart {
  return typeof value === 'string' && (WEEK_STARTS as readonly string[]).includes(value)
}

export function parseWeekStart(value: string | undefined | null): WeekStart {
  return isWeekStart(value) ? value : DEFAULT_WEEK_START
}

/** Monday-first `Weekday` index the week strip should begin on. */
export function weekStartIndex(weekStart: WeekStart): Weekday {
  return weekStart === 'sunday' ? 6 : 0
}

export function parseReduceMotion(value: string | undefined | null): boolean {
  return value === 'true'
}

export interface GeneralSettings {
  weekStart: WeekStart
  reduceMotion: boolean
}
