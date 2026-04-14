import { NextResponse } from 'next/server'

export async function GET() {
  // Cross-border remittance rate (THB → MMK)
  // Configurable via MOCK_EXCHANGE_RATE env var (default 133.0 per D-03)
  const rate = parseFloat(process.env.MOCK_EXCHANGE_RATE ?? '133.0')

  // Rate is valid for 5 minutes (D-10)
  const validUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  return NextResponse.json({
    rate,
    validUntil,
    from: 'THB',
    to: 'MMK',
  })
}
