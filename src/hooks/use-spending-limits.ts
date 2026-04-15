'use client'

import useSWR from 'swr'

interface SpendingLimits {
  daily_limit_satang: number
  monthly_limit_satang: number
}

const fetcher = (url: string): Promise<SpendingLimits> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed to fetch spending limits')
    return r.json()
  })

export function useSpendingLimits() {
  const { data, isLoading, error, mutate } = useSWR<SpendingLimits>(
    '/api/spending-limits',
    fetcher
  )
  return {
    dailyLimitSatang: data?.daily_limit_satang ?? 5000000,
    monthlyLimitSatang: data?.monthly_limit_satang ?? 20000000,
    isLoading,
    error,
    mutate,
  }
}
