import { describe, it, expect } from 'vitest'
import {
  recipientFormSchema,
  transferAmountSchema,
  transferChannelSchema,
} from '../schemas'

const validRecipient = {
  transfer_type: 'wave_agent' as const,
  first_name: 'Aung',
  last_name: 'Win',
  phone: '+959123456789',
  transfer_purpose: 'family_support' as const,
  relationship: 'family' as const,
  address_line_1: '123 Main St',
  city: 'Yangon',
  state_region: 'Yangon',
}

describe('recipientFormSchema', () => {
  it('accepts valid wave_agent recipient', () => {
    const result = recipientFormSchema.safeParse(validRecipient)
    expect(result.success).toBe(true)
  })

  it('rejects empty first_name', () => {
    const result = recipientFormSchema.safeParse({ ...validRecipient, first_name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('required_field'))).toBe(true)
    }
  })

  it('rejects invalid Myanmar phone format', () => {
    const result = recipientFormSchema.safeParse({ ...validRecipient, phone: '+66081234567' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('phone_myanmar_error'))).toBe(true)
    }
  })

  it('requires bank_name when transfer_type is bank_transfer', () => {
    const result = recipientFormSchema.safeParse({
      ...validRecipient,
      transfer_type: 'bank_transfer',
      account_no: '1234567890',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths.some((p) => p === 'bank_name')).toBe(true)
    }
  })

  it('requires account_no when transfer_type is bank_transfer', () => {
    const result = recipientFormSchema.safeParse({
      ...validRecipient,
      transfer_type: 'bank_transfer',
      bank_name: 'KBZ',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths.some((p) => p === 'account_no')).toBe(true)
    }
  })

  it('accepts valid bank_transfer recipient with bank_name and account_no', () => {
    const result = recipientFormSchema.safeParse({
      ...validRecipient,
      transfer_type: 'bank_transfer',
      bank_name: 'KBZ',
      account_no: '1234567890',
    })
    expect(result.success).toBe(true)
  })

  it('does NOT require bank fields when transfer_type is wave_agent', () => {
    const result = recipientFormSchema.safeParse(validRecipient)
    expect(result.success).toBe(true)
  })

  it('accepts valid NRC format', () => {
    const result = recipientFormSchema.safeParse({
      ...validRecipient,
      nrc: '12/ABCDEF(N)123456',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid NRC format', () => {
    const result = recipientFormSchema.safeParse({
      ...validRecipient,
      nrc: 'invalid-nrc',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('nrc_format_error'))).toBe(true)
    }
  })
})

describe('transferAmountSchema', () => {
  it('accepts minimum amount (10000 satang = 100 THB)', () => {
    const result = transferAmountSchema.safeParse({ amountSatang: 10000 })
    expect(result.success).toBe(true)
  })

  it('accepts maximum amount (2500000 satang = 25000 THB)', () => {
    const result = transferAmountSchema.safeParse({ amountSatang: 2500000 })
    expect(result.success).toBe(true)
  })

  it('rejects amount below minimum (9999)', () => {
    const result = transferAmountSchema.safeParse({ amountSatang: 9999 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('amount_min_error'))).toBe(true)
    }
  })

  it('rejects amount above maximum (2500001)', () => {
    const result = transferAmountSchema.safeParse({ amountSatang: 2500001 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('amount_max_error'))).toBe(true)
    }
  })

  it('rejects non-integer amount (10000.5)', () => {
    const result = transferAmountSchema.safeParse({ amountSatang: 10000.5 })
    expect(result.success).toBe(false)
  })
})

describe('transferChannelSchema', () => {
  it('accepts all valid channel values', () => {
    for (const channel of ['wave_agent', 'wave_app', 'bank_transfer', 'cash_pickup'] as const) {
      const result = transferChannelSchema.safeParse(channel)
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid channel value', () => {
    const result = transferChannelSchema.safeParse('invalid_channel')
    expect(result.success).toBe(false)
  })
})
