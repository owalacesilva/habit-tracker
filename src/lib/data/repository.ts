import type { NotificationPreferences, NotificationType } from '@/lib/notifications'
import type { Habit, NewHabitInput } from '@/types/habit'
import type { JourneyEnrollment } from '@/types/journey'

/**
 * The port every data source implements.
 *
 * An instance is bound to one owner — a signed-in user in API mode, a device id
 * in local mode — so no call has to pass an id around. Everything is async
 * because IndexedDB and HTTP both are; the in-memory adapter just resolves
 * immediately.
 */
export interface DataRepository {
  /** Called once before first use: opens the database, seeds a new store. */
  initialise(): Promise<void>

  listHabits(): Promise<Habit[]>
  createHabit(input: NewHabitInput): Promise<Habit>
  /** Returns the resulting state, so callers do not have to re-read. */
  toggleCompletion(habitId: string, isoDate: string): Promise<boolean>
  deleteHabit(habitId: string): Promise<void>

  listEnrollments(): Promise<JourneyEnrollment[]>
  startJourney(journeyId: string, startedIso: string): Promise<JourneyEnrollment>

  getNotificationPreferences(): Promise<NotificationPreferences>
  setNotificationsEnabled(enabled: boolean): Promise<NotificationPreferences>
  setNotificationType(type: NotificationType, enabled: boolean): Promise<NotificationPreferences>
}

export interface RepositoryOptions {
  /** User id in API mode, device id in local mode. */
  ownerId: string
  /** Injectable for deterministic tests. */
  now?: () => Date
}

/** Everything one owner has, as stored by the local adapters. */
export interface OwnerSnapshot {
  habits: Habit[]
  enrollments: JourneyEnrollment[]
  notifications: NotificationPreferences
}

export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'RepositoryError'
  }
}
