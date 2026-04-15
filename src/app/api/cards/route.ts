import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { cards } from '@/db/schema'
import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo'

export async function GET() {
  try {
    if (isDemoMode) {
      // Return mock card data matching existing hardcoded values
      return NextResponse.json({
        cards: [
          {
            id: 'mock-card-001',
            card_number_masked: '•••• •••• •••• 3210',
            expiry_month: 12,
            expiry_year: 2028,
            balance: 0,
            is_frozen: false,
            status: 'active',
          },
        ],
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

    const userCards = await db
      .select({
        id: cards.id,
        card_number_masked: cards.cardNumberMasked,
        expiry_month: cards.expiryMonth,
        expiry_year: cards.expiryYear,
        balance: cards.balance,
        is_frozen: cards.isFrozen,
        status: cards.status,
      })
      .from(cards)
      .where(eq(cards.userId, user.id))

    return NextResponse.json({ cards: userCards })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
  }
}
