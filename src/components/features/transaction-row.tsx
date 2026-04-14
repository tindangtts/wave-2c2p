'use client'

import { ArrowUpRight, ArrowDownLeft, Plus, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/currency'
import type { CurrencyCode } from '@/lib/currency'
import type { Transaction, TransactionType, TransactionStatus } from '@/types'

// Type config matching UI-SPEC D-15 (send_money blue per plan, add_money green, withdraw orange, receive green)
const typeConfig: Record<TransactionType, { icon: React.ElementType; bg: string; color: string }> = {
  send_money: { icon: ArrowUpRight, bg: '#E3F2FD', color: '#0091EA' },
  add_money: { icon: Plus, bg: '#E8F5E9', color: '#00C853' },
  withdraw: { icon: Minus, bg: '#FFF3E0', color: '#FF9800' },
  receive: { icon: ArrowDownLeft, bg: '#E8F5E9', color: '#00C853' },
  bill_payment: { icon: ArrowUpRight, bg: '#E3F2FD', color: '#0091EA' },
}

const statusConfig: Record<TransactionStatus, { bg: string; text: string; label: string }> = {
  success: { bg: 'bg-[#E8F5E9]', text: 'text-[#00C853]', label: 'Success' },
  pending: { bg: 'bg-[#FFF3E0]', text: 'text-[#FF9800]', label: 'Pending' },
  processing: { bg: 'bg-[#FFF3E0]', text: 'text-[#FF9800]', label: 'Processing' },
  rejected: { bg: 'bg-[#FFEBEE]', text: 'text-[#F44336]', label: 'Rejected' },
  failed: { bg: 'bg-[#FFEBEE]', text: 'text-[#F44336]', label: 'Failed' },
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
  const amountColor = isCredit ? 'text-[#00C853]' : 'text-[#F44336]'

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
      className="flex items-center gap-3 px-4 py-3 min-h-[60px] w-full border-b border-[#F5F5F5] text-left hover:bg-[#FAFAFA] transition-colors active:bg-[#F5F5F5]"
      aria-label={`${transaction.description}, ${amountPrefix}${formattedAmount}`}
    >
      {/* Left: type icon circle */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: tCfg.bg }}
      >
        <TypeIcon className="w-5 h-5" style={{ color: tCfg.color }} />
      </div>

      {/* Center: description + date */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-base text-[#212121] truncate leading-snug">
          {transaction.description}
        </span>
        <span className="text-xs text-[#9E9E9E] mt-0.5">
          {dateLabel}
        </span>
      </div>

      {/* Right: amount + status badge */}
      <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
        <span className={`text-base font-bold ${amountColor}`}>
          {amountPrefix}{formattedAmount}
        </span>
        <Badge
          className={`rounded-full text-[10px] px-2 py-0.5 ${sCfg.bg} ${sCfg.text} border-0`}
        >
          {sCfg.label}
        </Badge>
      </div>
    </button>
  )
}
