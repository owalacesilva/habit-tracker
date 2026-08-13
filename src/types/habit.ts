/** 0 = Monday … 6 = Sunday (the week starts on Monday in the UI). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** Pastel tile behind a habit icon — keys map to `theme.colors.habit`. */
export type HabitAccent = 'water' | 'meditate' | 'stretch' | 'walk'

export interface Habit {
  id: string
  userId: string
  name: string
  /** One-word label for tight spots such as the progress chart. */
  shortName: string
  /** Emoji used as the habit glyph until real illustrations land. */
  icon: string
  accent: HabitAccent
  durationMinutes: number
  repeatDays: Weekday[]
  remindersEnabled: boolean
  /** ISO `yyyy-mm-dd` strings, one per completed day. */
  completedDates: string[]
}

export interface NewHabitInput {
  name: string
  shortName?: string
  icon?: string
  accent?: HabitAccent
  durationMinutes?: number
  repeatDays?: Weekday[]
  remindersEnabled?: boolean
}

/** Column colours available to the progress chart (see `--color-chart-*`). */
export type ChartTone = 'walking' | 'running' | 'meditation' | 'drink'

export interface HabitProgress {
  label: string
  percentage: number
  tone: ChartTone
}
