'use client'

interface Bank {
  id: string
  label: string
  abbr: string
  bgColor: string
  textColor: string
}

const BANKS: Bank[] = [
  { id: 'scb', label: 'SCB', abbr: 'SCB', bgColor: '#4A148C', textColor: '#FFFFFF' },
  { id: 'ktb', label: 'KTB', abbr: 'KTB', bgColor: '#1565C0', textColor: '#FFFFFF' },
  { id: 'bay', label: 'Krungsri', abbr: 'BAY', bgColor: '#F9A825', textColor: '#212121' },
  { id: 'bbl', label: 'Bangkok Bank', abbr: 'BBL', bgColor: '#0D47A1', textColor: '#FFFFFF' },
  { id: 'kbank', label: 'KBANK', abbr: 'KBK', bgColor: '#2E7D32', textColor: '#FFFFFF' },
  { id: 'gsb', label: 'GSB', abbr: 'GSB', bgColor: '#E91E63', textColor: '#FFFFFF' },
]

interface BankChannelGridProps {
  onSelect: (channel: string) => void
}

export function BankChannelGrid({ onSelect }: BankChannelGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {BANKS.map((bank) => (
        <button
          key={bank.id}
          type="button"
          onClick={() => onSelect(bank.id)}
          className="flex flex-col items-center justify-center gap-2 bg-white border border-[#E0E0E0] rounded-xl active:bg-[#F5F5F5] transition-colors"
          style={{ width: '88px', height: '72px' }}
          aria-label={bank.label}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: bank.bgColor }}
          >
            <span
              className="text-[10px] font-bold leading-none"
              style={{ color: bank.textColor }}
            >
              {bank.abbr}
            </span>
          </div>
          <span className="text-[12px] font-normal text-[#212121] text-center leading-tight">
            {bank.label}
          </span>
        </button>
      ))}
    </div>
  )
}
