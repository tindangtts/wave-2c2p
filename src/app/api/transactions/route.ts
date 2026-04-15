import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { eq, and, desc, gte, lte } from 'drizzle-orm'
import { transactions, recipients } from '@/db/schema'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Single transaction fetch by ID (includes recipient join)
    if (id) {
      const result = await db.select()
        .from(transactions)
        .leftJoin(recipients, eq(transactions.recipientId, recipients.id))
        .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
        .limit(1)

      if (!result.length) {
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        )
      }

      // Flatten join result and alias to snake_case for UI compatibility
      const row = result[0]
      const t = row.transactions
      const transaction = {
        id: t.id,
        user_id: t.userId,
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        converted_amount: t.convertedAmount,
        converted_currency: t.convertedCurrency,
        exchange_rate: t.exchangeRate,
        fee: t.fee,
        status: t.status,
        recipient_id: t.recipientId,
        channel: t.channel,
        reference_number: t.referenceNumber,
        description: t.description,
        metadata: t.metadata,
        created_at: t.createdAt,
        updated_at: t.updatedAt,
        recipients: row.recipients,
      }
      return NextResponse.json(transaction)
    }

    const page = parseInt(searchParams.get('page') ?? '0', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
    const offset = page * limit
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build where conditions array
    const conditions = [eq(transactions.userId, user.id)]
    if (type && type !== 'all') conditions.push(eq(transactions.type, type))
    if (status && status !== 'all') conditions.push(eq(transactions.status, status))
    if (dateFrom) conditions.push(gte(transactions.createdAt, new Date(dateFrom)))
    if (dateTo) conditions.push(lte(transactions.createdAt, new Date(`${dateTo}T23:59:59`)))

    const rows = await db.select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset)

    // Alias to snake_case for UI compatibility
    const mapped = (rows ?? []).map(t => ({
      id: t.id,
      user_id: t.userId,
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      converted_amount: t.convertedAmount,
      converted_currency: t.convertedCurrency,
      exchange_rate: t.exchangeRate,
      fee: t.fee,
      status: t.status,
      recipient_id: t.recipientId,
      channel: t.channel,
      reference_number: t.referenceNumber,
      description: t.description,
      metadata: t.metadata,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
    }))

    return NextResponse.json(mapped)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
