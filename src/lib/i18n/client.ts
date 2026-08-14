'use client'

import { useSyncExternalStore } from 'react'

import { type Dictionary, getDictionary } from '@/lib/i18n'
import { DEFAULT_LOCALE, parseLocale } from '@/lib/i18n/config'

const subscribe = () => () => {}

/**
 * Dictionary for client-only trees such as error boundaries, which cannot read
 * cookies on the server. The language is taken from `<html lang>`, which the
 * root layout already renders; `useSyncExternalStore`'s server snapshot keeps
 * hydration free of mismatches.
 */
export function useDictionary(): Dictionary {
  const locale = useSyncExternalStore(
    subscribe,
    () => document.documentElement.lang,
    () => DEFAULT_LOCALE,
  )

  return getDictionary(parseLocale(locale))
}
