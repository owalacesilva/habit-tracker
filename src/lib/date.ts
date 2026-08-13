import type { Weekday } from '@/types/habit'

/** Fallback weekday names, used when no locale is supplied. */
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

/**
 * The design is day-first ("Thursday, 13 March 2025"), which `en-US` would
 * render month-first. Everything else uses the requested locale as-is.
 */
const DISPLAY_LOCALE: Record<string, string> = { en: 'en-GB' }

function displayLocale(locale: string): string {
  return DISPLAY_LOCALE[locale] ?? locale
}

export interface WeekDay {
  date: Date
  /** `yyyy-mm-dd`, safe to use as a React key and storage key. */
  iso: string
  label: string
  dayOfMonth: number
  weekday: Weekday
}

/** Local-time ISO date (`toISOString` would shift days for negative offsets). */
export function toISODate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Parse `yyyy-mm-dd` as a local date; falls back to `now` when malformed. */
export function parseISODate(value: string | undefined, now: Date = new Date()): Date {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return now
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)
  return Number.isNaN(parsed.getTime()) ? now : parsed
}

/** Convert JS `getDay()` (Sunday = 0) to our Monday-first `Weekday`. */
export function toWeekday(date: Date): Weekday {
  return ((date.getDay() + 6) % 7) as Weekday
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b)
}

/**
 * `weekStartsOn` is a Monday-first `Weekday` (0 = Monday, 6 = Sunday) so the
 * "start the week on Sunday" preference only changes presentation — habit
 * scheduling stays on the same canonical indexes.
 */
export function startOfWeek(date: Date, weekStartsOn: Weekday = 0): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const offset = (toWeekday(date) - weekStartsOn + 7) % 7
  start.setDate(start.getDate() - offset)
  return start
}

/** Short weekday names in Monday-first order, e.g. `Mon` / `seg.`. */
export function weekdayLabels(locale?: string): string[] {
  if (!locale) return [...WEEKDAY_LABELS]
  const formatter = new Intl.DateTimeFormat(displayLocale(locale), {
    weekday: 'short',
  })
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, 1 + index)))
}

/** Single-letter weekday names in Monday-first order, for the repeat picker. */
export function weekdayInitials(locale?: string): string[] {
  const formatter = new Intl.DateTimeFormat(displayLocale(locale ?? 'en'), {
    weekday: 'narrow',
  })
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(2024, 0, 1 + index)).toUpperCase(),
  )
}

/** The seven days shown under the greeting, ordered by the week-start setting. */
export function weekStrip(reference: Date, weekStartsOn: Weekday = 0, locale?: string): WeekDay[] {
  const first = startOfWeek(reference, weekStartsOn)
  const labels = weekdayLabels(locale)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(first.getFullYear(), first.getMonth(), first.getDate() + index)
    const weekday = toWeekday(date)
    return {
      date,
      iso: toISODate(date),
      label: labels[weekday],
      dayOfMonth: date.getDate(),
      weekday,
    }
  })
}

/** "Morning" before noon, "Afternoon" until 18:00, "Evening" after. */
export function greeting(date: Date): 'Morning' | 'Afternoon' | 'Evening' {
  const hour = date.getHours()
  if (hour < 12) return 'Morning'
  if (hour < 18) return 'Afternoon'
  return 'Evening'
}

/** e.g. "Thursday, 10 March 2025". */
export function formatLongDate(date: Date, locale = 'en'): string {
  return new Intl.DateTimeFormat(displayLocale(locale), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** e.g. "7h 30m" — used by the weekly stats row. */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}m`
  if (rest === 0) return `${hours}h`
  return `${hours}h ${rest}m`
}
