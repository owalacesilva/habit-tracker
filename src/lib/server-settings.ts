import { cookies } from 'next/headers'

import {
  DEFAULT_WEEK_START,
  type GeneralSettings,
  parseReduceMotion,
  parseWeekStart,
  REDUCE_MOTION_COOKIE,
  WEEK_START_COOKIE,
  weekStartIndex,
} from '@/lib/general-settings'
import { type Dictionary, getDictionary } from '@/lib/i18n'
import { LOCALE_COOKIE, type Locale, parseLocale } from '@/lib/i18n/config'
import { parseTheme, THEME_COOKIE, type Theme } from '@/lib/theme'
import type { Weekday } from '@/types/habit'

/**
 * Device-level settings live in cookies so the server renders the right theme,
 * language and week layout on the first paint. This module is the only place
 * that reads them.
 */
export interface ScreenSettings {
  locale: Locale
  t: Dictionary
  theme: Theme
  general: GeneralSettings
  /** Monday-first index the week strip starts on. */
  weekStartsOn: Weekday
}

export async function getScreenSettings(): Promise<ScreenSettings> {
  const store = await cookies()

  const locale = parseLocale(store.get(LOCALE_COOKIE)?.value)
  const theme = parseTheme(store.get(THEME_COOKIE)?.value)
  const weekStart = parseWeekStart(store.get(WEEK_START_COOKIE)?.value)
  const reduceMotion = parseReduceMotion(store.get(REDUCE_MOTION_COOKIE)?.value)

  return {
    locale,
    t: getDictionary(locale),
    theme,
    general: { weekStart, reduceMotion },
    weekStartsOn: weekStartIndex(weekStart),
  }
}

/** Shorthand for screens that only need copy. */
export async function getI18n(): Promise<{ locale: Locale; t: Dictionary }> {
  const { locale, t } = await getScreenSettings()
  return { locale, t }
}

export async function getLocale(): Promise<Locale> {
  return (await getScreenSettings()).locale
}

export async function getTheme(): Promise<Theme> {
  return (await getScreenSettings()).theme
}

export async function getGeneralSettings(): Promise<GeneralSettings> {
  const { general } = await getScreenSettings()
  return general
}

export { DEFAULT_WEEK_START }
