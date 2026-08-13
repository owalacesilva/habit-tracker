'use client'

import { type ReactNode, useState } from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'

export interface ShareButtonLabels {
  /** Shown after falling back to the clipboard. */
  copied: string
  /** Shown when neither sharing nor the clipboard is available. */
  failed: string
}

export interface ShareButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  title: string
  text: string
  /** Defaults to the current page. */
  url?: string
  labels: ShareButtonLabels
  children: ReactNode
}

/**
 * Uses the platform share sheet (`navigator.share`) where it exists — Android,
 * iOS and installed PWAs — and degrades to the clipboard on desktop browsers.
 */
export function ShareButton({ title, text, url, labels, children, ...props }: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function share() {
    const shareUrl = url ?? (typeof window === 'undefined' ? '' : window.location.origin)
    const data = { title, text, url: shareUrl }

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(data)
        setStatus('idle')
        return
      } catch {
        // The user dismissed the sheet, or the browser refused — fall through.
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${shareUrl}`.trim())
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Button {...props} onClick={share}>
        {children}
      </Button>
      <p aria-live="polite" className="text-center text-[11px] text-ink-muted empty:hidden">
        {status === 'copied' ? labels.copied : status === 'failed' ? labels.failed : ''}
      </p>
    </div>
  )
}
