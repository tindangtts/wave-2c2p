'use client'

import { useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MYANMAR_STATES, getTownships, getWards } from '@/lib/transfer/myanmar-address-data'

export interface MyanmarAddress {
  state: string
  township: string
  ward: string
}

interface MyanmarAddressPickerProps {
  value: MyanmarAddress
  onChange: (v: MyanmarAddress) => void
  disabled?: boolean
}

export function MyanmarAddressPicker({ value, onChange, disabled }: MyanmarAddressPickerProps) {
  const stateNames = useMemo(() => MYANMAR_STATES.map((s) => s.name), [])
  const townships = useMemo(() => getTownships(value.state), [value.state])
  const wards = useMemo(() => getWards(value.state, value.township), [value.state, value.township])

  function handleStateChange(state: string | null) {
    if (!state) return
    onChange({ state, township: '', ward: '' })
  }

  function handleTownshipChange(township: string | null) {
    if (!township) return
    onChange({ ...value, township, ward: '' })
  }

  function handleWardChange(ward: string | null) {
    if (!ward) return
    onChange({ ...value, ward })
  }

  return (
    <div className="space-y-4">
      {/* State / Division */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">State / Division</label>
        <Select
          value={value.state || undefined}
          onValueChange={handleStateChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-12 w-full rounded-xl border-border focus-visible:border-[#0091EA]">
            <SelectValue placeholder="Select State / Division" />
          </SelectTrigger>
          <SelectContent>
            {stateNames.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Township */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Township</label>
        <Select
          value={value.township || undefined}
          onValueChange={handleTownshipChange}
          disabled={disabled || !value.state}
        >
          <SelectTrigger className="h-12 w-full rounded-xl border-border focus-visible:border-[#0091EA]">
            <SelectValue placeholder={value.state ? 'Select Township' : 'Select State first'} />
          </SelectTrigger>
          <SelectContent>
            {townships.map((t) => (
              <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ward / Village */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Ward / Village</label>
        <Select
          value={value.ward || undefined}
          onValueChange={handleWardChange}
          disabled={disabled || !value.township}
        >
          <SelectTrigger className="h-12 w-full rounded-xl border-border focus-visible:border-[#0091EA]">
            <SelectValue placeholder={value.township ? 'Select Ward / Village' : 'Select Township first'} />
          </SelectTrigger>
          <SelectContent>
            {wards.map((ward) => (
              <SelectItem key={ward} value={ward}>{ward}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
