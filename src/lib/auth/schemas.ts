import { z } from 'zod'

// Phone validation schema — supports Thai (+66) and Myanmar (+95) numbers
export const phoneSchema = z
  .object({
    countryCode: z.enum(['+66', '+95']),
    phone: z.string(),
  })
  .superRefine((data, ctx) => {
    // Strip non-digit characters before validation
    const digits = data.phone.replace(/\D/g, '')

    if (data.countryCode === '+66') {
      // Thai numbers: 9-10 digits
      if (digits.length < 9 || digits.length > 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid Thai number (9-10 digits after +66).',
          path: ['phone'],
        })
      }
    } else if (data.countryCode === '+95') {
      // Myanmar numbers: 7-11 digits
      if (digits.length < 7 || digits.length > 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid Myanmar number (7-11 digits after +95).',
          path: ['phone'],
        })
      }
    }
  })

export type PhoneInput = z.infer<typeof phoneSchema>

// Personal information schema — step 1 of registration
export const personalInfoSchema = z.object({
  title: z.enum(['ms', 'mr', 'mrs']),
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  gender: z.enum(['male', 'female']),
  dateOfBirth: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Enter a valid date (DD/MM/YYYY).'),
  email: z.string().email('Enter a valid email address.').or(z.literal('')),
  nationality: z.enum(['thai', 'myanmar', 'other']),
})

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>

// ID details schema — step 2 of registration
export const idDetailsSchema = z.object({
  idType: z.enum(['national_id', 'passport', 'work_permit', 'other']),
  idNumber: z.string().min(1, 'ID number is required.'),
  idExpiry: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Enter a valid date (DD/MM/YYYY).'),
})

export type IdDetailsInput = z.infer<typeof idDetailsSchema>
