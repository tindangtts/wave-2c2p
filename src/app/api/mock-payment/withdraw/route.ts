import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod/v4'
import { db } from '@/db'
import { wallets, transactions } from '@/db/schema'
import { eq } from 'drizzle-orm'

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

    // Fetch wallet via Drizzle and validate balance
    const [wallet] = await db
      .select({ id: wallets.id, balance: wallets.balance })
      .from(wallets)
      .where(eq(wallets.userId, user.id))
      .limit(1)

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    if (amount > wallet.balance) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      )
    }

    // Resolve description based on recipient or bank account
    // recipients and bank_accounts tables are not yet in Drizzle schema — keep Supabase for these lookups
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
    const newBalance = wallet.balance - amount
    const metadataStr = bank_account_id ? JSON.stringify({ bank_account_id }) : null

    let txId: string
    try {
      const [, [inserted]] = await db.batch([
        db.update(wallets)
          .set({ balance: newBalance, updatedAt: new Date() })
          .where(eq(wallets.id, wallet.id)),
        db.insert(transactions)
          .values({
            userId: user.id,
            type: 'withdraw',
            status: 'pending',
            amount,
            currency: 'THB',
            fee: 0,
            ...(recipient_id ? { recipientId: recipient_id } : {}),
            referenceNumber,
            description,
            ...(metadataStr ? { metadata: metadataStr } : {}),
          })
          .returning({ id: transactions.id }),
      ] as const)
      txId = inserted.id
    } catch {
      return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 })
    }

    // Fire-and-forget: auto-complete after 2s delay (mock behavior)
    setTimeout(async () => {
      try {
        await db.update(transactions)
          .set({ status: 'success', updatedAt: new Date() })
          .where(eq(transactions.id, txId))
      } catch {
        // Background update failure — not critical for response
      }
    }, 2000)

    return NextResponse.json({
      transaction_id: txId,
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
