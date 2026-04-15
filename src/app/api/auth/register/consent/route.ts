import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/demo'

export async function POST(request: NextRequest) {
  try {
    if (isDemoMode) {
      return NextResponse.json({ success: true })
    }

    const body = await request.json()
    const { tcAcceptedAt, tcVersion } = body as { tcAcceptedAt: string; tcVersion: string }

    if (!tcAcceptedAt || !tcVersion) {
      return NextResponse.json({ error: 'Missing tcAcceptedAt or tcVersion' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        tc_accepted_at: tcAcceptedAt,
        tc_version: tcVersion,
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save consent' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
