import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [referralsResult, profileResult] = await Promise.all([
      supabase
        .from('referrals')
        .select('id, status, reward_amount')
        .eq('referrer_id', user.id),
      supabase
        .from('user_profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single(),
    ])

    const rows = referralsResult.data ?? []
    const completedRows = rows.filter((r) => r.status === 'completed')
    const referredCount = completedRows.length
    const totalBonusSatang = completedRows.reduce(
      (sum, r) => sum + (r.reward_amount ?? 0),
      0
    )

    // Fall back to mock code if column missing or profile error
    const referralCode =
      profileResult.data?.referral_code ?? 'WAVE2C2P'

    return NextResponse.json({ referredCount, totalBonusSatang, referralCode })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    )
  }
}
