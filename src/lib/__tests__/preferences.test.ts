import {
  DEFAULT_WEEK_START,
  parseReduceMotion,
  parseWeekStart,
  weekStartIndex,
} from '@/lib/general-settings'
import { defaultPreferences, isNotificationActive, isNotificationType } from '@/lib/notifications'
import { DEFAULT_THEME, isTheme, parseTheme, themeAttribute } from '@/lib/theme'

describe('theme preference', () => {
  it.each(['light', 'dark', 'system'])('accepts %s', (value) => {
    expect(parseTheme(value)).toBe(value)
  })

  it('falls back to the default for anything else', () => {
    expect(parseTheme('neon')).toBe(DEFAULT_THEME)
    expect(parseTheme(undefined)).toBe(DEFAULT_THEME)
    expect(isTheme('neon')).toBe(false)
  })

  it('renders no attribute for "system" so the OS preference wins', () => {
    expect(themeAttribute('system')).toBeUndefined()
    expect(themeAttribute('dark')).toBe('dark')
    expect(themeAttribute('light')).toBe('light')
  })
})

describe('general settings', () => {
  it('parses the week start', () => {
    expect(parseWeekStart('sunday')).toBe('sunday')
    expect(parseWeekStart('friday')).toBe(DEFAULT_WEEK_START)
    expect(parseWeekStart(undefined)).toBe('monday')
  })

  it('maps the week start onto a Monday-first index', () => {
    expect(weekStartIndex('monday')).toBe(0)
    expect(weekStartIndex('sunday')).toBe(6)
  })

  it('treats only the literal "true" as reduced motion', () => {
    expect(parseReduceMotion('true')).toBe(true)
    expect(parseReduceMotion('false')).toBe(false)
    expect(parseReduceMotion(undefined)).toBe(false)
  })
})

describe('notification rules', () => {
  it('starts with reminders on and the weekly report off', () => {
    expect(defaultPreferences()).toEqual({
      enabled: true,
      types: { dailyReminder: true, streakAlert: true, weeklyReport: false },
    })
  })

  it('reports a type as active only when the master switch is on', () => {
    const preferences = defaultPreferences()

    expect(isNotificationActive(preferences, 'dailyReminder')).toBe(true)
    expect(isNotificationActive(preferences, 'weeklyReport')).toBe(false)
    expect(isNotificationActive({ ...preferences, enabled: false }, 'dailyReminder')).toBe(false)
  })

  it('guards unknown types', () => {
    expect(isNotificationType('dailyReminder')).toBe(true)
    expect(isNotificationType('carrierPigeon')).toBe(false)
  })
})
