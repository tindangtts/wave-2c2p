'use client'

import { CheckCircle, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, convertSatangToPya } from '@/lib/currency'
import type { TransferChannel } from '@/types'

function formatReceiptDate(isoString: string): string {
  const date = new Date(isoString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = String(hours % 12 || 12).padStart(2, '0')
  return `${day} ${month} ${year}, ${displayHours}:${minutes} ${ampm}`
}

function channelLabel(channel: TransferChannel): string {
  switch (channel) {
    case 'wave_agent': return 'Wave Agent'
    case 'wave_app': return 'Wave App'
    case 'bank_transfer': return 'Bank Transfer'
    case 'cash_pickup': return 'Cash Pickup'
    default: return channel
  }
}

export interface TransferReceiptProps {
  transactionId: string
  amount: number        // satang
  fee: number           // satang
  convertedPya: number  // pya
  rate: number
  channel: TransferChannel
  senderName: string
  senderPhone: string
  recipientName: string
  recipientType: string
  note?: string
  createdAt: string     // ISO string
}

export function TransferReceipt({
  transactionId,
  amount,
  fee,
  convertedPya,
  rate,
  channel,
  senderName,
  senderPhone,
  recipientName,
  recipientType,
  note,
  createdAt,
}: TransferReceiptProps) {
  const totalSatang = amount + fee

  async function handleShare() {
    const thbAmount = formatCurrency(amount, 'THB')
    const shareText = `Transfer of ${thbAmount} to ${recipientName} completed. Ref: ${transactionId}. 2c2p WAVE`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: shareText })
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText)
        toast.success('Receipt copied to clipboard')
      } catch {
        toast.error('Unable to copy receipt')
      }
    }
  }

  return (
    <div className="mx-4 mt-4 bg-white rounded-xl border border-[#E0E0E0] p-4">
      {/* Success area */}
      <div className="flex flex-col items-center pb-4 border-b border-gray-100">
        <CheckCircle className="w-12 h-12 text-[#00C853] mb-2" />
        <p className="text-[16px] font-bold text-[#00C853]">Success!</p>
        <p className="text-[14px] text-[#757575] mt-1">2c2p WAVE</p>
        <p className="text-[12px] text-[#757575] mt-1">{formatReceiptDate(createdAt)}</p>
      </div>

      {/* Reference number */}
      <p className="text-[12px] text-[#757575] text-center mt-3">
        Ref: {transactionId}
      </p>

      {/* Transfer section */}
      <div className="mt-4">
        <p className="text-[12px] font-bold text-[#757575] uppercase tracking-wide mb-2">
          Transfer
        </p>
        <div className="flex justify-between items-baseline">
          <span className="text-[12px] text-[#757575]">From</span>
          <span className="text-[16px] font-bold text-[#212121] text-right">
            {senderName}
            {senderPhone ? ` · ${senderPhone}` : ''}
          </span>
        </div>
        <div className="flex justify-between items-baseline mt-2">
          <span className="text-[12px] text-[#757575]">To</span>
          <span className="text-[16px] font-bold text-[#212121] text-right">
            {recipientName}
            {' '}
            <span className="text-[12px] font-normal text-[#757575]">
              · {channelLabel(channel)}
            </span>
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-[#E0E0E0] my-4" />

      {/* Amount breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-[16px] text-[#757575]">Amount</span>
          <span className="text-[16px] font-bold text-[#212121]">
            {formatCurrency(amount, 'THB')}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-[16px] text-[#757575]">Fee</span>
          <span className="text-[16px] font-bold text-[#F44336]">
            {formatCurrency(fee, 'THB')}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-[16px] text-[#757575]">Converted</span>
          <span className="text-[16px] text-[#757575]">
            {formatCurrency(convertedPya, 'MMK')}
          </span>
        </div>

        <div className="border-t border-[#E0E0E0] my-2" />

        <div className="flex justify-between items-baseline">
          <span className="text-[20px] font-bold text-[#212121]">Total</span>
          <span className="text-[20px] font-bold text-[#212121]">
            {formatCurrency(totalSatang, 'THB')}
          </span>
        </div>
      </div>

      {/* Note section */}
      {note && (
        <div className="mt-4">
          <p className="text-[12px] text-[#757575]">Note</p>
          <p className="text-[16px] text-[#212121] mt-1">{note}</p>
        </div>
      )}

      {/* Share button */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share receipt"
          className="flex items-center gap-2 text-[#0091EA] text-[16px] min-h-[44px] min-w-[44px] px-4"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>
    </div>
  )
}
