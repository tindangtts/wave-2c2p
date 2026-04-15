import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, DEMO_USER } from '@/lib/demo'
import { z } from 'zod/v4'

const createBankAccountSchema = z.object({
  bank_name: z.string().min(1, 'bank_name is required'),
  account_number: z.string().regex(/^\d{10,12}$/, 'account_number must be 10-12 digits'),
  account_name: z.string().min(1, 'account_name is required'),
})

// Seeded demo bank accounts — returned on every GET in demo mode
const DEMO_BANK_ACCOUNTS = [
  {
    id: 'demo-ba-1',
    user_id: DEMO_USER.id,
    bank_name: 'Bangkok Bank',
    account_number: '1234567890',
    account_name: 'Aung Kyaw',
    created_at: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'demo-ba-2',
    user_id: DEMO_USER.id,
    bank_name: 'Kasikornbank',
    account_number: '9876543210',
    account_name: 'Aung Kyaw',
    created_at: '2026-02-15T10:30:00.000Z',
  },
]

export async function GET() {
  try {
    if (isDemoMode) {
      return NextResponse.json({ bank_accounts: DEMO_BANK_ACCOUNTS })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: bank_accounts, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch bank accounts' }, { status: 500 })
    }

    return NextResponse.json({ bank_accounts: bank_accounts ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parseResult = createBankAccountSchema.safeParse(body)

    if (isDemoMode) {
      if (!parseResult.success) {
        return NextResponse.json({ error: 'Validation failed', details: parseResult.error.flatten() }, { status: 400 })
      }
      return NextResponse.json({
        bank_account: {
          id: `demo-ba-${Date.now()}`,
          user_id: DEMO_USER.id,
          ...parseResult.data,
          created_at: new Date().toISOString(),
        },
      }, { status: 201 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { bank_name, account_number, account_name } = parseResult.data

    const { data: bank_account, error } = await supabase
      .from('bank_accounts')
      .insert({ user_id: user.id, bank_name, account_number, account_name })
      .select('*')
      .single()

    if (error || !bank_account) {
      return NextResponse.json({ error: 'Failed to create bank account' }, { status: 500 })
    }

    return NextResponse.json({ bank_account }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    if (isDemoMode) {
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for pending withdrawal referencing this bank account via metadata JSONB
    const { data: pendingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'withdraw')
      .eq('status', 'pending')
      .contains('metadata', { bank_account_id: id })
      .limit(1)
      .maybeSingle()

    if (pendingTx) {
      return NextResponse.json(
        { error: 'Cannot delete bank account with pending withdrawal' },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // RLS belt-and-suspenders

    if (error) {
      return NextResponse.json({ error: 'Failed to delete bank account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
