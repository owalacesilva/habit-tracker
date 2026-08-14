'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { requireUser } from '@/auth'
import {
  parseWeekStart,
  REDUCE_MOTION_COOKIE,
  WEEK_START_COOKIE,
  type WeekStart,
} from '@/lib/general-settings'
import { LOCALE_COOKIE, type Locale, parseLocale } from '@/lib/i18n/config'
import {
  isNotificationType,
  type NotificationPreferences,
  setNotificationsEnabled,
  setNotificationType,
} from '@/lib/notifications'
import { parseTheme, THEME_COOKIE, type Theme } from '@/lib/theme'

/** A year, so a preference survives sessions; `lax` keeps it on same-site navigations. */
const COOKIE_OPTIONS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
} as const

/**
 * Appearance, language and layout live in cookies (the server needs them to
 * render the first paint); notification preferences belong to the account.
 * Every action re-validates the layout so the whole app re-renders translated.
 */
export async function setThemeAction(value: string): Promise<Theme> {
  const theme = parseTheme(value)
  const store = await cookies()
  store.set(THEME_COOKIE, theme, COOKIE_OPTIONS)
  revalidatePath('/', 'layout')
  return theme
}

export async function setLocaleAction(value: string): Promise<Locale> {
  const locale = parseLocale(value)
  const store = await cookies()
  store.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS)
  revalidatePath('/', 'layout')
  return locale
}

export async function setWeekStartAction(value: string): Promise<WeekStart> {
  const weekStart = parseWeekStart(value)
  const store = await cookies()
  store.set(WEEK_START_COOKIE, weekStart, COOKIE_OPTIONS)
  revalidatePath('/', 'layout')
  return weekStart
}

export async function setReduceMotionAction(enabled: boolean): Promise<boolean> {
  const store = await cookies()
  store.set(REDUCE_MOTION_COOKIE, enabled ? 'true' : 'false', COOKIE_OPTIONS)
  revalidatePath('/', 'layout')
  return enabled
}

export async function setNotificationsEnabledAction(
  enabled: boolean,
): Promise<NotificationPreferences> {
  const user = await requireUser()
  const preferences = setNotificationsEnabled(user.id, enabled)
  revalidatePath('/settings')
  return preferences
}

export async function setNotificationTypeAction(
  type: string,
  enabled: boolean,
): Promise<NotificationPreferences> {
  const user = await requireUser()
  if (!isNotificationType(type)) throw new Error(`Unknown notification type: ${type}`)

  const preferences = setNotificationType(user.id, type, enabled)
  revalidatePath('/settings')
  return preferences
}
