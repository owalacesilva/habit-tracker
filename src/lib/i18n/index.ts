import { DEFAULT_LOCALE, type Locale, parseLocale } from '@/lib/i18n/config'
import en, { type Dictionary } from '@/lib/i18n/dictionaries/en'
import es from '@/lib/i18n/dictionaries/es'
import ptBR from '@/lib/i18n/dictionaries/pt-BR'

export type { Dictionary }
export * from '@/lib/i18n/config'

const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  'pt-BR': ptBR,
  es,
}

export function getDictionary(locale: Locale | string | undefined | null): Dictionary {
  return DICTIONARIES[parseLocale(locale)] ?? DICTIONARIES[DEFAULT_LOCALE]
}

/** Replace `{name}` placeholders. Unknown placeholders are left untouched. */
export function format(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  )
}

/**
 * Pick the singular or plural template and interpolate `{count}`.
 * English, Portuguese and Spanish share the "one vs. other" rule; a language
 * with more forms would get its own branch here.
 */
export function plural(count: number, one: string, other: string): string {
  return format(count === 1 ? one : other, { count })
}
