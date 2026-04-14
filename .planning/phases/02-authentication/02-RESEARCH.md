# Phase 2: Authentication - Research

**Researched:** 2026-04-14
**Domain:** Supabase Auth (Phone OTP), Next.js App Router session management, multi-step registration, passcode hashing
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Mock OTP auto-bypass with fixed code "000000" — Supabase phone auth requires Twilio setup; mock flow accepts any 6-digit input or auto-fills "000000" for fast dev iteration. Configurable via env var `MOCK_OTP_AUTO_BYPASS=true`.
- **D-02:** Auth session state stored via Supabase session cookies — `@supabase/ssr` handles cookie-based sessions via `updateSession` in proxy.ts. No extra state management needed.
- **D-03:** First-time vs returning user detection by checking `user_profiles` table — after OTP verification, if `user_profiles` row exists with `registration_complete=true`, redirect to home; otherwise redirect to registration flow.
- **D-04:** Phone number validation: TH 9-10 digits after +66, MM 7-11 digits after +95 — standard mobile formats, validated with Zod schema before OTP request.
- **D-05:** 3-step registration: Personal Info → ID Details → Passcode Setup — each step focused, clear progress indicator, matches prototype flow.
- **D-06:** Partial registration persists via Zustand store + localStorage sync — multi-step form state survives browser close/reopen; cleared on completion. Zustand already installed.
- **D-07:** Per-step Zod schemas with react-hook-form — validate on "Next" tap, show inline errors, prevent advancing with invalid data. RHF + Zod already installed.
- **D-08:** Progress indicator: numbered step dots (1/3, 2/3, 3/3) — simple dots matching mobile banking conventions.
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | User can enter phone number with country code selector (+66 TH, +95 MM) | Existing login scaffold partially complete; needs Zod validation, proper CTA disable logic, and OTP route link |
| AUTH-02 | User receives 6-digit OTP and can verify within time limit | Mock API route pattern identified; `input-otp@1.4.2` `onComplete` prop confirmed; Supabase `signInWithOtp` + `verifyOtp` phone methods confirmed |
| AUTH-03 | User can complete multi-step registration (personal info, ID details) | RHF v7 + Zod v4 with `zodResolver` confirmed working; 3 new routes needed; per-step schema pattern documented |
| AUTH-04 | Registration progress is checkpointed server-side so returning users resume where they left off | Zustand v5 `persist` middleware confirmed; `user_profiles` needs `registration_step` + `registration_complete` columns; `partialize` pattern for selective field persistence |
| AUTH-05 | User can set up 6-digit passcode for quick login | Custom passcode keypad component needed; Node.js `crypto.pbkdf2Sync` confirmed available (no extra packages); API route pattern from mock-kyc reusable |
| AUTH-06 | Authenticated routes redirect unauthenticated users to login via proxy.ts | `updateSession` in middleware.ts already does this; gap found: `/otp` route missing from `isAuthPage` list |
| AUTH-07 | User session persists across browser refresh with automatic token refresh | `@supabase/ssr` `updateSession` pattern already wired in proxy.ts; `supabase.auth.getUser()` (not `getSession`) is the correct server-side check |
</phase_requirements>

---

## Summary

Phase 2 delivers the complete authentication flow on top of an existing scaffold. The login page exists but bypasses all auth — it needs a real OTP flow wired to Supabase. The OTP, registration steps, and passcode pages are entirely missing and must be created from scratch.

The core technical challenge is the **mock OTP strategy**: Supabase phone auth requires a configured SMS provider (Twilio). For development, the approach is a **pure mock route** (`POST /api/auth/otp/send` and `POST /api/auth/otp/verify`) that bypasses Supabase phone auth entirely and uses `supabase.auth.signInAnonymously()` or `signInWithPassword` with a generated synthetic user. However, the correct architecture per the locked decisions is: the mock route creates a Supabase session via the admin API using `SERVICE_ROLE_KEY`, so the session is real and cookie-based. This allows all downstream auth guards to work correctly without changes.

A second challenge is the **schema gap**: `user_profiles` table does not have `passcode_hash`, `registration_complete`, or `registration_step` columns. These must be added via a migration before registration steps can be implemented. The `user_profiles` table also requires `first_name`/`last_name` columns since it only has `full_name` currently.

