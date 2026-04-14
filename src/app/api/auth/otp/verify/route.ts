import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/auth/admin'
import { phoneSchema } from '@/lib/auth/schemas'

/**
 * Derive a deterministic password from phone + server secret.
 * Not security-critical — used only in mock mode to allow
 * signInWithPassword after admin-created user.
 */
function generateDerivedPassword(phone: string): string {
  return createHash('sha256')
    .update(phone + (process.env.MOCK_AUTH_SECRET ?? 'dev-secret'))
    .digest('hex')
    .slice(0, 32)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { phone, countryCode, token } = body

  // Validate phone input
  const parsed = phoneSchema.safeParse({ phone, countryCode })
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Invalid phone number'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'OTP token is required' }, { status: 400 })
  }

  const isMockMode = process.env.MOCK_OTP_AUTO_BYPASS !== 'false'

  if (isMockMode) {
    // In mock mode, only accept '000000'
    if (token !== '000000') {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
    }

    const fullPhone = countryCode + phone
    const derivedPassword = generateDerivedPassword(fullPhone)
    const admin = createAdminClient()

    // Check if user already exists by phone
    let userId: string | null = null
    let isNewUser = true

    try {
      // listUsers doesn't support filter natively — fetch first page and check phone
      const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const match = usersData?.users?.find((u) => u.phone === fullPhone)
      if (match) {
        userId = match.id
        isNewUser = false
      }
    } catch {
      // Treat as not found — will create below
    }

    if (!userId) {
      // Create new user with confirmed phone
      const { data: newUser, error: createError } =
        await admin.auth.admin.createUser({
          phone: fullPhone,
          phone_confirm: true,
          password: derivedPassword,
        })

      if (createError || !newUser?.user) {
        console.error('[otp/verify] createUser error:', createError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }
      userId = newUser.user.id
      isNewUser = true
    } else {
      // Update password for existing user to keep it consistent
      await admin.auth.admin.updateUserById(userId, {
        password: derivedPassword,
      })
    }

    // Build a response object so we can attach Set-Cookie headers via @supabase/ssr
    const response = NextResponse.json({ success: true }) // placeholder — replaced below

    // Create a server client that writes session cookies into the response
    let sessionResponse: NextResponse | null = null
    const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookies) {
            cookies.forEach(({ name, value, options }) => {
              cookiesToSet.push({ name, value, options })
            })
          },
        },
      }
    )

    // Sign in with the derived password to create a real session
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        phone: fullPhone,
        password: derivedPassword,
      })

    if (signInError || !signInData?.session) {
      console.error('[otp/verify] signInWithPassword error:', signInError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Check if user_profiles row exists
    const { data: profile } = await admin
      .from('user_profiles')
      .select('id, registration_complete, registration_step')
      .eq('id', userId)
      .single()

    const profileExists = !!profile

    // Create user_profiles row if it doesn't exist
    if (!profileExists) {
      const { error: insertError } = await admin.from('user_profiles').insert({
        id: userId,
        full_name: '',
        phone,
        country_code: countryCode,
        registration_complete: false,
        registration_step: 1,
      })

      if (insertError) {
        console.error('[otp/verify] user_profiles insert error:', insertError)
        // Non-fatal — session was created successfully
      }
    }

    const registrationComplete = profile?.registration_complete ?? false
    const registrationStep = profile?.registration_step ?? 1

    // Build final response with cookie headers
    sessionResponse = NextResponse.json({
      success: true,
      isNewUser,
      registrationComplete,
      registrationStep,
    })

    // Apply cookies from the @supabase/ssr client to the response
    cookiesToSet.forEach(({ name, value, options }) => {
      sessionResponse!.cookies.set(name, value, options as Parameters<typeof sessionResponse.cookies.set>[2])
    })

    void response // suppress unused var warning
    return sessionResponse
  }

  // Real mode: verify OTP via Supabase
  const realResponse = NextResponse.json({ success: true }) // placeholder
  const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            cookiesToSet.push({ name, value, options })
          })
        },
      },
    }
  )

  const { data: verifyData, error: verifyError } =
    await supabase.auth.verifyOtp({
      phone: countryCode + phone,
      token,
      type: 'sms',
    })

  if (verifyError || !verifyData?.session) {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
  }

  const userId = verifyData.user?.id
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('user_profiles')
    .select('id, registration_complete, registration_step')
    .eq('id', userId)
    .single()

  const finalResponse = NextResponse.json({
    success: true,
    isNewUser: !profile,
    registrationComplete: profile?.registration_complete ?? false,
    registrationStep: profile?.registration_step ?? 1,
  })

  cookiesToSet.forEach(({ name, value, options }) => {
    finalResponse.cookies.set(name, value, options as Parameters<typeof finalResponse.cookies.set>[2])
  })

  void realResponse
  return finalResponse
}
