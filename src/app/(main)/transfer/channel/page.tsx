'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BackHeader } from '@/components/layout/back-header'
import { ConversionCard } from '@/components/features/conversion-card'
import { ChannelCard } from '@/components/features/channel-card'
import { useTransferStore } from '@/stores/transfer-store'
import {
  convertSatangToPya,
  formatCurrency,
  toSmallestUnit,
} from '@/lib/currency'
import type { TransferChannel } from '@/types'

// Fee schedule per D-14 (in THB display values)
const CHANNEL_FEES_THB: Record<TransferChannel, number> = {
  wave_agent: 10,
  wave_app: 10,
  bank_transfer: 50,
  cash_pickup: 30,
  p2p: 0,
}

const CHANNEL_ORDER: TransferChannel[] = [
  'wave_agent',
  'wave_app',
  'bank_transfer',
  'cash_pickup',
]

export default function ChannelPage() {
  const router = useRouter()
  const t = useTranslations('transfer')

  const { amountSatang, rate, setChannel, setFee } = useTransferStore()
  const [selectedChannel, setSelectedChannel] = useState<TransferChannel | null>(null)

  // Guard: redirect if no amount set
  useEffect(() => {
    if (amountSatang === 0) {
      router.replace('/transfer/amount')
    }
  }, [amountSatang, router])

  const isNextDisabled = selectedChannel === null

  // Compute converted amount from store values
  const convertedPya = rate > 0 ? convertSatangToPya(amountSatang, rate) : 0

  // Channel name map using i18n keys
  const channelNames: Record<TransferChannel, string> = {
    wave_agent: t('channel_wave_agent'),
    wave_app: t('channel_wave_app'),
    bank_transfer: t('channel_bank_transfer'),
    cash_pickup: t('channel_cash_pickup'),
    p2p: t('channel_p2p'),
  }

  function handleNext() {
    if (!selectedChannel) return
    const feeTHB = CHANNEL_FEES_THB[selectedChannel]
    setChannel(selectedChannel)
    setFee(toSmallestUnit(feeTHB, 'THB'))
    router.push('/transfer/confirm')
  }

  if (amountSatang === 0) return null

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <BackHeader title={t('title_channels')} />

      {/* Conversion summary card */}
      <div className="px-4 pt-4">
        <ConversionCard
          amountSatang={amountSatang}
          convertedPya={convertedPya}
          rate={rate}
        />
      </div>

      {/* Hint text */}
      <p className="mx-4 mt-2 text-xs text-muted-foreground">
        {t('channel_hint')}
      </p>

      {/* Channel cards */}
      <div className="flex flex-col gap-3 mx-4 mt-4">
        {CHANNEL_ORDER.map((channel) => {
          const feeTHB = CHANNEL_FEES_THB[channel]
          const feeSatang = toSmallestUnit(feeTHB, 'THB')
          const feeDisplay = formatCurrency(feeSatang, 'THB')
          const convertedDisplay = formatCurrency(convertedPya, 'MMK')

          return (
            <ChannelCard
              key={channel}
              channel={channel}
              name={channelNames[channel]}
              convertedAmount={convertedDisplay}
              fee={feeDisplay}
              isSelected={selectedChannel === channel}
              onSelect={() => setSelectedChannel(channel)}
            />
          )
        })}
      </div>

      {/* Spacer to push CTA to bottom */}
      <div className="flex-1" />

      {/* Sticky CTA */}
      <div className="px-4 pb-6 pt-4 safe-bottom">
        <button
          type="button"
          onClick={handleNext}
          disabled={isNextDisabled}
          className={`w-full h-14 rounded-full text-base font-bold transition-colors ${isNextDisabled ? 'bg-border text-muted-foreground' : 'bg-primary text-foreground'}`}
        >
          {t('cta_next')}
        </button>
      </div>
    </div>
  )
}
