import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { KYCStatusValue, DocumentType } from '@/lib/kyc/schemas'

export type CaptureStep =
  | 'select-type'
  | 'capture-front'
  | 'review-front'
  | 'capture-back'
  | 'review-back'
  | 'capture-selfie'
  | 'review-selfie'
  | 'processing'
  | 'status'

export interface KYCState {
  captureStep: CaptureStep
  documentType: DocumentType | ''
  frontImage: string
  backImage: string
  selfieImage: string
  submissionId: string
  kycStatus: KYCStatusValue
  rejectionReasons: string[]
}

interface KYCActions {
  setDocumentType: (type: DocumentType) => void
  setCaptureStep: (step: CaptureStep) => void
  setFrontImage: (image: string) => void
  setBackImage: (image: string) => void
  setSelfieImage: (image: string) => void
  setSubmissionResult: (result: {
    kycStatus: KYCStatusValue
    rejectionReasons: string[]
    submissionId: string
  }) => void
  clearAll: () => void
}

const initialState: KYCState = {
  captureStep: 'select-type',
  documentType: '',
  frontImage: '',
  backImage: '',
  selfieImage: '',
  submissionId: '',
  kycStatus: 'not_started',
  rejectionReasons: [],
}

export const useKYCStore = create<KYCState & KYCActions>()(
  persist(
    (set) => ({
      ...initialState,

      setDocumentType: (type) => set({ documentType: type }),

      setCaptureStep: (step) => set({ captureStep: step }),

      setFrontImage: (image) => set({ frontImage: image }),

      setBackImage: (image) => set({ backImage: image }),

      setSelfieImage: (image) => set({ selfieImage: image }),

      setSubmissionResult: ({ kycStatus, rejectionReasons, submissionId }) =>
        set({ kycStatus, rejectionReasons, submissionId }),

      clearAll: () => set({ ...initialState }),
    }),
    {
      name: 'wave-kyc-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        captureStep: state.captureStep,
        documentType: state.documentType,
        frontImage: state.frontImage,
        backImage: state.backImage,
        selfieImage: state.selfieImage,
        submissionId: state.submissionId,
        kycStatus: state.kycStatus,
        rejectionReasons: state.rejectionReasons,
      }),
    }
  )
)
