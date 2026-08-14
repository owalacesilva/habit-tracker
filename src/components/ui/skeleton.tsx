'use client'

import RawSkeleton, { type SkeletonProps } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import { cn } from '@/lib/utils'

export type { SkeletonProps }

/**
 * Themed wrapper around `react-loading-skeleton`.
 *
 * The library reads React context, so it needs a client boundary. Its stylesheet
 * declares `--base-color` on `.react-loading-skeleton` itself, which would beat
 * anything we set on `:root` — so the design tokens are passed as props, which
 * the library writes as inline custom properties. They resolve at paint time,
 * so the placeholders follow light and dark like every other surface.
 */
export function Skeleton({
  className,
  containerClassName,
  borderRadius = 'var(--radius-pill)',
  ...props
}: SkeletonProps) {
  return (
    <RawSkeleton
      baseColor="var(--color-skeleton)"
      highlightColor="var(--color-skeleton-highlight)"
      borderRadius={borderRadius}
      // Slow enough to read as "working", not as a strobe.
      duration={1.6}
      // Without this the library separates placeholders with <br/>, which
      // fights the flex and grid layouts these are dropped into.
      inline
      className={cn('block', className)}
      containerClassName={cn('leading-none', containerClassName)}
      {...props}
    />
  )
}

/** A single line of placeholder text. `width` accepts any CSS length. */
export function SkeletonText({
  width = '100%',
  height = 12,
  className,
}: {
  width?: string | number
  height?: number
  className?: string
}) {
  return <Skeleton width={width} height={height} className={className} />
}

/** Square placeholder for the rounded icon tiles used across the app. */
export function SkeletonTile({ size = 44 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius="1rem" />
}
