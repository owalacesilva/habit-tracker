import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  /** Icon rendered inside the field, on the right. */
  adornment?: ReactNode
  error?: string
}

export function TextField({ label, adornment, error, className, id, ...props }: TextFieldProps) {
  const inputId = id ?? props.name

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            'h-14 w-full rounded-card border border-sand-200 bg-surface px-4 text-sm text-ink',
            'placeholder:text-ink-soft focus:border-brand-300 focus:outline-none',
            adornment && 'pr-12',
            error && 'border-brand-600',
            className,
          )}
          {...props}
        />
        {adornment && (
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-muted">
            {adornment}
          </span>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-brand-700">{error}</p>}
    </div>
  )
}