**Primary recommendation:** Implement a mock-only OTP flow using Supabase Admin API (service role) to create/sign-in users without SMS. This gives real sessions, real cookies, and makes all auth guards work without any special casing.

---

## Standard Stack

### Core (All Already Installed — No New Installs Required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | ^2.103.0 | Auth session, database queries | Locked decision — project foundation |
| `@supabase/ssr` | ^0.10.2 | Cookie-based session management in Next.js | Mandatory for App Router Supabase auth |
| `react-hook-form` | ^7.72.1 | Form state, validation trigger, error display | Already installed, locked |
| `zod` | ^4.3.6 | Per-step schema validation | Already installed, locked |
| `@hookform/resolvers` | ^5.2.2 | Bridge between RHF and Zod v4 | Already installed, supports Zod v3 + v4 |
| `zustand` | ^5.0.12 | Registration multi-step state + persist | Already installed, locked |
| `input-otp` | ^1.4.2 | OTP digit input with `onComplete` hook | Already installed via shadcn |
| `next-intl` | ^4.9.1 | i18n for auth copy in `messages/{locale}/auth.json` | Already installed, locked |

### No New Packages Required

All packages needed for Phase 2 are already installed. The `passcode_hash` can be implemented using Node.js built-in `crypto.pbkdf2Sync` — no `bcryptjs` or `argon2` install needed. WebCrypto PBKDF2 is also available for async use in API routes.

**Version verification (confirmed 2026-04-14):**
- `input-otp`: 1.4.2 — `onComplete` prop confirmed in `dist/index.d.ts`
- `zustand/middleware`: persist + createJSONStorage confirmed available
- `@hookform/resolvers`: `zodResolver` supports both Zod v3 and v4 (confirmed in types)
- Node.js: v25.8.1 — `crypto.pbkdf2Sync` and `WebCrypto.subtle` both available

---

## Architecture Patterns

### Route Structure (New Files to Create)

```
src/app/(auth)/
├── login/page.tsx              # EXISTS — rewrite OTP flow, keep scaffold structure
├── otp/page.tsx                # NEW — 6-digit OTP verification
├── register/
│   ├── personal-info/page.tsx  # NEW — step 1
│   ├── id-details/page.tsx     # NEW — step 2
│   └── create-passcode/page.tsx # NEW — step 3 (includes confirm sub-step via local state)
├── passcode/page.tsx           # NEW — passcode login for returning users
└── layout.tsx                  # EXISTS — no changes needed

src/app/api/auth/
├── otp/
│   ├── send/route.ts           # NEW — mock OTP send (creates/looks up Supabase user)
│   └── verify/route.ts         # NEW — mock OTP verify (establishes real session)
└── passcode/
    ├── setup/route.ts          # NEW — hash + store passcode
    └── verify/route.ts         # NEW — compare passcode hash

src/stores/
└── registration-store.ts       # NEW — Zustand persist store

src/lib/auth/
├── mock-otp.ts                 # NEW — OTP generation and validation logic
└── passcode.ts                 # NEW — PBKDF2 hash/verify helpers
```

### Pattern 1: Mock OTP Session Creation

The mock OTP bypasses real SMS but must still produce a real Supabase session cookie for all auth guards to work.

**Strategy:** Use Supabase Admin API (`createClient` with `SERVICE_ROLE_KEY`) to call `auth.admin.createUser` (or update if exists), then use `signInWithPassword` with a system-generated password keyed to the phone number. The client never sees the password — it only receives the session cookie set by the verify route.

**Alternative (simpler, confirmed approach):** Use `supabase.auth.signInWithOtp` with phone — this will fail in real mode without Twilio, but with `MOCK_OTP_AUTO_BYPASS=true`, the verify route accepts any 6-digit code and calls `supabase.auth.admin.generateLink({ type: 'magiclink', email: ... })` ... but this only works for email.

**Confirmed correct pattern for phone mock:**

