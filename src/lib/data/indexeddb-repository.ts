import { getAllByIndex, openDatabase, requestToPromise, withStores } from '@/lib/data/idb'
import { seedSnapshot } from '@/lib/data/memory-repository'
import { type DataRepository, RepositoryError, type RepositoryOptions } from '@/lib/data/repository'
import { buildHabit, toggleCompletionDate } from '@/lib/habits'
import {
  defaultPreferences,
  type NotificationPreferences,
  type NotificationType,
} from '@/lib/notifications'
import type { Habit, NewHabitInput } from '@/types/habit'
import type { JourneyEnrollment } from '@/types/journey'

export const DB_NAME = 'habit-tracker'
export const DB_VERSION = 1

export const STORE_HABITS = 'habits'
export const STORE_ENROLLMENTS = 'enrollments'
export const STORE_PREFERENCES = 'preferences'

/** Enrolments are keyed per owner, so the same journey can exist twice. */
interface StoredEnrollment extends JourneyEnrollment {
  id: string
  ownerId: string
}

interface StoredPreferences extends NotificationPreferences {
  ownerId: string
}

function enrollmentKey(ownerId: string, journeyId: string): string {
  return `${ownerId}:${journeyId}`
}

export function upgradeDatabase(db: IDBDatabase) {
  if (!db.objectStoreNames.contains(STORE_HABITS)) {
    const habits = db.createObjectStore(STORE_HABITS, { keyPath: 'id' })
    habits.createIndex('ownerId', 'userId')
  }
  if (!db.objectStoreNames.contains(STORE_ENROLLMENTS)) {
    const enrollments = db.createObjectStore(STORE_ENROLLMENTS, { keyPath: 'id' })
    enrollments.createIndex('ownerId', 'ownerId')
  }
  if (!db.objectStoreNames.contains(STORE_PREFERENCES)) {
    db.createObjectStore(STORE_PREFERENCES, { keyPath: 'ownerId' })
  }
}

/**
 * Local-first adapter: the browser owns the data outright, so the app runs with
 * no backend and keeps working offline. A brand new database is seeded with the
 * fixture routine, otherwise the first launch would be an empty screen.
 */
export class IndexedDbRepository implements DataRepository {
  private readonly ownerId: string
  private readonly now: () => Date
  private db: IDBDatabase | null = null

  constructor({ ownerId, now = () => new Date() }: RepositoryOptions) {
    this.ownerId = ownerId
    this.now = now
  }

  async initialise(): Promise<void> {
    if (this.db) return

    try {
      this.db = await openDatabase({
        name: DB_NAME,
        version: DB_VERSION,
        upgrade: upgradeDatabase,
      })
    } catch (error) {
      throw new RepositoryError('Could not open the local database', error)
    }

    await this.seedIfEmpty()
  }

  private database(): IDBDatabase {
    if (!this.db) throw new RepositoryError('Repository used before initialise()')
    return this.db
  }

  /** First run only: an owner with no habits and no preferences record. */
  private async seedIfEmpty(): Promise<void> {
    const db = this.database()

    const existing = await withStores(db, [STORE_PREFERENCES], 'readonly', async (stores) =>
      requestToPromise<StoredPreferences | undefined>(
        stores[STORE_PREFERENCES].get(this.ownerId) as IDBRequest<StoredPreferences | undefined>,
      ),
    )
    if (existing) return

    const snapshot = seedSnapshot(this.ownerId, this.now())

    await withStores(db, [STORE_HABITS, STORE_PREFERENCES], 'readwrite', async (stores) => {
      for (const habit of snapshot.habits) stores[STORE_HABITS].put(habit)
      stores[STORE_PREFERENCES].put({ ownerId: this.ownerId, ...snapshot.notifications })
    })
  }

  async listHabits(): Promise<Habit[]> {
    return withStores(this.database(), [STORE_HABITS], 'readonly', (stores) =>
      getAllByIndex<Habit>(stores[STORE_HABITS], 'ownerId', this.ownerId),
    )
  }

  async createHabit(input: NewHabitInput): Promise<Habit> {
    const habit = buildHabit(this.ownerId, input, this.now())

    await withStores(this.database(), [STORE_HABITS], 'readwrite', (stores) => {
      stores[STORE_HABITS].put(habit)
    })

    return habit
  }

  async toggleCompletion(habitId: string, isoDate: string): Promise<boolean> {
    return withStores(this.database(), [STORE_HABITS], 'readwrite', async (stores) => {
      const store = stores[STORE_HABITS]
      const current = await requestToPromise<Habit | undefined>(
        store.get(habitId) as IDBRequest<Habit | undefined>,
      )
      if (!current) throw new RepositoryError(`Unknown habit: ${habitId}`)

      const { habit, completed } = toggleCompletionDate(current, isoDate)
      store.put(habit)
      return completed
    })
  }

  async deleteHabit(habitId: string): Promise<void> {
    await withStores(this.database(), [STORE_HABITS], 'readwrite', (stores) => {
      stores[STORE_HABITS].delete(habitId)
    })
  }

  async listEnrollments(): Promise<JourneyEnrollment[]> {
    const stored = await withStores(this.database(), [STORE_ENROLLMENTS], 'readonly', (stores) =>
      getAllByIndex<StoredEnrollment>(stores[STORE_ENROLLMENTS], 'ownerId', this.ownerId),
    )

    return stored.map(({ journeyId, startedIso }) => ({ journeyId, startedIso }))
  }

  async startJourney(journeyId: string, startedIso: string): Promise<JourneyEnrollment> {
    return withStores(this.database(), [STORE_ENROLLMENTS], 'readwrite', async (stores) => {
      const store = stores[STORE_ENROLLMENTS]
      const key = enrollmentKey(this.ownerId, journeyId)

      const existing = await requestToPromise<StoredEnrollment | undefined>(
        store.get(key) as IDBRequest<StoredEnrollment | undefined>,
      )
      // Re-starting a journey keeps the original start date.
      if (existing) return { journeyId: existing.journeyId, startedIso: existing.startedIso }

      store.put({ id: key, ownerId: this.ownerId, journeyId, startedIso })
      return { journeyId, startedIso }
    })
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const stored = await withStores(this.database(), [STORE_PREFERENCES], 'readonly', (stores) =>
      requestToPromise<StoredPreferences | undefined>(
        stores[STORE_PREFERENCES].get(this.ownerId) as IDBRequest<StoredPreferences | undefined>,
      ),
    )

    if (!stored) return defaultPreferences()
    return { enabled: stored.enabled, types: { ...stored.types } }
  }

  private async savePreferences(
    update: (current: NotificationPreferences) => NotificationPreferences,
  ): Promise<NotificationPreferences> {
    return withStores(this.database(), [STORE_PREFERENCES], 'readwrite', async (stores) => {
      const store = stores[STORE_PREFERENCES]
      const stored = await requestToPromise<StoredPreferences | undefined>(
        store.get(this.ownerId) as IDBRequest<StoredPreferences | undefined>,
      )

      const current: NotificationPreferences = stored
        ? { enabled: stored.enabled, types: { ...stored.types } }
        : defaultPreferences()

      const next = update(current)
      store.put({ ownerId: this.ownerId, ...next })
      return next
    })
  }

  async setNotificationsEnabled(enabled: boolean): Promise<NotificationPreferences> {
    return this.savePreferences((current) => ({ ...current, enabled }))
  }

  async setNotificationType(
    type: NotificationType,
    enabled: boolean,
  ): Promise<NotificationPreferences> {
    return this.savePreferences((current) => ({
      ...current,
      types: { ...current.types, [type]: enabled },
    }))
  }
}
