import {
  __resetJourneyStore,
  journeyContent,
  journeyProgress,
  listEnrollments,
  listJourneys,
  getJourney,
  recommendJourneys,
  startJourney,
  toJourneyViews,
} from '@/lib/journeys'
import type { Habit } from '@/types/habit'
import type { Journey } from '@/types/journey'

const USER = 'test-user'

function habit(accent: Habit['accent'], id = accent): Habit {
  return {
    id,
    userId: USER,
    name: id,
    shortName: id,
    icon: '⭐',
    accent,
    durationMinutes: 10,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    remindersEnabled: false,
    completedDates: [],
  }
}

function journey(id: string, focus: Habit['accent'][], durationDays: number): Journey {
  return {
    id,
    icon: '🎯',
    accent: focus[0] ?? 'walk',
    level: 'gentle',
    durationDays,
    habitCount: 3,
    focus,
    content: {
      en: { title: `${id} en`, description: 'en description' },
      'pt-BR': { title: `${id} pt`, description: 'pt description' },
      es: { title: `${id} es`, description: 'es description' },
    },
  }
}

beforeEach(() => __resetJourneyStore())

describe('listJourneys', () => {
  it('returns the catalogue', async () => {
    const journeys = await listJourneys()
    expect(journeys.length).toBeGreaterThan(0)
    expect(getJourney(journeys[0].id)).not.toBeNull()
  })

  it('returns copies, so callers cannot edit the catalogue', async () => {
    const [first] = await listJourneys()
    first.durationDays = 999

    const [again] = await listJourneys()
    expect(again.durationDays).not.toBe(999)
  })

  it('has no journey without a translation', async () => {
    const journeys = await listJourneys()
    journeys.forEach((entry) => {
      expect(journeyContent(entry, 'pt-BR').title).toBeTruthy()
      expect(journeyContent(entry, 'es').description).toBeTruthy()
    })
  })
})

describe('journeyContent', () => {
  it('falls back to the default language when a translation is missing', () => {
    const partial = journey('partial', ['water'], 7)
    // @ts-expect-error — simulating a record that predates a new language.
    delete partial.content.es

    expect(journeyContent(partial, 'es').title).toBe('partial en')
  })
})

describe('recommendJourneys', () => {
  const catalogue = [
    journey('water-long', ['water'], 30),
    journey('walk-short', ['walk'], 7),
    journey('meditate', ['meditate'], 14),
  ]

  it('prefers journeys that build on the habits the user keeps', () => {
    const result = recommendJourneys(catalogue, [habit('water')], 1)
    expect(result.map((entry) => entry.id)).toEqual(['water-long'])
  })

  it('falls back to the shortest journeys for a user with no habits', () => {
    const result = recommendJourneys(catalogue, [], 2)
    expect(result.map((entry) => entry.id)).toEqual(['walk-short', 'meditate'])
  })

  it('never returns more than the limit', () => {
    expect(recommendJourneys(catalogue, [habit('water')], 2)).toHaveLength(2)
  })
})

describe('enrollment', () => {
  it('records the start date', () => {
    const enrollment = startJourney(USER, 'hydration-reset', new Date(2026, 2, 10))

    expect(enrollment.startedIso).toBe('2026-03-10')
    expect(listEnrollments(USER)).toHaveLength(1)
  })

  it('keeps the original start date when started again', () => {
    startJourney(USER, 'hydration-reset', new Date(2026, 2, 10))
    const again = startJourney(USER, 'hydration-reset', new Date(2026, 2, 20))

    expect(again.startedIso).toBe('2026-03-10')
    expect(listEnrollments(USER)).toHaveLength(1)
  })

  it('keeps users apart', () => {
    startJourney(USER, 'hydration-reset', new Date(2026, 2, 10))
    expect(listEnrollments('someone-else')).toHaveLength(0)
  })
})

describe('journeyProgress', () => {
  const enrollment = { journeyId: 'x', startedIso: '2026-03-10' }

  it('counts the start day as day 1', () => {
    expect(journeyProgress(enrollment, 14, new Date(2026, 2, 10))).toEqual({
      day: 1,
      total: 14,
      percentage: 7,
    })
  })

  it('advances a day at a time', () => {
    expect(journeyProgress(enrollment, 14, new Date(2026, 2, 13)).day).toBe(4)
  })

  it('never runs past the end of the journey', () => {
    expect(journeyProgress(enrollment, 14, new Date(2026, 5, 1))).toMatchObject({
      day: 14,
      percentage: 100,
    })
  })
})

describe('toJourneyViews', () => {
  const catalogue = [journey('a', ['water'], 10), journey('b', ['walk'], 20)]

  it('resolves copy, recommendations and progress for one user', () => {
    const views = toJourneyViews(catalogue, {
      locale: 'pt-BR',
      recommendedIds: ['b'],
      enrollments: [{ journeyId: 'a', startedIso: '2026-03-10' }],
      today: new Date(2026, 2, 12),
    })

    expect(views[0]).toMatchObject({
      id: 'a',
      title: 'a pt',
      recommended: false,
      progress: { day: 3, total: 10 },
    })
    expect(views[1]).toMatchObject({ id: 'b', recommended: true, progress: null })
  })
})
