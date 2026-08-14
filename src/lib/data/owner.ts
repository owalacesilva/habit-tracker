export const OWNER_STORAGE_KEY = 'habit_owner_id'

/**
 * Identity in local mode.
 *
 * There is no server to authenticate against, so the data belongs to the
 * device. The id is generated once and kept in localStorage — clearing site
 * data starts a fresh routine, which is the honest behaviour for an app that
 * stores everything locally.
 */
export function localOwnerId(storage: Storage): string {
  const existing = storage.getItem(OWNER_STORAGE_KEY)
  if (existing) return existing

  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `local-${Date.now().toString(36)}`

  storage.setItem(OWNER_STORAGE_KEY, id)
  return id
}
