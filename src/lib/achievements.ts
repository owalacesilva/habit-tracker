import { toISODate, toWeekday } from '@/lib/date'
import { currentStreak } from '@/lib/habits'
import type { Habit } from '@/types/habit'

export const ACHIEVEMENT_IDS = [
  'firstStep',
  'weekWarrior',
  'halfCentury',
  'routineBuilder',
  'earlyBird',
] as const

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number]

export interface Achievement {
  id: AchievementId
  icon: string
  /** Progress towards `target`, clamped so the UI never shows 8/7. */
  current: number
  target: number
  unlocked: boolean
}

const ICONS: Record<AchievementId, string> = {
  firstStep: '👣',
  weekWarrior: '🔥',
  halfCentury: '🏅',
  routineBuilder: '🧱',
  earlyBird: '🌅',
}

/** How many days back `earlyBird` looks for a fully completed day. */
const PERFECT_DAY_WINDOW = 30

function totalCompletions(habits: Habit[]): number {
  return habits.reduce((total, habit) => total + habit.completedDates.length, 0)
}

function bestStreak(habits: Habit[], today: Date): number {
  return habits.reduce((best, habit) => Math.max(best, currentStreak(habit, today)), 0)
}

/** A day where every scheduled habit was ticked (and at least one was due). */
export function hasPerfectDay(habits: Habit[], today: Date, window = PERFECT_DAY_WINDOW): boolean {
  if (habits.length === 0) return false

  for (let offset = 0; offset < window; offset += 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    const iso = toISODate(date)
    const weekday = toWeekday(date)

    const scheduled = habits.filter((habit) => habit.repeatDays.includes(weekday))
    if (scheduled.length === 0) continue

    if (scheduled.every((habit) => habit.completedDates.includes(iso))) return true
  }

  return false
}

function achievement(
  id: AchievementId,
  current: number,
  target: number,
  unlocked = current >= target,
): Achievement {
  return { id, icon: ICONS[id], current: Math.min(current, target), target, unlocked }
}

/** Derived from habit data — nothing extra to persist. */
export function computeAchievements(habits: Habit[], today: Date = new Date()): Achievement[] {
  const completions = totalCompletions(habits)

  return [
    achievement('firstStep', Math.min(completions, 1), 1),
    achievement('weekWarrior', bestStreak(habits, today), 7),
    achievement('halfCentury', completions, 50),
    achievement('routineBuilder', habits.length, 4),
    achievement('earlyBird', hasPerfectDay(habits, today) ? 1 : 0, 1),
  ]
}

export function unlockedCount(achievements: Achievement[]): number {
  return achievements.filter((entry) => entry.unlocked).length
}
