/**
 * @jest-environment node
 */
import { REDUCE_MOTION_COOKIE, WEEK_START_COOKIE } from '@/lib/general-settings'
import { LOCALE_COOKIE } from '@/lib/i18n/config'
import {
  getGeneralSettings,
  getI18n,
  getLocale,
  getScreenSettings,
  getTheme,
} from '@/lib/server-settings'
import { THEME_COOKIE } from '@/lib/theme'

const mockCookies = new Map<string, string>()

jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({
    get: (name: string) =>
      mockCookies.has(name) ? { name, value: mockCookies.get(name) } : undefined,
  })),
}))

beforeEach(() => mockCookies.clear())

describe('getScreenSettings', () => {
  it('falls back to sensible defaults when nothing is stored', async () => {
    await expect(getScreenSettings()).resolves.toMatchObject({
      locale: 'en',
      theme: 'system',
      general: { weekStart: 'monday', reduceMotion: false },
      weekStartsOn: 0,
    })
  })

  it('reads every preference from its cookie', async () => {
    mockCookies.set(LOCALE_COOKIE, 'pt-BR')
    mockCookies.set(THEME_COOKIE, 'dark')
    mockCookies.set(WEEK_START_COOKIE, 'sunday')
    mockCookies.set(REDUCE_MOTION_COOKIE, 'true')

    const settings = await getScreenSettings()

    expect(settings).toMatchObject({
      locale: 'pt-BR',
      theme: 'dark',
      general: { weekStart: 'sunday', reduceMotion: true },
      weekStartsOn: 6,
    })
    expect(settings.t.nav.home).toBe('Início')
  })

  it('ignores values it does not recognise', async () => {
    mockCookies.set(LOCALE_COOKIE, 'kl-GL')
    mockCookies.set(THEME_COOKIE, 'neon')

    await expect(getScreenSettings()).resolves.toMatchObject({ locale: 'en', theme: 'system' })
  })
})

describe('shorthand readers', () => {
  it('return the same values as the full settings', async () => {
    mockCookies.set(LOCALE_COOKIE, 'es')
    mockCookies.set(THEME_COOKIE, 'light')

    await expect(getLocale()).resolves.toBe('es')
    await expect(getTheme()).resolves.toBe('light')
    await expect(getGeneralSettings()).resolves.toEqual({
      weekStart: 'monday',
      reduceMotion: false,
    })

    const { locale, t } = await getI18n()
    expect(locale).toBe('es')
    expect(t.nav.home).toBe('Inicio')
  })
})
