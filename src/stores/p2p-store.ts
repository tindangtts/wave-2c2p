'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type P2PStatus = 'idle' | 'pending' | 'processing' | 'success' | 'failed'

export interface P2PState {
  receiverWalletId: string
  amountSatang: number
  status: P2PStatus
  transactionId: string
}

interface P2PActions {
  setReceiverWalletId: (receiverWalletId: string) => void
  setAmount: (amountSatang: number) => void
  setTransactionId: (transactionId: string) => void
  setStatus: (status: P2PStatus) => void
  reset: () => void
}

const initialState: P2PState = {
  receiverWalletId: '',
  amountSatang: 0,
  status: 'idle',
  transactionId: '',
}

export const useP2PStore = create<P2PState & P2PActions>()(
  persist(
    (set) => ({
      ...initialState,

      setReceiverWalletId: (receiverWalletId) => set({ receiverWalletId }),

      setAmount: (amountSatang) => set({ amountSatang }),

      setTransactionId: (transactionId) => set({ transactionId }),

      setStatus: (status) => set({ status }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'wave-p2p-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist flow state — transactionId and status are ephemeral (NOT persisted)
      partialize: (state) => ({
        receiverWalletId: state.receiverWalletId,
        amountSatang: state.amountSatang,
      }),
    }
  )
)
