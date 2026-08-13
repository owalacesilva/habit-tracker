'use client'

import { useOptimistic, useTransition } from 'react'

import { cn } from '@/lib/utils'

export interface ChoiceOption<T extends string> {
  value: T
  label: string
  /** Optional glyph shown above the label. */
  icon?: string
}

export interface ChoiceGroupProps<T extends string> {
  label: string
  value: T
  options: ChoiceOption<T>[]
  /** Server action; the selection updates optimistically while it runs. */
  onSelect: (value: T) => Promise<unknown>
}

/**
 * Segmented single-choice control used for theme, language and week start.
 * Options wrap instead of shrinking, so long translations stay readable.
 */
export function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onSelect,
}: ChoiceGroupProps<T>) {
  const [selected, setSelected] = useOptimistic(value)
  const [isPending, startTransition] = useTransition()

  function choose(next: T) {
    if (next === selected) return
    startTransition(async () => {
      setSelected(next)
      try {
        await onSelect(next)
      } catch (error) {
        console.error('Could not save the preference', error)
      }
    })
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-busy={isPending}
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const active = option.value === selected
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(option.value)}
            className={cn(
              'flex min-h-11 min-w-[6.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-card border px-3 py-2 text-xs font-semibold transition-colors',
              active
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-sand-200 bg-surface text-ink-muted hover:border-brand-200 hover:text-ink',
            )}
          >
            {option.icon && (
              <span aria-hidden className="text-base">
                {option.icon}
              </span>
            )}
            <span className="text-center text-balance">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
