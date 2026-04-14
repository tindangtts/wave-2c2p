'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { TopHeader } from '@/components/layout/top-header'
import { formatCurrency } from '@/lib/currency'

const DEFAULT_AMOUNT_THB = 100000 // 1,000.00 THB in satang
const DEFAULT_RATE = 133.0

interface ExchangeRate {
  rate: number
  inverse_rate: number
}

export default function WelcomePage() {
  const router = useRouter()
  const [rate, setRate] = useState<ExchangeRate | null>(null)
  const [amountSatang] = useState(DEFAULT_AMOUNT_THB)

  useEffect(() => {
    fetch('/api/mock-payment/exchange-rate')
      .then((r) => r.json())
      .then((data) => {
        const r = data.rates?.[0]
        if (r) setRate({ rate: r.rate, inverse_rate: r.inverse_rate })
      })
      .catch(() => {})
  }, [])

  const currentRate = rate?.rate ?? DEFAULT_RATE
  const convertedPya = Math.round(amountSatang * currentRate)
  const inverseSample = rate
    ? (100000 * rate.inverse_rate).toFixed(2)
    : (100000 / currentRate).toFixed(2)

  return (
    <>
      <TopHeader />
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Yellow background area — design: extends from header */}
        <div className="bg-[#FFE512] px-4 pt-3 pb-18">
          {/* Rate Card — design: white card with rounded corners */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Top: amount conversion */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-start">
                {/* THB side */}
                <div className="flex-1">
                  <p className="text-[0.6875rem] text-[#595959] mb-1.5">Amount</p>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base" role="img" aria-label="Thailand">🇹🇭</span>
                    <span className="text-[0.6875rem] font-medium text-foreground">THB</span>
                  </div>
                  <p className="text-[1.375rem] font-bold text-foreground leading-tight tabular-nums">
                    {formatCurrency(amountSatang, 'THB')}
                  </p>
                </div>

                {/* Transfer arrow icon */}
                <div className="flex items-center justify-center pt-6">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-[#767676]">
                    <path d="M6 10h16m0 0l-4-4m4 4l-4 4M22 18H6m0 0l4-4m-4 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* MMK side */}
                <div className="flex-1 text-right">
                  <p className="text-[0.6875rem] text-[#595959] mb-1.5">Converted Amount</p>
                  <div className="flex items-center gap-1.5 justify-end mb-1">
                    <span className="text-base" role="img" aria-label="Myanmar">🇲🇲</span>
                    <span className="text-[0.6875rem] font-medium text-foreground">MMK</span>
                  </div>
                  <p className="text-[1.375rem] font-bold text-foreground leading-tight tabular-nums">
                    {formatCurrency(convertedPya, 'MMK')}
                  </p>
                </div>
              </div>
            </div>

            {/* Blue bottom: rate info — design: blue bar */}
            <div className="bg-[#0091EA] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white font-medium">Rate</span>
                <span className="text-sm text-white">
                  1 THB = {currentRate.toFixed(1)} MMK
                </span>
              </div>
              <p className="text-xs text-white/80 text-right mt-0.5">
                100,000 MMK = {inverseSample} THB
              </p>
            </div>
          </div>
        </div>

        {/* White section: Receiving Channels — design: overlapping rounded white panel */}
        <div className="flex-1 bg-white -mt-10 rounded-t-[15px] px-4 pt-5 pb-6 relative z-10 shadow-[0_-1.5px_3.3px_rgba(128,128,128,0.15)]">
          {/* Section header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-foreground">
              Receiving Channels
            </h2>
            <span className="text-sm font-medium text-[#E33E38]">
              Instant Receive
            </span>
          </div>

          {/* Channel Card: Wave Agent */}
          <button
            onClick={() => router.push('/login')}
            className="w-full mb-4 bg-white rounded-2xl border border-border shadow-sm overflow-hidden text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
              <span className="text-base font-medium text-foreground">Wave Agent</span>
              <ChevronRight className="w-5 h-5 text-[#767676]" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-11 h-11 rounded-lg bg-[#0091EA] border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">W</span>
              </div>
              <div className="flex-1" />
              <div className="text-right">
                <p className="text-base font-bold text-foreground tabular-nums">
                  {formatCurrency(convertedPya, 'MMK')}
                </p>
                <p className="text-xs text-[#767676]">Fees: 10.00 THB</p>
              </div>
            </div>
          </button>

          {/* Channel Card: Wave App */}
          <button
            onClick={() => router.push('/login')}
            className="w-full mb-4 bg-white rounded-2xl border border-border shadow-sm overflow-hidden text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
              <span className="text-base font-medium text-foreground">Wave App</span>
              <ChevronRight className="w-5 h-5 text-[#767676]" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-11 h-11 rounded-lg bg-[#FFE600] border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-foreground text-sm font-bold">W</span>
              </div>
              <div className="w-11 h-11 rounded-lg bg-white border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-[#E33E38] text-sm font-bold">W</span>
              </div>
              <div className="flex-1" />
              <div className="text-right">
                <p className="text-base font-bold text-foreground tabular-nums">
                  {formatCurrency(convertedPya, 'MMK')}
                </p>
                <p className="text-xs text-[#767676]">Fees: 10.00 THB</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}
