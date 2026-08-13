'use client'

import { useId, useState } from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps {
  name: string
  label: string
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

/** Pill toggle used for "Get reminders". Submits `on`/`off` with the form. */
export function Switch({ name, label, defaultChecked = false, onCheckedChange }: SwitchProps) {
  const [checked, setChecked] = useState(defaultChecked)
  const id = useId()

  return (
    <>
      <input type="hidden" name={name} value={checked ? 'on' : 'off'} />
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-label={label}
        onClick={() => {
          const next = !checked
          setChecked(next)
          onCheckedChange?.(next)
        }}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-pill transition-colors',
          checked ? 'bg-brand-500' : 'bg-sand-300',
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all',
            checked ? 'left-6' : 'left-1',
          )}
        />
      </button>
    </>
  )
}
