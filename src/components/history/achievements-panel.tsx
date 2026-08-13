import { LockIcon } from '@/components/icons'
import { EmptyState } from '@/components/ui/states'
import type { Achievement, AchievementId } from '@/lib/achievements'
import { format } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export interface AchievementCopy {
  title: string
  body: string
}

export interface AchievementsPanelLabels {
  unlocked: string
  locked: string
  progress: string
  emptyTitle: string
  emptyBody: string
}

export interface AchievementsPanelProps {
  achievements: Achievement[]
  /** Title and body per achievement, resolved from the dictionary. */
  copy: Record<AchievementId, AchievementCopy>
  labels: AchievementsPanelLabels
}

export function AchievementsPanel({ achievements, copy, labels }: AchievementsPanelProps) {
  if (achievements.length === 0) {
    return <EmptyState icon="🏆" title={labels.emptyTitle} body={labels.emptyBody} />
  }

  return (
    <ul className="flex flex-col gap-3">
      {achievements.map((achievement) => {
        const { title, body } = copy[achievement.id]
        const percentage = Math.round((achievement.current / achievement.target) * 100)

        return (
          <li
            key={achievement.id}
            className={cn('card flex items-start gap-3 p-4', !achievement.unlocked && 'opacity-75')}
          >
            <span
              aria-hidden
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg',
                achievement.unlocked ? 'bg-brand-100' : 'bg-sand-100 grayscale',
              )}
            >
              {achievement.unlocked ? (
                achievement.icon
              ) : (
                <LockIcon className="h-5 w-5 text-ink-soft" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
                <p className="text-sm font-semibold text-balance text-ink">{title}</p>
                <span
                  className={cn(
                    'rounded-pill px-2 py-0.5 text-[10px] font-semibold',
                    achievement.unlocked ? 'bg-brand-500 text-white' : 'bg-sand-100 text-ink-muted',
                  )}
                >
                  {achievement.unlocked ? labels.unlocked : labels.locked}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{body}</p>

              {!achievement.unlocked && (
                <div className="mt-2 flex items-center gap-2">
                  <div
                    role="progressbar"
                    aria-valuenow={achievement.current}
                    aria-valuemin={0}
                    aria-valuemax={achievement.target}
                    aria-label={title}
                    className="h-1.5 flex-1 overflow-hidden rounded-pill bg-sand-200"
                  >
                    <span
                      className="block h-full rounded-pill bg-brand-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-ink-muted">
                    {format(labels.progress, {
                      current: achievement.current,
                      target: achievement.target,
                    })}
                  </span>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
