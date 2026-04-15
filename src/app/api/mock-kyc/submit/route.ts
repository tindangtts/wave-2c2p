import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/auth/admin'
import { createClient } from '@/lib/supabase/server'
import { kycSubmitRequestSchema } from '@/lib/kyc/schemas'

const REJECTION_REASONS = [
  'Document is blurry or unreadable.',
  'Document is expired.',
  'Name on document does not match registration.',
  'Photo unclear or face not visible.',
] as const

export async function POST(request: Request) {
  try {
    // Auth check — get session from Supabase
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const parsed = kycSubmitRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { document_type } = parsed.data

    // Read env vars at request time (per D-04)
    const autoApprove = process.env.MOCK_KYC_AUTO_APPROVE !== 'false' // default: true
    const delayMs = parseInt(process.env.MOCK_KYC_DELAY_MS ?? '1500', 10)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, delayMs))

    const admin = createAdminClient()
    const verificationId = `KYC-${Date.now()}`

    if (autoApprove) {
      // Insert approved KYC document
      await admin.from('kyc_documents').insert({
        user_id: user.id,
        document_type,
        front_image_url: 'mock://front',
        back_image_url: 'mock://back',
        selfie_image_url: 'mock://selfie',
        status: 'approved',
        verified_at: new Date().toISOString(),
      })

      // Update user profile KYC status
      await admin
        .from('user_profiles')
        .update({ kyc_status: 'approved' })
        .eq('id', user.id)

      return NextResponse.json({
        success: true,
        status: 'approved',
        verification_id: verificationId,
      })
    } else {
      // Pick random rejection reason
      const reason =
        REJECTION_REASONS[Math.floor(Math.random() * REJECTION_REASONS.length)]

      // Insert rejected KYC document
      await admin.from('kyc_documents').insert({
        user_id: user.id,
        document_type,
        front_image_url: 'mock://front',
        back_image_url: 'mock://back',
        selfie_image_url: 'mock://selfie',
        status: 'rejected',
        rejection_reason: reason,
      })

      // Update user profile KYC status
      await admin
        .from('user_profiles')
        .update({ kyc_status: 'rejected' })
        .eq('id', user.id)

      return NextResponse.json({
        success: false,
        status: 'rejected',
        rejection_reasons: [reason],
        verification_id: verificationId,
      })
    }
  } catch {
    return NextResponse.json(
      { error: 'Verification could not be completed' },
      { status: 500 }
    )
  }
}
