/**
 * @jest-environment node
 */
import { createRepository } from '@/lib/data/factory'
import { HttpRepository } from '@/lib/data/http-repository'
import { IndexedDbRepository } from '@/lib/data/indexeddb-repository'
import { MemoryRepository } from '@/lib/data/memory-repository'

describe('createRepository', () => {
  const options = { ownerId: 'owner-1' }

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'indexedDB')
    process.env.NEXT_PUBLIC_DATA_SOURCE = undefined
  })

  it('builds the HTTP client for the api source', () => {
    const repository = createRepository({ ...options, source: 'api', baseUrl: 'http://api.test' })
    expect(repository).toBeInstanceOf(HttpRepository)
  })

  it('builds the IndexedDB adapter when the browser provides it', async () => {
    const { IDBFactory } = await import('fake-indexeddb')
    Object.defineProperty(globalThis, 'indexedDB', { value: new IDBFactory(), configurable: true })

    expect(createRepository({ ...options, source: 'indexeddb' })).toBeInstanceOf(
      IndexedDbRepository,
    )
  })

  it('falls back to memory when IndexedDB is missing, so the server can render', () => {
    // No `indexedDB` global here — this is the server, or a plain node test.
    expect(createRepository({ ...options, source: 'indexeddb' })).toBeInstanceOf(MemoryRepository)
  })

  it('builds the memory adapter on request', () => {
    expect(createRepository({ ...options, source: 'memory' })).toBeInstanceOf(MemoryRepository)
  })

  it('reads the source from the environment by default', () => {
    process.env.NEXT_PUBLIC_DATA_SOURCE = 'api'

    expect(createRepository({ ...options, baseUrl: 'http://api.test' })).toBeInstanceOf(
      HttpRepository,
    )
  })
})

describe('HttpRepository guard rails', () => {
  it('refuses to start without a base url', async () => {
    const repository = new HttpRepository({ ownerId: 'owner-1', baseUrl: '' })

    await expect(repository.initialise()).rejects.toThrow(/NEXT_PUBLIC_API_URL is required/)
  })

  it('reports a service that cannot be reached', async () => {
    const repository = new HttpRepository({
      ownerId: 'owner-1',
      baseUrl: 'http://api.test',
      fetchImpl: async () => {
        throw new TypeError('Failed to fetch')
      },
    })

    await expect(repository.listHabits()).rejects.toThrow(/Could not reach \/habits/)
  })

  it('reports a rejected request', async () => {
    const repository = new HttpRepository({
      ownerId: 'owner-1',
      baseUrl: 'http://api.test',
      fetchImpl: async () => new Response('nope', { status: 500 }),
    })

    await expect(repository.listHabits()).rejects.toThrow(/500 from \/habits/)
  })
})
