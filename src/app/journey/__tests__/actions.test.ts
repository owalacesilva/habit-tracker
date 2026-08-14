/**
 * @jest-environment node
 */
import { startJourneyAction } from '@/app/journey/actions'
import { __resetJourneyStore, listEnrollments } from '@/lib/journeys'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/auth', () => ({
  requireUser: jest.fn().mockResolvedValue({ id: 'test-user', name: 'Budi' }),
}))

const { revalidatePath } = jest.requireMock('next/cache')

function formData(journeyId?: string) {
  const data = new FormData()
  if (journeyId !== undefined) data.append('journeyId', journeyId)
  return data
}

beforeEach(() => {
  jest.clearAllMocks()
  __resetJourneyStore()
})

describe('startJourneyAction', () => {
  it('enrols the signed-in user and refreshes the screen', async () => {
    await startJourneyAction(formData('hydration-reset'))

    expect(listEnrollments('test-user')).toHaveLength(1)
    expect(revalidatePath).toHaveBeenCalledWith('/journey')
  })

  it('is safe to submit twice', async () => {
    await startJourneyAction(formData('hydration-reset'))
    await startJourneyAction(formData('hydration-reset'))

    expect(listEnrollments('test-user')).toHaveLength(1)
  })

  it('rejects a journey that does not exist', async () => {
    await expect(startJourneyAction(formData('not-a-journey'))).rejects.toThrow(/Unknown journey/)
    expect(listEnrollments('test-user')).toHaveLength(0)
  })

  it('rejects a missing id', async () => {
    await expect(startJourneyAction(formData())).rejects.toThrow(/Unknown journey/)
  })
})
