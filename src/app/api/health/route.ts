import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Probed by the Docker HEALTHCHECK — keep it dependency-free and cheap. */
export function GET() {
  return NextResponse.json({ status: 'ok', uptime: Math.round(process.uptime()) })
}
