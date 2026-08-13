'use client'

import { useOptimistic, useTransition } from 'react'

import { SettingsRow } from '@/components/settings/settings-section'
import { Switch } from '@/components/ui/switch'
import type { NotificationPreferences, NotificationType } from '@/lib/notifications'

export interface NotificationSettingsLabels {
  master: string
  description: string
  disabledHint: string
  types: Record<NotificationType, { label: string; description: string }>
}

export interface NotificationSettingsProps {
  preferences: NotificationPreferences
  labels: NotificationSettingsLabels
  onToggleAll: (enabled: boolean) => Promise<unknown>
  onToggleType: (type: NotificationType, enabled: boolean) => Promise<unknown>
}

const TYPE_ORDER: NotificationType[] = ['dailyReminder', 'streakAlert', 'weeklyReport']

/**
 * Master switch plus one row per type. Turning the master off disables the
 * rows rather than hiding them, so the choices stay discoverable.
 */
export function NotificationSettings({
  preferences,
  labels,
  onToggleAll,
  onToggleType,
}: NotificationSettingsProps) {
  const [optimistic, setOptimistic] = useOptimistic(preferences)
  const [, startTransition] = useTransition()

  function toggleAll(enabled: boolean) {
    startTransition(async () => {
      setOptimistic({ ...optimistic, enabled })
      await onToggleAll(enabled)
    })
  }

  function toggleType(type: NotificationType, enabled: boolean) {
    startTransition(async () => {
      setOptimistic({
        ...optimistic,
        types: { ...optimistic.types, [type]: enabled },
      })
      await onToggleType(type, enabled)
    })
  }

  return (
    <>
      <SettingsRow
        label={labels.master}
        description={optimistic.enabled ? labels.description : labels.disabledHint}
        control={
          <Switch label={labels.master} checked={optimistic.enabled} onCheckedChange={toggleAll} />
        }
      />

      {TYPE_ORDER.map((type) => (
        <SettingsRow
          key={type}
          label={labels.types[type].label}
          description={labels.types[type].description}
          disabled={!optimistic.enabled}
          control={
            <Switch
              label={labels.types[type].label}
              checked={optimistic.types[type]}
              disabled={!optimistic.enabled}
              onCheckedChange={(enabled) => toggleType(type, enabled)}
            />
          }
        />
      ))}
    </>
  )
}
