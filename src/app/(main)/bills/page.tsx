'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Zap, Droplets, Wifi, Smartphone, Shield, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { BackHeader } from '@/components/layout/back-header'
import { Input } from '@/components/ui/input'

const BILL_CATEGORIES = [
  { key: 'electricity', icon: Zap, color: '#FF9800' },
  { key: 'water', icon: Droplets, color: '#0091EA' },
  { key: 'internet', icon: Wifi, color: '#7C4DFF' },
  { key: 'mobile', icon: Smartphone, color: '#00C853' },
  { key: 'insurance', icon: Shield, color: '#E91E63' },
] as const

type BillCategory = (typeof BILL_CATEGORIES)[number]['key']

export default function BillsPage() {
  const router = useRouter()
  const t = useTranslations('home')

  const [selectedCategory, setSelectedCategory] = useState<BillCategory | null>(null)
  const [accountNo, setAccountNo] = useState('')
  const [amount, setAmount] = useState('')
  const [isPaying, setIsPaying] = useState(false)

  async function handlePay() {
    if (!selectedCategory || !accountNo || !amount) return
    setIsPaying(true)
    // Mock payment — simulate 1.5s delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsPaying(false)
    toast.success(t('bills.paySuccess'))
    setSelectedCategory(null)
    setAccountNo('')
    setAmount('')
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <BackHeader
        title={t('bills.title')}
        onBack={() => router.back()}
      />

      <div className="flex-1 px-4 pt-6 pb-32 overflow-y-auto">
        {/* Category grid */}
        <div className="grid grid-cols-3 gap-3">
          {BILL_CATEGORIES.map(({ key, icon: Icon, color }) => {
            const isActive = selectedCategory === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={[
                  'flex flex-col items-center gap-2 py-4 px-2 rounded-xl border transition-colors',
                  isActive
                    ? 'bg-primary border-primary'
                    : 'bg-white border-border hover:bg-secondary',
                ].join(' ')}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">
                  {t(`bills.${key}`)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Payment form — shown when category selected */}
        {selectedCategory && (
          <div className="mt-6 flex flex-col gap-4 animate-fade-up">
            <div className="bg-white rounded-xl border border-border p-4 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {t('bills.enterAccountNo')}
                </label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="e.g. 123456789"
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {t('bills.enterAmount')}
                </label>
                <Input
                  type="tel"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Recent bills empty state */}
        {!selectedCategory && (
          <div className="mt-8 flex flex-col items-center justify-center gap-2 py-8">
            <FileText className="w-12 h-12 text-border" aria-hidden="true" />
            <p className="text-base font-bold text-foreground">{t('bills.noBills')}</p>
            <p className="text-sm text-muted-foreground text-center">{t('bills.noBillsBody')}</p>
          </div>
        )}
      </div>

      {/* Sticky pay button */}
      {selectedCategory && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-muted px-4 py-4 safe-bottom border-t border-[#F0F0F0]">
          <button
            type="button"
            onClick={handlePay}
            disabled={isPaying || !accountNo || !amount}
            className="w-full h-14 rounded-full bg-primary text-foreground text-base font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {isPaying ? t('bills.paying') : t('bills.payNow')}
          </button>
        </div>
      )}
    </div>
  )
}
