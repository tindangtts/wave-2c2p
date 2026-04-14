import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { topupAmountSchema, topupChannelSchema } from '@/lib/wallet/schemas'
import { z } from 'zod/v4'

const topupRequestSchema = z.object({
  amount: z.number().int().positive(),
  channel: topupChannelSchema,
})

function generateReference(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `TOPUP-${timestamp}-${random}`
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

    // Validate channel
    const parseResult = topupRequestSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error },
        { status: 400 }
      )
    }

    const { amount, channel } = parseResult.data

    // Validate amount (satang)
    const amountValidation = topupAmountSchema.safeParse({ amountSatang: amount })
    if (!amountValidation.success) {
      return NextResponse.json(
        { error: 'Invalid amount', details: amountValidation.error },
        { status: 400 }
      )
    }

    // Fetch wallet and check max_topup
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, balance, max_topup')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    if (amount > wallet.max_topup) {
      return NextResponse.json(
        { error: 'Amount exceeds maximum top-up limit' },
        { status: 400 }
      )
    }

    const referenceNumber = generateReference()
    const amountInBaht = amount / 100
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    // Insert pending transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'add_money',
        status: 'pending',
        amount,
        currency: 'THB',
        channel,
        reference_number: referenceNumber,
        description: `Top-up via ${channel.toUpperCase()}`,
      })
      .select('id')
      .single()

    if (txError || !transaction) {
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // Fire-and-forget: simulate async completion after configurable delay
    const delayMs = parseInt(process.env.MOCK_TOPUP_DELAY_MS ?? '5000', 10)
    setTimeout(async () => {
      try {
        // Create a new server client for the background update
        const { createClient: createBgClient } = await import('@/lib/supabase/server')
        const bgSupabase = await createBgClient()

        await bgSupabase
          .from('transactions')
          .update({ status: 'success', updated_at: new Date().toISOString() })
          .eq('id', transaction.id)

        await bgSupabase
          .from('wallets')
          .update({ balance: wallet.balance + amount })
          .eq('id', wallet.id)
      } catch {
        // Background update failure — not critical for response
      }
    }, delayMs)

    return NextResponse.json({
      transaction_id: transaction.id,
      qr_data: {
        paymentCode: '9300596914',
        amount: amountInBaht,
        merchantName: '2C2P PLUS (THAILAND) CO., LTD.',
        expiresAt,
        channel,
        referenceNumber,
      },
      status: 'pending',
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
