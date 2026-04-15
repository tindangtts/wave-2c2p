import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
const MOCK_OTP = '123456'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, countryCode, otp } = body

    if (!phone || !countryCode || !otp) {
      return NextResponse.json(
        { error: 'Phone, country code, and OTP are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Require authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Mock OTP verification: only "123456" succeeds
    if (String(otp) !== MOCK_OTP) {
      return NextResponse.json(
        { error: 'Incorrect OTP' },
        { status: 400 }
      )
    }

    // Update phone in user_profiles
    const fullPhone = `${countryCode}${String(phone).replace(/\D/g, '')}`
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ phone: fullPhone })
      .eq('id', user.id)

    if (updateError) {
      console.error('[verify-change-phone] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update phone number' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[verify-change-phone] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
