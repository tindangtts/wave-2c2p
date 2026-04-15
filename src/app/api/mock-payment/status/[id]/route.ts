import { NextResponse } from 'next/server'

// In-memory map to track when each transaction was first requested
// This simulates status progression: pending → processing → success
const transactionTimestamps = new Map<string, number>()

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const now = Date.now()

  // First call for this transaction ID: record creation time
  if (!transactionTimestamps.has(id)) {
    transactionTimestamps.set(id, now)
  }

  const createdAt = transactionTimestamps.get(id)!
  const elapsed = now - createdAt

  // Status progression per D-16:
  // < 1500ms  → pending
  // < 3000ms  → processing
  // >= 3000ms → success (or failed if MOCK_PAYMENT_FAIL=true)
  let status: 'pending' | 'processing' | 'success' | 'failed'

  if (elapsed < 1500) {
    status = 'pending'
  } else if (elapsed < 3000) {
    status = 'processing'
  } else {
    const mockFail = process.env.MOCK_PAYMENT_FAIL === 'true'
    status = mockFail ? 'failed' : 'success'
  }

  return NextResponse.json({
    id,
    status,
    updated_at: new Date().toISOString(),
  })
}
