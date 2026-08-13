import {
  DEFAULT_WEEK_START,
  parseReduceMotion,
  parseWeekStart,
  weekStartIndex,
} from '@/lib/general-settings'
import {
  __resetNotificationStore,
  defaultPreferences,
  getNotificationPreferences,
  isNotificationActive,
  isNotificationType,
  setNotificationsEnabled,
  setNotificationType,
} from '@/lib/notifications'
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

describe('notification preferences', () => {
  const USER = 'test-user'

  beforeEach(() => __resetNotificationStore())

  it('starts from the defaults', () => {
    expect(getNotificationPreferences(USER)).toEqual(defaultPreferences())
  })

  it('returns a copy, so callers cannot mutate the store', () => {
    const preferences = getNotificationPreferences(USER)
    preferences.types.dailyReminder = false

    expect(getNotificationPreferences(USER).types.dailyReminder).toBe(true)
  })

  it('toggles the master switch without losing the type choices', () => {
    setNotificationType(USER, 'weeklyReport', true)
    const off = setNotificationsEnabled(USER, false)

    expect(off.enabled).toBe(false)
    expect(off.types.weeklyReport).toBe(true)
  })

  it('toggles a single type', () => {
    const next = setNotificationType(USER, 'streakAlert', false)

    expect(next.types.streakAlert).toBe(false)
    expect(next.types.dailyReminder).toBe(true)
  })

  it('keeps users apart', () => {
    setNotificationsEnabled(USER, false)
    expect(getNotificationPreferences('someone-else').enabled).toBe(true)
  })

  it('reports a type as active only when the master switch is on', () => {
    const preferences = setNotificationsEnabled(USER, false)
    expect(isNotificationActive(preferences, 'dailyReminder')).toBe(false)

    const enabled = setNotificationsEnabled(USER, true)
    expect(isNotificationActive(enabled, 'dailyReminder')).toBe(true)
    expect(isNotificationActive(enabled, 'weeklyReport')).toBe(false)
  })

  it('guards unknown types', () => {
    expect(isNotificationType('dailyReminder')).toBe(true)
    expect(isNotificationType('carrierPigeon')).toBe(false)
  })
})
