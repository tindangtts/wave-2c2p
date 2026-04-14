'use client'

import * as React from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { useTranslations } from 'next-intl'
import { BackHeader } from '@/components/layout/back-header'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionDetail } from '@/components/features/transaction-detail'
import type { Transaction } from '@/types'

const fetcher = (url: string): Promise<Transaction> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed to fetch transaction')
    return r.json()
  })

function SkeletonReceipt() {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex justify-center">
        <Skeleton className="h-8 w-24 rounded-full bg-secondary" />
      </div>
      <div className="mx-4 bg-white rounded-2xl border border-border p-4">
        <Skeleton className="h-6 w-32 mx-auto mb-4 rounded bg-secondary" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-between py-2">
            <Skeleton className="h-4 w-24 rounded bg-secondary" />
            <Skeleton className="h-4 w-32 rounded bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  )
}

interface TransactionDetailPageProps {
  params: Promise<{ id: string }>
}

export default function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const t = useTranslations('wallet')

  const { data: transaction, isLoading, error } = useSWR<Transaction>(
    id ? `/api/transactions?id=${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <BackHeader
        title={t('screenTitles.transactionDetail')}
        onBack={() => router.push('/history')}
      />

      <div className="flex-1 pb-24">
        {isLoading ? (
          <SkeletonReceipt />
        ) : error || !transaction ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-2">
            <p className="text-base font-bold text-foreground">Transaction not found</p>
            <p className="text-sm text-[#595959] text-center">
              This transaction could not be loaded.
            </p>
          </div>
        ) : (
          <TransactionDetail transaction={transaction} />
        )}
      </div>

      {/* Sticky "Close" CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-white border-t border-border max-w-[430px] mx-auto">
        <button
          type="button"
          onClick={() => router.push('/history')}
          className="w-full h-14 rounded-full bg-[#FFE600] text-foreground text-base font-bold transition-colors active:bg-[#FFD600]"
        >
          {t('ctas.close')}
        </button>
      </div>
    </div>
  )
}
