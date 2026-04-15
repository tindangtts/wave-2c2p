'use client'

import * as React from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { generateStatement } from '@/lib/pdf/generate-statement'
import type { Transaction } from '@/types'

interface StatementDownloadButtonProps {
  dateFrom?: string
  dateTo?: string
}

export function StatementDownloadButton({ dateFrom, dateTo }: StatementDownloadButtonProps) {
  const t = useTranslations('wallet')
  const [isLoading, setIsLoading] = React.useState(false)

  // Only render when both date values are present
  if (!dateFrom || !dateTo) return null

  async function handleDownload() {
    if (!dateFrom || !dateTo) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/statement?dateFrom=${dateFrom}&dateTo=${dateTo}`)
      if (!res.ok) {
        throw new Error(`Statement fetch failed: ${res.status}`)
      }
      const data = (await res.json()) as { transactions: Transaction[] }

      if (data.transactions.length === 0) {
        toast.info(t('noTransactionsForPeriod'))
        return
      }

      await generateStatement(data.transactions, dateFrom, dateTo)
    } catch {
      toast.error(t('downloadFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isLoading}
      className="w-full h-10 rounded-lg border"
    >
      <Download className="w-4 h-4 mr-2 flex-shrink-0" />
      {isLoading ? t('downloading') : t('downloadStatement')}
    </Button>
  )
}
