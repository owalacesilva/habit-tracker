/**
 * @jest-environment node
 */
import {
  setLocaleAction,
  setNotificationsEnabledAction,
  setNotificationTypeAction,
  setReduceMotionAction,
  setThemeAction,
  setWeekStartAction,
} from '@/app/settings/actions'
import { REDUCE_MOTION_COOKIE, WEEK_START_COOKIE } from '@/lib/general-settings'
import { LOCALE_COOKIE } from '@/lib/i18n/config'
import { __resetNotificationStore, getNotificationPreferences } from '@/lib/notifications'
import { THEME_COOKIE } from '@/lib/theme'

const cookieStore = { set: jest.fn(), get: jest.fn() }

jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => cookieStore),
}))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/auth', () => ({
  requireUser: jest.fn().mockResolvedValue({ id: 'test-user', name: 'Budi' }),
}))

const { revalidatePath } = jest.requireMock('next/cache')

beforeEach(() => {
  jest.clearAllMocks()
  __resetNotificationStore()
})

describe('appearance and layout preferences', () => {
  it('persists the theme for a year on every path', async () => {
    await expect(setThemeAction('dark')).resolves.toBe('dark')

    expect(cookieStore.set).toHaveBeenCalledWith(
      THEME_COOKIE,
      'dark',
      expect.objectContaining({
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      }),
    )
  })

  it('re-renders the whole app so the change is visible everywhere', async () => {
    await setThemeAction('light')
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('refuses a value it does not know', async () => {
    await expect(setThemeAction('neon')).resolves.toBe('system')
    expect(cookieStore.set).toHaveBeenCalledWith(THEME_COOKIE, 'system', expect.anything())
  })

  it('normalises the locale before storing it', async () => {
    await expect(setLocaleAction('pt-PT')).resolves.toBe('pt-BR')
    expect(cookieStore.set).toHaveBeenCalledWith(LOCALE_COOKIE, 'pt-BR', expect.anything())
  })

  it('stores the week start', async () => {
    await expect(setWeekStartAction('sunday')).resolves.toBe('sunday')
    expect(cookieStore.set).toHaveBeenCalledWith(WEEK_START_COOKIE, 'sunday', expect.anything())
  })

  it('stores reduced motion as a flag', async () => {
    await setReduceMotionAction(true)
    expect(cookieStore.set).toHaveBeenCalledWith(REDUCE_MOTION_COOKIE, 'true', expect.anything())

    await setReduceMotionAction(false)
    expect(cookieStore.set).toHaveBeenCalledWith(REDUCE_MOTION_COOKIE, 'false', expect.anything())
  })
})

describe('notification preferences', () => {
  it('stores the master switch against the signed-in user', async () => {
    const preferences = await setNotificationsEnabledAction(false)

    expect(preferences.enabled).toBe(false)
    expect(getNotificationPreferences('test-user').enabled).toBe(false)
    expect(revalidatePath).toHaveBeenCalledWith('/settings')
  })

  it('stores a single type without touching the others', async () => {
    const preferences = await setNotificationTypeAction('weeklyReport', true)

    expect(preferences.types.weeklyReport).toBe(true)
    expect(preferences.types.dailyReminder).toBe(true)
  })

  it('rejects an unknown notification type', async () => {
    await expect(setNotificationTypeAction('carrierPigeon', true)).rejects.toThrow(
      /Unknown notification type/,
    )
  })

  it('never writes preferences to a cookie', async () => {
    await setNotificationsEnabledAction(true)
    expect(cookieStore.set).not.toHaveBeenCalled()
  })
})
