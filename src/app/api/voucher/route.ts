import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { vouchers, wallets } from '@/db/schema'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code } = body as { code: string }

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Look up voucher by code
    const [row] = await db
      .select()
      .from(vouchers)
      .where(eq(vouchers.code, code.toUpperCase()))
      .limit(1)

    if (!row || !row.active) {
      return NextResponse.json({ error: 'invalid', message: 'Invalid or expired voucher code.' }, { status: 400 })
    }

    if (row.redeemedBy !== null) {
      return NextResponse.json({ error: 'already_used', message: 'This voucher has already been used.' }, { status: 400 })
    }

    if (row.expiresAt && row.expiresAt < new Date()) {
      return NextResponse.json({ error: 'invalid', message: 'Invalid or expired voucher code.' }, { status: 400 })
    }

    // Fetch user wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, user.id))
      .limit(1)

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Atomic batch: mark voucher redeemed + credit wallet balance
    const now = new Date()
    await db.batch([
      db.update(vouchers)
        .set({ redeemedBy: user.id, redeemedAt: now })
        .where(eq(vouchers.id, row.id)),
      db.update(wallets)
        .set({ balance: wallet.balance + row.amount, updatedAt: now })
        .where(eq(wallets.userId, user.id)),
    ])

    return NextResponse.json({
      success: true,
      voucher: {
        code: row.code,
        amount: row.amount,
        type: row.type,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
