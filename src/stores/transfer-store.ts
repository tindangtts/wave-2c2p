import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Recipient, TransferChannel } from '@/types'

export type TransferStatus = 'idle' | 'pending' | 'processing' | 'success' | 'failed'

export interface TransferState {
  selectedRecipient: Recipient | null
  amountSatang: number
  channel: TransferChannel | null
  rate: number
  rateValidUntil: string
  feeSatang: number
  note: string
  transactionId: string
  status: TransferStatus
}

interface TransferActions {
  setRecipient: (recipient: Recipient | null) => void
  setAmount: (amountSatang: number) => void
  setChannel: (channel: TransferChannel | null) => void
  setRate: (rate: number, validUntil: string) => void
  setFee: (feeSatang: number) => void
  setNote: (note: string) => void
  setTransactionId: (transactionId: string) => void
  setStatus: (status: TransferStatus) => void
  reset: () => void
}

const initialState: TransferState = {
  selectedRecipient: null,
  amountSatang: 0,
  channel: null,
  rate: 0,
  rateValidUntil: '',
  feeSatang: 0,
  note: '',
  transactionId: '',
  status: 'idle',
}

export const useTransferStore = create<TransferState & TransferActions>()(
  persist(
    (set) => ({
      ...initialState,

      setRecipient: (recipient) => set({ selectedRecipient: recipient }),

      setAmount: (amountSatang) => set({ amountSatang }),

      setChannel: (channel) => set({ channel }),

      setRate: (rate, validUntil) =>
        set({ rate, rateValidUntil: validUntil }),

      setFee: (feeSatang) => set({ feeSatang }),

      setNote: (note) => set({ note }),

      setTransactionId: (transactionId) => set({ transactionId }),

      setStatus: (status) => set({ status }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'wave-transfer-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist flow state — not ephemeral transaction tracking
      partialize: (state) => ({
        selectedRecipient: state.selectedRecipient,
        amountSatang: state.amountSatang,
        channel: state.channel,
        rate: state.rate,
        rateValidUntil: state.rateValidUntil,
        feeSatang: state.feeSatang,
        note: state.note,
        // transactionId and status are NOT persisted (ephemeral)
      }),
    }
  )
)
