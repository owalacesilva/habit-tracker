import Link from 'next/link'
import { toISODate, weekStrip } from '@/lib/date'
import { cn } from '@/lib/utils'

export interface WeekStripProps {
  selected: Date
}

/** Monday→Sunday date picker. Selection is a URL param so the server re-renders. */
export function WeekStrip({ selected }: WeekStripProps) {
  const selectedIso = toISODate(selected)
  const today = toISODate(new Date())

  return (
    <nav aria-label="Select a day" className="no-scrollbar -mx-1 overflow-x-auto px-1">
      <ul className="flex min-w-full justify-between gap-1">
        {weekStrip(selected).map((day) => {
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
                    ? 'bg-ink text-white'
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
