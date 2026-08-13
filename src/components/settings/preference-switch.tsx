'use client'

import { useOptimistic, useTransition } from 'react'

import { Switch } from '@/components/ui/switch'

export interface PreferenceSwitchProps {
  label: string
  checked: boolean
  /** Server action; the switch flips optimistically while it runs. */
  onChange: (enabled: boolean) => Promise<unknown>
}

/** Switch bound to a persisted preference, with an instant optimistic flip. */
export function PreferenceSwitch({ label, checked, onChange }: PreferenceSwitchProps) {
  const [optimistic, setOptimistic] = useOptimistic(checked)
  const [, startTransition] = useTransition()

  return (
    <Switch
      label={label}
      checked={optimistic}
      onCheckedChange={(next) => {
        startTransition(async () => {
          setOptimistic(next)
          try {
            await onChange(next)
          } catch (error) {
            console.error('Could not save the preference', error)
          }
        })
      }}
    />
  )
}
