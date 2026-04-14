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
  { Icon: React.ComponentType<{ className?: string }>; bgColor: string }
> = {
  wave_agent: { Icon: Store, bgColor: '#E8F5E9' },
  wave_app: { Icon: Smartphone, bgColor: '#E3F2FD' },
  bank_transfer: { Icon: Landmark, bgColor: '#F3E5F5' },
  cash_pickup: { Icon: Banknote, bgColor: '#FFF3E0' },
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
  const { Icon, bgColor } = config

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98] text-left"
      style={{
        borderWidth: isSelected ? '2px' : '1px',
        borderColor: isSelected ? '#0091EA' : '#E0E0E0',
        backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
        minHeight: '72px',
      }}
      aria-pressed={isSelected}
    >
      {/* Left: icon + name + converted amount */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Channel icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="w-5 h-5 text-[#424242]" />
        </div>

        {/* Text */}
        <div className="flex flex-col min-w-0">
          <span className="text-base font-bold text-foreground truncate">{name}</span>
          <span className="text-xs text-[#595959] truncate">{convertedAmount}</span>
        </div>
      </div>

      {/* Right: fee + radio */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Fee */}
        <div className="flex flex-col items-end">
          <span className="text-xs text-[#595959]">Fee</span>
          <span className="text-base font-bold text-foreground">{fee}</span>
        </div>

        {/* Radio indicator */}
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            border: isSelected ? 'none' : '2px solid #E0E0E0',
            backgroundColor: isSelected ? '#0091EA' : 'transparent',
          }}
        >
          {isSelected && (
            <div className="w-2 h-2 rounded-full bg-white" />
          )}
        </div>
      </div>
    </button>
  )
}