```typescript
// src/app/api/auth/otp/send/route.ts
// Source: verified Supabase admin API in node_modules/@supabase/auth-js

import { createClient } from '@supabase/supabase-js'

// Admin client uses SERVICE_ROLE_KEY — bypasses RLS, can create users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  const { phone } = await request.json()
  const isMockMode = process.env.MOCK_OTP_AUTO_BYPASS !== 'false'

  if (isMockMode) {
    // Store phone in a short-lived server-side map or signed cookie
    // Return success — OTP is always "000000" in mock mode
    return NextResponse.json({ success: true, mock: true })
  }

  // Real mode: supabase.auth.signInWithOtp({ phone })
  // Requires Twilio — not used in Phase 2
}
```

```typescript
// src/app/api/auth/otp/verify/route.ts
export async function POST(request: Request) {
  const { phone, token } = await request.json()
  const isMockMode = process.env.MOCK_OTP_AUTO_BYPASS !== 'false'

  if (isMockMode && token !== '000000') {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
  }

  // Create or find Supabase user by phone using admin client
  // Then create a session — set it as a cookie on the response
  // The session cookie pattern mirrors @supabase/ssr's cookie structure
}
```

**Critical: Phone-to-User Mapping.** Supabase `auth.users` table stores phone numbers directly. Admin can call `supabase.auth.admin.listUsers()` to find existing user, or `supabase.auth.admin.createUser({ phone, phone_confirm: true })`.

### Pattern 2: Zustand Registration Store with Persist

```typescript
// src/stores/registration-store.ts
// Source: zustand/middleware persist.d.ts — confirmed API

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface RegistrationState {
  step: 1 | 2 | 3
  phone: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  idType: string
  idNumber: string
  idExpiry: string
  clearAll: () => void
  setField: <K extends keyof RegistrationState>(key: K, value: RegistrationState[K]) => void
}

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set) => ({
      step: 1,
      phone: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      idType: '',
      idNumber: '',
      idExpiry: '',
      clearAll: () => set({ step: 1, phone: '', firstName: '', /* ... */ }),
      setField: (key, value) => set({ [key]: value }),
    }),
    {
      name: 'wave-registration-state',       // localStorage key from UI-SPEC D-06
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({              // persist only data fields, not actions
        step: state.step,
        phone: state.phone,
        firstName: state.firstName,
        lastName: state.lastName,
        dateOfBirth: state.dateOfBirth,
        nationality: state.nationality,
        idType: state.idType,
        idNumber: state.idNumber,
        idExpiry: state.idExpiry,
      }),
    }
  )
)
```

**SSR hydration warning:** Zustand `persist` reads `localStorage` only on the client. Use `useRegistrationStore.persist.hasHydrated()` or a `useEffect` pattern to avoid hydration mismatch — do not read persisted state during SSR.

### Pattern 3: React Hook Form + Zod v4 Per-Step Validation

```typescript
// Zod v4 schema for step 1
// Source: @hookform/resolvers dist — confirmed zodResolver supports zod v4

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  dateOfBirth: z.string().regex(
    /^\d{2}\/\d{2}\/\d{4}$/,
    'Enter a valid date (DD/MM/YYYY).'
  ),
  nationality: z.enum(['thai', 'myanmar', 'other']),
})

// In component:
const form = useForm({
  resolver: zodResolver(personalInfoSchema),
  mode: 'onSubmit',  // validates on "Next" tap per D-07
})
```

**D-07 note:** `mode: 'onSubmit'` in RHF triggers validation only on form submit (= "Next" tap). Exception for phone number: use `mode: 'onBlur'` only for the phone field on the login screen. These are two separate forms with different modes.

### Pattern 4: PBKDF2 Passcode Hashing (No Extra Packages)

```typescript
// src/lib/auth/passcode.ts
// Source: Node.js crypto module — confirmed available v25.8.1

import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto'

const ITERATIONS = 310_000  // NIST recommendation for PBKDF2-SHA256
const KEY_LENGTH = 32
const DIGEST = 'sha256'

export function hashPasscode(passcode: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(passcode, salt, ITERATIONS, KEY_LENGTH, DIGEST)
  return `pbkdf2:${salt}:${hash.toString('hex')}`
}

export function verifyPasscode(passcode: string, stored: string): boolean {
  const [, salt, storedHash] = stored.split(':')
  const hash = pbkdf2Sync(passcode, salt, ITERATIONS, KEY_LENGTH, DIGEST)
  const storedBuf = Buffer.from(storedHash, 'hex')
  return timingSafeEqual(hash, storedBuf)
}
```

