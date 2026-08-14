import type { DataRepository, OwnerSnapshot, RepositoryOptions } from '@/lib/data/repository'
import { buildHabit, toggleCompletionDate } from '@/lib/habits'
import { currentPersona, personaHabits } from '@/lib/mocks/personas'
import {
  defaultPreferences,
  type NotificationPreferences,
  type NotificationType,
} from '@/lib/notifications'
import type { Habit, NewHabitInput } from '@/types/habit'
import type { JourneyEnrollment } from '@/types/journey'

/** Fresh data for an owner who has none yet — the persona fixtures. */
export function seedSnapshot(ownerId: string, now: Date = new Date()): OwnerSnapshot {
  return {
    habits: personaHabits(currentPersona(), ownerId, now),
    enrollments: [],
    notifications: defaultPreferences(),
  }
}

const snapshots = new Map<string, OwnerSnapshot>()

/**
 * Volatile adapter. Backs the tests, and the server render before the client
 * repository takes over — it must never be the source of truth for a user.
 */
export class MemoryRepository implements DataRepository {
  private readonly ownerId: string
  private readonly now: () => Date

  constructor({ ownerId, now = () => new Date() }: RepositoryOptions) {
    this.ownerId = ownerId
    this.now = now
  }

  private snapshot(): OwnerSnapshot {
    let snapshot = snapshots.get(this.ownerId)
    if (!snapshot) {
      snapshot = seedSnapshot(this.ownerId, this.now())
      snapshots.set(this.ownerId, snapshot)
    }
    return snapshot
  }

  async initialise(): Promise<void> {
    this.snapshot()
  }

  async listHabits(): Promise<Habit[]> {
    return this.snapshot().habits.map((habit) => ({ ...habit }))
  }

  async createHabit(input: NewHabitInput): Promise<Habit> {
    const habit = buildHabit(this.ownerId, input, this.now())
    this.snapshot().habits.push(habit)
    return { ...habit }
  }

  async toggleCompletion(habitId: string, isoDate: string): Promise<boolean> {
    const snapshot = this.snapshot()
    const index = snapshot.habits.findIndex((habit) => habit.id === habitId)
    if (index < 0) throw new Error(`Unknown habit: ${habitId}`)

    const { habit, completed } = toggleCompletionDate(snapshot.habits[index], isoDate)
    snapshot.habits[index] = habit
    return completed
  }

  async deleteHabit(habitId: string): Promise<void> {
    const snapshot = this.snapshot()
    snapshot.habits = snapshot.habits.filter((habit) => habit.id !== habitId)
  }

  async listEnrollments(): Promise<JourneyEnrollment[]> {
    return this.snapshot().enrollments.map((entry) => ({ ...entry }))
  }

  async startJourney(journeyId: string, startedIso: string): Promise<JourneyEnrollment> {
    const snapshot = this.snapshot()
    const existing = snapshot.enrollments.find((entry) => entry.journeyId === journeyId)
    if (existing) return { ...existing }

    const enrollment: JourneyEnrollment = { journeyId, startedIso }
    snapshot.enrollments.push(enrollment)
    return { ...enrollment }
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const { notifications } = this.snapshot()
    return { enabled: notifications.enabled, types: { ...notifications.types } }
  }

  async setNotificationsEnabled(enabled: boolean): Promise<NotificationPreferences> {
    const snapshot = this.snapshot()
    snapshot.notifications = { ...snapshot.notifications, enabled }
    return this.getNotificationPreferences()
  }

  async setNotificationType(
    type: NotificationType,
    enabled: boolean,
  ): Promise<NotificationPreferences> {
    const snapshot = this.snapshot()
    snapshot.notifications = {
      ...snapshot.notifications,
      types: { ...snapshot.notifications.types, [type]: enabled },
    }
    return this.getNotificationPreferences()
  }
}

/** Reset helper for tests — never called by the app itself. */
export function __resetMemoryRepository() {
  snapshots.clear()
}
