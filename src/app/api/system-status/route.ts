import { NextResponse } from 'next/server'

export async function GET() {
  const maintenance = process.env.SYSTEM_MAINTENANCE === 'true'
  const updateRequired = process.env.SYSTEM_UPDATE_REQUIRED === 'true'

  return NextResponse.json({ maintenance, updateRequired })
}
