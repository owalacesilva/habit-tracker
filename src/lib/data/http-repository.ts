import { type DataRepository, RepositoryError, type RepositoryOptions } from '@/lib/data/repository'
import type { NotificationPreferences, NotificationType } from '@/lib/notifications'
import type { Habit, NewHabitInput } from '@/types/habit'
import type { JourneyEnrollment } from '@/types/journey'

export interface HttpRepositoryOptions extends RepositoryOptions {
  baseUrl: string
  /** Injectable so tests do not need a live server. */
  fetchImpl?: typeof fetch
}

/**
 * Talks to an external service through the same port as the local adapters.
 *
 * The owner comes from the session, so requests carry cookies; the routes are
 * the ones a backend for this app would expose. Any non-2xx answer becomes a
 * `RepositoryError`, which the provider surfaces as the screen's error state.
 */
export class HttpRepository implements DataRepository {
  private readonly baseUrl: string
  private readonly ownerId: string
  private readonly fetchImpl: typeof fetch

  constructor({ baseUrl, ownerId, fetchImpl }: HttpRepositoryOptions) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.ownerId = ownerId
    this.fetchImpl = fetchImpl ?? globalThis.fetch.bind(globalThis)
  }

  async initialise(): Promise<void> {
    if (!this.baseUrl) {
      throw new RepositoryError('NEXT_PUBLIC_API_URL is required when the data source is "api"')
    }
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let response: Response

    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
          'x-owner-id': this.ownerId,
          ...init.headers,
        },
        ...init,
      })
    } catch (error) {
      // Offline, DNS failure, CORS — nothing came back at all.
      throw new RepositoryError(`Could not reach ${path}`, error)
    }

    if (!response.ok) {
      throw new RepositoryError(`${response.status} from ${path}`)
    }

    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  }

  listHabits(): Promise<Habit[]> {
    return this.request<Habit[]>('/habits')
  }

  createHabit(input: NewHabitInput): Promise<Habit> {
    return this.request<Habit>('/habits', { method: 'POST', body: JSON.stringify(input) })
  }

  async toggleCompletion(habitId: string, isoDate: string): Promise<boolean> {
    const { completed } = await this.request<{ completed: boolean }>(
      `/habits/${encodeURIComponent(habitId)}/completions`,
      { method: 'POST', body: JSON.stringify({ date: isoDate }) },
    )
    return completed
  }

  async deleteHabit(habitId: string): Promise<void> {
    await this.request<void>(`/habits/${encodeURIComponent(habitId)}`, { method: 'DELETE' })
  }

  listEnrollments(): Promise<JourneyEnrollment[]> {
    return this.request<JourneyEnrollment[]>('/journeys/enrollments')
  }

  startJourney(journeyId: string, startedIso: string): Promise<JourneyEnrollment> {
    return this.request<JourneyEnrollment>('/journeys/enrollments', {
      method: 'POST',
      body: JSON.stringify({ journeyId, startedIso }),
    })
  }

  getNotificationPreferences(): Promise<NotificationPreferences> {
    return this.request<NotificationPreferences>('/preferences/notifications')
  }

  setNotificationsEnabled(enabled: boolean): Promise<NotificationPreferences> {
    return this.request<NotificationPreferences>('/preferences/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    })
  }

  setNotificationType(type: NotificationType, enabled: boolean): Promise<NotificationPreferences> {
    return this.request<NotificationPreferences>('/preferences/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ types: { [type]: enabled } }),
    })
  }
}
