import type { Weekday } from '@/types/habit'

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
/** Initials used by the "Repeat days" picker. */
export const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

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

export function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  start.setDate(start.getDate() - toWeekday(date))
  return start
}

/** The Monday→Sunday strip shown under the greeting. */
export function weekStrip(reference: Date): WeekDay[] {
  const monday = startOfWeek(reference)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index)
    return {
      date,
      iso: toISODate(date),
      label: WEEKDAY_LABELS[index],
      dayOfMonth: date.getDate(),
      weekday: index as Weekday,
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
export function formatLongDate(date: Date, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, {
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
