'use client'

import { ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'

interface ConversionCardProps {
  amountSatang: number
  convertedPya: number
  rate: number
}

export function ConversionCard({ amountSatang, convertedPya, rate }: ConversionCardProps) {
  return (
    <div className="bg-[#F5F5F5] rounded-xl p-4">
      {/* Side-by-side amounts */}
      <div className="flex items-center gap-4">
        {/* Left: THB */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl" role="img" aria-label="Thailand flag">
            🇹🇭
          </span>
          <span className="text-[16px] font-bold text-[#212121] truncate">
            {formatCurrency(amountSatang, 'THB')}
          </span>
        </div>

        {/* Arrow */}
        <ArrowRight className="w-5 h-5 text-[#757575] flex-shrink-0" />

        {/* Right: MMK */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-[16px] font-bold text-[#212121] truncate">
            {formatCurrency(convertedPya, 'MMK')}
          </span>
          <span className="text-xl" role="img" aria-label="Myanmar flag">
            🇲🇲
          </span>
        </div>
      </div>

      {/* Rate line */}
      <p className="mt-2 text-[12px] text-[#757575] text-center">
        1 THB = {rate.toFixed(1)} MMK
      </p>
    </div>
  )
}
