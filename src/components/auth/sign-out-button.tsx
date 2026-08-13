import { signOut } from '@/auth'

export function SignOutButton() {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/login' })
      }}
    >
      <button type="submit" className="text-xs font-medium text-ink-muted hover:text-ink">
        Sign out
      </button>
    </form>
  )
}
