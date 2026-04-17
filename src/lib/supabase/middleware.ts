import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unreachable — treat as unauthenticated
  }

  // Pages accessible without authentication
  const isAuthPage =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/otp") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/kyc") ||
    request.nextUrl.pathname.startsWith("/passcode") ||
    request.nextUrl.pathname.startsWith("/welcome");

  // Redirect unauthenticated users to welcome page (except public pages)
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login/otp pages.
  // /passcode is intentionally excluded — authenticated users need /passcode
  // for the lock screen (re-authentication after inactivity).
  const isLoginOnlyPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/otp");

  if (user && isLoginOnlyPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Allow authenticated users to access /register pages if registration is
  // incomplete. Only redirect to /home when registration is already done.
  const isRegisterPage = request.nextUrl.pathname.startsWith("/register");
  if (user && isRegisterPage) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("registration_complete")
      .eq("id", user.id)
      .single();

    if (profile?.registration_complete) {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
