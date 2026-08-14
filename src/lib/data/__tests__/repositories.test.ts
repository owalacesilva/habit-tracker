/**
 * No DOM needed, and the node environment brings the real `fetch`, `Request`
 * and `Response` the HTTP adapter is written against.
 *
 * @jest-environment node
 */
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'

import { describeRepositoryContract } from '@/lib/data/__tests__/contract'
import { createFakeApi } from '@/lib/data/__tests__/fake-api'
import { HttpRepository } from '@/lib/data/http-repository'
import { IndexedDbRepository } from '@/lib/data/indexeddb-repository'
import { __resetMemoryRepository, MemoryRepository } from '@/lib/data/memory-repository'

describeRepositoryContract('in-memory', {
  create: (ownerId) => new MemoryRepository({ ownerId }),
  reset: () => __resetMemoryRepository(),
})

describeRepositoryContract('IndexedDB', {
  create: (ownerId) => new IndexedDbRepository({ ownerId }),
  // A brand new factory is the cleanest way to drop the whole database.
  reset: () => {
    globalThis.indexedDB = new IDBFactory()
  },
})

const api = createFakeApi()

describeRepositoryContract('HTTP', {
  create: (ownerId) =>
    new HttpRepository({ ownerId, baseUrl: 'http://api.test', fetchImpl: api.fetchImpl }),
  reset: () => api.reset(),
})
