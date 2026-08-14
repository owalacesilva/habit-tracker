import { apiBaseUrl, type DataSource, dataSource } from '@/lib/data/config'
import { HttpRepository } from '@/lib/data/http-repository'
import { IndexedDbRepository } from '@/lib/data/indexeddb-repository'
import { MemoryRepository } from '@/lib/data/memory-repository'
import type { DataRepository, RepositoryOptions } from '@/lib/data/repository'

export interface CreateRepositoryOptions extends RepositoryOptions {
  /** Defaults to `NEXT_PUBLIC_DATA_SOURCE`. */
  source?: DataSource
  baseUrl?: string
  fetchImpl?: typeof fetch
}

/**
 * Pick the adapter for the configured data source.
 *
 * IndexedDB only exists in the browser, so a server render — or a test running
 * without the API — falls back to the volatile adapter rather than throwing.
 */
export function createRepository({
  source = dataSource(),
  baseUrl = apiBaseUrl(),
  fetchImpl,
  ...options
}: CreateRepositoryOptions): DataRepository {
  if (source === 'api') {
    return new HttpRepository({ ...options, baseUrl, fetchImpl })
  }

  if (source === 'indexeddb' && typeof indexedDB !== 'undefined') {
    return new IndexedDbRepository(options)
  }

  return new MemoryRepository(options)
}
