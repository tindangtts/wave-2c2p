'use client'

import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface DocumentTypeCardProps {
  type: string
  label: string
  icon: LucideIcon
  selected: boolean
  onSelect: () => void
}

export function DocumentTypeCard({
  label,
  icon: Icon,
  selected,
  onSelect,
}: DocumentTypeCardProps) {
  return (
    <Card
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={`flex flex-row items-center gap-3 p-4 min-h-[64px] cursor-pointer transition-colors duration-150 rounded-xl ${
        selected
          ? 'border-2 border-[#FFE600] bg-[#FFFDE7]'
          : 'border border-[#E0E0E0] bg-white'
      }`}
    >
      <Icon
        className={`w-6 h-6 shrink-0 ${selected ? 'text-[#212121]' : 'text-[#757575]'}`}
      />
      <span className="text-base text-[#212121] flex-1">{label}</span>
      <div
        className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center ${
          selected
            ? 'bg-[#FFE600]'
            : 'border-2 border-[#E0E0E0]'
        }`}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </Card>
  )
}
