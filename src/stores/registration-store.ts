import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface RegistrationState {
  // Current registration step
  step: 1 | 2 | 3

  // Step 0 (pre-registration): phone
  phone: string
  countryCode: '+66' | '+95'

  // Step 1: personal info
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: 'thai' | 'myanmar' | 'other' | ''

  // Step 2: ID details
  idType: 'national_id' | 'passport' | 'work_permit' | 'other' | ''
  idNumber: string
  idExpiry: string
}

interface RegistrationActions {
  setStep: (step: 1 | 2 | 3) => void
  setPhone: (phone: string, countryCode: '+66' | '+95') => void
  setPersonalInfo: (info: {
    firstName: string
    lastName: string
    dateOfBirth: string
    nationality: 'thai' | 'myanmar' | 'other'
  }) => void
  setIdDetails: (details: {
    idType: 'national_id' | 'passport' | 'work_permit' | 'other'
    idNumber: string
    idExpiry: string
  }) => void
  clearAll: () => void
}

const initialState: RegistrationState = {
  step: 1,
  phone: '',
  countryCode: '+66',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  nationality: '',
  idType: '',
  idNumber: '',
  idExpiry: '',
}

export const useRegistrationStore = create<RegistrationState & RegistrationActions>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      setPhone: (phone, countryCode) => set({ phone, countryCode }),

      setPersonalInfo: ({ firstName, lastName, dateOfBirth, nationality }) =>
        set({ firstName, lastName, dateOfBirth, nationality }),

      setIdDetails: ({ idType, idNumber, idExpiry }) =>
        set({ idType, idNumber, idExpiry }),

      clearAll: () => set({ ...initialState }),
    }),
    {
      name: 'wave-registration-state',
      storage: createJSONStorage(() => localStorage),
      // Exclude action functions from persisted state
      partialize: (state) => ({
        step: state.step,
        phone: state.phone,
        countryCode: state.countryCode,
        firstName: state.firstName,
        lastName: state.lastName,
        dateOfBirth: state.dateOfBirth,
        nationality: state.nationality,
        idType: state.idType,
        idNumber: state.idNumber,
        idExpiry: state.idExpiry,
      }),
    }
  )
)
