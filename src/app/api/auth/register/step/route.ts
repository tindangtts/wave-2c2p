import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { personalInfoSchema, idDetailsSchema } from '@/lib/auth/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { step, data } = body as { step: 1 | 2 | 3; data: Record<string, unknown> }

    if (!step || !data) {
      return NextResponse.json({ error: 'Missing step or data' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (step === 1) {
      // Validate step 1 data with personalInfoSchema
      const parsed = personalInfoSchema.safeParse(data)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const { firstName, lastName, dateOfBirth, nationality } = parsed.data
      const fullName = `${firstName} ${lastName}`.trim()

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          date_of_birth: dateOfBirth,
          nationality,
          registration_step: 2,
        })
        .eq('id', user.id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to save personal info' }, { status: 500 })
      }

      return NextResponse.json({ success: true, nextStep: 2 })
    }

    if (step === 2) {
      // Validate step 2 data with idDetailsSchema
      const parsed = idDetailsSchema.safeParse(data)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const { idType, idNumber, idExpiry } = parsed.data

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          id_type: idType,
          id_number: idNumber,
          id_expiry: idExpiry,
          registration_step: 3,
        })
        .eq('id', user.id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to save ID details' }, { status: 500 })
      }

      return NextResponse.json({ success: true, nextStep: 3 })
    }

    return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
