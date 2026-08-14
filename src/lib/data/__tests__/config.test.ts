import {
  apiBaseUrl,
  DEFAULT_DATA_SOURCE,
  isDataSource,
  isLocalMode,
  parseDataSource,
} from '@/lib/data/config'
import { localOwnerId, OWNER_STORAGE_KEY } from '@/lib/data/owner'

describe('data source', () => {
  it.each(['indexeddb', 'api', 'memory'])('accepts %s', (value) => {
    expect(parseDataSource(value)).toBe(value)
    expect(isDataSource(value)).toBe(true)
  })

  it('falls back to the local default', () => {
    expect(parseDataSource('postgres')).toBe(DEFAULT_DATA_SOURCE)
    expect(parseDataSource(undefined)).toBe('indexeddb')
    expect(isDataSource(7)).toBe(false)
  })

  it('treats everything but the API as local, so only API mode needs a session', () => {
    expect(isLocalMode('indexeddb')).toBe(true)
    expect(isLocalMode('memory')).toBe(true)
    expect(isLocalMode('api')).toBe(false)
  })

  it('trims the trailing slash off the API base url', () => {
    const previous = process.env.NEXT_PUBLIC_API_URL
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/'

    expect(apiBaseUrl()).toBe('https://api.example.com')

    process.env.NEXT_PUBLIC_API_URL = previous
  })
})

describe('localOwnerId', () => {
  function fakeStorage(): Storage {
    const values = new Map<string, string>()
    return {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
      clear: () => values.clear(),
      key: () => null,
      length: 0,
    } as Storage
  }

  it('generates an id once and reuses it', () => {
    const storage = fakeStorage()

    const first = localOwnerId(storage)
    const second = localOwnerId(storage)

    expect(first).toBeTruthy()
    expect(second).toBe(first)
    expect(storage.getItem(OWNER_STORAGE_KEY)).toBe(first)
  })

  it('keeps an id that is already stored', () => {
    const storage = fakeStorage()
    storage.setItem(OWNER_STORAGE_KEY, 'existing-device')

    expect(localOwnerId(storage)).toBe('existing-device')
  })
})
