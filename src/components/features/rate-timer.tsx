'use client'

import { useEffect, useState } from 'react'

interface RateTimerProps {
  validUntil: string // ISO timestamp
  onExpired: () => void
}

function formatMMSS(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function RateTimer({ validUntil, onExpired }: RateTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const diff = Math.max(0, Math.floor((new Date(validUntil).getTime() - Date.now()) / 1000))
    return diff
  })

  useEffect(() => {
    // Recalculate when validUntil changes
    const initialDiff = Math.max(0, Math.floor((new Date(validUntil).getTime() - Date.now()) / 1000))
    setRemainingSeconds(initialDiff)

    if (initialDiff <= 0) {
      onExpired()
      return
    }

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(validUntil).getTime() - Date.now()) / 1000))
      setRemainingSeconds(diff)
      if (diff <= 0) {
        clearInterval(interval)
        onExpired()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [validUntil, onExpired])

  const timeDisplay = formatMMSS(remainingSeconds)

  // Color thresholds per UI-SPEC:
  // > 3min (180s): #212121 on bg-secondary
  // 1-3min (60-180s): #FF9800 on bg-[#FFF3E0]
  // < 60s: #F44336 on bg-[#FFEBEE] + animate-pulse
  let badgeClass: string
  let label: string

  if (remainingSeconds > 180) {
    badgeClass = 'bg-secondary text-foreground'
    label = `Rate expires in ${timeDisplay}`
  } else if (remainingSeconds > 60) {
    badgeClass = 'bg-[#FFF3E0] text-[#FF9800]'
    label = `Rate expires soon — ${timeDisplay} remaining`
  } else {
    badgeClass = 'bg-[#FFEBEE] text-destructive animate-pulse'
    label = `Rate expires soon — ${timeDisplay} remaining`
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}
      aria-live="polite"
      aria-label={`Rate expires in ${timeDisplay}`}
    >
      {label}
    </span>
  )
}
