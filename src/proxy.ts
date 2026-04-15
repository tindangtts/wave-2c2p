import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function proxy(request: NextRequest) {
  try {
    // 1. Refresh Supabase session (auth guards + session refresh)
    const sessionResponse = await updateSession(request)

    // If updateSession returned a redirect (auth guard), honor it
    if (sessionResponse.status !== 200 && sessionResponse.headers.get('location')) {
      return sessionResponse
    }

    // 2. Run next-intl middleware — reads locale cookie, sets headers for requestLocale
    const intlResponse = intlMiddleware(request)

    // Merge session cookies (auth tokens) into the intl response
    for (const cookie of sessionResponse.cookies.getAll()) {
      intlResponse.cookies.set(cookie.name, cookie.value)
    }

    return intlResponse
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
