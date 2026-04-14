'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { isToday, isYesterday, format } from 'date-fns'
import { useTranslations } from 'next-intl'
import { BackHeader } from '@/components/layout/back-header'
import { Skeleton } from '@/components/ui/skeleton'
import { HistoryFilterBar } from '@/components/features/history-filter-bar'
import { TransactionRow } from '@/components/features/transaction-row'
import { useTransactions } from '@/hooks/use-transactions'
import type { Transaction } from '@/types'
import type { DateRangeValue } from '@/components/features/date-range-picker'

function formatGroupHeader(dateStr: string): string {
  if (dateStr === 'unknown') return 'Unknown Date'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Unknown Date'
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

function groupByDate(transactions: Transaction[]): { date: string; items: Transaction[] }[] {
  const map = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const d = new Date(tx.created_at)
    const dayKey = isNaN(d.getTime()) ? 'unknown' : format(d, 'yyyy-MM-dd')
    const existing = map.get(dayKey)
    if (existing) {
      existing.push(tx)
    } else {
      map.set(dayKey, [tx])
    }
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }))
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 min-h-[60px] border-b border-[#F5F5F5]">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0 bg-[#F5F5F5]" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-4 w-40 rounded bg-[#F5F5F5]" />
        <Skeleton className="h-3 w-24 rounded bg-[#F5F5F5]" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <Skeleton className="h-4 w-20 rounded bg-[#F5F5F5]" />
        <Skeleton className="h-4 w-14 rounded-full bg-[#F5F5F5]" />
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const router = useRouter()
  const t = useTranslations('wallet')

  const [typeFilter, setTypeFilter] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [dateRange, setDateRange] = React.useState<DateRangeValue>({})

  const sentinelRef = React.useRef<HTMLDivElement>(null)

  const filters = React.useMemo(() => ({
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    dateFrom: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    dateTo: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  }), [typeFilter, statusFilter, dateRange])

  const { transactions, isLoading, isLoadingMore, isEmpty, isReachingEnd, size, setSize } =
    useTransactions(filters)

  // IntersectionObserver — trigger next page when sentinel is visible
  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !isReachingEnd && !isLoadingMore) {
          setSize(size + 1)
        }
      },
      { rootMargin: '100px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [isReachingEnd, isLoadingMore, size, setSize])

  const hasActiveFilters =
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    Boolean(dateRange.from)

  const groups = groupByDate(transactions)

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <BackHeader title={t('screenTitles.transactionHistory')} />

      {/* Filter bar */}
      <div className="bg-white border-b border-[#E0E0E0]">
        <HistoryFilterBar
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          dateRange={dateRange}
          onTypeChange={setTypeFilter}
          onStatusChange={setStatusFilter}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Transaction list */}
      <div className="flex-1 bg-white">
        {isLoading ? (
          /* Initial loading: 5 skeleton rows */
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-2">
            <p className="text-base font-bold text-[#212121] text-center">
              {hasActiveFilters ? t('empty.noTransactions') : t('empty.noTransactionsYet')}
            </p>
            <p className="text-sm text-[#757575] text-center">
              {hasActiveFilters
                ? t('empty.noTransactionsBody')
                : t('empty.noTransactionsYetBody')}
            </p>
          </div>
        ) : (
          /* Grouped transaction list */
          <div>
            {groups.map(({ date, items }) => (
              <div key={date}>
                {/* Date group header — sticky */}
                <div className="sticky top-[88px] z-10 mx-4 py-2 bg-white">
                  <span className="text-xs text-[#9E9E9E]">
                    {formatGroupHeader(items[0]?.created_at ?? date)}
                  </span>
                </div>

                {/* Rows in this date group */}
                {items.map((tx, idx) => (
                  <TransactionRow
                    key={tx.id ?? `${date}-${idx}`}
                    transaction={tx}
                    onClick={(id) => router.push(`/history/${id}`)}
                  />
                ))}
              </div>
            ))}

            {/* Next page loading: 3 skeleton rows */}
            {isLoadingMore && (
              <div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonRow key={`loading-more-${i}`} />
                ))}
              </div>
            )}

            {/* End of list sentinel — IntersectionObserver target */}
            <div ref={sentinelRef} className="h-5" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  )
}
