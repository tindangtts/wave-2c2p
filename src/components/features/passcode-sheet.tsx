'use client'

import { useState, useCallback } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { PasscodeKeypad } from '@/components/features/passcode-keypad'

const MAX_ATTEMPTS = 3

interface PasscodeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified: () => void
}

export function PasscodeSheet({ open, onOpenChange, onVerified }: PasscodeSheetProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)

  function resetState() {
    setValue('')
    setError(undefined)
    setIsLoading(false)
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      resetState()
    }
    onOpenChange(open)
  }

  const handleComplete = useCallback(
    async (code: string) => {
      if (locked) return
      setIsLoading(true)
      setError(undefined)

      try {
        const res = await fetch('/api/auth/passcode/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: code }),
        })

        const data = await res.json()

        if (res.ok && data.success) {
          resetState()
          onVerified()
          onOpenChange(false)
          return
        }

        // Incorrect passcode
        const newAttempts = attempts + 1
        setAttempts(newAttempts)

        if (data.locked || newAttempts >= MAX_ATTEMPTS) {
          setLocked(true)
          setError('Too many attempts. Try again in 5 minutes.')
          setValue('')
          setIsLoading(false)
          // Close the sheet after a short delay
          setTimeout(() => {
            setLocked(false)
            setAttempts(0)
            resetState()
            onOpenChange(false)
          }, 2000)
          return
        }

        const remaining = MAX_ATTEMPTS - newAttempts
        setError(`Incorrect passcode. ${remaining} attempt(s) remaining.`)
        setValue('')
      } catch {
        setError('Connection error. Please try again.')
        setValue('')
      } finally {
        setIsLoading(false)
      }
    },
    [attempts, locked, onVerified, onOpenChange]
  )

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="pb-safe">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-[20px] font-bold text-[#212121] text-center">
            Enter Passcode
          </DrawerTitle>
          <DrawerDescription className="text-[12px] text-[#757575] text-center mt-1">
            Confirm your transfer
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-8">
          <PasscodeKeypad
            value={value}
            onChange={setValue}
            onComplete={handleComplete}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
