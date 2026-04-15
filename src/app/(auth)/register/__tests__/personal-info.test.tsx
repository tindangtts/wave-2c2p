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
  usePathname: () => '/register/personal-info',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock layout components that have no bearing on form logic
vi.mock('@/components/layout/back-header', () => ({
  BackHeader: ({ title }: { title: string }) => <div data-testid="back-header">{title}</div>,
}))

vi.mock('@/components/features/step-indicator', () => ({
  StepIndicator: ({ currentStep }: { currentStep: number }) => (
    <div data-testid="step-indicator">Step {currentStep}</div>
  ),
}))

// Mock Zustand registration store
const mockSetPersonalInfo = vi.fn()
const mockSetStep = vi.fn()
vi.mock('@/stores/registration-store', () => ({
  useRegistrationStore: () => ({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: 'thai',
    phone: '812345678',
    countryCode: '+66',
    setPersonalInfo: mockSetPersonalInfo,
    setStep: mockSetStep,
  }),
}))

// Import AFTER all mocks are defined
import PersonalInfoPage from '../personal-info/page'

describe('PersonalInfoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock fetch for form submission
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)
  })

  it('renders the form with required fields', () => {
    render(<PersonalInfoPage />)

    // First name and last name inputs should be visible
    expect(screen.getByLabelText(/fields.firstName/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fields.lastName/i)).toBeInTheDocument()

    // Date of birth and email inputs
    expect(screen.getByLabelText(/fields.dateOfBirth/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fields.email/i)).toBeInTheDocument()

    // Submit button
    expect(screen.getByRole('button', { name: /cta.next/i })).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty required fields', async () => {
    const user = userEvent.setup()
    render(<PersonalInfoPage />)

    // Clear firstName and lastName to ensure they are empty
    const firstNameInput = screen.getByLabelText(/fields.firstName/i)
    const lastNameInput = screen.getByLabelText(/fields.lastName/i)
    await user.clear(firstNameInput)
    await user.clear(lastNameInput)

    // Submit the form
    await user.click(screen.getByRole('button', { name: /cta.next/i }))

    await waitFor(() => {
      // firstName error (min 1 char)
      expect(screen.getByText('First name is required.')).toBeInTheDocument()
    })

    await waitFor(() => {
      // lastName error
      expect(screen.getByText('Last name is required.')).toBeInTheDocument()
    })
  })

  it('shows dateOfBirth validation error when format is invalid', async () => {
    const user = userEvent.setup()
    render(<PersonalInfoPage />)

    // Type invalid date
    const dobInput = screen.getByLabelText(/fields.dateOfBirth/i)
    await user.click(dobInput)
    await user.type(dobInput, 'not-a-date')

    await user.click(screen.getByRole('button', { name: /cta.next/i }))

    await waitFor(() => {
      expect(screen.getByText('Enter a valid date (DD/MM/YYYY).')).toBeInTheDocument()
    })
  })

  it('shows email validation error when email is invalid', async () => {
    const user = userEvent.setup()
    render(<PersonalInfoPage />)

    // Fill required fields correctly
    const firstNameInput = screen.getByLabelText(/fields.firstName/i)
    const lastNameInput = screen.getByLabelText(/fields.lastName/i)
    const dobInput = screen.getByLabelText(/fields.dateOfBirth/i)
    const emailInput = screen.getByLabelText(/fields.email/i)

    await user.click(firstNameInput)
    await user.type(firstNameInput, 'John')
    await user.click(lastNameInput)
    await user.type(lastNameInput, 'Doe')
    await user.click(dobInput)
    await user.type(dobInput, '01/01/1990')
    await user.click(emailInput)
    await user.type(emailInput, 'not-an-email')

    await user.click(screen.getByRole('button', { name: /cta.next/i }))

    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    })
  })

  it('submits successfully when all required fields are filled correctly', async () => {
    const user = userEvent.setup()
    render(<PersonalInfoPage />)

    // Fill in all required text fields
    const firstNameInput = screen.getByLabelText(/fields.firstName/i)
    const lastNameInput = screen.getByLabelText(/fields.lastName/i)
    const dobInput = screen.getByLabelText(/fields.dateOfBirth/i)

    await user.click(firstNameInput)
    await user.type(firstNameInput, 'John')
    await user.click(lastNameInput)
    await user.type(lastNameInput, 'Doe')
    await user.click(dobInput)
    await user.type(dobInput, '01/01/1990')
    // email is optional — leave blank (empty string passes schema)

    await user.click(screen.getByRole('button', { name: /cta.next/i }))

    await waitFor(() => {
      // No firstName or lastName errors
      expect(screen.queryByText('First name is required.')).not.toBeInTheDocument()
      expect(screen.queryByText('Last name is required.')).not.toBeInTheDocument()
    })

    // Store should be called with the form data
    await waitFor(() => {
      expect(mockSetPersonalInfo).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'John', lastName: 'Doe' })
      )
    })
  })
})
