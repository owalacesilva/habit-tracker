import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'dark' | 'ghost' | 'icon'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const buttonVariants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-fab',
  dark: 'bg-ink text-white hover:bg-ink/90',
  ghost: 'bg-surface text-ink hover:bg-sand-100',
  icon: 'bg-surface text-ink hover:bg-sand-100 h-11 w-11 p-0',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-12 px-5 text-sm',
  lg: 'h-14 px-6 text-base',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-60',
        buttonVariants[variant],
        variant !== 'icon' && sizes[size],
        className,
      )}
      {...props}
    />
  )
}
