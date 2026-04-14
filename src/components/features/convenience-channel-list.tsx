'use client'

import { ChevronRight } from 'lucide-react'

interface ConvenienceChannel {
  id: string
  label: string
  bgColor: string
  textColor: string
  abbr: string
}

const CONVENIENCE_CHANNELS: ConvenienceChannel[] = [
  { id: 'service_123', label: '123 Service', bgColor: '#E53935', textColor: '#FFFFFF', abbr: '123' },
  { id: 'cenpay', label: 'CenPay', bgColor: '#1565C0', textColor: '#FFFFFF', abbr: 'CEN' },
]

interface ConvenienceChannelListProps {
  onSelect: (channel: string) => void
}

export function ConvenienceChannelList({ onSelect }: ConvenienceChannelListProps) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {CONVENIENCE_CHANNELS.map((channel, index) => (
        <button
          key={channel.id}
          type="button"
          onClick={() => onSelect(channel.id)}
          className={`w-full flex items-center justify-between px-4 active:bg-secondary transition-colors ${
            index < CONVENIENCE_CHANNELS.length - 1 ? 'border-b border-border' : ''
          }`}
          style={{ height: '56px' }}
          aria-label={channel.label}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: channel.bgColor }}
            >
              <span
                className="text-[0.625rem] font-bold leading-none"
                style={{ color: channel.textColor }}
              >
                {channel.abbr}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">{channel.label}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[#595959] flex-shrink-0" />
        </button>
      ))}
    </div>
  )
}
