import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-intl — returns the translation key as-is
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/transfer/new-recipient',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock BackHeader layout component
vi.mock('@/components/layout/back-header', () => ({
  BackHeader: ({ title }: { title: string }) => <div data-testid="back-header">{title}</div>,
}))

// Mock MyanmarAddressPicker (complex custom component)
vi.mock('@/components/features/myanmar-address-picker', () => ({
  MyanmarAddressPicker: ({ onChange }: { onChange: (addr: unknown) => void }) => (
    <div data-testid="myanmar-address-picker" />
  ),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock useRecipients SWR hook
const mockMutate = vi.fn()
vi.mock('@/hooks/use-recipients', () => ({
  useRecipients: () => ({
    data: { recipients: [] },
    error: null,
    isLoading: false,
    mutate: mockMutate,
  }),
}))

// Import AFTER all mocks are defined
import NewRecipientPage from '../new-recipient/page'

describe('NewRecipientPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)
  })

  it('renders the new recipient form with key fields', () => {
    render(<NewRecipientPage />)

    // Key identity fields
    expect(screen.getByLabelText(/label_first_name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/label_last_name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/label_phone/i)).toBeInTheDocument()

    // Submit button
    expect(screen.getByRole('button', { name: /cta_create_new/i })).toBeInTheDocument()
  })

  it('shows validation errors on empty submit for required fields', async () => {
    const user = userEvent.setup()
    render(<NewRecipientPage />)

    // Click the sticky CTA button (type="button" with onClick handleSubmit)
    await user.click(screen.getByRole('button', { name: /cta_create_new/i }))

    await waitFor(() => {
      // first_name and last_name are required (min 1 char, message: 'required_field')
      const alerts = screen.getAllByRole('alert')
      expect(alerts.length).toBeGreaterThan(0)
    })
  })

  it('shows first_name validation error on empty first name', async () => {
    const user = userEvent.setup()
    render(<NewRecipientPage />)

    // Ensure first_name is empty and submit
    const firstNameInput = screen.getByLabelText(/label_first_name/i)
    await user.clear(firstNameInput)

    await user.click(screen.getByRole('button', { name: /cta_create_new/i }))

    await waitFor(() => {
      // Multiple 'required_field' alerts may appear; verify at least one is rendered
      const alerts = screen.getAllByText('required_field')
      expect(alerts.length).toBeGreaterThan(0)
    })
  })

  it('shows bank fields when bank_transfer type is selected', async () => {
    const user = userEvent.setup()
    render(<NewRecipientPage />)

    // Bank fields should NOT be visible initially (default is wave_app)
    expect(screen.queryByLabelText(/label_bank_name/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/label_account_no/i)).not.toBeInTheDocument()

    // Find the transfer_type select trigger and click it to open
    const transferTypeTrigger = screen.getByRole('combobox', { name: /label_transfer_type/i })
    await user.click(transferTypeTrigger)

    // Click the bank_transfer option
    await waitFor(() => {
      const bankTransferOption = screen.getByRole('option', { name: /channel_bank_transfer/i })
      return bankTransferOption
    })
    await user.click(screen.getByRole('option', { name: /channel_bank_transfer/i }))

    // Bank fields should now appear
    await waitFor(() => {
      expect(screen.getByLabelText(/label_bank_name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/label_account_no/i)).toBeInTheDocument()
    })
  })

  it('shows phone validation error for invalid Myanmar phone number', async () => {
    const user = userEvent.setup()
    render(<NewRecipientPage />)

    // Fill first_name and last_name to isolate phone error
    const firstNameInput = screen.getByLabelText(/label_first_name/i)
    const lastNameInput = screen.getByLabelText(/label_last_name/i)
    await user.click(firstNameInput)
    await user.type(firstNameInput, 'Aung')
    await user.click(lastNameInput)
    await user.type(lastNameInput, 'Kyaw')

    // Enter invalid phone
    const phoneInput = screen.getByLabelText(/label_phone/i)
    await user.clear(phoneInput)
    await user.type(phoneInput, '+959123') // too short

    await user.click(screen.getByRole('button', { name: /cta_create_new/i }))

    await waitFor(() => {
      expect(screen.getByText('phone_myanmar_error')).toBeInTheDocument()
    })
  })
})
