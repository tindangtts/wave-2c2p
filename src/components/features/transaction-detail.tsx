'use client'

import { format } from 'date-fns'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/currency'
import type { CurrencyCode } from '@/lib/currency'
import type { Transaction, TransactionType, TransactionStatus } from '@/types'

const typeLabel: Record<TransactionType, string> = {
  send_money: 'Transfer',
  add_money: 'Top-up',
  withdraw: 'Withdrawal',
  receive: 'Receive',
  bill_payment: 'Bill Payment',
}

const statusConfig: Record<TransactionStatus, { bg: string; text: string; label: string }> = {
  success: { bg: 'bg-[#E8F5E9]', text: 'text-[#00C853]', label: 'Success' },
  pending: { bg: 'bg-[#FFF3E0]', text: 'text-[#FF9800]', label: 'Pending' },
  processing: { bg: 'bg-[#FFF3E0]', text: 'text-[#FF9800]', label: 'Processing' },
  rejected: { bg: 'bg-[#FFEBEE]', text: 'text-[#F44336]', label: 'Rejected' },
  failed: { bg: 'bg-[#FFEBEE]', text: 'text-[#F44336]', label: 'Failed' },
}

interface ReceiptRowProps {
  label: string
  value: React.ReactNode
  mono?: boolean
}

function ReceiptRow({ label, value, mono }: ReceiptRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="text-base text-[#757575] flex-shrink-0">{label}</span>
      <span
        className={`text-base font-bold text-[#212121] text-right ${mono ? 'font-mono text-xs text-[#757575]' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}

interface TransactionDetailProps {
  transaction: Transaction
}

/**
 * Full receipt card for transaction detail view (D-16, UI-SPEC Screen 6).
 * Matches TransferReceipt pattern: status badge, receipt card, breakdown rows, amount/fee/total.
 */
export function TransactionDetail({ transaction }: TransactionDetailProps) {
  const t = useTranslations('wallet')

  const sCfg = statusConfig[transaction.status] ?? statusConfig.failed
  const txLabel = typeLabel[transaction.type] ?? transaction.type

  let dateTimeStr = ''
  try {
    dateTimeStr = format(new Date(transaction.created_at), 'MMM d, yyyy, hh:mm aa')
  } catch {
    dateTimeStr = transaction.created_at
  }

  const fee = transaction.fee ?? 0
  const totalSatang = transaction.amount + fee
  const isCredit = transaction.type === 'add_money' || transaction.type === 'receive'

  return (
    <div className="flex flex-col gap-4">
      {/* Status badge — centered */}
      <div className="flex justify-center pt-2">
        <Badge
          className={`rounded-full text-sm px-4 py-1.5 ${sCfg.bg} ${sCfg.text} border-0 font-medium`}
        >
          {sCfg.label}
        </Badge>
      </div>

      {/* Receipt card */}
      <div className="mx-4 bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-4">
        {/* Logo placeholder */}
        <div className="flex items-center justify-center h-8 mb-4">
          <span className="text-base font-bold text-[#0091EA] tracking-wide">2C2P WAVE</span>
        </div>

        {/* Breakdown rows */}
        <div className="space-y-0.5">
          <ReceiptRow label="Date / Time" value={dateTimeStr} />
          <ReceiptRow label="Type" value={txLabel} />
          <ReceiptRow
            label={t('labels.referenceNo')}
            value={transaction.reference_number}
            mono
          />

          {transaction.description && (
            <ReceiptRow label="Description" value={transaction.description} />
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-[#E0E0E0] my-3" />

        {/* Amount breakdown */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-4 py-1">
            <span className="text-base text-[#757575]">Amount</span>
            <span className={`text-base font-bold ${isCredit ? 'text-[#00C853]' : 'text-[#212121]'}`}>
              {formatCurrency(transaction.amount, transaction.currency as CurrencyCode)}
            </span>
          </div>

          {fee > 0 && (
            <div className="flex items-baseline justify-between gap-4 py-1">
              <span className="text-base text-[#757575]">Fee</span>
              <span className="text-base font-bold text-[#F44336]">
                {formatCurrency(fee, 'THB')}
              </span>
            </div>
          )}

          {transaction.converted_amount && transaction.converted_currency && (
            <div className="flex items-baseline justify-between gap-4 py-1">
              <span className="text-base text-[#757575]">Converted</span>
              <span className="text-base text-[#757575]">
                {formatCurrency(
                  transaction.converted_amount,
                  transaction.converted_currency as CurrencyCode
                )}
              </span>
            </div>
          )}

          <div className="border-t border-[#E0E0E0] my-2" />

          <div className="flex items-baseline justify-between gap-4 py-1">
            <span className="text-xl font-bold text-[#212121]">Total</span>
            <span className="text-xl font-bold text-[#212121]">
              {formatCurrency(totalSatang, transaction.currency as CurrencyCode)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
