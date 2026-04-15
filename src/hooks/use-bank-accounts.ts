'use client'

import useSWR from 'swr'
import type { BankAccount } from '@/types'

export interface BankAccountsData {
  bank_accounts: BankAccount[]
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('fetch failed')
    return r.json()
  })

export function useBankAccounts() {
  return useSWR<BankAccountsData>('/api/bank-accounts', fetcher, {
    dedupingInterval: 10_000,
  })
}
