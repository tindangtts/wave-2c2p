'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BackHeader } from '@/components/layout/back-header'
import { AmountInput } from '@/components/features/amount-input'
import { BankChannelGrid } from '@/components/features/bank-channel-grid'
import { ConvenienceChannelList } from '@/components/features/convenience-channel-list'
import { useWallet } from '@/hooks/use-wallet'
import { useWalletOpsStore } from '@/stores/wallet-ops-store'
import { formatCurrency } from '@/lib/currency'
import { toast } from 'sonner'

const MIN_TOPUP_THB = 150
const MAX_TOPUP_THB = 25000
const MIN_TOPUP_SATANG = MIN_TOPUP_THB * 100
const MAX_TOPUP_SATANG = MAX_TOPUP_THB * 100

function parseAmountSatang(amountStr: string): number {
  const parsed = parseFloat(amountStr)
  if (isNaN(parsed)) return 0
  return Math.round(parsed * 100)
}

export default function AddMoneyPage() {
  const router = useRouter()
  const t = useTranslations('wallet')
  const { data } = useWallet()
  const { topupAmount, setTopupAmount, setTopupChannel } = useWalletOpsStore()

  const walletBalanceSatang = data?.wallet?.balance ?? 0
  const amountSatang = parseAmountSatang(topupAmount)

  const isBelowMin = amountSatang > 0 && amountSatang < MIN_TOPUP_SATANG
  const isAboveMax = amountSatang > MAX_TOPUP_SATANG
  const isAmountValid = amountSatang >= MIN_TOPUP_SATANG && amountSatang <= MAX_TOPUP_SATANG

  function handleChannelSelect(channel: string) {
    if (!isAmountValid) {
      if (amountSatang === 0) {
        toast.error('Please enter an amount first.')
      } else if (isBelowMin) {
        toast.error(t('errors.belowMinimum'))
      } else if (isAboveMax) {
        toast.error(t('errors.aboveMaximum'))
      }
      return
    }
    setTopupChannel(channel)
    router.push(`/add-money/qr?channel=${channel}&amount=${amountSatang}`)
  }

  return (
    <div className="flex flex-col min-h-full">
      <BackHeader title={t('screenTitles.addMoney')} />

      <div className="flex-1 px-4 py-4 space-y-6 pb-8">
        {/* Balance info block */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-normal text-[#595959]">
            {t('labels.walletBalance')}:{' '}
            <span className="font-medium text-foreground">
              {formatCurrency(walletBalanceSatang, 'THB')}
            </span>
          </p>
          <p className="text-xs font-normal text-[#595959]">
            {t('labels.maxTopup', { amount: '25,000.00' })}
          </p>
        </div>

        {/* Amount display */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className="text-base font-normal text-[#595959]">THB</span>
            <span className="text-5xl font-bold text-foreground leading-none tabular-nums">
              {topupAmount === '' ? '0' : topupAmount}
            </span>
          </div>

          {/* Validation captions */}
          {isBelowMin && (
            <p className="text-xs text-destructive mt-1">
              {t('labels.minTopup', { amount: MIN_TOPUP_THB.toLocaleString() })}
            </p>
          )}
          {isAboveMax && (
            <p className="text-xs text-destructive mt-1">
              {t('errors.aboveMaximum')}
            </p>
          )}
        </div>

        {/* Numpad amount input */}
        <AmountInput value={topupAmount} onChange={setTopupAmount} />

        {/* Top-up Channels */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground">
            {t('sections.topupChannels')}
          </h2>

          {/* Banking services */}
          <div className="space-y-2">
            <p className="text-xs font-normal text-[#595959]">
              {t('sections.bankingServices')}
            </p>
            <BankChannelGrid onSelect={handleChannelSelect} />
          </div>

          {/* Convenience store */}
          <div className="space-y-2">
            <p className="text-xs font-normal text-[#595959]">
              {t('sections.convenienceService')}
            </p>
            <ConvenienceChannelList onSelect={handleChannelSelect} />
          </div>
        </div>
      </div>
    </div>
  )
}
