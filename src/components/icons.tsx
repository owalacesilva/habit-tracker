import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
} as const

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2.6} aria-hidden {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2.4} aria-hidden {...props}>
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2.2} aria-hidden {...props}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  )
}

export function ChartIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <path d="M6 19V11M12 19V5M18 19v-5" />
    </svg>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
      <path d="M8 3.5v4M16 3.5v4M3.5 10.5h17" />
    </svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden {...props}>
      <path d="m7 10 5 5 5-5" />
    </svg>
  )
}

/** Ringing bell used by the reminder banner. */
export function BellIllustration(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden {...props}>
      <path
        d="M32 8c-9 0-15 6.4-15 15.5 0 9-2.2 12.4-4.6 15.2-1.3 1.5-.3 3.8 1.7 3.8h35.8c2 0 3-2.3 1.7-3.8C49.2 35.9 47 32.5 47 23.5 47 14.4 41 8 32 8Z"
        fill="#FF6B00"
      />
      <path
        d="M25.5 47.5a6.5 6.5 0 0 0 13 0"
        stroke="#BF4E00"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M32 4.5V8" stroke="#BF4E00" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M53 18c2 2 3 4.5 3 7M56 12c3 3 4.5 7 4.5 11M11 18c-2 2-3 4.5-3 7M8 12c-3 3-4.5 7-4.5 11"
        stroke="#8FAF33"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Calendar mascot shown at the top of the "New habit" sheet. */
export function NewHabitIllustration(props: IconProps) {
  return (
    <svg viewBox="0 0 160 140" fill="none" aria-hidden {...props}>
      <path
        d="M44 30c-6-4-10-10-8-16 1.5-4.5 7-5 8 0 .8 4-2 6-5 5"
        stroke="#E8A33D"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect x="34" y="30" width="92" height="86" rx="14" fill="#8FC33A" />
      <rect x="44" y="44" width="72" height="58" rx="8" fill="#FDFBF6" />
      <rect x="42" y="20" width="10" height="18" rx="5" fill="#8FC33A" />
      <rect x="108" y="20" width="10" height="18" rx="5" fill="#8FC33A" />
      <g fill="#2F1F17">
        <rect x="53" y="54" width="12" height="12" rx="3" />
        <rect x="74" y="54" width="12" height="12" rx="3" />
        <rect x="95" y="54" width="12" height="12" rx="3" />
        <rect x="53" y="75" width="12" height="12" rx="3" />
        <rect x="74" y="75" width="12" height="12" rx="3" />
      </g>
      <rect x="95" y="75" width="12" height="12" rx="3" fill="#8FC33A" />
      <path
        d="M132 24c3-3 6-4 9-4M136 38c4-1 7-3 9-6M130 12c1-3 1-6 0-9"
        stroke="#EE7FD0"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
