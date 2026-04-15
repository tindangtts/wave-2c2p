import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/auth/admin'
import { createClient } from '@/lib/supabase/server'

const REJECTION_REASONS = [
  'Document is blurry or unreadable.',
  'Work permit has expired.',
  'Name on document does not match registration.',
] as const

export async function POST() {
  try {
    // Auth guard — get session from Supabase
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Read env flags at request time (per D-04)
    const autoApprove = process.env.MOCK_KYC_AUTO_APPROVE !== 'false' // default: true
    const delayMs = parseInt(process.env.MOCK_KYC_DELAY_MS ?? '1500', 10)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, delayMs))

    const admin = createAdminClient()
    const verificationId = `WP-UPDATE-${Date.now()}`

    if (autoApprove) {
      // Insert pending KYC document — will be approved asynchronously in real system
      await admin.from('kyc_documents').insert({
        user_id: user.id,
        document_type: 'work_permit',
        front_image_url: 'mock://front',
        back_image_url: 'mock://back',
        status: 'pending',
        verified_at: null,
      })

      // Set kyc_status to 'pending_update' — preserves existing transfer access during re-verification
      await admin
        .from('user_profiles')
        .update({ kyc_status: 'pending_update' })
        .eq('id', user.id)

      return NextResponse.json({
        success: true,
        status: 'pending_update',
        verification_id: verificationId,
      })
    } else {
      // Pick random rejection reason
      const reason =
        REJECTION_REASONS[Math.floor(Math.random() * REJECTION_REASONS.length)]

      // Insert rejected KYC document
      await admin.from('kyc_documents').insert({
        user_id: user.id,
        document_type: 'work_permit',
        front_image_url: 'mock://front',
        back_image_url: 'mock://back',
        status: 'rejected',
        rejection_reason: reason,
      })

      // Do NOT change kyc_status in user_profiles — user retains current access
      return NextResponse.json({
        success: false,
        status: 'rejected',
        verification_id: verificationId,
        rejection_reasons: [reason],
      })
    }
  } catch {
    return NextResponse.json(
      { error: 'Verification could not be completed' },
      { status: 500 }
    )
  }
}