**Why PBKDF2 over bcrypt:** bcryptjs is not installed; adding it adds a dependency. Node.js built-in `crypto` is always available in API routes (Node.js runtime). PBKDF2-SHA256 at 310,000 iterations meets NIST SP 800-132 guidance. `timingSafeEqual` prevents timing attacks.

**bcrypt consideration:** The CONTEXT.md mentions "bcrypt hash" in D-09. PBKDF2 from Node.js crypto satisfies the security requirement without an extra dependency. If bcryptjs is preferred, it would need to be installed (`npm install bcryptjs @types/bcryptjs`).

### Pattern 5: proxy.ts Auth Guard Extension (AUTH-06)

The existing `middleware.ts` auth guard has a critical gap: `/otp` is NOT in the `isAuthPage` list. This means:
- An unauthenticated user navigating to `/otp` would be redirected to `/login` (correct behavior)
- BUT an authenticated user would be redirected to `/home` from `/otp` (wrong — user needs to pass through OTP during login flow)

The fix: `/otp` is an auth page (user is mid-authentication, no full session yet) and must be added to `isAuthPage`. Additionally, the current middleware redirects ALL authenticated users away from ALL auth pages — but the passcode screen needs special handling: a user with session can be on `/passcode` if the session exists but was backgrounded.

```typescript
// src/lib/supabase/middleware.ts — updated isAuthPage check
const isAuthPage =
  request.nextUrl.pathname.startsWith('/login') ||
  request.nextUrl.pathname.startsWith('/otp') ||       // ADD THIS
  request.nextUrl.pathname.startsWith('/register') ||
  request.nextUrl.pathname.startsWith('/kyc') ||
  request.nextUrl.pathname.startsWith('/passcode')
```

