import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // 1. Refresh Supabase session (auth guards + session refresh)
  const sessionResponse = await updateSession(request)

  // If updateSession returned a redirect (auth guard), honor it
  if (sessionResponse.status !== 200 && sessionResponse.headers.get('location')) {
    return sessionResponse
  }

  // 2. Ensure locale cookie exists (next-intl reads from cookie via request.ts)
  // No intl middleware rewrite — app uses localePrefix:'never' with cookie-based detection
  if (!request.cookies.get('locale')) {
    const acceptLang = request.headers.get('accept-language') ?? ''
    let locale = 'en'
    if (acceptLang.includes('th')) locale = 'th'
    else if (acceptLang.includes('my')) locale = 'mm'

    const response = NextResponse.next({ request })
    response.cookies.set('locale', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return response
  }

  return sessionResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
