/**
 * Notification preferences, per user.
 *
 * Account-level (they follow the user across devices), so unlike the theme they
 * live in the domain store rather than in a cookie. Swap the Map for a database
 * table the same way as `habits.ts`.
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

const store = new Map<string, NotificationPreferences>()

export function getNotificationPreferences(userId: string): NotificationPreferences {
  const current = store.get(userId) ?? defaultPreferences()
  store.set(userId, current)
  return { enabled: current.enabled, types: { ...current.types } }
}

export function setNotificationsEnabled(userId: string, enabled: boolean): NotificationPreferences {
  const current = getNotificationPreferences(userId)
  const next = { ...current, enabled }
  store.set(userId, next)
  return next
}

export function setNotificationType(
  userId: string,
  type: NotificationType,
  enabled: boolean,
): NotificationPreferences {
  const current = getNotificationPreferences(userId)
  const next = { ...current, types: { ...current.types, [type]: enabled } }
  store.set(userId, next)
  return next
}

/** A type only fires when it is on *and* the master switch is on. */
export function isNotificationActive(
  preferences: NotificationPreferences,
  type: NotificationType,
): boolean {
  return preferences.enabled && preferences.types[type]
}

/** Reset helper for tests — never called by the app itself. */
export function __resetNotificationStore() {
  store.clear()
}
