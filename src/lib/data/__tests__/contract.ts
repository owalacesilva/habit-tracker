import type { DataRepository } from '@/lib/data/repository'

export interface ContractHarness {
  /** A repository for the given owner. Called more than once per test to
   *  prove data survives a new instance. */
  create: (ownerId: string) => DataRepository
  /** Drop all stored data between tests. */
  reset: () => Promise<void> | void
}

/**
 * The behaviour every adapter must share.
 *
 * Running one suite against IndexedDB, the in-memory adapter and the HTTP
 * client is what makes `NEXT_PUBLIC_DATA_SOURCE` safe to flip: a screen cannot
 * depend on a quirk of one source.
 */
export function describeRepositoryContract(name: string, harness: ContractHarness) {
  describe(`${name} repository`, () => {
    const OWNER = 'owner-1'

    async function open(ownerId = OWNER): Promise<DataRepository> {
      const repository = harness.create(ownerId)
      await repository.initialise()
      return repository
    }

    beforeEach(async () => {
      await harness.reset()
    })

    describe('habits', () => {
      it('seeds a routine on first use, so the app never opens empty', async () => {
        const repository = await open()
        expect((await repository.listHabits()).length).toBeGreaterThan(0)
      })

      it('creates a habit and reads it back', async () => {
        const repository = await open()
        const created = await repository.createHabit({ name: 'Read ten pages' })

        const habits = await repository.listHabits()
        expect(habits.map((habit) => habit.id)).toContain(created.id)
        expect(habits.find((habit) => habit.id === created.id)).toMatchObject({
          name: 'Read ten pages',
          shortName: 'Read',
          completedDates: [],
        })
      })

      it('toggles a completion on and off', async () => {
        const repository = await open()
        const habit = await repository.createHabit({ name: 'Stretch' })

        await expect(repository.toggleCompletion(habit.id, '2026-03-13')).resolves.toBe(true)
        expect(await completedDates(repository, habit.id)).toEqual(['2026-03-13'])

        await expect(repository.toggleCompletion(habit.id, '2026-03-13')).resolves.toBe(false)
        expect(await completedDates(repository, habit.id)).toEqual([])
      })

      it('keeps other days when one is toggled', async () => {
        const repository = await open()
        const habit = await repository.createHabit({ name: 'Stretch' })

        await repository.toggleCompletion(habit.id, '2026-03-12')
        await repository.toggleCompletion(habit.id, '2026-03-13')
        await repository.toggleCompletion(habit.id, '2026-03-12')

        expect(await completedDates(repository, habit.id)).toEqual(['2026-03-13'])
      })

      it('rejects a habit it does not know', async () => {
        const repository = await open()
        await expect(repository.toggleCompletion('nope', '2026-03-13')).rejects.toThrow()
      })

      it('deletes a habit', async () => {
        const repository = await open()
        const habit = await repository.createHabit({ name: 'Temporary' })

        await repository.deleteHabit(habit.id)

        const habits = await repository.listHabits()
        expect(habits.map((entry) => entry.id)).not.toContain(habit.id)
      })

      it('persists across instances', async () => {
        const first = await open()
        const habit = await first.createHabit({ name: 'Persisted habit' })
        await first.toggleCompletion(habit.id, '2026-03-13')

        const second = await open()
        const stored = (await second.listHabits()).find((entry) => entry.id === habit.id)

        expect(stored).toMatchObject({ name: 'Persisted habit', completedDates: ['2026-03-13'] })
      })

      it('keeps owners apart', async () => {
        const mine = await open('owner-1')
        const created = await mine.createHabit({ name: 'Mine only' })

        const theirs = await open('owner-2')
        const names = (await theirs.listHabits()).map((habit) => habit.name)

        expect(names).not.toContain('Mine only')
        expect((await mine.listHabits()).map((habit) => habit.id)).toContain(created.id)
      })
    })

    describe('journey enrolment', () => {
      it('starts empty', async () => {
        const repository = await open()
        expect(await repository.listEnrollments()).toEqual([])
      })

      it('records a start date', async () => {
        const repository = await open()
        await repository.startJourney('hydration-reset', '2026-03-10')

        expect(await repository.listEnrollments()).toEqual([
          { journeyId: 'hydration-reset', startedIso: '2026-03-10' },
        ])
      })

      it('keeps the original start date when started again', async () => {
        const repository = await open()
        await repository.startJourney('hydration-reset', '2026-03-10')
        const again = await repository.startJourney('hydration-reset', '2026-03-20')

        expect(again.startedIso).toBe('2026-03-10')
        expect(await repository.listEnrollments()).toHaveLength(1)
      })

      it('keeps owners apart', async () => {
        const mine = await open('owner-1')
        await mine.startJourney('hydration-reset', '2026-03-10')

        const theirs = await open('owner-2')
        expect(await theirs.listEnrollments()).toEqual([])
      })
    })

    describe('notification preferences', () => {
      it('starts from the defaults', async () => {
        const repository = await open()

        expect(await repository.getNotificationPreferences()).toEqual({
          enabled: true,
          types: { dailyReminder: true, streakAlert: true, weeklyReport: false },
        })
      })

      it('stores the master switch without losing the types', async () => {
        const repository = await open()
        await repository.setNotificationType('weeklyReport', true)
        const next = await repository.setNotificationsEnabled(false)

        expect(next).toMatchObject({ enabled: false, types: { weeklyReport: true } })
        expect(await repository.getNotificationPreferences()).toMatchObject({ enabled: false })
      })

      it('persists across instances', async () => {
        const first = await open()
        await first.setNotificationType('streakAlert', false)

        const second = await open()
        expect((await second.getNotificationPreferences()).types.streakAlert).toBe(false)
      })
    })
  })
}

async function completedDates(repository: DataRepository, habitId: string): Promise<string[]> {
  const habits = await repository.listHabits()
  return habits.find((habit) => habit.id === habitId)?.completedDates ?? []
}
