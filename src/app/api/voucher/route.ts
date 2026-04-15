import { NextResponse } from 'next/server'

// Mock voucher database
const VALID_VOUCHERS: Record<string, { amount: number; type: 'cashback' | 'free_transfer'; used: boolean }> = {
  WAVE2024: { amount: 5000, type: 'cashback', used: false }, // 50 THB
  NEWYEAR: { amount: 10000, type: 'cashback', used: false }, // 100 THB
  FREETX: { amount: 0, type: 'free_transfer', used: false },
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code } = body as { code: string }

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const voucher = VALID_VOUCHERS[code.toUpperCase()]

    if (!voucher) {
      return NextResponse.json({ error: 'invalid', message: 'Invalid or expired voucher code.' }, { status: 400 })
    }

    if (voucher.used) {
      return NextResponse.json({ error: 'already_used', message: 'This voucher has already been used.' }, { status: 400 })
    }

    // Mark as used
    voucher.used = true

    return NextResponse.json({
      success: true,
      voucher: {
        code: code.toUpperCase(),
        amount: voucher.amount,
        type: voucher.type,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
