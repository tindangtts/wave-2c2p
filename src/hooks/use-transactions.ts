'use client'

import useSWRInfinite from 'swr/infinite'
import type { Transaction } from '@/types'

const PAGE_SIZE = 20

export interface TransactionFilters {
  type?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

const fetcher = (url: string): Promise<Transaction[]> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed to fetch transactions')
    return r.json()
  })

function buildKey(
  pageIndex: number,
  previousPageData: Transaction[] | null,
  filters: TransactionFilters
): string | null {
  // Reached end — no more pages
  if (previousPageData && previousPageData.length < PAGE_SIZE) return null

  const params = new URLSearchParams()
  params.set('page', String(pageIndex))
  params.set('limit', String(PAGE_SIZE))

  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)

  return `/api/transactions?${params.toString()}`
}

/**
 * Infinite scroll hook for transaction history (D-12)
 * Loads 20 transactions per page, appends on scroll
 */
export function useTransactions(filters: TransactionFilters = {}) {
  const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite<
    Transaction[]
  >(
    (pageIndex, previousPageData) => buildKey(pageIndex, previousPageData, filters),
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  const transactions: Transaction[] = data?.flatMap((page) => page) ?? []

  const isEmpty = !isLoading && transactions.length === 0
  const lastPage = data?.[data.length - 1]
  const isReachingEnd =
    isEmpty || (lastPage !== undefined && lastPage.length < PAGE_SIZE)
  const isLoadingMore =
    size > 0 && data !== undefined && typeof data[size - 1] === 'undefined'

  return {
    transactions,
    isLoading,
    isLoadingMore,
    isValidating,
    isEmpty,
    isReachingEnd,
    size,
    setSize,
    mutate,
    error,
  }
}
