import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import { createClient } from '@/lib/supabase/server'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credential } = body

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
      .select(
        'webauthn_credential_id, webauthn_public_key, webauthn_counter, webauthn_challenge'
      )
      .eq('id', user.id)
      .single()

    if (
      profileError ||
      !profile?.webauthn_credential_id ||
      !profile?.webauthn_public_key ||
      !profile?.webauthn_challenge
    ) {
      return NextResponse.json(
        { error: 'Biometric credential not found or no pending challenge' },
        { status: 400 }
      )
    }

    const expectedOrigin =
      process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'http://localhost:3000'
    const expectedRPID = process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost'

    // Decode stored base64url public key back to Uint8Array
    const publicKeyUint8 = isoBase64URL.toBuffer(profile.webauthn_public_key)

    let verification
    try {
      verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: profile.webauthn_challenge,
        expectedOrigin,
        expectedRPID,
        credential: {
          id: profile.webauthn_credential_id,
          publicKey: publicKeyUint8,
          counter: profile.webauthn_counter ?? 0,
        },
        requireUserVerification: true,
      })
    } catch (verifyErr) {
      console.error(
        '[webauthn/authenticate/verify] Verification error:',
        verifyErr
      )
      return NextResponse.json(
        { error: 'Biometric authentication failed' },
        { status: 401 }
      )
    }

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Biometric authentication failed' },
        { status: 401 }
      )
    }

    // Update counter and clear challenge
    await supabase
      .from('user_profiles')
      .update({
        webauthn_counter: verification.authenticationInfo.newCounter,
        webauthn_challenge: null,
      })
      .eq('id', user.id)

    return NextResponse.json({ authenticated: true })
  } catch (err) {
    console.error('[webauthn/authenticate/verify] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