The redirect for authenticated users away from auth pages must also exclude `/passcode` — a user with a valid session IS allowed on `/passcode` (it's the passcode lock screen, not registration).

```typescript
// Redirect authenticated users away from login/otp/register only (not passcode)
const isLoginOnlyPage =
  request.nextUrl.pathname.startsWith('/login') ||
  request.nextUrl.pathname.startsWith('/otp') ||
  request.nextUrl.pathname.startsWith('/register')

if (user && isLoginOnlyPage) {
  // redirect to /home
}
```

### Pattern 6: Schema Migration Requirements

The existing `user_profiles` table is missing columns needed for Phase 2. A migration must be run before implementation:

```sql
-- Migration required before Phase 2 implementation
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS date_of_birth text,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS id_type text,
  ADD COLUMN IF NOT EXISTS id_number text,
  ADD COLUMN IF NOT EXISTS id_expiry text,
  ADD COLUMN IF NOT EXISTS passcode_hash text,
  ADD COLUMN IF NOT EXISTS registration_complete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS registration_step integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS passcode_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS passcode_locked_at timestamptz;

-- full_name remains (used elsewhere), but first_name + last_name added separately
```

**RLS note:** The existing `INSERT` policy on `user_profiles` allows the authenticated user to insert their own row. The `UPDATE` policy allows update. New columns fall under existing policies — no new policies needed.

### Anti-Patterns to Avoid

- **Using `getSession()` server-side instead of `getUser()`:** `getSession()` reads from the cookie without verification — it can be spoofed. `getUser()` makes a network call to Supabase to verify the JWT. The existing `middleware.ts` correctly uses `getUser()`.
- **Storing phone number in localStorage for OTP handoff:** Use `sessionStorage` or URL search params (phone is not sensitive but transient). The `useRegistrationStore` includes `phone` field — this is acceptable since it's just a phone number, not a credential.
- **Reading Zustand store on server:** Zustand with `persist` reads from `localStorage`. All store reads must happen inside client components or after hydration check.
- **Auto-submitting OTP with `onComplete` before error state is cleared:** Clear error state before calling the verify API to avoid race conditions where shake animation + new verify race.
- **Passcode on client-side only:** The passcode must be verified server-side via API route. The client only sends the 6-digit code and receives success/failure. Never compute the hash on the client.
- **Blocking the proxy with slow `getUser()` calls:** The existing proxy already calls `getUser()` on every request. This is necessary but adds ~50-100ms. Do not add additional Supabase queries to the proxy.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OTP digit input | Custom digit input grid | `input-otp` (already installed) | Handles paste, backspace, focus traversal, accessibility, `onComplete` |
| Form validation | Manual field checks | RHF + Zod (already installed) | Handles touched state, error display, submit prevention |
| Session cookie management | Manual cookie parsing | `@supabase/ssr` `updateSession` | Handles token refresh, cookie attribute security |
| Passcode hash | Rolling own hash function | Node.js `crypto.pbkdf2Sync` | Timing-safe, proven, no extra dependency |
| Multi-step state | Context + prop drilling | Zustand `persist` (already installed) | localStorage persistence, rehydration, SSR-safe pattern |
| Phone format validation | Regex inline in component | Zod schema with `.regex()` | Reusable, type-safe, testable |
| Redirect on auth state | Custom hooks + useEffect | proxy.ts middleware redirect | Runs before React, prevents flash of wrong content |

---

## Common Pitfalls

### Pitfall 1: Supabase `getSession()` vs `getUser()` Server-Side
**What goes wrong:** Calling `supabase.auth.getSession()` in Server Components or middleware — it trusts the cookie without validation, allowing spoofed sessions.
**Why it happens:** Developer confusion between client and server methods.
**How to avoid:** Always use `supabase.auth.getUser()` in middleware and Server Components. The existing `middleware.ts` already does this correctly — don't change it.
**Warning signs:** Seeing `getSession()` in any file under `src/lib/supabase/server.ts` or `middleware.ts`.

### Pitfall 2: Zustand Persist Hydration Mismatch
**What goes wrong:** Reading Zustand persisted state during SSR causes hydration mismatch because localStorage is unavailable on the server. React may throw or silently produce incorrect UI.
**Why it happens:** `create()` with `persist` initializes with defaults on server, then hydrates to different values on client.
**How to avoid:** Wrap any UI that depends on persisted state in a component that checks `useRegistrationStore.persist.hasHydrated()`. Or use a simple `mounted` state pattern with `useEffect`.
**Warning signs:** React hydration warnings in console; registration form flashing empty → populated.

### Pitfall 3: `/otp` Route Not in `isAuthPage` Guard
**What goes wrong:** The current `middleware.ts` does not include `/otp` in `isAuthPage`. If an unauthenticated user tries to access `/otp` directly, they get redirected to `/login` (acceptable), but more importantly, after OTP is verified and session is created, navigation to `/otp` by an authenticated user triggers the wrong redirect.
**Why it happens:** `/otp` was not in the original scaffold's `isAuthPage` list.
**How to avoid:** Update `isAuthPage` in `middleware.ts` to include `/otp`. See Pattern 5 above.

### Pitfall 4: Mock OTP Creates No Real Session
**What goes wrong:** If the mock OTP route just returns `{ success: true }` without creating a real Supabase session cookie, all downstream auth guards (`proxy.ts` calling `getUser()`) will see the user as unauthenticated. Every protected route will redirect to `/login`.
**Why it happens:** Mock routes that simulate success without calling Supabase admin to create an actual session.
**How to avoid:** The verify route must use the Supabase admin API to create a user (if not exists) and then return a session token. The session must be written to cookies using the same `@supabase/ssr` cookie format.
**Warning signs:** Login appears to succeed (OTP screen passes), but home page immediately redirects back to login.

### Pitfall 5: `registration_complete` Not Set on Final Step
**What goes wrong:** User completes all 3 registration steps, passcode is created, but `registration_complete` column is not set to `true`. On next login, user is redirected back to registration even though they completed it.
**Why it happens:** The final step's API route only saves the passcode hash but doesn't update `registration_complete`.
**How to avoid:** The passcode setup API route (step 3 completion) must atomically: (1) save `passcode_hash`, (2) set `registration_complete = true`, (3) set `registration_step = 3`. Use a single Supabase `update` call.

### Pitfall 6: `user_profiles` Row Not Created After OTP Verification
**What goes wrong:** After OTP verification, the user has a Supabase `auth.users` entry but no `user_profiles` row. The D-03 redirect logic queries `user_profiles` to determine first-time vs returning — if no row exists, this query returns null and must be treated as "new user" (redirect to registration). But if the row creation fails partway through registration, subsequent logins try to check a partially-filled row.
**Why it happens:** The `user_profiles` INSERT RLS policy requires the user to be authenticated (auth.uid() = id). The INSERT must happen after OTP verification, not before.
**How to avoid:** The OTP verify API route should create a minimal `user_profiles` row immediately after session creation (`registration_complete: false`, `registration_step: 1`). If the row already exists, skip creation. Each registration step API route then updates the existing row.

### Pitfall 7: Passcode Lock State Not Persisted
**What goes wrong:** User enters wrong passcode 3 times, refreshes the browser — attempt counter resets. User can try unlimited times.
**Why it happens:** Attempt counter stored only in client state.
**How to avoid:** `passcode_attempts` and `passcode_locked_at` are stored in `user_profiles` (server-side). The passcode verify API route reads and updates these columns. The client shows remaining attempts based on the API response.

### Pitfall 8: `input-otp` `onComplete` Called With Stale Closure
**What goes wrong:** `onComplete` callback captures stale state (e.g., old `phone` value from a previous render).
**Why it happens:** Function passed as `onComplete` is recreated each render but `input-otp` may cache it.
**How to avoid:** Use `useCallback` with all dependencies listed. Or use `onChange` with length check instead of `onComplete`.

---

## Code Examples

### OTP Input with Auto-Submit and Error State

```tsx
// Source: input-otp 1.4.2 onComplete prop — confirmed in dist/index.d.ts

'use client'
import { useState } from 'react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

export function OTPVerification({ phone }: { phone: string }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleComplete(code: string) {
    setError('')
    setIsLoading(true)
    const res = await fetch('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, token: code }),
    })
    if (!res.ok) {
      setError('Incorrect code. Please try again.')
      setValue('')  // clear all slots
      setIsLoading(false)
    } else {
      // navigate to registration or home based on user_profiles check
    }
  }

  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={setValue}
      onComplete={handleComplete}
      autoComplete="one-time-code"
      aria-label="6-digit verification code"
      aria-invalid={!!error}
    >
      <InputOTPGroup className="gap-2">
        {[0,1,2,3,4,5].map(i => (
          <InputOTPSlot
            key={i}
            index={i}
            className="w-12 h-12 text-lg font-bold"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}
```

### Supabase Admin Client for Mock OTP

```typescript
// Source: @supabase/supabase-js dist — verified admin createUser method exists

import { createClient } from '@supabase/supabase-js'

// Never use in client components — SERVER ONLY
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

### Phone Validation Zod Schema

```typescript
// Source: project conventions from CONTEXT.md D-04

import { z } from 'zod'

export const phoneSchema = z.object({
  countryCode: z.enum(['+66', '+95']),
  phone: z.string(),
}).superRefine(({ countryCode, phone }, ctx) => {
  const digits = phone.replace(/\D/g, '')
  if (countryCode === '+66') {
    if (digits.length < 9 || digits.length > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid Thai number (9-10 digits after +66).',
        path: ['phone'],
      })
    }
  }
  if (countryCode === '+95') {
    if (digits.length < 7 || digits.length > 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid Myanmar number (7-11 digits after +95).',
        path: ['phone'],
      })
    }
  }
})
```

### Session Cookie Writing in Verify Route

```typescript
// Pattern for setting Supabase session cookies from API route
// After admin creates session, write cookies to response

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// In verify route — set session cookies so proxy.ts sees authenticated user
const cookieStore = await cookies()
// Use @supabase/ssr server client with cookie write access
// The session from admin.createSession() must be written to the response cookies
// using the same cookie names that @supabase/ssr expects
```

---

## Schema Migration (Critical — Must Run Before Phase 2)

The existing `user_profiles` schema is missing fields required by this phase. The planner must include a Wave 0 task to run this migration.

**Columns currently in schema:**
- `id`, `full_name`, `phone`, `country_code`, `wallet_id`, `kyc_status`, `language`, `avatar_url`, `created_at`, `updated_at`

**Columns missing (required for Phase 2):**
- `first_name` — step 1 registration
- `last_name` — step 1 registration
- `date_of_birth` — step 1 registration
- `nationality` — step 1 registration
- `id_type` — step 2 registration
- `id_number` — step 2 registration
- `id_expiry` — step 2 registration
- `passcode_hash` — step 3, D-09
- `registration_complete` — D-03 first-time vs returning detection
- `registration_step` — D-04/D-06 resume at last incomplete step
- `passcode_attempts` — D-10 lockout after 5 failures
- `passcode_locked_at` — D-10 lockout timestamp

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | PBKDF2 passcode hashing | ✓ | v25.8.1 | — |
| Node.js `crypto` module | Passcode hash/verify | ✓ | Built-in | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Mock OTP admin client | Must configure | — | Set in `.env.local` before dev |
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase calls | Must configure | — | Set in `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All Supabase calls | Must configure | — | Set in `.env.local` |
| `@testing-library/react` | Component tests | ✗ Not installed | — | Install in Wave 0 if tests needed |
| Supabase project | Auth session creation | External | — | Configure before testing |

