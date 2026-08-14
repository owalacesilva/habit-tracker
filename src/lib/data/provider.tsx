'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { createRepository } from '@/lib/data/factory'
import { localOwnerId } from '@/lib/data/owner'
import type { DataRepository } from '@/lib/data/repository'
import {
  defaultPreferences,
  type NotificationPreferences,
  type NotificationType,
} from '@/lib/notifications'
import type { Habit, NewHabitInput } from '@/types/habit'
import type { JourneyEnrollment } from '@/types/journey'

export type DataStatus = 'loading' | 'ready' | 'error'

export interface DataContextValue {
  status: DataStatus
  error: Error | null
  habits: Habit[]
  enrollments: JourneyEnrollment[]
  notifications: NotificationPreferences
  reload: () => void
  createHabit: (input: NewHabitInput) => Promise<Habit>
  toggleCompletion: (habitId: string, isoDate: string) => Promise<boolean>
  startJourney: (journeyId: string, startedIso: string) => Promise<void>
  setNotificationsEnabled: (enabled: boolean) => Promise<void>
  setNotificationType: (type: NotificationType, enabled: boolean) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

/** The owner id never changes underneath us; there is nothing to subscribe to. */
const subscribeToNothing = () => () => {}

export interface DataProviderProps {
  /** Session user id in API mode; `null` means "resolve a local device id". */
  ownerId?: string | null
  /** Injected by tests; otherwise built from NEXT_PUBLIC_DATA_SOURCE. */
  repository?: DataRepository
  children: ReactNode
}

/**
 * Owns the client-side data layer.
 *
 * Everything user-owned — habits, journey enrolment, notification preferences —
 * is read and written here through `DataRepository`, so the screens neither know
 * nor care whether the records come from IndexedDB or an external API.
 */
export function DataProvider({ ownerId = null, repository, children }: DataProviderProps) {
  const [status, setStatus] = useState<DataStatus>('loading')
  const [error, setError] = useState<Error | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [enrollments, setEnrollments] = useState<JourneyEnrollment[]>([])
  const [notifications, setNotifications] = useState<NotificationPreferences>(defaultPreferences())
  const [reloadCount, setReloadCount] = useState(0)

  // The device id lives in localStorage, which does not exist during SSR. The
  // server snapshot keeps hydration free of mismatches; the id is stable once
  // written, so repeated reads return the same value.
  const resolvedOwner = useSyncExternalStore(
    subscribeToNothing,
    () => ownerId ?? localOwnerId(window.localStorage),
    () => ownerId,
  )

  const instance = useMemo(() => {
    if (repository) return repository
    if (!resolvedOwner) return null
    return createRepository({ ownerId: resolvedOwner })
  }, [repository, resolvedOwner])

  // Mirrors the latest habits so an optimistic write can roll back without
  // making every callback depend on the list.
  const habitsRef = useRef<Habit[]>([])
  useEffect(() => {
    habitsRef.current = habits
  }, [habits])

  /**
   * Guards against a slow answer from a previous repository — or one that
   * arrives after unmount — overwriting fresher state.
   */
  const loadId = useRef(0)

  useEffect(() => {
    if (!instance) return

    loadId.current += 1
    const id = loadId.current
    // Read so the retry counter is a genuine dependency of this effect.
    void reloadCount

    // Nothing is set synchronously here: a setState in an effect body cascades
    // renders. The provider already starts in its loading state, and the retry
    // handler resets it before bumping the counter.
    ;(async () => {
      try {
        await instance.initialise()
        const [loadedHabits, loadedEnrollments, loadedNotifications] = await Promise.all([
          instance.listHabits(),
          instance.listEnrollments(),
          instance.getNotificationPreferences(),
        ])

        if (id !== loadId.current) return
        setHabits(loadedHabits)
        setEnrollments(loadedEnrollments)
        setNotifications(loadedNotifications)
        setError(null)
        setStatus('ready')
      } catch (caught) {
        if (id !== loadId.current) return
        setError(caught instanceof Error ? caught : new Error(String(caught)))
        setStatus('error')
      }
    })()

    return () => {
      loadId.current += 1
    }
  }, [instance, reloadCount])

  const reload = useCallback(() => {
    setStatus('loading')
    setError(null)
    setReloadCount((count) => count + 1)
  }, [])

  const createHabit = useCallback(
    async (input: NewHabitInput) => {
      if (!instance) throw new Error('The data layer is not ready yet')

      const created = await instance.createHabit(input)
      setHabits((current) => [...current, created])
      return created
    },
    [instance],
  )

  const toggleCompletion = useCallback(
    async (habitId: string, isoDate: string) => {
      if (!instance) throw new Error('The data layer is not ready yet')

      // Optimistic: the tick has to feel instant, even on a cold IndexedDB.
      const previous = habitsRef.current
      setHabits((current) =>
        current.map((habit) =>
          habit.id === habitId
            ? {
                ...habit,
                completedDates: habit.completedDates.includes(isoDate)
                  ? habit.completedDates.filter((entry) => entry !== isoDate)
                  : [...habit.completedDates, isoDate],
              }
            : habit,
        ),
      )

      try {
        const completed = await instance.toggleCompletion(habitId, isoDate)
        setHabits(await instance.listHabits())
        return completed
      } catch (caught) {
        setHabits(previous)
        throw caught
      }
    },
    [instance],
  )

  const startJourney = useCallback(
    async (journeyId: string, startedIso: string) => {
      if (!instance) throw new Error('The data layer is not ready yet')

      await instance.startJourney(journeyId, startedIso)
      setEnrollments(await instance.listEnrollments())
    },
    [instance],
  )

  const setNotificationsEnabled = useCallback(
    async (enabled: boolean) => {
      if (!instance) throw new Error('The data layer is not ready yet')

      setNotifications((current) => ({ ...current, enabled }))
      setNotifications(await instance.setNotificationsEnabled(enabled))
    },
    [instance],
  )

  const setNotificationType = useCallback(
    async (type: NotificationType, enabled: boolean) => {
      if (!instance) throw new Error('The data layer is not ready yet')

      setNotifications((current) => ({ ...current, types: { ...current.types, [type]: enabled } }))
      setNotifications(await instance.setNotificationType(type, enabled))
    },
    [instance],
  )

  const value = useMemo<DataContextValue>(
    () => ({
      status,
      error,
      habits,
      enrollments,
      notifications,
      reload,
      createHabit,
      toggleCompletion,
      startJourney,
      setNotificationsEnabled,
      setNotificationType,
    }),
    [
      status,
      error,
      habits,
      enrollments,
      notifications,
      reload,
      createHabit,
      toggleCompletion,
      startJourney,
      setNotificationsEnabled,
      setNotificationType,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const value = useContext(DataContext)
  if (!value) throw new Error('useData must be used inside <DataProvider>')
  return value
}

/** Habits plus the two writes screens perform on them. */
export function useHabits() {
  const { habits, status, error, reload, createHabit, toggleCompletion } = useData()
  return { habits, status, error, reload, createHabit, toggleCompletion }
}

export function useJourneyEnrollments() {
  const { enrollments, status, error, reload, startJourney } = useData()
  return { enrollments, status, error, reload, startJourney }
}

export function useNotificationPreferences() {
  const { notifications, status, setNotificationsEnabled, setNotificationType } = useData()
  return { notifications, status, setNotificationsEnabled, setNotificationType }
}
