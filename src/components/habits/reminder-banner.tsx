import { BellIllustration } from '@/components/icons'
import { Button } from '@/components/ui/button'

export interface ReminderBannerProps {
  labels: {
    title: string
    body: string
    cta: string
  }
}

/** Peach promo card nudging the user to switch reminders on. */
export function ReminderBanner({ labels }: ReminderBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-card bg-peach px-5 py-4">
      <div className="max-w-[62%]">
        <h2 className="text-base font-bold text-ink">{labels.title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink/75">{labels.body}</p>
        <Button variant="dark" size="sm" className="mt-3">
          {labels.cta}
        </Button>
      </div>
      <BellIllustration className="absolute right-3 -bottom-2 h-24 w-24" />
    </section>
  )
}
