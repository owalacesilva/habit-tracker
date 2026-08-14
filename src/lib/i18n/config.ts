/**
 * Adding a language: add the tag here, drop a dictionary next to `en.ts` (the
 * `Dictionary` type makes a missing key a compile error) and register it in
 * `dictionaries/index.ts`. Nothing else in the app needs to change.
 */
export const LOCALES = ['en', 'pt-BR', 'es'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_COOKIE = 'habit_locale'

/** Shown in the language picker — always in the language itself. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português (Brasil)',
  es: 'Español',
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** Exact match first, then the base language (`pt-PT` → `pt-BR`). */
export function parseLocale(value: string | undefined | null): Locale {
  if (isLocale(value)) return value
  if (!value) return DEFAULT_LOCALE

  const base = value.split('-')[0]?.toLowerCase()
  const match = LOCALES.find((locale) => locale.split('-')[0].toLowerCase() === base)
  return match ?? DEFAULT_LOCALE
}