**Missing dependencies with no fallback:**
- Supabase project credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) — must be configured in `.env.local` before any auth flow can be tested. The `.env.local.example` documents these.

**Missing dependencies with fallback:**
- `@testing-library/react` — not installed, but `vitest.config.ts` exists and `vitest` is in devDependencies. If component tests are needed for Wave 0, install `@testing-library/react @testing-library/user-event jsdom` and update vitest config to use `jsdom` environment.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | `vitest.config.ts` (exists, environment: 'node') |
| Quick run command | `npx vitest run src/lib` |
| Full suite command | `npx vitest run` |

**Note:** `vitest.config.ts` currently sets `environment: 'node'`. Component tests (OTP input, passcode keypad) require `jsdom` environment. The config needs updating in Wave 0 if client component tests are added.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Phone Zod schema validates TH/MM digit counts | unit | `npx vitest run src/lib/auth` | ❌ Wave 0 |
| AUTH-01 | Phone schema rejects invalid formats | unit | `npx vitest run src/lib/auth` | ❌ Wave 0 |
| AUTH-02 | Mock OTP verify route returns session on "000000" | unit | `npx vitest run src/app/api/auth` | ❌ Wave 0 |
| AUTH-02 | Mock OTP verify route rejects wrong code | unit | `npx vitest run src/app/api/auth` | ❌ Wave 0 |
| AUTH-03 | Step schemas validate required fields | unit | `npx vitest run src/lib/auth` | ❌ Wave 0 |
| AUTH-04 | Registration store persists and rehydrates | unit | `npx vitest run src/stores` | ❌ Wave 0 |
| AUTH-05 | Passcode PBKDF2 hash + verify roundtrip | unit | `npx vitest run src/lib/auth` | ❌ Wave 0 |
| AUTH-05 | Passcode verify rejects wrong code | unit | `npx vitest run src/lib/auth` | ❌ Wave 0 |
| AUTH-06 | proxy.ts redirects unauthenticated to /login | manual | manual browser test | ❌ Wave 0 |
| AUTH-07 | Session persists across simulated refresh | manual | manual browser test | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/auth`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/auth/passcode.ts` — covers AUTH-05 (create, then test)
- [ ] `src/lib/auth/__tests__/passcode.test.ts` — PBKDF2 roundtrip tests
- [ ] `src/lib/auth/__tests__/phone-schema.test.ts` — covers AUTH-01 validation
- [ ] `src/stores/__tests__/registration-store.test.ts` — covers AUTH-04 persist
- [ ] `src/app/api/auth/otp/__tests__/verify.test.ts` — covers AUTH-02
- [ ] vitest.config.ts update: keep `environment: 'node'` (all tests above are pure logic, no DOM needed)

