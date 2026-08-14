/**
 * A very small promise wrapper over IndexedDB.
 *
 * The API is callback-based and its transactions commit as soon as the
 * microtask queue drains without a pending request, which is why every helper
 * here issues its requests inside the same continuation chain. Kept in-house
 * rather than pulling in a wrapper library: this is the whole surface the app
 * needs.
 */
export function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export interface OpenOptions {
  name: string
  version: number
  /** Create or migrate stores. Runs inside the version-change transaction. */
  upgrade: (db: IDBDatabase, transaction: IDBTransaction, oldVersion: number) => void
}

export function openDatabase({ name, version, upgrade }: OpenOptions): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment'))
      return
    }

    const request = indexedDB.open(name, version)

    request.onupgradeneeded = (event) => {
      const db = request.result
      const transaction = request.transaction
      if (transaction) upgrade(db, transaction, event.oldVersion)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('IndexedDB upgrade blocked by another open tab')) // another tab holds the old version
  })
}

/**
 * Run `work` against one or more stores and resolve once the transaction has
 * actually committed, so a caller that re-reads afterwards sees its own write.
 */
export async function withStores<T>(
  db: IDBDatabase,
  storeNames: string[],
  mode: IDBTransactionMode,
  work: (stores: Record<string, IDBObjectStore>) => Promise<T> | T,
): Promise<T> {
  const transaction = db.transaction(storeNames, mode)
  const stores = Object.fromEntries(storeNames.map((name) => [name, transaction.objectStore(name)]))

  const done = transactionDone(transaction)
  const result = await work(stores)
  await done

  return result
}

/** Every record in `store` whose `index` equals `value`. */
export async function getAllByIndex<T>(
  store: IDBObjectStore,
  index: string,
  value: IDBValidKey,
): Promise<T[]> {
  return requestToPromise(store.index(index).getAll(value) as IDBRequest<T[]>)
}
