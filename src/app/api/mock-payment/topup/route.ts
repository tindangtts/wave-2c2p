import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { topupAmountSchema, topupChannelSchema } from '@/lib/wallet/schemas'
import { z } from 'zod/v4'
import { db } from '@/db'
import { wallets, transactions } from '@/db/schema'
import { eq } from 'drizzle-orm'

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
    const body = await request.json()

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Fetch wallet via Drizzle and check maxTopup
    const [wallet] = await db
      .select({ id: wallets.id, balance: wallets.balance, maxTopup: wallets.maxTopup })
      .from(wallets)
      .where(eq(wallets.userId, user.id))
      .limit(1)

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    if (amount > wallet.maxTopup) {
      return NextResponse.json(
        { error: 'Amount exceeds maximum top-up limit' },
        { status: 400 }
      )
    }

    // Fetch user profile to get wallet_id (needed as ref1 for 123 Service)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('wallet_id')
      .eq('id', user.id)
      .single()
    const walletId = profile?.wallet_id ?? user.id.slice(0, 16).toUpperCase()

    const referenceNumber = generateReference()
    const amountInBaht = amount / 100
    const expiresMinutes = channel === 'service_123' ? 30 : 15
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000).toISOString()

    // Atomic batch: update wallet balance + insert transaction (immediate, no deferred setTimeout)
    let txId: string
    try {
      txId = await db.transaction(async (tx) => {
        await tx.update(wallets)
          .set({ balance: wallet.balance + amount, updatedAt: new Date() })
          .where(eq(wallets.id, wallet.id));
        const [inserted] = await tx.insert(transactions)
          .values({
            userId: user.id,
            type: 'add_money',
            status: 'success',
            amount,
            fee: 0,
            currency: 'THB',
            channel,
            referenceNumber,
            description: `Top-up via ${channel.toUpperCase()}`,
            metadata: null,
          })
          .returning({ id: transactions.id });
        return inserted.id;
      })
    } catch {
      return NextResponse.json(
        { error: 'Failed to process top-up' },
        { status: 500 }
      )
    }

    if (channel === 'service_123') {
      return NextResponse.json({
        transaction_id: txId,
        barcode_data: {
          barcodeValue: referenceNumber.replace(/[^0-9]/g, '').padStart(20, '0'),
          ref1: walletId,
          ref2: referenceNumber,
          amount: amountInBaht,
          expiresAt,
          channel,
        },
        status: 'pending',   // Keep 'pending' in response for UI compatibility
      })
    }

    return NextResponse.json({
      transaction_id: txId,
      qr_data: {
        paymentCode: '9300596914',
        amount: amountInBaht,
        merchantName: '2C2P PLUS (THAILAND) CO., LTD.',
        expiresAt,
        channel,
        referenceNumber,
      },
      status: 'pending',   // Keep 'pending' in response for UI compatibility
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
