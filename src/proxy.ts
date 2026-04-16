import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  try {
    // Skip proxy for API routes — they don't need session refresh
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.next()
    }

    // Refresh Supabase session (auth guards + session refresh)
    // Locale is read from cookie by getRequestConfig in i18n/request.ts — no
    // intl middleware needed. Running createIntlMiddleware here rewrites the
    // URL to /en/... which 404s because there is no [locale] route segment.
    return await updateSession(request)
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
