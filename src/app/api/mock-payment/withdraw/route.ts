import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod/v4'

const withdrawRequestSchema = z.object({
  amount: z.number().int().positive('Amount must be greater than 0'),
  recipient_id: z.string().min(1, 'recipient_id is required'),
})

function generateReference(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `WTHD-${timestamp}-${random}`
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

    const parseResult = withdrawRequestSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error },
        { status: 400 }
      )
    }

    const { amount, recipient_id } = parseResult.data

    // Fetch wallet and validate balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    if (amount > wallet.balance) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      )
    }

    // Verify recipient belongs to user
    const { data: recipient, error: recipientError } = await supabase
      .from('recipients')
      .select('id, full_name')
      .eq('id', recipient_id)
      .eq('user_id', user.id)
      .single()

    if (recipientError || !recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    const referenceNumber = generateReference()

    // Deduct balance immediately
    const { error: balanceError } = await supabase
      .from('wallets')
      .update({ balance: wallet.balance - amount })
      .eq('id', wallet.id)

    if (balanceError) {
      return NextResponse.json(
        { error: 'Failed to update wallet balance' },
        { status: 500 }
      )
    }

    // Insert pending transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'withdraw',
        status: 'pending',
        amount,
        currency: 'THB',
        recipient_id,
        reference_number: referenceNumber,
        description: `Withdrawal to ${recipient.full_name}`,
      })
      .select('id')
      .single()

    if (txError || !transaction) {
      // Rollback balance deduction on transaction insert failure
      await supabase
        .from('wallets')
        .update({ balance: wallet.balance })
        .eq('id', wallet.id)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // Fire-and-forget: auto-complete after 2s delay (mock behavior)
    setTimeout(async () => {
      try {
        const { createClient: createBgClient } = await import('@/lib/supabase/server')
        const bgSupabase = await createBgClient()

        await bgSupabase
          .from('transactions')
          .update({ status: 'success', updated_at: new Date().toISOString() })
          .eq('id', transaction.id)
      } catch {
        // Background update failure — not critical for response
      }
    }, 2000)

    return NextResponse.json({
      transaction_id: transaction.id,
      status: 'pending',
      reference_number: referenceNumber,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
