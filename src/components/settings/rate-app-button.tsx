'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'

export interface RateAppButtonProps {
  /** Store listing to open. Empty until the app is published. */
  storeUrl?: string
  labels: {
    action: string
    unavailable: string
  }
}

/**
 * Opens the platform's store listing, which is where both Android and iOS
 * surface their native rating prompt for an installed PWA. Without a
 * configured listing the button explains itself instead of dead-ending.
 */
export function RateAppButton({ storeUrl, labels }: RateAppButtonProps) {
  const [showHint, setShowHint] = useState(false)

  if (storeUrl) {
    return (
      <Button
        size="sm"
        variant="ghost"
        className="border border-sand-200 shadow-none"
        onClick={() => window.open(storeUrl, '_blank', 'noopener,noreferrer')}
      >
        {labels.action}
      </Button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="ghost"
        className="border border-sand-200 shadow-none"
        onClick={() => setShowHint(true)}
      >
        {labels.action}
      </Button>
      <p aria-live="polite" className="max-w-56 text-right text-[11px] text-ink-muted empty:hidden">
        {showHint ? labels.unavailable : ''}
      </p>
    </div>
  )
}
