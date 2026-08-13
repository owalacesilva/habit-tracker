'use client'

import { useState } from 'react'
import { CheckIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

export interface CheckBoxProps {
  name: string
  label: string
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

/** Small square checkbox that sits at the right edge of a section header. */
export function CheckBox({ name, label, defaultChecked = false, onCheckedChange }: CheckBoxProps) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <>
      <input type="hidden" name={name} value={checked ? 'on' : 'off'} />
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
        onClick={() => {
          const next = !checked
          setChecked(next)
          onCheckedChange?.(next)
        }}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors',
          checked ? 'border-brand-500 bg-brand-500 text-white' : 'border-sand-300 bg-surface',
        )}
      >
        {checked && <CheckIcon className="h-3.5 w-3.5" />}
      </button>
    </>
  )
}
