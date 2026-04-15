import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, DEMO_TRANSACTIONS } from '@/lib/demo'

// GET /api/statement?dateFrom=yyyy-MM-dd&dateTo=yyyy-MM-dd
// Returns all transactions for authenticated user in range (max 500 rows, no pagination)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'dateFrom and dateTo query params are required (yyyy-MM-dd)' },
        { status: 400 }
      )
    }

    if (isDemoMode) {
      // Filter DEMO_TRANSACTIONS by date range
      const from = new Date(dateFrom)
      const to = new Date(`${dateTo}T23:59:59`)
      const filtered = DEMO_TRANSACTIONS.filter((tx) => {
        const txDate = new Date(tx.created_at)
        return txDate >= from && txDate <= to
      })
      return NextResponse.json({ transactions: filtered })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', dateFrom)
      .lte('created_at', `${dateTo}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ transactions: transactions ?? [] })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
