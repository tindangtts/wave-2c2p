import { NextResponse } from 'next/server'
import { phoneSchema } from '@/lib/auth/schemas'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/auth/admin'

export async function POST(request: Request) {
  const body = await request.json()
  const { phone, countryCode } = body

  // Validate phone input
  const parsed = phoneSchema.safeParse({ phone, countryCode })
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Invalid phone number'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  // AUTH-04: Check permanently_rejected flag before sending OTP
  // Uses admin client to bypass RLS — phone column stores local digits only
  try {
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('user_profiles')
      .select('permanently_rejected')
      .eq('phone', phone)
      .single()

    if (profile?.permanently_rejected === true) {
      return NextResponse.json({ error: 'permanently_rejected' }, { status: 403 })
    }
  } catch {
    // Profile not found or DB error — allow through (new user flow)
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
