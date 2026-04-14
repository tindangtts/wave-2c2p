'use client'

import { useTranslations } from 'next-intl'
import { DateRangePicker, type DateRangeValue } from './date-range-picker'

type TypeFilter = 'all' | 'send_money' | 'add_money' | 'withdraw'
type StatusFilter = 'all' | 'success' | 'pending' | 'failed'

interface HistoryFilterBarProps {
  typeFilter: string
  statusFilter: string
  dateRange: DateRangeValue
  onTypeChange: (type: string) => void
  onStatusChange: (status: string) => void
  onDateRangeChange: (range: DateRangeValue) => void
}

interface ChipProps {
  label: string
  value: string
  active: boolean
  onClick: (value: string) => void
}

function Chip({ label, value, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`inline-flex items-center justify-center h-8 px-3 rounded-full text-xs font-normal whitespace-nowrap flex-shrink-0 transition-colors active:opacity-80 ${
        active
          ? 'bg-[#FFE600] text-foreground'
          : 'bg-secondary text-[#595959]'
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

/**
 * Filter bar for transaction history (D-14, UI-SPEC Screen 5).
 * Row 1: DateRangePicker trigger (full-width)
 * Row 2: Type filter chips — All, Transfer, Top-up, Withdrawal
 * Row 3: Status filter chips — All, Success, Pending, Failed
 */
export function HistoryFilterBar({
  typeFilter,
  statusFilter,
  dateRange,
  onTypeChange,
  onStatusChange,
  onDateRangeChange,
}: HistoryFilterBarProps) {
  const t = useTranslations('wallet.filters')

  const typeChips: { label: string; value: TypeFilter }[] = [
    { label: t('all'), value: 'all' },
    { label: t('transfer'), value: 'send_money' },
    { label: t('topup'), value: 'add_money' },
    { label: t('withdrawal'), value: 'withdraw' },
  ]

  const statusChips: { label: string; value: StatusFilter }[] = [
    { label: t('all'), value: 'all' },
    { label: t('success'), value: 'success' },
    { label: t('pending'), value: 'pending' },
    { label: t('failed'), value: 'failed' },
  ]

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {/* Row 1: Date range picker */}
      <DateRangePicker
        dateRange={dateRange}
        onChange={onDateRangeChange}
        placeholder={t('selectDateRange')}
      />

      {/* Row 2: Type filter chips */}
      <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {typeChips.map((chip) => (
          <Chip
            key={chip.value}
            label={chip.label}
            value={chip.value}
            active={typeFilter === chip.value}
            onClick={onTypeChange}
          />
        ))}
      </div>

      {/* Row 3: Status filter chips */}
      <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {statusChips.map((chip) => (
          <Chip
            key={chip.value}
            label={chip.label}
            value={chip.value}
            active={statusFilter === chip.value}
            onClick={onStatusChange}
          />
        ))}
      </div>
    </div>
  )
}
