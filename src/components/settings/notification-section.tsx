'use client'

import {
  NotificationSettings,
  type NotificationSettingsLabels,
} from '@/components/settings/notification-settings'
import { useNotificationPreferences } from '@/lib/data/provider'

export interface NotificationSectionProps {
  labels: NotificationSettingsLabels
}

/** Binds the notification switches to the data layer. */
export function NotificationSection({ labels }: NotificationSectionProps) {
  const { notifications, setNotificationsEnabled, setNotificationType } =
    useNotificationPreferences()

  return (
    <NotificationSettings
      preferences={notifications}
      labels={labels}
      onToggleAll={setNotificationsEnabled}
      onToggleType={setNotificationType}
    />
  )
}
