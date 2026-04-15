import { NextRequest, NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
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

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('webauthn_credential_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.webauthn_credential_id) {
      return NextResponse.json(
        { error: 'No biometric credential enrolled' },
        { status: 404 }
      )
    }

    const rpID = process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost'

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: [
        {
          id: profile.webauthn_credential_id,
        },
      ],
      userVerification: 'required',
    })

    // Store challenge for verification
    await supabase
      .from('user_profiles')
      .update({ webauthn_challenge: options.challenge })
      .eq('id', user.id)

    return NextResponse.json({ options })
  } catch (err) {
    console.error('[webauthn/authenticate] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
