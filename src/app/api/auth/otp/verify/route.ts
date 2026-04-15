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
    const admin = createAdminClient()

    // Check if user already exists by phone
    let userId: string | null = null
    let isNewUser = true

    try {
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
      // Create new user with confirmed phone and an email-based password for session creation
      const demoEmail = `${phone.replace(/\D/g, '')}@wave-demo.local`
      const derivedPassword = generateDerivedPassword(fullPhone)
      const { data: newUser, error: createError } =
        await admin.auth.admin.createUser({
          email: demoEmail,
          phone: fullPhone,
          phone_confirm: true,
          email_confirm: true,
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
    }

    // Sign in with email + derived password to create a real session
    const demoEmail = `${phone.replace(/\D/g, '')}@wave-demo.local`
    const derivedPassword = generateDerivedPassword(fullPhone)
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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: derivedPassword,
    })

    if (signInError) {
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

    if (!profile) {
      await admin.from('user_profiles').insert({
        id: userId,
        full_name: '',
        phone,
        country_code: countryCode,
        registration_complete: false,
        registration_step: 1,
      }).then(() => {})
    }

    const registrationComplete = profile?.registration_complete ?? false
    const registrationStep = profile?.registration_step ?? 1

    // AUTH-05: Invalidate all other sessions for this user
    try {
      await admin.auth.admin.signOut(userId!, 'others')
    } catch (err) {
      console.warn('[otp/verify] signOut others failed:', err)
    }

    // Build response with cookie headers
    const sessionResponse = NextResponse.json({
      success: true,
      isNewUser,
      registrationComplete,
      registrationStep,
    })

    cookiesToSet.forEach(({ name, value, options }) => {
      sessionResponse.cookies.set(name, value, options as Parameters<typeof sessionResponse.cookies.set>[2])
    })

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

  // AUTH-05: Invalidate all other sessions for this user
  if (userId) {
    try {
      await admin.auth.admin.signOut(userId, 'others')
    } catch (err) {
      console.warn('[otp/verify] signOut others failed:', err)
    }
  }

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
