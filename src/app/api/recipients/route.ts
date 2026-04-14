import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { recipientFormSchema } from '@/lib/transfer/schemas'
import { z } from 'zod/v4'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: recipients, error } = await supabase
      .from('recipients')
      .select('*')
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('full_name', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch recipients' },
        { status: 500 }
      )
    }

    return NextResponse.json({ recipients: recipients ?? [] })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch recipients' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parseResult = recipientFormSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error },
        { status: 400 }
      )
    }

    const data = parseResult.data
    const full_name = `${data.first_name} ${data.last_name}`

    // Store extended fields in metadata (DB schema uses legacy columns)
    const insertData = {
      user_id: user.id,
      full_name,
      phone: data.phone,
      country_code: '+95',
      nrc: data.nrc ?? null,
      occupation: data.occupation ?? null,
      transfer_purpose: data.transfer_purpose,
      relationship: data.relationship,
      address: data.address_line_1,
      is_favorite: false,
    }

    const { data: recipient, error } = await supabase
      .from('recipients')
      .insert(insertData)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create recipient' },
        { status: 500 }
      )
    }

    // Merge extended fields not in DB schema into the returned object
    const enrichedRecipient = {
      ...recipient,
      first_name: data.first_name,
      last_name: data.last_name,
      transfer_type: data.transfer_type,
      bank_name: data.bank_name ?? null,
      account_no: data.account_no ?? null,
      address_line_2: data.address_line_2 ?? null,
      city: data.city,
      state_region: data.state_region,
    }

    return NextResponse.json({ recipient: enrichedRecipient }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create recipient' },
      { status: 500 }
    )
  }
}
