import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// vi.hoisted ensures these are available when vi.mock factory runs
// ---------------------------------------------------------------------------
const { mockGetUser, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      body,
    }),
  },
}))

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
import { GET, POST, DELETE } from '../route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser = { id: 'user-uuid-123' }

const mockBankAccount = {
  id: 'ba-uuid-1',
  user_id: 'user-uuid-123',
  bank_name: 'SCB',
  account_number: '1234567890',
  account_name: 'Test User',
  created_at: '2026-04-15T00:00:00Z',
}

function makeQueryChain(resolvedWith: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'order', 'insert', 'delete', 'limit', 'contains', 'maybeSingle', 'single']
  methods.forEach(m => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  // terminal calls return resolved value
  ;(chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue(resolvedWith)
  ;(chain.single as ReturnType<typeof vi.fn>).mockResolvedValue(resolvedWith)
  // order is also terminal for GET (no further chaining)
  ;(chain.order as ReturnType<typeof vi.fn>).mockResolvedValue(resolvedWith)
  return chain
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/bank-accounts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') })
    const res = await GET()
    expect(res.status).toBe(401)
    expect((res.body as { error: string }).error).toBe('Unauthorized')
  })

  it('returns bank_accounts array for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    const chain = makeQueryChain({ data: [mockBankAccount], error: null })
    mockFrom.mockReturnValue(chain)

    const res = await GET()
    expect(res.status).toBe(200)
    expect((res.body as { bank_accounts: unknown[] }).bank_accounts).toHaveLength(1)
  })

  it('returns empty array when user has no bank accounts', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    const chain = makeQueryChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    const res = await GET()
    expect(res.status).toBe(200)
    expect((res.body as { bank_accounts: unknown[] }).bank_accounts).toHaveLength(0)
  })
})

describe('POST /api/bank-accounts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') })
    const req = new Request('http://localhost/api/bank-accounts', {
      method: 'POST',
      body: JSON.stringify({ bank_name: 'SCB', account_number: '1234567890', account_name: 'Test User' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for missing fields', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    const req = new Request('http://localhost/api/bank-accounts', {
      method: 'POST',
      body: JSON.stringify({ bank_name: 'SCB' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid account_number (not 10-12 digits)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    const req = new Request('http://localhost/api/bank-accounts', {
      method: 'POST',
      body: JSON.stringify({ bank_name: 'SCB', account_number: '123', account_name: 'Test User' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('creates bank account and returns 201', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    const chain = makeQueryChain({ data: mockBankAccount, error: null })
    mockFrom.mockReturnValue(chain)

    const req = new Request('http://localhost/api/bank-accounts', {
      method: 'POST',
      body: JSON.stringify({ bank_name: 'SCB', account_number: '1234567890', account_name: 'Test User' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect((res.body as { bank_account: unknown }).bank_account).toBeDefined()
  })
})

describe('DELETE /api/bank-accounts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') })
    const req = new Request('http://localhost/api/bank-accounts?id=ba-uuid-1')
    const res = await DELETE(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when id param is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    const req = new Request('http://localhost/api/bank-accounts')
    const res = await DELETE(req)
    expect(res.status).toBe(400)
  })

  it('returns 409 when pending withdrawal exists for bank account', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    // transactions check returns a pending transaction
    const pendingChain = makeQueryChain({ data: { id: 'tx-uuid' }, error: null })
    mockFrom.mockReturnValue(pendingChain)

    const req = new Request('http://localhost/api/bank-accounts?id=ba-uuid-1')
    const res = await DELETE(req)
    expect(res.status).toBe(409)
    expect((res.body as { error: string }).error).toContain('pending withdrawal')
  })

  it('returns 200 on successful delete when no pending withdrawal', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    // First from() call: transactions pending check — returns null (no pending tx)
    const noPendingChain = makeQueryChain({ data: null, error: null })

    // Second from() call: delete chain — final .eq() resolves with no error
    const deleteChain: Record<string, unknown> = {}
    const deleteMethods = ['delete', 'eq']
    deleteMethods.forEach(m => {
      deleteChain[m] = vi.fn().mockReturnValue(deleteChain)
    })
    // Second .eq() (the user_id eq) resolves with { error: null }
    let eqCallCount = 0
    ;(deleteChain.eq as ReturnType<typeof vi.fn>).mockImplementation(() => {
      eqCallCount++
      if (eqCallCount >= 2) {
        return Promise.resolve({ error: null })
      }
      return deleteChain
    })

    mockFrom
      .mockReturnValueOnce(noPendingChain)
      .mockReturnValueOnce(deleteChain)

    const req = new Request('http://localhost/api/bank-accounts?id=ba-uuid-1')
    const res = await DELETE(req)
    expect(res.status).toBe(200)
    expect((res.body as { success: boolean }).success).toBe(true)
  })
})
