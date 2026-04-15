/**
 * WebAuthn Registration Options Generator
 *
 * Required SQL migrations (run in Supabase dashboard):
 * ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS webauthn_credential_id text;
 * ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS webauthn_public_key text;
 * ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS webauthn_counter bigint DEFAULT 0;
 * ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS webauthn_challenge text;
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { createClient } from '@/lib/supabase/server'
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const rpID = process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost'

    const options = await generateRegistrationOptions({
      rpName: '2C2P Wave',
      rpID,
      userID: new TextEncoder().encode(user.id),
      userName: user.phone ?? user.id,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
    })

    // Store challenge for verification
    await supabase
      .from('user_profiles')
      .update({ webauthn_challenge: options.challenge })
      .eq('id', user.id)

    return NextResponse.json({ options })
  } catch (err) {
    console.error('[webauthn/register] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
