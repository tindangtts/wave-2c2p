'use client'

import { ArrowUpRight, ArrowDownLeft, Plus, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/currency'
import type { CurrencyCode } from '@/lib/currency'
import type { Transaction, TransactionType, TransactionStatus } from '@/types'

// Type config matching UI-SPEC D-15 (send_money blue per plan, add_money green, withdraw orange, receive green)
const typeConfig: Record<TransactionType, { icon: React.ElementType; bgClass: string; colorClass: string }> = {
  send_money: { icon: ArrowUpRight, bgClass: 'bg-brand-blue-light', colorClass: 'text-accent' },
  add_money: { icon: Plus, bgClass: 'bg-wave-success-light', colorClass: 'text-wave-success' },
  withdraw: { icon: Minus, bgClass: 'bg-[#FFF3E0]', colorClass: 'text-wave-warning' },
  receive: { icon: ArrowDownLeft, bgClass: 'bg-wave-success-light', colorClass: 'text-wave-success' },
  bill_payment: { icon: ArrowUpRight, bgClass: 'bg-brand-blue-light', colorClass: 'text-accent' },
}

const statusConfig: Record<TransactionStatus, { bg: string; text: string; label: string }> = {
  success: { bg: 'bg-wave-success-light', text: 'text-wave-success', label: 'Success' },
  pending: { bg: 'bg-[#FFF3E0]', text: 'text-wave-warning', label: 'Pending' },
  processing: { bg: 'bg-[#FFF3E0]', text: 'text-wave-warning', label: 'Processing' },
  rejected: { bg: 'bg-[#FFEBEE]', text: 'text-destructive', label: 'Rejected' },
  failed: { bg: 'bg-[#FFEBEE]', text: 'text-destructive', label: 'Failed' },
}

const creditTypes: TransactionType[] = ['add_money', 'receive']

interface TransactionRowProps {
  transaction: Transaction
  onClick: (id: string) => void
}

/**
 * Transaction row for history list (D-15, UI-SPEC Screen 5).
 * Layout: icon circle 40px | name+date (2 lines) | amount+status badge
 */
export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const tCfg = typeConfig[transaction.type] ?? typeConfig.send_money
  const sCfg = statusConfig[transaction.status] ?? statusConfig.failed
  const TypeIcon = tCfg.icon

  const isCredit = creditTypes.includes(transaction.type)
  const amountPrefix = isCredit ? '+' : '-'
  const amountColor = isCredit ? 'text-wave-success' : 'text-destructive'

  const formattedAmount = formatCurrency(
    transaction.amount,
    transaction.currency as CurrencyCode
  )

  let dateLabel = ''
  try {
    dateLabel = format(new Date(transaction.created_at), 'MMM d, hh:mm aa')
  } catch {
    dateLabel = transaction.created_at
  }

  return (
    <button
      type="button"
      onClick={() => onClick(transaction.id)}
      className="flex items-center gap-3 px-4 py-3 min-h-[60px] w-full border-b border-[#F5F5F5] text-left hover:bg-muted transition-colors active:bg-secondary"
      aria-label={`${transaction.description}, ${amountPrefix}${formattedAmount}`}
    >
      {/* Left: type icon circle */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tCfg.bgClass}`}
      >
        <TypeIcon className={`w-5 h-5 ${tCfg.colorClass}`} />
      </div>

      {/* Center: description + date */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-base text-foreground truncate leading-snug">
          {transaction.description}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">
          {dateLabel}
        </span>
      </div>

      {/* Right: amount + status badge */}
      <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
        <span className={`text-base font-bold ${amountColor}`}>
          {amountPrefix}{formattedAmount}
        </span>
        <Badge
          className={`rounded-full text-[0.625rem] px-2 py-0.5 ${sCfg.bg} ${sCfg.text} border-0`}
        >
          {sCfg.label}
        </Badge>
      </div>
    </button>
  )
}
