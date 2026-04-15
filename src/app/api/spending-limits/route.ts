import { createClient } from "@/lib/supabase/server"
import { NextResponse, NextRequest } from "next/server"
import { isDemoMode } from "@/lib/demo"
import { z } from "zod/v4"

const SPENDING_TIERS = {
  basic:    { daily_limit_satang: 1000000,  monthly_limit_satang: 5000000 },   // 10,000 / 50,000 THB
  standard: { daily_limit_satang: 3000000,  monthly_limit_satang: 10000000 },  // 30,000 / 100,000 THB
  premium:  { daily_limit_satang: 5000000,  monthly_limit_satang: 20000000 },  // 50,000 / 200,000 THB
} as const

const DEMO_SPENDING_LIMITS = {
  daily_limit_satang: 5000000,
  monthly_limit_satang: 20000000,
}

const PatchSchema = z.object({
  tier: z.enum(['basic', 'standard', 'premium']),
})

export async function GET() {
  try {
    if (isDemoMode) {
      return NextResponse.json(DEMO_SPENDING_LIMITS)
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data } = await supabase
      .from('user_profiles')
      .select('daily_limit_satang, monthly_limit_satang')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      daily_limit_satang: data?.daily_limit_satang ?? 5000000,
      monthly_limit_satang: data?.monthly_limit_satang ?? 20000000,
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch spending limits" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 })
    }

    const { tier } = parsed.data
    const tierValues = SPENDING_TIERS[tier]

    if (isDemoMode) {
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        daily_limit_satang: tierValues.daily_limit_satang,
        monthly_limit_satang: tierValues.monthly_limit_satang,
      })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: "Failed to update spending limits" }, { status: 500 })
    }

    return NextResponse.json({ success: true, ...tierValues })
  } catch {
    return NextResponse.json({ error: "Failed to update spending limits" }, { status: 500 })
  }
}
