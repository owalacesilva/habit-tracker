/**
 * Where user data lives.
 *
 * `indexeddb` makes the app autonomous: everything is stored in the browser, so
 * it runs with no backend at all and keeps working offline. `api` points the
 * same repository interface at an external service. `memory` is the volatile
 * adapter used by tests and by the server render before the client takes over.
 *
 * The value is read on both sides of the wire (the proxy needs it to decide
 * whether to enforce a session), so it must be a `NEXT_PUBLIC_` variable.
 */
export const DATA_SOURCES = ['indexeddb', 'api', 'memory'] as const

export type DataSource = (typeof DATA_SOURCES)[number]

export const DEFAULT_DATA_SOURCE: DataSource = 'indexeddb'

export function isDataSource(value: unknown): value is DataSource {
  return typeof value === 'string' && (DATA_SOURCES as readonly string[]).includes(value)
}

export function parseDataSource(value: string | undefined | null): DataSource {
  return isDataSource(value) ? value : DEFAULT_DATA_SOURCE
}

/**
 * Inlined by the bundler, so it must be referenced as a full literal rather
 * than through a computed key.
 */
export function dataSource(): DataSource {
  return parseDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE)
}

/** Local mode owns its data outright: no server, and therefore no session. */
export function isLocalMode(source: DataSource = dataSource()): boolean {
  return source !== 'api'
}

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''
}
