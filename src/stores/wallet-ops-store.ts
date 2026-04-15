import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface WalletOpsState {
  // Top-up flow state
  topupAmount: string
  topupChannel: string | null

  // Withdrawal flow state
  withdrawRecipientId: string | null
  withdrawBankAccountId: string | null
  withdrawAmount: string
}

interface WalletOpsActions {
  // Top-up actions
  setTopupAmount: (amount: string) => void
  setTopupChannel: (channel: string | null) => void
  resetTopup: () => void

  // Withdrawal actions
  setWithdrawRecipient: (recipientId: string | null) => void
  setWithdrawBankAccount: (bankAccountId: string | null) => void
  setWithdrawAmount: (amount: string) => void
  resetWithdraw: () => void
}

const initialState: WalletOpsState = {
  topupAmount: '',
  topupChannel: null,
  withdrawRecipientId: null,
  withdrawBankAccountId: null,
  withdrawAmount: '',
}

export const useWalletOpsStore = create<WalletOpsState & WalletOpsActions>()(
  persist(
    (set) => ({
      ...initialState,

      // Top-up actions
      setTopupAmount: (amount) => set({ topupAmount: amount }),
      setTopupChannel: (channel) => set({ topupChannel: channel }),
      resetTopup: () =>
        set({ topupAmount: initialState.topupAmount, topupChannel: initialState.topupChannel }),

      // Withdrawal actions
      setWithdrawRecipient: (recipientId) => set({ withdrawRecipientId: recipientId }),
      setWithdrawBankAccount: (bankAccountId) => set({ withdrawBankAccountId: bankAccountId }),
      setWithdrawAmount: (amount) => set({ withdrawAmount: amount }),
      resetWithdraw: () =>
        set({
          withdrawRecipientId: initialState.withdrawRecipientId,
          withdrawBankAccountId: initialState.withdrawBankAccountId,
          withdrawAmount: initialState.withdrawAmount,
        }),
    }),
    {
      name: 'wave-wallet-ops-store',
      // Session storage: wallet ops state is session-scoped, not persistent across sessions
      storage: createJSONStorage(() => sessionStorage),
      // Persist all fields — needed for multi-step navigation within same session
      partialize: (state) => ({
        topupAmount: state.topupAmount,
        topupChannel: state.topupChannel,
        withdrawRecipientId: state.withdrawRecipientId,
        withdrawBankAccountId: state.withdrawBankAccountId,
        withdrawAmount: state.withdrawAmount,
      }),
    }
  )
)
