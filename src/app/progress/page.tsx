import { permanentRedirect } from 'next/navigation'

/**
 * Statistics moved into History when the app gained its four-destination
 * navigation. Kept so old links (and any installed PWA shortcut) still work.
 */
export default function ProgressPage() {
  permanentRedirect('/history?tab=statistics')
}
