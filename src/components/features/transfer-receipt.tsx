'use client'

import { useRef, useState } from 'react'
import { CheckCircle, Share2, Copy, RefreshCw, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/currency'
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
    case 'p2p': return '2C2P WAVE (P2P)'
    default: return channel
  }
}

export interface TransferReceiptProps {
  transactionId: string
  amount: number        // satang
  fee: number           // satang
  convertedPya: number  // pya (0 for p2p)
  rate: number          // (1 for p2p)
  channel: TransferChannel
  senderName: string
  senderPhone: string
  recipientName: string
  recipientType: string
  note?: string
  createdAt: string     // ISO string
  secretCode?: string   // cash_pickup channel only — initial code value
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
  secretCode,
}: TransferReceiptProps) {
  const totalSatang = amount + fee
  const [displayCode, setDisplayCode] = useState(secretCode ?? '')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSavingImage, setIsSavingImage] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)

  async function handleRefreshCode() {
    setIsRefreshing(true)
    try {
      const res = await fetch('/api/mock-payment/refresh-secret-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionId }),
      })
      if (res.ok) {
        const data = await res.json()
        setDisplayCode(data.secret_code)
      }
    } catch {
      // Silent fail — user can retry
    } finally {
      setIsRefreshing(false)
    }
  }

  async function handleSaveImage() {
    if (!receiptRef.current) return
    setIsSavingImage(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(receiptRef.current, { quality: 0.95 })
      const link = document.createElement('a')
      link.download = `receipt-${transactionId}.png`
      link.href = dataUrl
      link.click()
    } catch {
      toast.error('Could not save image. Try the Share option instead.')
    } finally {
      setIsSavingImage(false)
    }
  }

  async function handleShare() {
    const thbAmount = formatCurrency(amount, 'THB')
    const shareText = `Transfer of ${thbAmount} to ${recipientName} completed. Ref: ${transactionId}. 2c2p WAVE`

    // Try to capture receipt as PNG for image share
    let pngFile: File | undefined
    if (receiptRef.current) {
      try {
        const { toPng } = await import('html-to-image')
        const dataUrl = await toPng(receiptRef.current, { quality: 0.95 })
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        pngFile = new File([blob], `receipt-${transactionId}.png`, { type: 'image/png' })
      } catch {
        // PNG capture failed — fall through to text share
      }
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (pngFile && navigator.canShare?.({ files: [pngFile] })) {
          await navigator.share({ files: [pngFile], title: '2c2p WAVE Receipt', text: shareText })
        } else {
          await navigator.share({ text: shareText })
        }
        return
      } catch {
        // User cancelled or share failed — fall through
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText)
        toast.success('Receipt copied to clipboard')
      } catch {
        toast.error('Unable to copy receipt')
      }
    }
  }

  return (
    <div ref={receiptRef} id="transfer-receipt-export" className="mx-4 mt-4 bg-white rounded-xl border border-border p-4">
      {/* Success area */}
      <div className="flex flex-col items-center pb-4 border-b border-gray-100">
        <CheckCircle className="w-12 h-12 text-[#00C853] mb-2" />
        <p className="text-base font-bold text-[#00C853]">Success!</p>
        <p className="text-sm text-[#595959] mt-1">2c2p WAVE</p>
        <p className="text-xs text-[#595959] mt-1">{formatReceiptDate(createdAt)}</p>
      </div>

      {/* Reference number */}
      <p className="text-xs text-[#595959] text-center mt-3">
        Ref: {transactionId}
      </p>

      {/* Transfer section */}
      <div className="mt-4">
        <p className="text-xs font-bold text-[#595959] uppercase tracking-wide mb-2">
          Transfer
        </p>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-[#595959]">From</span>
          <span className="text-base font-bold text-foreground text-right">
            {senderName}
            {senderPhone ? ` · ${senderPhone}` : ''}
          </span>
        </div>
        <div className="flex justify-between items-baseline mt-2">
          <span className="text-xs text-[#595959]">To</span>
          <span className="text-base font-bold text-foreground text-right">
            {recipientName}
            {' '}
            <span className="text-xs font-normal text-[#595959]">
              · {channelLabel(channel)}
            </span>
          </span>
        </div>
      </div>

      {/* Secret code chip — cash_pickup channel only */}
      {channel === 'cash_pickup' && displayCode && (
        <div className="bg-[#FFF9C4] rounded-xl px-4 py-3 mt-4">
          <p className="text-xs font-bold text-[#595959] uppercase tracking-wide mb-2">SECRET CODE</p>
          <div className="flex items-center justify-between">
            <span
              aria-live="polite"
              className="text-[1.75rem] font-bold text-foreground tracking-[0.15em] font-mono"
            >
              {isRefreshing ? '···' : displayCode}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Copy secret code"
                onClick={() => {
                  navigator.clipboard.writeText(displayCode).then(() => toast.success('Code copied'))
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#0091EA]"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Refresh secret code"
                onClick={handleRefreshCode}
                disabled={isRefreshing}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#595959]"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Separator */}
      <div className="border-t border-border my-4" />

      {/* Amount breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-base text-[#595959]">Amount</span>
          <span className="text-base font-bold text-foreground">
            {formatCurrency(amount, 'THB')}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-base text-[#595959]">Fee</span>
          <span className="text-base font-bold text-destructive">
            {formatCurrency(fee, 'THB')}
          </span>
        </div>

        {/* Converted row — hidden for P2P */}
        {channel !== 'p2p' && (
          <div className="flex justify-between items-baseline">
            <span className="text-base text-[#595959]">Converted</span>
            <span className="text-base text-[#595959]">
              {formatCurrency(convertedPya, 'MMK')}
            </span>
          </div>
        )}

        <div className="border-t border-border my-2" />

        <div className="flex justify-between items-baseline">
          <span className="text-xl font-bold text-foreground">Total</span>
          <span className="text-xl font-bold text-foreground">
            {formatCurrency(totalSatang, 'THB')}
          </span>
        </div>
      </div>

      {/* Note section */}
      {note && (
        <div className="mt-4">
          <p className="text-xs text-[#595959]">Note</p>
          <p className="text-base text-foreground mt-1">{note}</p>
        </div>
      )}

      {/* Share and Save as Image buttons */}
      <div className="mt-6 flex justify-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share receipt"
          className="flex items-center gap-2 text-[#0091EA] text-base min-h-[44px] min-w-[44px] px-4"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
        <button
          type="button"
          onClick={handleSaveImage}
          disabled={isSavingImage}
          aria-label="Save receipt as image"
          className="flex items-center gap-2 text-[#0091EA] text-base min-h-[44px] min-w-[44px] px-4 disabled:opacity-50"
        >
          {isSavingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          Save as Image
        </button>
      </div>
    </div>
  )
}
