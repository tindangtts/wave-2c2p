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

    // 2. Run intl middleware to resolve locale from cookie and set x-next-intl-locale header
    //    Without this, requestLocale in getRequestConfig always resolves to undefined → 'en'
    const intlResponse = intlMiddleware(request)

    // 3. Merge intl headers into session response (preserves auth cookies)
    intlResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        sessionResponse.headers.append(key, value)
      } else {
        sessionResponse.headers.set(key, value)
      }
    })

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
