/**
 * Notification preferences.
 *
 * Account-level rather than device-level, so they are persisted through
 * `DataRepository` (IndexedDB or the external API) rather than in a cookie.
 * This module holds only the shape and the rules.
 */
export const NOTIFICATION_TYPES = ['dailyReminder', 'streakAlert', 'weeklyReport'] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export interface NotificationPreferences {
  /** Master switch — when off, no notification is sent whatever the types say. */
  enabled: boolean
  types: Record<NotificationType, boolean>
}

export function defaultPreferences(): NotificationPreferences {
  return {
    enabled: true,
    types: { dailyReminder: true, streakAlert: true, weeklyReport: false },
  }
}

export function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === 'string' && (NOTIFICATION_TYPES as readonly string[]).includes(value)
}

/** A type only fires when it is on *and* the master switch is on. */
export function isNotificationActive(
  preferences: NotificationPreferences,
  type: NotificationType,
): boolean {
  return preferences.enabled && preferences.types[type]
}
