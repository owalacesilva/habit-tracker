import {
  formatDuration,
  formatLongDate,
  greeting,
  isSameDay,
  parseISODate,
  startOfWeek,
  toISODate,
  toWeekday,
  weekdayInitials,
  weekdayLabels,
  weekStrip,
} from '@/lib/date'

// Monday 10 March 2025 is a Monday; the reference design shows Thursday 13th.
const MONDAY = new Date(2025, 2, 10, 9, 0, 0)
const THURSDAY = new Date(2025, 2, 13, 9, 0, 0)

describe('toISODate', () => {
  it('formats using local time, not UTC', () => {
    expect(toISODate(new Date(2025, 0, 5, 23, 30))).toBe('2025-01-05')
  })

  it('zero-pads month and day', () => {
    expect(toISODate(new Date(2025, 8, 7))).toBe('2025-09-07')
  })
})

describe('parseISODate', () => {
  it('parses a valid yyyy-mm-dd string', () => {
    expect(toISODate(parseISODate('2025-03-13'))).toBe('2025-03-13')
  })

  it.each([undefined, '', 'not-a-date', '2025-3-1'])('falls back to now for %p', (input) => {
    expect(parseISODate(input, THURSDAY)).toBe(THURSDAY)
  })
})

describe('toWeekday', () => {
  it('treats Monday as 0 and Sunday as 6', () => {
    expect(toWeekday(MONDAY)).toBe(0)
    expect(toWeekday(THURSDAY)).toBe(3)
    expect(toWeekday(new Date(2025, 2, 16))).toBe(6)
  })
})

describe('startOfWeek', () => {
  it('rewinds to the preceding Monday', () => {
    expect(toISODate(startOfWeek(THURSDAY))).toBe('2025-03-10')
  })

  it('is a no-op on a Monday', () => {
    expect(toISODate(startOfWeek(MONDAY))).toBe('2025-03-10')
  })
})

describe('weekStrip', () => {
  const strip = weekStrip(THURSDAY)

  it('returns seven Monday-first days', () => {
    expect(strip).toHaveLength(7)
    expect(strip[0].label).toBe('Mon')
    expect(strip[6].label).toBe('Sun')
  })

  it('spans the full calendar week', () => {
    expect(strip.map((day) => day.dayOfMonth)).toEqual([10, 11, 12, 13, 14, 15, 16])
  })
})

describe('greeting', () => {
  it.each([
    [8, 'Morning'],
    [11, 'Morning'],
    [12, 'Afternoon'],
    [17, 'Afternoon'],
    [18, 'Evening'],
    [23, 'Evening'],
  ])('is %s → %s', (hour, expected) => {
    expect(greeting(new Date(2025, 2, 13, hour))).toBe(expected)
  })
})

describe('formatLongDate', () => {
  it('matches the design header format', () => {
    expect(formatLongDate(THURSDAY)).toBe('Thursday, 13 March 2025')
  })
})

describe('formatDuration', () => {
  it.each([
    [30, '30m'],
    [60, '1h'],
    [450, '7h 30m'],
  ])('%d minutes → %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected)
  })
})

describe('isSameDay', () => {
  it('ignores the time component', () => {
    expect(isSameDay(new Date(2025, 2, 13, 1), new Date(2025, 2, 13, 23))).toBe(true)
    expect(isSameDay(MONDAY, THURSDAY)).toBe(false)
  })
})

describe('week start preference', () => {
  it('rewinds to the preceding Sunday when the week starts on Sunday', () => {
    expect(toISODate(startOfWeek(THURSDAY, 6))).toBe('2025-03-09')
  })

  it('reorders the strip without changing the weekday indexes', () => {
    const strip = weekStrip(THURSDAY, 6)

    expect(strip.map((day) => day.dayOfMonth)).toEqual([9, 10, 11, 12, 13, 14, 15])
    // Sunday keeps its canonical Monday-first index of 6.
    expect(strip[0].weekday).toBe(6)
    expect(strip[1].weekday).toBe(0)
  })
})

describe('weekday names', () => {
  it('falls back to English short names without a locale', () => {
    expect(weekdayLabels()).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
  })

  it('translates the short names, Monday first', () => {
    const labels = weekdayLabels('pt-BR')

    expect(labels).toHaveLength(7)
    expect(labels[0].toLowerCase()).toContain('seg')
    expect(labels[6].toLowerCase()).toContain('dom')
  })

  it('gives single letters for the repeat picker', () => {
    expect(weekdayInitials('en')).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
    expect(weekdayInitials('pt-BR')).toHaveLength(7)
  })
})

describe('formatLongDate in other languages', () => {
  it('uses the day-first order for English, as the design does', () => {
    expect(formatLongDate(THURSDAY, 'en')).toBe('Thursday, 13 March 2025')
  })

  it('formats in the requested language', () => {
    expect(formatLongDate(THURSDAY, 'pt-BR')).toContain('mar')
    expect(formatLongDate(THURSDAY, 'es')).toContain('marzo')
  })
})
