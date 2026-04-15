import { describe, it, expect } from 'vitest'
import {
  documentTypeSchema,
  kycStatusSchema,
  kycSubmissionSchema,
} from '../schemas'

const validSubmission = {
  documentType: 'national_id' as const,
  frontImage: 'data:image/jpeg;base64,/9j/abc',
  backImage: 'data:image/jpeg;base64,/9j/def',
  selfieImage: 'data:image/jpeg;base64,/9j/ghi',
}

describe('documentTypeSchema', () => {
  it('accepts all 5 valid document types', () => {
    for (const docType of ['national_id', 'work_permit', 'pink_card', 'owic', 'visa'] as const) {
      const result = documentTypeSchema.safeParse(docType)
      expect(result.success).toBe(true)
    }
  })

  it('rejects drivers_license', () => {
    const result = documentTypeSchema.safeParse('drivers_license')
    expect(result.success).toBe(false)
  })

  it('rejects unknown document type', () => {
    const result = documentTypeSchema.safeParse('passport')
    expect(result.success).toBe(false)
  })
})

describe('kycStatusSchema', () => {
  it('accepts all 6 status values', () => {
    for (const status of [
      'not_started',
      'pending',
      'approved',
      'rejected',
      'expired',
      'pending_update',
    ] as const) {
      const result = kycStatusSchema.safeParse(status)
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid status', () => {
    const result = kycStatusSchema.safeParse('under_review')
    expect(result.success).toBe(false)
  })
})

describe('kycSubmissionSchema', () => {
  it('accepts valid submission with all 3 images', () => {
    const result = kycSubmissionSchema.safeParse(validSubmission)
    expect(result.success).toBe(true)
  })

  it('rejects missing frontImage (empty string)', () => {
    const result = kycSubmissionSchema.safeParse({ ...validSubmission, frontImage: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths.some((p) => p === 'frontImage')).toBe(true)
    }
  })

  it('rejects missing backImage (empty string)', () => {
    const result = kycSubmissionSchema.safeParse({ ...validSubmission, backImage: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths.some((p) => p === 'backImage')).toBe(true)
    }
  })

  it('rejects missing selfieImage (empty string)', () => {
    const result = kycSubmissionSchema.safeParse({ ...validSubmission, selfieImage: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths.some((p) => p === 'selfieImage')).toBe(true)
    }
  })

  it('rejects invalid documentType', () => {
    const result = kycSubmissionSchema.safeParse({ ...validSubmission, documentType: 'passport' })
    expect(result.success).toBe(false)
  })
})
