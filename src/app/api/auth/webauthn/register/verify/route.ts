import { NextRequest, NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, DEMO_USER } from '@/lib/demo'
import { isoBase64URL } from '@simplewebauthn/server/helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credential } = body

    if (isDemoMode) {
      const supabase = await createClient()
      await supabase
        .from('user_profiles')
        .update({
          webauthn_credential_id: 'demo-credential',
          webauthn_public_key: 'demo-key',
          webauthn_counter: 0,
        })
        .eq('id', DEMO_USER.id)
      return NextResponse.json({ enrolled: true })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('webauthn_challenge')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.webauthn_challenge) {
      return NextResponse.json(
        { error: 'No pending challenge found' },
        { status: 400 }
      )
    }

    const expectedOrigin =
      process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'http://localhost:3000'
    const expectedRPID = process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost'

    let verification
    try {
      verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: profile.webauthn_challenge,
        expectedOrigin,
        expectedRPID,
        requireUserVerification: true,
      })
    } catch (verifyErr) {
      console.error('[webauthn/register/verify] Verification error:', verifyErr)
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      )
    }

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      )
    }

    const { credential: cred } = verification.registrationInfo

    // Encode public key as base64url string for storage
    const publicKeyBase64 = isoBase64URL.fromBuffer(cred.publicKey)

    await supabase
      .from('user_profiles')
      .update({
        webauthn_credential_id: cred.id,
        webauthn_public_key: publicKeyBase64,
        webauthn_counter: cred.counter,
        webauthn_challenge: null,
      })
      .eq('id', user.id)

    return NextResponse.json({ enrolled: true })
  } catch (err) {
    console.error('[webauthn/register/verify] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
