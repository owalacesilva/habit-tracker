'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/states'
import { useDictionary } from '@/lib/i18n/client'

export interface RouteErrorProps {
  error: Error & { digest?: string }
  /** Re-renders the segment; provided by the Next.js error boundary. */
  reset: () => void
}

/** Shared body for every route's `error.tsx`, so failures look the same. */
export function RouteError({ error, reset }: RouteErrorProps) {
  const t = useDictionary()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="app-shell app-shell-nav justify-center px-5 py-10">
      <ErrorState
        title={t.common.errorTitle}
        body={t.common.errorBody}
        action={
          <Button size="sm" onClick={reset}>
            {t.common.retry}
          </Button>
        }
      />
    </main>
  )
}
