import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface SettingsSectionProps {
  id: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}

/** Titled group of rows — the unit every settings block is built from. */
export function SettingsSection({
  id,
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section aria-labelledby={id} className={cn('flex flex-col gap-2', className)}>
      <div className="px-1">
        <h2 id={id} className="font-bold text-ink text-sm">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-ink-muted text-xs">{description}</p>}
      </div>
      <div className="card divide-y divide-sand-200 overflow-hidden">{children}</div>
    </section>
  )
}

export interface SettingsRowProps {
  label: string
  description?: string
  /** Leading icon, usually one of the shared SVG icons. */
  icon?: ReactNode
  /** Trailing control: switch, chevron, badge… */
  control?: ReactNode
  /** Renders the row as a link when set. */
  href?: string
  /** Opens in a new tab — external links only. */
  external?: boolean
  disabled?: boolean
  /** Full-width content below the label, e.g. a choice group. */
  children?: ReactNode
}

/**
 * One setting. Keeps label, description and control aligned across every
 * section, and grows in height rather than truncating when translated.
 */
export function SettingsRow({
  label,
  description,
  icon,
  control,
  href,
  external = false,
  disabled = false,
  children,
}: SettingsRowProps) {
  const body = (
    <>
      <div className="flex items-start gap-3">
        {icon && (
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sand-100 text-ink-muted"
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-balance font-medium text-ink text-sm">{label}</p>
          {description && <p className="mt-0.5 text-ink-muted text-xs">{description}</p>}
        </div>
        {control && <div className="flex shrink-0 items-center">{control}</div>}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        className={cn(
          'block min-h-11 px-4 py-3.5 transition-colors hover:bg-sand-50',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        {body}
      </a>
    )
  }

  return (
    <div className={cn('min-h-11 px-4 py-3.5', disabled && 'opacity-50')} aria-disabled={disabled}>
      {body}
    </div>
  )
}
