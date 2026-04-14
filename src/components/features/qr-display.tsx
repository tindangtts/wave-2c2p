'use client'

import QRCode from 'react-qr-code'
import { formatCurrency } from '@/lib/currency'

interface QRDisplayProps {
  paymentCode: string
  amount: number // in baht (from API)
  merchantName: string
  expiresAt: string // ISO date string
  expired: boolean
}

function formatExpiryTime(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function QRDisplay({ paymentCode, amount, merchantName, expiresAt, expired }: QRDisplayProps) {
  // amount from API is in baht; convert to satang for formatCurrency
  const amountSatang = Math.round(amount * 100)

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-4">
      {/* 2C2P logo placeholder */}
      <div className="h-8 flex items-center justify-center mb-2">
        <span className="text-base font-bold text-[#0091EA] tracking-wide">2C2P WAVE</span>
      </div>

      {/* Merchant name */}
      <p className="text-xs font-normal text-[#595959] text-center -mt-2">
        {merchantName}
      </p>

      {/* QR Code */}
      <div className={`relative transition-opacity ${expired ? 'opacity-40' : 'opacity-100'}`}>
        <QRCode
          value={paymentCode}
          size={200}
          bgColor="#FFFFFF"
          fgColor="#212121"
        />
        {expired && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-destructive bg-white/80 px-2 py-1 rounded">
              Expired
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#E0E0E0]" />

      {/* Payment details */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-normal text-[#595959]">Payment Code:</span>
          <span className="text-xs font-medium text-foreground">{paymentCode}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-normal text-[#595959]">Amount (THB):</span>
          <span className="text-sm font-bold text-foreground">
            {formatCurrency(amountSatang, 'THB')}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#E0E0E0]" />

      {/* Expiry info */}
      <p className="text-xs font-normal text-[#595959] text-center">
        Please pay before {formatExpiryTime(expiresAt)}
      </p>
    </div>
  )
}
