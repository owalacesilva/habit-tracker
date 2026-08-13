/**
 * Theme preference.
 *
 * Persisted in a cookie rather than localStorage so the server can render the
 * right palette on the first paint — a client-side read would flash the wrong
 * theme on every navigation.
 */
export const THEMES = ['system', 'light', 'dark'] as const

export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = 'system'
export const THEME_COOKIE = 'habit_theme'

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

export function parseTheme(value: string | undefined | null): Theme {
  return isTheme(value) ? value : DEFAULT_THEME
}

/**
 * `data-theme` for the <html> element. "system" deliberately renders no
 * attribute so the `prefers-color-scheme` rules in globals.css take over.
 */
export function themeAttribute(theme: Theme): 'light' | 'dark' | undefined {
  return theme === 'system' ? undefined : theme
}
