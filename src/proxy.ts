import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function proxy(request: NextRequest) {
  try {
    // Skip proxy for API routes — they don't need intl or session refresh
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.next()
    }

    // 1. Refresh Supabase session (auth guards + session refresh)
    const sessionResponse = await updateSession(request)

    // If updateSession returned a redirect (auth guard), honor it
    if (sessionResponse.status !== 200 && sessionResponse.headers.get('location')) {
      return sessionResponse
    }

    // 2. Pass through with session cookies
    // next-intl reads locale from requestLocale() which uses the cookie directly
    return sessionResponse
  } catch (err) {
    console.error('[proxy] Error:', err)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
