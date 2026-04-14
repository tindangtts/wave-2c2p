import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, countryCode } = body

    // Validate inputs
    if (!phone || !countryCode) {
      return NextResponse.json(
        { error: 'Phone number and country code are required' },
        { status: 400 }
      )
    }

    const digits = String(phone).replace(/\D/g, '')
    if (digits.length < 7) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
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

    // Mock: simulate OTP send delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({ success: true, message: 'OTP sent' })
  } catch (err) {
    console.error('[change-phone] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
