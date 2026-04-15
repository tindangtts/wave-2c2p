import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/demo'
import { z } from 'zod/v4'

const withdrawRequestSchema = z
  .object({
    amount: z.number().int().positive('Amount must be greater than 0'),
    recipient_id: z.string().optional(),
    bank_account_id: z.string().optional(),
  })
  .refine((d) => d.recipient_id || d.bank_account_id, {
    message: 'Either recipient_id or bank_account_id is required',
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
    if (isDemoMode) {
      const body = await request.json()
      const parseResult = withdrawRequestSchema.safeParse(body)
      if (!parseResult.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: parseResult.error },
          { status: 400 }
        )
      }
      return NextResponse.json({
        transaction_id: 'demo-tx-withdraw',
        status: 'pending',
        reference_number: generateReference(),
      })
    }

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

    const { amount, recipient_id, bank_account_id } = parseResult.data

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

    // Resolve description based on recipient or bank account
    let description = 'Withdrawal'

    if (recipient_id) {
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

      description = `Withdrawal to ${recipient.full_name}`
    } else if (bank_account_id) {
      // Verify bank account belongs to user
      const { data: bankAccount, error: bankAccountError } = await supabase
        .from('bank_accounts')
        .select('id, bank_name, account_name')
        .eq('id', bank_account_id)
        .eq('user_id', user.id)
        .single()

      if (bankAccountError || !bankAccount) {
        return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
      }

      description = `Withdrawal to ${bankAccount.bank_name} (${bankAccount.account_name})`
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

    // Build metadata if bank_account_id provided
    const metadata = bank_account_id ? { bank_account_id } : null

    // Insert pending transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'withdraw',
        status: 'pending',
        amount,
        currency: 'THB',
        ...(recipient_id ? { recipient_id } : {}),
        reference_number: referenceNumber,
        description,
        ...(metadata ? { metadata } : {}),
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