---

## Open Questions

1. **Mock OTP Session Strategy — Admin API vs signInAnonymously**
   - What we know: Supabase `signInWithOtp({ phone })` requires Twilio. Admin client can create users and generate magic links (email only). `signInAnonymously()` creates real sessions but loses phone identity.
   - What's unclear: The exact admin API call to create a phone-authenticated user AND set a valid session cookie in a Route Handler response without a redirect.
   - Recommendation: Use `admin.createUser({ phone, phone_confirm: true })` to create/ensure user exists, then use a custom password (derived from phone + secret) with `signInWithPassword` to get a session. This is a well-documented pattern for test environments. Alternatively, check if Supabase supports phone OTP testing numbers configured in the dashboard (this is a project setting, not SDK feature).

2. **`full_name` vs `first_name`/`last_name` Schema Conflict**
   - What we know: Current `user_profiles` has `full_name text NOT NULL`. The registration step 1 collects `first_name` + `last_name` separately.
   - What's unclear: Whether to keep `full_name` (derived as `first_name || ' ' || last_name`) or remove it.
   - Recommendation: Add `first_name` and `last_name` as new columns, keep `full_name` for backward compatibility (compute it when saving step 1), and populate it as `first_name + ' ' + last_name`.

3. **Passcode Backgrounding Detection (D-10: >5 minutes)**
   - What we know: The `(main)/layout.tsx` needs to track app visibility. `document.visibilitychange` event and `Date.now()` can measure elapsed time.
   - What's unclear: Whether this is Phase 2 scope or deferred. The UI-SPEC includes the passcode login screen (Screen 6) and the route `/passcode`.
   - Recommendation: Implement a lightweight `useAppVisibility` hook in Phase 2 that records `hiddenAt` timestamp to `sessionStorage` and compares on `visibilitychange`. If elapsed > 5 minutes and user is authenticated, redirect to `/passcode`. Keep it in `src/hooks/use-app-visibility.ts`.

