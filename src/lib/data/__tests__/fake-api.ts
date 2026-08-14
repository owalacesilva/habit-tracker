import { __resetMemoryRepository, MemoryRepository } from '@/lib/data/memory-repository'
import type { DataRepository } from '@/lib/data/repository'
import type { NotificationType } from '@/lib/notifications'

/**
 * A stand-in for the external service, backed by the in-memory adapter.
 *
 * It exists so the HTTP client can run the same contract suite as the local
 * adapters: if a route, verb or payload drifts, the shared expectations fail
 * rather than silently returning the wrong shape at runtime.
 */
export function createFakeApi(): { fetchImpl: typeof fetch; reset: () => void } {
  const repositories = new Map<string, DataRepository>()

  async function repositoryFor(ownerId: string): Promise<DataRepository> {
    let repository = repositories.get(ownerId)
    if (!repository) {
      repository = new MemoryRepository({ ownerId })
      await repository.initialise()
      repositories.set(ownerId, repository)
    }
    return repository
  }

  const fetchImpl: typeof fetch = async (input, init = {}) => {
    const url = new URL(String(input), 'http://api.test')
    const method = (init.method ?? 'GET').toUpperCase()
    const headers = (init.headers ?? {}) as Record<string, string>
    const ownerId = headers['x-owner-id'] ?? 'anonymous'
    const body = init.body ? JSON.parse(String(init.body)) : {}
    const repository = await repositoryFor(ownerId)

    const json = (payload: unknown, status = 200) =>
      new Response(JSON.stringify(payload), {
        status,
        headers: { 'content-type': 'application/json' },
      })

    try {
      const path = url.pathname

      if (path === '/habits' && method === 'GET') {
        return json(await repository.listHabits())
      }
      if (path === '/habits' && method === 'POST') {
        return json(await repository.createHabit(body), 201)
      }

      const completions = path.match(/^\/habits\/([^/]+)\/completions$/)
      if (completions && method === 'POST') {
        const completed = await repository.toggleCompletion(
          decodeURIComponent(completions[1]),
          body.date,
        )
        return json({ completed })
      }

      const habit = path.match(/^\/habits\/([^/]+)$/)
      if (habit && method === 'DELETE') {
        await repository.deleteHabit(decodeURIComponent(habit[1]))
        return new Response(null, { status: 204 })
      }

      if (path === '/journeys/enrollments' && method === 'GET') {
        return json(await repository.listEnrollments())
      }
      if (path === '/journeys/enrollments' && method === 'POST') {
        return json(await repository.startJourney(body.journeyId, body.startedIso), 201)
      }

      if (path === '/preferences/notifications' && method === 'GET') {
        return json(await repository.getNotificationPreferences())
      }
      if (path === '/preferences/notifications' && method === 'PATCH') {
        if (typeof body.enabled === 'boolean') {
          return json(await repository.setNotificationsEnabled(body.enabled))
        }
        const [type, enabled] = Object.entries(body.types ?? {})[0] ?? []
        return json(
          await repository.setNotificationType(type as NotificationType, Boolean(enabled)),
        )
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), { status: 422 })
    }
  }

  return {
    fetchImpl,
    reset: () => {
      repositories.clear()
      __resetMemoryRepository()
    },
  }
}
