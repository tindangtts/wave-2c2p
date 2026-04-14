import { z } from 'zod/v4'

// Transfer channel enum
export const transferChannelSchema = z.enum([
  'wave_agent',
  'wave_app',
  'bank_transfer',
  'cash_pickup',
])

export type TransferChannelValue = z.infer<typeof transferChannelSchema>

// Occupation options
export const occupationOptions = [
  'employed',
  'self_employed',
  'student',
  'retired',
  'unemployed',
  'other',
] as const

export type OccupationOption = (typeof occupationOptions)[number]

// Transfer purpose options
export const purposeOptions = [
  'family_support',
  'education',
  'medical',
  'business',
  'savings',
  'other',
] as const

export type PurposeOption = (typeof purposeOptions)[number]

// Relationship options
export const relationshipOptions = [
  'family',
  'friend',
  'business_partner',
  'employer',
  'other',
] as const

export type RelationshipOption = (typeof relationshipOptions)[number]

/**
 * Recipient form schema — validates all fields per D-06 UI-SPEC.
 * Bank fields (bank_name, account_no) are required when transfer_type is 'bank_transfer'.
 */
export const recipientFormSchema = z
  .object({
    transfer_type: transferChannelSchema,
    bank_name: z.string().optional(),
    account_no: z.string().optional(),
    first_name: z
      .string()
      .min(1, 'required_field')
      .max(50, 'First name must be 50 characters or less'),
    last_name: z
      .string()
      .min(1, 'required_field')
      .max(50, 'Last name must be 50 characters or less'),
    nrc: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val || /^\d{1,2}\/[A-Z]+\([A-Z]\)\d{6}$/.test(val),
        { message: 'nrc_format_error' }
      ),
    phone: z
      .string()
      .min(1, 'required_field')
      .refine(
        (val) => /^\+959\d{9}$/.test(val.replace(/\s/g, '')),
        { message: 'phone_myanmar_error' }
      ),
    occupation: z.enum(occupationOptions).optional(),
    transfer_purpose: z.enum(purposeOptions, { error: 'required_field' }),
    relationship: z.enum(relationshipOptions, { error: 'required_field' }),
    address_line_1: z.string().min(1, 'required_field'),
    address_line_2: z.string().optional(),
    city: z.string().min(1, 'required_field'),
    state_region: z.string().min(1, 'required_field'),
  })
  .superRefine((data, ctx) => {
    if (data.transfer_type === 'bank_transfer') {
      if (!data.bank_name || data.bank_name.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'required_field',
          path: ['bank_name'],
        })
      }
      if (!data.account_no || data.account_no.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'required_field',
          path: ['account_no'],
        })
      }
    }
  })

export type RecipientFormInput = z.infer<typeof recipientFormSchema>

/**
 * Transfer amount schema — validates amount per D-11.
 * amountSatang is in smallest unit (satang).
 * Min 10000 satang = 100 THB, Max 2500000 satang = 25000 THB.
 * Balance check is done at component level (not schema — balance is runtime).
 */
export const transferAmountSchema = z.object({
  amountSatang: z
    .number()
    .int('Amount must be a whole number')
    .min(10000, 'amount_min_error')
    .max(2500000, 'amount_max_error'),
})

export type TransferAmountInput = z.infer<typeof transferAmountSchema>
