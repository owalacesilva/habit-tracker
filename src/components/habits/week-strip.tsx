import Link from 'next/link'

import { toISODate, weekStrip } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { Weekday } from '@/types/habit'

export interface WeekStripProps {
  selected: Date
  /** Accessible name, e.g. "Select a day". */
  label: string
  /** Monday-first index the strip starts on (General settings). */
  weekStartsOn?: Weekday
  locale?: string
}

/** Week date picker. Selection is a URL param so the server re-renders. */
export function WeekStrip({ selected, label, weekStartsOn = 0, locale }: WeekStripProps) {
  const selectedIso = toISODate(selected)
  const today = toISODate(new Date())

  return (
    <nav aria-label={label} className="no-scrollbar -mx-1 overflow-x-auto px-1">
      <ul className="flex min-w-full justify-between gap-1">
        {weekStrip(selected, weekStartsOn, locale).map((day) => {
          const isSelected = day.iso === selectedIso
          return (
            <li key={day.iso} className="flex flex-1 flex-col items-center gap-2">
              <span
                className={cn('text-xs font-medium', isSelected ? 'text-ink' : 'text-ink-muted')}
              >
                {day.label}
              </span>
              <Link
                href={day.iso === today ? '/' : `/?date=${day.iso}`}
                aria-current={isSelected ? 'date' : undefined}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isSelected
                    ? 'bg-ink text-canvas'
                    : 'border border-sand-200 bg-surface text-ink hover:border-brand-200',
                )}
              >
                {day.dayOfMonth}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
