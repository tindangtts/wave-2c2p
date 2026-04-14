import { z } from 'zod/v4'

export const documentTypeSchema = z.enum([
  'national_id',
  'work_permit',
  'pink_card',
  'owic',
  'visa',
])

export type DocumentType = z.infer<typeof documentTypeSchema>

export const kycStatusSchema = z.enum([
  'not_started',
  'pending',
  'approved',
  'rejected',
  'expired',
])

export type KYCStatusValue = z.infer<typeof kycStatusSchema>

export const kycSubmissionSchema = z.object({
  documentType: documentTypeSchema,
  frontImage: z.string().min(1, 'Front image is required'),
  backImage: z.string().min(1, 'Back image is required'),
  selfieImage: z.string().min(1, 'Selfie image is required'),
})

export type KYCSubmissionInput = z.infer<typeof kycSubmissionSchema>

export const kycSubmitRequestSchema = z.object({
  document_type: documentTypeSchema,
  front_image: z.string().min(1),
  back_image: z.string().min(1),
  selfie_image: z.string().min(1),
})

export type KYCSubmitRequest = z.infer<typeof kycSubmitRequestSchema>
