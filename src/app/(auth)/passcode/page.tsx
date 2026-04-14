'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { PasscodeKeypad } from '@/components/features/passcode-keypad'
import { createClient } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function PasscodePage() {
  const t = useTranslations('auth')
  const router = useRouter()

  const [value, setValue] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState<string>('User')

  // Fetch user name on mount
  useEffect(() => {
    async function fetchUserName() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('first_name')
          .eq('id', user.id)
          .single()

        if (profile?.first_name) {
          setUserName(profile.first_name)
        }
      } catch {
        // Keep default 'User' on error
      }
    }

    fetchUserName()
  }, [router])

  async function handleComplete(code: string) {
    setIsLoading(true)
    setError(undefined)

    try {
      const response = await fetch('/api/auth/passcode/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code }),
      })

      if (response.ok) {
        router.push('/home')
        return
      }

      const data = await response.json()

      if (response.status === 423) {
        // Account locked
        setError(t('errors.accountLocked'))
        setValue('')
        setIsLoading(false)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
        return
      }

      if (response.status === 401) {
        setError(
          t('errors.passcodeIncorrect', { remaining: data.remaining ?? 0 })
        )
        setValue('')
        setIsLoading(false)

        if (data.locked) {
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        }
        return
      }

      // Generic error
      setError(t('errors.generic'))
      setValue('')
      setIsLoading(false)
    } catch {
      setError(t('errors.generic'))
      setValue('')
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initial = userName.charAt(0).toUpperCase()

  return (
    <div className="flex flex-col min-h-svh px-4 pt-16 pb-8 items-center">
      {/* Avatar circle */}
      <div className="w-14 h-14 bg-[#FFE600] text-[#212121] rounded-full flex items-center justify-center text-xl font-bold">
        {initial}
      </div>

      {/* Greeting */}
      <h1 className="text-xl font-bold text-[#212121] mt-4 text-center">
        {t('passcode.greeting', { name: userName })}
      </h1>

      {/* Instruction */}
      <p className="text-base text-[#757575] mt-2 text-center">
        {t('passcode.instruction')}
      </p>

      {/* Passcode keypad */}
      <div className="w-full mt-8">
        <PasscodeKeypad
          value={value}
          onChange={setValue}
          onComplete={handleComplete}
          error={error}
          isLoading={isLoading}
        />
      </div>

      {/* Logout link with confirmation dialog */}
      <AlertDialog>
        <AlertDialogTrigger
          className="text-xs text-[#757575] underline mt-8 text-center"
        >
          {t('passcode.logoutLink')}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('passcode.logoutTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('passcode.logoutBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('passcode.logoutCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('passcode.logoutConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
