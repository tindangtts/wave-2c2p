import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-intl — returns the translation key as-is
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: vi.fn() }),
  usePathname: () => '/transfer/amount',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock BackHeader layout component
vi.mock('@/components/layout/back-header', () => ({
  BackHeader: ({ title }: { title: string }) => <div data-testid="back-header">{title}</div>,
}))

// Mock useTransferStore — provide a selected recipient so page doesn't redirect
const mockSetAmount = vi.fn()
const mockSetRate = vi.fn()
const mockSelectedRecipient = {
  id: 'rec-001',
  first_name: 'Aung',
  last_name: 'Kyaw',
  full_name: 'Aung Kyaw',
  transfer_type: 'wave_app',
  phone: '+9591234567890',
  address_line_1: '123 Main St',
  city: 'Yangon',
  state_region: 'Yangon',
  is_favorite: false,
  created_at: '2024-01-01T00:00:00Z',
}

vi.mock('@/stores/transfer-store', () => ({
  useTransferStore: () => ({
    selectedRecipient: mockSelectedRecipient,
    rate: 55.5,
    setAmount: mockSetAmount,
    setRate: mockSetRate,
  }),
}))

// Mock useWallet — provide a sufficient balance (1,000,000 satang = 10,000 THB)
vi.mock('@/hooks/use-wallet', () => ({
  useWallet: () => ({
    data: {
      wallet: { balance: 1000000, currency: 'THB', id: 'w-001' },
      profile: { first_name: 'Test', wallet_id: 'w-001' },
    },
    error: null,
    isLoading: false,
    mutate: vi.fn(),
  }),
}))

// Import AFTER all mocks
import AmountPage from '../amount/page'

describe('AmountPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock the rate fetch endpoint
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rate: 55.5, validUntil: '2024-12-31T23:59:59Z' }),
    } as Response)
  })

  it('renders the amount input keypad', async () => {
    render(<AmountPage />)

    // AmountInput renders digit buttons 1–9, 0, decimal point
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '0' })).toBeInTheDocument()
    })
  })

  it('renders recipient name in the summary section', async () => {
    render(<AmountPage />)

    await waitFor(() => {
      expect(screen.getByText('Aung Kyaw')).toBeInTheDocument()
    })
  })

  it('shows error when amount is below minimum (100 THB)', async () => {
    const user = userEvent.setup()
    render(<AmountPage />)

    // Type 99 via keypad buttons: press 9 then 9
    await waitFor(() => screen.getByRole('button', { name: '9' }))

    await user.click(screen.getByRole('button', { name: '9' }))
    await user.click(screen.getByRole('button', { name: '9' }))

    // Validation error should appear (amount_min_error key — returned as-is by mock t())
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('amount_min_error')).toBeInTheDocument()
    })
  })

  it('shows error when amount is above maximum (25000 THB)', async () => {
    const user = userEvent.setup()
    render(<AmountPage />)

    await waitFor(() => screen.getByRole('button', { name: '2' }))

    // Type 26000 via keypad: 2, 6, 0, 0, 0
    await user.click(screen.getByRole('button', { name: '2' }))
    await user.click(screen.getByRole('button', { name: '6' }))
    await user.click(screen.getByRole('button', { name: '0' }))
    await user.click(screen.getByRole('button', { name: '0' }))
    await user.click(screen.getByRole('button', { name: '0' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('amount_max_error')).toBeInTheDocument()
    })
  })

  it('enables the Next button when a valid amount is entered', async () => {
    const user = userEvent.setup()
    render(<AmountPage />)

    await waitFor(() => screen.getByRole('button', { name: '1' }))

    // Type 500 (valid — between 100 and 25000, within balance)
    await user.click(screen.getByRole('button', { name: '5' }))
    await user.click(screen.getByRole('button', { name: '0' }))
    await user.click(screen.getByRole('button', { name: '0' }))

    // No validation error should be shown
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    // The cta_next button should not be disabled
    const nextButton = screen.getByRole('button', { name: /cta_next/i })
    expect(nextButton).not.toBeDisabled()
  })

  it('does not redirect to recipient page when selectedRecipient is set', async () => {
    render(<AmountPage />)

    // Give effects time to run
    await waitFor(() => screen.getByRole('button', { name: '1' }))

    // mockReplace should NOT have been called (recipient is set)
    expect(mockReplace).not.toHaveBeenCalledWith('/transfer/recipient')
  })
})
