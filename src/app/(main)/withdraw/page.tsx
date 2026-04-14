'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { BackHeader } from '@/components/layout/back-header'
import { RecipientList } from '@/components/features/recipient-list'
import { useWalletOpsStore } from '@/stores/wallet-ops-store'
import type { Recipient } from '@/types'

interface RecipientsData {
  recipients: Recipient[]
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('fetch failed')
    return r.json()
  })

export default function WithdrawPage() {
  const router = useRouter()
  const { withdrawRecipientId, setWithdrawRecipient } = useWalletOpsStore()

  const { data, isLoading, mutate } = useSWR<RecipientsData>('/api/recipients', fetcher)
  const recipients = data?.recipients ?? []

  const handleSelect = useCallback(
    (recipient: Recipient) => {
      setWithdrawRecipient(recipient.id)
      router.push(`/withdraw/amount?recipientId=${recipient.id}`)
    },
    [setWithdrawRecipient, router]
  )

  // Withdraw page uses existing recipients only — edit navigates to transfer edit route
  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/transfer/edit-recipient/${id}`)
    },
    [router]
  )

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <BackHeader title="Withdraw" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <RecipientList
          recipients={recipients}
          isLoading={isLoading}
          onSelect={handleSelect}
          selectedId={withdrawRecipientId}
          onEdit={handleEdit}
          mutate={mutate as Parameters<typeof RecipientList>[0]['mutate']}
        />
      </div>
    </div>
  )
}
