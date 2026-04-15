import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/demo'
import { hashPasscode } from '@/lib/auth/passcode'

export async function POST(request: NextRequest) {
  try {
    if (isDemoMode) {
      return NextResponse.json({ success: true })
    }

    const body = await request.json()
    const { passcode } = body

    // Validate: must be exactly 6 digits
    if (!passcode || !/^\d{6}$/.test(passcode)) {
      return NextResponse.json(
        { error: 'Passcode must be exactly 6 digits' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify authenticated user
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

    // Hash the passcode with PBKDF2
    const hash = hashPasscode(passcode)

    // Update user_profiles: set passcode_hash, registration_complete=true, registration_step=3, reset attempts
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        passcode_hash: hash,
        registration_complete: true,
        registration_step: 3,
        passcode_attempts: 0,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('[passcode/setup] DB update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to save passcode' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[passcode/setup] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
