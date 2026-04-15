import { describe, it, expect } from 'vitest'
import { phoneSchema, personalInfoSchema, idDetailsSchema } from '../schemas'

describe('phoneSchema', () => {
  // Thai (+66) valid cases
  it('accepts valid TH number with 10 digits', () => {
    const result = phoneSchema.safeParse({ countryCode: '+66', phone: '0812345678' })
    expect(result.success).toBe(true)
  })

  it('accepts valid TH number with 9 digits', () => {
    const result = phoneSchema.safeParse({ countryCode: '+66', phone: '081234567' })
    expect(result.success).toBe(true)
  })

  it('rejects TH number with 8 digits', () => {
    const result = phoneSchema.safeParse({ countryCode: '+66', phone: '08123456' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('Thai') || m.includes('9-10'))).toBe(true)
    }
  })

  // Myanmar (+95) valid cases
  it('accepts valid MM number with 11 digits', () => {
    const result = phoneSchema.safeParse({ countryCode: '+95', phone: '09123456789' })
    expect(result.success).toBe(true)
  })

  it('accepts valid MM number with 7 digits', () => {
    const result = phoneSchema.safeParse({ countryCode: '+95', phone: '0912345' })
    expect(result.success).toBe(true)
  })

  it('rejects MM number with 6 digits', () => {
    const result = phoneSchema.safeParse({ countryCode: '+95', phone: '091234' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('Myanmar') || m.includes('7-11'))).toBe(true)
    }
  })

  // Strips non-digit characters before validation
  it('strips non-digit characters before validation (TH)', () => {
    const result = phoneSchema.safeParse({ countryCode: '+66', phone: '081-234-5678' })
    expect(result.success).toBe(true)
  })

  it('strips non-digit characters before validation (MM)', () => {
    const result = phoneSchema.safeParse({ countryCode: '+95', phone: '09-123-456-789' })
    expect(result.success).toBe(true)
  })
})

describe('personalInfoSchema', () => {
  it('accepts valid personal info', () => {
    const result = personalInfoSchema.safeParse({
      title: 'mr',
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male',
      dateOfBirth: '01/01/1990',
      email: 'john@example.com',
      nationality: 'thai',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty firstName', () => {
    const result = personalInfoSchema.safeParse({
      title: 'mr',
      firstName: '',
      lastName: 'Doe',
      gender: 'male',
      dateOfBirth: '01/01/1990',
      email: '',
      nationality: 'thai',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('First name is required'))).toBe(true)
    }
  })

  it('rejects empty lastName', () => {
    const result = personalInfoSchema.safeParse({
      title: 'mr',
      firstName: 'John',
      lastName: '',
      gender: 'male',
      dateOfBirth: '01/01/1990',
      email: '',
      nationality: 'thai',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('Last name is required'))).toBe(true)
    }
  })

  it('rejects invalid dateOfBirth format', () => {
    const result = personalInfoSchema.safeParse({
      title: 'mr',
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male',
      dateOfBirth: '1990-01-01',
      email: '',
      nationality: 'thai',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all nationality enum values', () => {
    for (const nationality of ['thai', 'myanmar', 'other'] as const) {
      const result = personalInfoSchema.safeParse({
        title: 'ms',
        firstName: 'John',
        lastName: 'Doe',
        gender: 'female',
        dateOfBirth: '01/01/1990',
        email: '',
        nationality,
      })
      expect(result.success).toBe(true)
    }
  })
})

describe('idDetailsSchema', () => {
  it('accepts valid ID details', () => {
    const result = idDetailsSchema.safeParse({
      idType: 'national_id',
      idNumber: 'TH1234567890',
      idExpiry: '31/12/2030',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty idNumber', () => {
    const result = idDetailsSchema.safeParse({
      idType: 'national_id',
      idNumber: '',
      idExpiry: '31/12/2030',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => m.includes('ID number is required'))).toBe(true)
    }
  })

  it('accepts all idType enum values', () => {
    for (const idType of ['national_id', 'passport', 'work_permit', 'other'] as const) {
      const result = idDetailsSchema.safeParse({
        idType,
        idNumber: 'ABC123',
        idExpiry: '01/01/2030',
      })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid idExpiry format', () => {
    const result = idDetailsSchema.safeParse({
      idType: 'passport',
      idNumber: 'P1234567',
      idExpiry: '2030-12-31',
    })
    expect(result.success).toBe(false)
  })
})
