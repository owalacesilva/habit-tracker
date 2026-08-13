import { format, getDictionary, plural } from '@/lib/i18n'
import { DEFAULT_LOCALE, isLocale, LOCALE_LABELS, LOCALES, parseLocale } from '@/lib/i18n/config'
import en from '@/lib/i18n/dictionaries/en'
import es from '@/lib/i18n/dictionaries/es'
import ptBR from '@/lib/i18n/dictionaries/pt-BR'

/** Flatten to dotted paths so a missing nested key is easy to read in the diff. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe('dictionaries', () => {
  const expected = keyPaths(en).sort()

  it.each([
    ['pt-BR', ptBR],
    ['es', es],
  ])('%s has exactly the same keys as en', (_name, dictionary) => {
    expect(keyPaths(dictionary).sort()).toEqual(expected)
  })

  it.each([
    ['pt-BR', ptBR],
    ['es', es],
  ])('%s leaves no string untranslated', (_name, dictionary) => {
    const translated = keyPaths(dictionary)
      .map((path) => path.split('.').reduce<never>((node, key) => node[key], dictionary as never))
      .filter((value) => typeof value === 'string')

    expect(translated.length).toBeGreaterThan(0)
    expect(translated.every((value) => value !== '')).toBe(true)
  })

  it('every locale has a label for the picker', () => {
    LOCALES.forEach((locale) => expect(LOCALE_LABELS[locale]).toBeTruthy())
  })

  it('keeps the placeholders of a template intact across languages', () => {
    // A dropped `{count}` would render "Streak days" for that language only.
    const placeholders = (value: string) => value.match(/\{\w+\}/g)?.sort() ?? []

    expect(placeholders(ptBR.home.streakOther)).toEqual(placeholders(en.home.streakOther))
    expect(placeholders(es.journey.progress)).toEqual(placeholders(en.journey.progress))
    expect(placeholders(ptBR.history.statistics.chartLabel)).toEqual(
      placeholders(en.history.statistics.chartLabel),
    )
  })
})

describe('getDictionary', () => {
  it('returns the requested language', () => {
    expect(getDictionary('pt-BR').nav.home).toBe('Início')
    expect(getDictionary('es').nav.home).toBe('Inicio')
  })

  it('falls back to the default for unknown values', () => {
    expect(getDictionary('kl-GL')).toBe(getDictionary(DEFAULT_LOCALE))
    expect(getDictionary(undefined).nav.home).toBe('Home')
  })
})

describe('parseLocale', () => {
  it('accepts an exact tag', () => {
    expect(parseLocale('pt-BR')).toBe('pt-BR')
  })

  it('matches on the base language', () => {
    expect(parseLocale('pt-PT')).toBe('pt-BR')
    expect(parseLocale('es-MX')).toBe('es')
    expect(parseLocale('EN-US')).toBe('en')
  })

  it('falls back to the default', () => {
    expect(parseLocale(undefined)).toBe(DEFAULT_LOCALE)
    expect(parseLocale('')).toBe(DEFAULT_LOCALE)
    expect(parseLocale('kl')).toBe(DEFAULT_LOCALE)
  })

  it('guards with isLocale', () => {
    expect(isLocale('en')).toBe(true)
    expect(isLocale('kl')).toBe(false)
    expect(isLocale(7)).toBe(false)
  })
})

describe('format', () => {
  it('replaces named placeholders', () => {
    expect(format('{done} of {total} days', { done: 3, total: 21 })).toBe('3 of 21 days')
  })

  it('leaves unknown placeholders untouched rather than printing "undefined"', () => {
    expect(format('Hi {name}', {})).toBe('Hi {name}')
  })
})

describe('plural', () => {
  it('picks the form and interpolates the count', () => {
    expect(plural(1, 'Streak {count} day', 'Streak {count} days')).toBe('Streak 1 day')
    expect(plural(4, 'Streak {count} day', 'Streak {count} days')).toBe('Streak 4 days')
    expect(plural(0, '{count} day', '{count} days')).toBe('0 days')
  })
})
