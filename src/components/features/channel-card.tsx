'use client'

import { Store, Smartphone, Landmark, Banknote } from 'lucide-react'
import type { TransferChannel } from '@/types'

interface ChannelCardProps {
  channel: TransferChannel
  name: string
  convertedAmount: string
  fee: string
  isSelected: boolean
  onSelect: () => void
}

const CHANNEL_CONFIG: Record<
  TransferChannel,
  { Icon: React.ComponentType<{ className?: string }>; bgClass: string }
> = {
  wave_agent: { Icon: Store, bgClass: 'bg-[#E8F5E9]' },
  wave_app: { Icon: Smartphone, bgClass: 'bg-brand-blue-light' },
  bank_transfer: { Icon: Landmark, bgClass: 'bg-[#F3E5F5]' },
  cash_pickup: { Icon: Banknote, bgClass: 'bg-[#FFF3E0]' },
  p2p: { Icon: Smartphone, bgClass: 'bg-brand-blue-light' },
}

export function ChannelCard({
  channel,
  name,
  convertedAmount,
  fee,
  isSelected,
  onSelect,
}: ChannelCardProps) {
  const config = CHANNEL_CONFIG[channel]
  const { Icon, bgClass } = config

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all active:scale-[0.98] text-left min-h-[72px] ${
        isSelected
          ? 'border-2 border-accent bg-accent/5'
          : 'border border-border bg-white'
      }`}
      aria-pressed={isSelected}
    >
      {/* Left: icon + name + converted amount */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Channel icon */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bgClass}`}
        >
          <Icon className="w-5 h-5 text-[#424242]" />
        </div>

        {/* Text */}
        <div className="flex flex-col min-w-0">
          <span className="text-base font-bold text-foreground truncate">{name}</span>
          <span className="text-xs text-muted-foreground truncate">{convertedAmount}</span>
        </div>
      </div>

      {/* Right: fee + radio */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Fee */}
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground">Fee</span>
          <span className="text-base font-bold text-foreground">{fee}</span>
        </div>

        {/* Radio indicator */}
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
            isSelected
              ? 'bg-accent'
              : 'border-2 border-border bg-transparent'
          }`}
        >
          {isSelected && (
            <div className="w-2 h-2 rounded-full bg-white" />
          )}
        </div>
      </div>
    </button>
  )
}
