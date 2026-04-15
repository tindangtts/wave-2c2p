import { NextResponse } from 'next/server'
import { db } from '@/db'
import { systemConfig } from '@/db/schema'
import { inArray } from 'drizzle-orm'

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0'

function semverGt(a: string, b: string): boolean {
  const parse = (v: string) =>
    v
      .replace(/^"/, '')
      .replace(/"$/, '')
      .split('.')
      .map(Number)
  const [aMaj, aMin, aPat] = parse(a)
  const [bMaj, bMin, bPat] = parse(b)
  if (aMaj !== bMaj) return aMaj > bMaj
  if (aMin !== bMin) return aMin > bMin
  return aPat > bPat
}

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(systemConfig)
      .where(
        inArray(systemConfig.key, [
          'maintenance_mode',
          'min_version',
          'recommended_version',
        ])
      )

    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    const maintenance = map['maintenance_mode'] === 'true'
    const minVersion = map['min_version'] ?? '"0.1.0"'
    const recommendedVersion = map['recommended_version'] ?? '"0.1.0"'

    const hardUpdate = semverGt(minVersion, APP_VERSION)
    const softUpdate = !hardUpdate && semverGt(recommendedVersion, APP_VERSION)

    return NextResponse.json({ maintenance, hardUpdate, softUpdate })
  } catch (err) {
    console.error('[system-status] DB error:', err)
    // Fail open — don't block the app if system_config is unavailable
    return NextResponse.json({ maintenance: false, hardUpdate: false, softUpdate: false })
  }
}
