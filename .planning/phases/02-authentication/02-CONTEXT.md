# Phase 2: Authentication - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the complete authentication flow: phone number entry with country code selector (+66 TH, +95 MM), mock OTP verification (auto-bypass with "000000"), multi-step registration (Personal Info → ID Details → Passcode Setup) with browser-resume capability, 6-digit passcode setup/verification, persistent Supabase sessions, and route protection via proxy.ts.

</domain>

<decisions>
## Implementation Decisions

### Mock Auth & OTP Flow
- **D-01:** Mock OTP auto-bypass with fixed code "000000" — Supabase phone auth requires Twilio setup; mock flow accepts any 6-digit input or auto-fills "000000" for fast dev iteration. Configurable via env var `MOCK_OTP_AUTO_BYPASS=true`.
- **D-02:** Auth session state stored via Supabase session cookies — `@supabase/ssr` handles cookie-based sessions via `updateSession` in proxy.ts. No extra state management needed.
- **D-03:** First-time vs returning user detection by checking `user_profiles` table — after OTP verification, if `user_profiles` row exists with `registration_complete=true`, redirect to home; otherwise redirect to registration flow.
- **D-04:** Phone number validation: TH 9-10 digits after +66, MM 7-11 digits after +95 — standard mobile formats, validated with Zod schema before OTP request.

### Registration Multi-Step UX
- **D-05:** 3-step registration: Personal Info → ID Details → Passcode Setup — each step focused, clear progress indicator, matches prototype flow.
- **D-06:** Partial registration persists via Zustand store + localStorage sync — multi-step form state survives browser close/reopen; cleared on completion. Zustand already installed.
- **D-07:** Per-step Zod schemas with react-hook-form — validate on "Next" tap, show inline errors, prevent advancing with invalid data. RHF + Zod already installed.
- **D-08:** Progress indicator: numbered step dots (1/3, 2/3, 3/3) — simple dots matching mobile banking conventions.

### Passcode & Route Protection
- **D-09:** 6-digit passcode hashed in Supabase `user_profiles.passcode_hash` — bcrypt hash stored server-side, verified via API route. Never stored in plaintext or client-side.
- **D-10:** Passcode required on app launch when session exists but app was backgrounded >5 minutes — fresh login uses OTP, passcode is "quick unlock" for returning users.
- **D-11:** Passcode input: 6 separate digit circles with dot masking — standard banking PIN entry using input-otp component (already installed). Each digit shows briefly then masks.
- **D-12:** Route protection in proxy.ts: check Supabase session, redirect unauthenticated users from `(main)/*` routes to `/login`. Extend existing `updateSession` logic.

### Claude's Discretion
- Registration form field specifics (personal info fields, ID type options) — follow prototype screens
- Mock OTP API route implementation details
- Passcode hash algorithm choice (bcrypt vs argon2)
- Session timeout duration tuning
- Error message copy and styling

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/(auth)/login/page.tsx` — existing login page with country code selector, phone input, submit button (needs OTP flow added)
- `src/app/(auth)/layout.tsx` — auth layout wrapper (minimal, reusable)
- `src/lib/supabase/client.ts` — browser Supabase client
- `src/lib/supabase/server.ts` — server Supabase client
- `src/lib/supabase/middleware.ts` — session middleware for proxy.ts
- `src/proxy.ts` — already has session refresh + intl middleware composition
- `src/components/ui/input-otp.tsx` — shadcn input-otp component (installed)
- `src/components/ui/input.tsx`, `select.tsx`, `button.tsx` — form components
- Phase 1 design tokens in `src/app/globals.css` — brand colors, typography, touch targets

### Established Patterns
- Cookie-based locale routing (no URL prefix) — from Phase 1
- Supabase session cookies via `@supabase/ssr` — already wired
- shadcn/ui components with brand theming — yellow primary, blue secondary
- 44px minimum touch targets — enforced in Phase 1
- i18n via next-intl with message files in `messages/{locale}/common.json`

### Integration Points
- `src/proxy.ts` — add auth guards for protected routes
- `src/app/(auth)/` — new pages: OTP, register steps, passcode setup
- `src/stores/` — new Zustand store for registration state
- `src/app/api/` — new mock OTP and passcode verification routes
- `.planning/supabase-schema.sql` — `user_profiles` table already has structure, may need `passcode_hash` and `registration_complete` columns

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following prototype screens.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
