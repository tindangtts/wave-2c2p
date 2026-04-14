'use client'

import { useEffect, useState } from 'react'

interface QRExpiryTimerProps {
  expiresAt: string // ISO date string
  onExpired: () => void
}

function formatMMSS(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getColorClass(remainingSeconds: number): string {
  if (remainingSeconds > 300) return 'text-foreground' // > 5 min
  if (remainingSeconds > 60) return 'text-[#FF9800]'  // 1-5 min
  return 'text-destructive'                              // < 60s
}

export function QRExpiryTimer({ expiresAt, onExpired }: QRExpiryTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  )

  useEffect(() => {
    const initial = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
    setRemainingSeconds(initial)

    if (initial <= 0) {
      onExpired()
      return
    }

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setRemainingSeconds(diff)
      if (diff <= 0) {
        clearInterval(interval)
        onExpired()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpired])

  const timeDisplay = formatMMSS(remainingSeconds)
  const colorClass = getColorClass(remainingSeconds)

  return (
    <p
      className={`text-xs font-bold text-center ${colorClass}`}
      aria-live="polite"
      aria-label={`QR code expires in ${timeDisplay}`}
    >
      Expires in {timeDisplay}
    </p>
  )
}
