import { NextResponse } from 'next/server'
import { phoneSchema } from '@/lib/auth/schemas'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { phone, countryCode } = body

  // Validate phone input
  const parsed = phoneSchema.safeParse({ phone, countryCode })
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Invalid phone number'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const isMockMode = process.env.MOCK_OTP_AUTO_BYPASS !== 'false'

  if (isMockMode) {
    return NextResponse.json({ success: true, mock: true })
  }

  // Real mode: send OTP via Supabase
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    phone: countryCode + phone,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, mock: false })
}
