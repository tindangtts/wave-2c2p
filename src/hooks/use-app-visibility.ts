'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const STORAGE_KEY = 'wave-hidden-at'
const BACKGROUND_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

// Paths that should NOT trigger a passcode redirect (to avoid redirect loops)
const EXCLUDED_PREFIXES = ['/login', '/otp', '/register', '/passcode']

function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/**
 * Detects app backgrounding > 5 minutes and redirects to /passcode.
 * Must be used inside a 'use client' component.
 */
export function useAppVisibility() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
      } else if (document.visibilityState === 'visible') {
        const hiddenAt = sessionStorage.getItem(STORAGE_KEY)
        if (!hiddenAt) return

        const elapsed = Date.now() - parseInt(hiddenAt, 10)
        sessionStorage.removeItem(STORAGE_KEY)

        if (elapsed > BACKGROUND_THRESHOLD_MS && !isExcludedPath(pathname)) {
          router.push('/passcode')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router, pathname])
}
