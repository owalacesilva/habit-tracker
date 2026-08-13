import { signOut } from '@/auth'
import { Button } from '@/components/ui/button'

export interface SignOutButtonProps {
  label: string
}

export function SignOutButton({ label }: SignOutButtonProps) {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/login' })
      }}
    >
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        className="border border-sand-200 text-brand-700 shadow-none"
      >
        {label}
      </Button>
    </form>
  )
}
