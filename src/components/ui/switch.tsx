'use client'

import { useId, useState } from 'react'

import { cn } from '@/lib/utils'

export interface SwitchProps {
  label: string
  /** Present → the switch posts `on`/`off` with a form. */
  name?: string
  /** Present → controlled; the parent owns the state. */
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}

/** Pill toggle, used both inside forms and as a controlled settings switch. */
export function Switch({
  label,
  name,
  checked,
  defaultChecked = false,
  disabled = false,
  onCheckedChange,
}: SwitchProps) {
  const [internal, setInternal] = useState(defaultChecked)
  const isControlled = checked !== undefined
  const isOn = isControlled ? checked : internal
  const id = useId()

  return (
    <>
      {name && <input type="hidden" name={name} value={isOn ? 'on' : 'off'} />}
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={isOn}
        aria-label={label}
        disabled={disabled}
        onClick={() => {
          const next = !isOn
          if (!isControlled) setInternal(next)
          onCheckedChange?.(next)
        }}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-pill transition-colors',
          isOn ? 'bg-brand-500' : 'bg-sand-300',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all',
            isOn ? 'left-6' : 'left-1',
          )}
        />
      </button>
    </>
  )
}