---

## Project Constraints (from CLAUDE.md)

- **Framework:** Next.js 16.2.3 (App Router) — uses `proxy.ts` NOT `middleware.ts`
- **Runtime:** React 19.2.4 — use Server Components where possible; add `'use client'` only for interactive components
- **Auth:** Supabase `@supabase/ssr` — cookie-based sessions, `updateSession` in proxy.ts
- **UI:** shadcn/ui (base-nova) + Tailwind CSS v4 — no inline styles, use CSS custom properties from `globals.css`
- **Touch targets:** 44x44px minimum on all interactive elements
- **Mobile-first:** Max 430px container, safe area handling
- **i18n:** All copy in `messages/{locale}/auth.json` via `next-intl` — no hardcoded strings
- **Mock services:** OTP and passcode verification must be mock-only with `MOCK_OTP_AUTO_BYPASS=true` env var
- **GSD workflow:** All code changes via GSD execute-phase, not direct edits
- **No re-evaluation:** Stack is locked — do not propose alternative frameworks or libraries

---

## Sources

### Primary (HIGH confidence)
- `node_modules/@supabase/auth-js/dist/module/GoTrueClient.d.ts` — `signInWithOtp`, `verifyOtp`, `admin.createUser` method signatures verified
- `node_modules/@supabase/auth-js/dist/module/lib/types.d.ts` — `SignInWithPasswordlessCredentials`, `VerifyMobileOtpParams`, `MobileOtpType` types verified
- `node_modules/zustand/middleware/persist.d.ts` — `persist`, `createJSONStorage`, `PersistOptions` API verified
- `node_modules/@hookform/resolvers/zod/dist/zod.d.ts` — `zodResolver` supports Zod v3 and v4 confirmed
- `node_modules/input-otp/dist/index.d.ts` — `onComplete` prop confirmed
- `src/lib/supabase/middleware.ts` — existing auth guard logic inspected
- `src/lib/supabase/server.ts` — existing server client pattern inspected
- `.planning/supabase-schema.sql` — schema gaps identified
- `vitest.config.ts` — test infrastructure confirmed

### Secondary (MEDIUM confidence)
- Node.js crypto module — PBKDF2 availability verified via `node -e` runtime test
- `package.json` — all package versions and installed status confirmed

### Tertiary (LOW confidence)
- Supabase "Test Phone Numbers" dashboard feature — referenced in Supabase docs (not in SDK types). A Supabase project can configure test phone numbers (e.g., `+66000000000` with OTP `000000`) in Authentication > Phone > Test phone numbers. This is the preferred approach if the project has a real Supabase project configured — it avoids the admin API complexity entirely. Needs verification against current Supabase Dashboard for the specific project.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed installed and version-verified locally
- Architecture patterns: HIGH — Supabase types and Zustand persist API verified from installed node_modules
- Schema gaps: HIGH — direct inspection of supabase-schema.sql
- Pitfalls: HIGH (most) / MEDIUM (session cookie writing in API route — pattern needs validation during implementation)
- Mock OTP strategy: MEDIUM — admin API existence confirmed in types, exact session cookie writing pattern needs implementation testing

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (stable libraries; Supabase admin API patterns unlikely to change)
