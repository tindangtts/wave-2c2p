import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  try {
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
    // Exclude API routes (handled directly by route handlers), static files,
    // and image/asset files from proxy processing.
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
