import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { recipientFormSchema } from '@/lib/transfer/schemas'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('recipients')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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

    const updateData = {
      full_name,
      phone: data.phone,
      country_code: '+95',
      nrc: data.nrc ?? null,
      occupation: data.occupation ?? null,
      transfer_purpose: data.transfer_purpose,
      relationship: data.relationship,
      address: data.address_line_1,
      updated_at: new Date().toISOString(),
    }

    const { data: recipient, error: updateError } = await supabase
      .from('recipients')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update recipient' },
        { status: 500 }
      )
    }

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

    return NextResponse.json({ recipient: enrichedRecipient })
  } catch {
    return NextResponse.json(
      { error: 'Failed to update recipient' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('recipients')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('recipients')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete recipient' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete recipient' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('recipients')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { is_favorite } = body as { is_favorite: boolean }

    if (typeof is_favorite !== 'boolean') {
      return NextResponse.json(
        { error: 'is_favorite must be a boolean' },
        { status: 400 }
      )
    }

    const { data: recipient, error: updateError } = await supabase
      .from('recipients')
      .update({ is_favorite, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to toggle favorite' },
        { status: 500 }
      )
    }

    return NextResponse.json({ recipient })
  } catch {
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    )
  }
}
