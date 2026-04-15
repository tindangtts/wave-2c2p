import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the module under test
// ---------------------------------------------------------------------------

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

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
  // terminal calls return the resolved value
  ;(chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue(resolvedWith)
  ;(chain.single as ReturnType<typeof vi.fn>).mockResolvedValue(resolvedWith)
  // order also needs to be terminal for GET
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
    // First from() call: transactions check — returns a pending transaction
    const pendingChain = makeQueryChain({ data: { id: 'tx-uuid' }, error: null })
    mockFrom.mockReturnValue(pendingChain)

    const req = new Request('http://localhost/api/bank-accounts?id=ba-uuid-1')
    const res = await DELETE(req)
    expect(res.status).toBe(409)
    expect((res.body as { error: string }).error).toContain('pending withdrawal')
  })

  it('returns 200 on successful delete when no pending withdrawal', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    // First call: transactions check — returns null (no pending)
    const noPendingChain = makeQueryChain({ data: null, error: null })
    // Second call: delete — returns no error
    const deleteChain = makeQueryChain({ data: null, error: null })
    ;(deleteChain.eq as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(deleteChain)
      .mockResolvedValueOnce({ error: null })

    mockFrom
      .mockReturnValueOnce(noPendingChain)
      .mockReturnValueOnce(deleteChain)

    const req = new Request('http://localhost/api/bank-accounts?id=ba-uuid-1')
    const res = await DELETE(req)
    expect(res.status).toBe(200)
    expect((res.body as { success: boolean }).success).toBe(true)
  })
})
