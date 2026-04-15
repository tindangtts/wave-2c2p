import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPasscode, hashPasscode } from '@/lib/auth/passcode'

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 30 * 60 * 1000 // 30 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPasscode, newPasscode } = body

    if (!currentPasscode || !newPasscode) {
      return NextResponse.json(
        { error: 'Current and new passcode are required' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(currentPasscode) || !/^\d{6}$/.test(newPasscode)) {
      return NextResponse.json(
        { error: 'Passcode must be exactly 6 digits' },
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

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('passcode_hash, passcode_attempts, passcode_locked_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const now = Date.now()

    // Check if account is locked
    if (profile.passcode_locked_at) {
      const lockedAt = new Date(profile.passcode_locked_at).getTime()
      const elapsed = now - lockedAt

      if (elapsed < LOCK_DURATION_MS) {
        return NextResponse.json(
          { error: 'Account locked', locked: true },
          { status: 423 }
        )
      } else {
        // Lock expired — reset
        await supabase
          .from('user_profiles')
          .update({ passcode_attempts: 0, passcode_locked_at: null })
          .eq('id', user.id)

        profile.passcode_attempts = 0
        profile.passcode_locked_at = null
      }
    }

    // Guard: passcode not yet set up
    if (!profile.passcode_hash) {
      return NextResponse.json(
        { error: 'Passcode not set up. Complete registration first.' },
        { status: 400 }
      )
    }

    // Verify current passcode against stored hash
    const isCorrect = verifyPasscode(currentPasscode, profile.passcode_hash)

    if (!isCorrect) {
      const newAttempts = (profile.passcode_attempts ?? 0) + 1
      const shouldLock = newAttempts >= MAX_ATTEMPTS

      await supabase
        .from('user_profiles')
        .update({
          passcode_attempts: newAttempts,
          ...(shouldLock ? { passcode_locked_at: new Date().toISOString() } : {}),
        })
        .eq('id', user.id)

      return NextResponse.json(
        {
          error: 'Incorrect passcode',
          attemptsRemaining: Math.max(0, MAX_ATTEMPTS - newAttempts),
          locked: shouldLock,
        },
        { status: 400 }
      )
    }

    // Hash and save the new passcode
    const newHash = hashPasscode(newPasscode)
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ passcode_hash: newHash, passcode_attempts: 0 })
      .eq('id', user.id)

    if (updateError) {
      console.error('[change-passcode] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update passcode' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[change-passcode] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
