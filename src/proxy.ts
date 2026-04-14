import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  // 1. Refresh Supabase session first (must complete before intl)
  const sessionResponse = await updateSession(request)

  // If updateSession returned a redirect (auth guard), honor it
  if (sessionResponse.status !== 200 && sessionResponse.headers.get('location')) {
    return sessionResponse
  }

  // 2. Apply intl locale cookie detection
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
