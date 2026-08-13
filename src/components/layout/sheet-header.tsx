import Link from 'next/link'
import { CloseIcon } from '@/components/icons'

export interface SheetHeaderProps {
  title: string
  /** Where the close button navigates to. */
  closeHref?: string
}

/** Full-screen sheet header: large title on the left, close button on the right. */
export function SheetHeader({ title, closeHref = '/' }: SheetHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <h1 className="text-3xl leading-tight font-bold text-ink">{title}</h1>
      <Link
        href={closeHref}
        aria-label="Close"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-card transition-colors hover:bg-sand-100"
      >
        <CloseIcon className="h-5 w-5" />
      </Link>
    </header>
  )
}
