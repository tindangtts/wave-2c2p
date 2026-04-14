'use client'

import * as React from 'react'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { useLocale } from 'next-intl'
import type { DateRange } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface DateRangeValue {
  from?: Date
  to?: Date
}

interface DateRangePickerProps {
  dateRange: DateRangeValue
  onChange: (range: DateRangeValue) => void
  placeholder?: string
}

/**
 * Date range picker with Buddhist calendar year support for Thai locale (D-13, HIST-05).
 * Adds 543 to the CE year when locale is 'th' (BE = CE + 543).
 */
export function DateRangePicker({
  dateRange,
  onChange,
  placeholder = 'Select Date Range',
}: DateRangePickerProps) {
  const locale = useLocale()
  const [open, setOpen] = React.useState(false)

  const isThai = locale === 'th'

  function formatYear(date: Date): string {
    const year = date.getFullYear()
    return isThai ? String(year + 543) : String(year)
  }

  function formatTriggerLabel(): string {
    if (!dateRange.from) return placeholder
    const fromStr = format(dateRange.from, 'MMM d')
    if (!dateRange.to) return fromStr
    return `${fromStr} - ${format(dateRange.to, 'MMM d')}`
  }

  function handleSelect(range: DateRange | undefined) {
    const next: DateRangeValue = {
      from: range?.from,
      to: range?.to,
    }
    onChange(next)
    // Close popover when range is complete
    if (range?.from && range?.to) {
      setOpen(false)
    }
  }

  function handleClear() {
    onChange({ from: undefined, to: undefined })
    setOpen(false)
  }

  const hasRange = Boolean(dateRange.from)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex items-center gap-2 w-full h-11 px-3 rounded-xl border border-border bg-white text-left text-sm text-foreground hover:bg-secondary transition-colors"
        aria-label="Select date range"
      >
        <CalendarIcon className="w-4 h-4 text-[#595959] flex-shrink-0" />
        <span className={`flex-1 text-sm ${hasRange ? 'text-foreground' : 'text-[#767676]'}`}>
          {formatTriggerLabel()}
        </span>
        {hasRange && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            className="p-0.5 hover:bg-[#E0E0E0] rounded-full transition-colors"
            aria-label="Clear date range"
          >
            <X className="w-3 h-3 text-[#595959]" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Calendar
          mode="range"
          selected={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          onSelect={handleSelect}
          numberOfMonths={1}
          disabled={(date) => date > new Date()}
          formatters={{
            formatCaption: (date) => {
              const month = format(date, 'MMMM')
              return `${month} ${formatYear(date)}`
            },
          }}
        />
        {hasRange && (
          <div className="border-t border-border px-3 py-2 flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-[#0091EA] font-medium px-3 py-1 min-h-[36px] hover:bg-[#E3F2FD] rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
