'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Tag, Gift, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { BackHeader } from '@/components/layout/back-header'
import { Input } from '@/components/ui/input'
import { useWallet } from '@/hooks/use-wallet'
import { formatCurrency } from '@/lib/currency'

interface RedeemedVoucher {
  code: string
  amount: number
  type: 'cashback' | 'free_transfer'
}

export default function VoucherPage() {
  const router = useRouter()
  const t = useTranslations('home')
  const { mutate: mutateWallet } = useWallet()

  const [code, setCode] = useState('')
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redeemed, setRedeemed] = useState<RedeemedVoucher[]>([])

  async function handleRedeem() {
    if (!code.trim()) return
    setIsRedeeming(true)
    try {
      const res = await fetch('/api/voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'already_used') {
          toast.error(t('voucher.alreadyUsed'))
        } else {
          toast.error(t('voucher.invalid'))
        }
        return
      }

      const voucher = data.voucher as RedeemedVoucher
      setRedeemed((prev) => [voucher, ...prev])
      setCode('')
      mutateWallet()

      if (voucher.type === 'cashback') {
        toast.success(t('voucher.success', { amount: (voucher.amount / 100).toString() }))
      } else {
        toast.success(t('voucher.freeTransfer'))
      }
    } catch {
      toast.error(t('voucher.invalid'))
    } finally {
      setIsRedeeming(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <BackHeader
        title={t('voucher.title')}
        onBack={() => router.back()}
      />

      <div className="flex-1 px-4 pt-6 pb-8 overflow-y-auto">
        {/* Code entry */}
        <div className="bg-white rounded-xl border border-border p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            {t('voucher.enterCode')}
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRedeem()
              }}
              placeholder={t('voucher.codePlaceholder')}
              className="h-12 rounded-xl flex-1 uppercase tracking-wider font-mono"
              maxLength={20}
            />
            <button
              type="button"
              onClick={handleRedeem}
              disabled={isRedeeming || !code.trim()}
              className="h-12 px-5 rounded-xl bg-[#FFE600] text-foreground font-bold text-sm active:scale-95 transition-transform disabled:opacity-50 flex-shrink-0"
            >
              {isRedeeming ? t('voucher.redeeming') : t('voucher.redeem')}
            </button>
          </div>
        </div>

        {/* Redeemed vouchers */}
        {redeemed.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-foreground mb-3">{t('voucher.activeVouchers')}</h3>
            <div className="flex flex-col gap-2">
              {redeemed.map((v) => (
                <div
                  key={v.code}
                  className="bg-white rounded-xl border border-border p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                    {v.type === 'cashback' ? (
                      <Gift className="w-5 h-5 text-[#00C853]" />
                    ) : (
                      <Ticket className="w-5 h-5 text-[#00C853]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{v.code}</p>
                    <p className="text-xs text-[#00C853]">
                      {v.type === 'cashback'
                        ? t('voucher.discount', { amount: (v.amount / 100).toString() })
                        : t('voucher.freeTransfer')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {redeemed.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center gap-2">
            <Tag className="w-12 h-12 text-[#E0E0E0]" />
            <p className="text-base font-bold text-foreground">{t('voucher.noVouchers')}</p>
            <p className="text-sm text-[#595959] text-center">{t('voucher.noVouchersBody')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
