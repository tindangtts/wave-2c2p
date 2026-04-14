---
phase: 02-authentication
verified: 2026-04-14T15:20:00Z
status: gaps_found
score: 14/17 must-haves verified
gaps:
  - truth: "Passcode is hashed server-side with PBKDF2 and stored in user_profiles.passcode_hash"
    status: failed
    reason: "passcode/setup/route.ts uses .eq('user_id', user.id) but user_profiles PK column is 'id', not 'user_id'. UPDATE hits 0 rows silently — passcode_hash is never written."
    artifacts:
      - path: "src/app/api/auth/passcode/setup/route.ts"
        issue: "Line 45: .eq('user_id', user.id) — column does not exist on user_profiles; should be .eq('id', user.id)"
    missing:
      - "Change .eq('user_id', user.id) to .eq('id', user.id) in setup/route.ts line 45"

  - truth: "After passcode creation, registration_complete is set to true and user is redirected to /home"
    status: failed
    reason: "passcode/setup/route.ts fails silently due to wrong column name — registration_complete is never set to true. The client still redirects to /home (no error check on update), but the session state in DB is corrupt."
    artifacts:
      - path: "src/app/api/auth/passcode/setup/route.ts"
        issue: "registration_complete update fails silently because .eq('user_id',...) matches no rows"
    missing:
      - "Fix .eq column name (same as above gap); add error logging or non-silent failure when update affects 0 rows"

  - truth: "5 wrong passcode attempts locks the account and redirects to /login"
    status: failed
    reason: "passcode/verify/route.ts queries .eq('user_id', user.id) on all 5 update paths — all hit 0 rows. Profile SELECT returns empty (no match), causing 404 response before any attempt tracking."
    artifacts:
      - path: "src/app/api/auth/passcode/verify/route.ts"
        issue: "Lines 40, 69, 84, 99: all use .eq('user_id', user.id) — wrong column; profile lookup returns null, endpoint returns 404 instead of attempting verification"
    missing:
      - "Change all .eq('user_id', user.id) to .eq('id', user.id) in verify/route.ts lines 40, 69, 84, 99"
      - "Same fix needed in passcode/page.tsx line 46 for user_profiles query (.eq('user_id', user.id))"
human_verification:
  - test: "Full auth flow end-to-end"
    expected: "Phone -> OTP 000000 -> register 3 steps -> passcode creation -> /home accessible"
    why_human: "Requires live Supabase instance, browser session cookies, and interactive OTP entry"
  - test: "Session persists across browser refresh"
    expected: "Navigating to /home after refresh stays authenticated without redirect to /login"
    why_human: "Requires live browser + Supabase session cookie behavior"
  - test: "Background lock triggers passcode screen"
    expected: "After backgrounding browser tab > 5 minutes, re-focusing redirects to /passcode"
    why_human: "Requires browser tab switching with real time elapsed — cannot automate without browser"
---

# Phase 02: Authentication Verification Report

**Phase Goal:** Users can create an account, verify their phone number via OTP, set a passcode, and maintain a persistent session across browser refreshes
**Verified:** 2026-04-14T15:20:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Phone validation accepts valid TH/MM numbers and rejects invalid | VERIFIED | phoneSchema in schemas.ts uses superRefine; 13 tests pass |
| 2 | PBKDF2 passcode hash and verify roundtrip | VERIFIED | passcode.ts with 310k iterations, timingSafeEqual; 9 tests pass |
| 3 | Registration Zustand store persists step + fields to localStorage | VERIFIED | wave-registration-state key, partialize excludes actions |
| 4 | User can enter phone + country code and navigate to OTP screen | VERIFIED | login/page.tsx wired to /api/auth/otp/send, stores phone, pushes to /otp |
| 5 | User can enter 6-digit OTP and auto-submit on 6th digit | VERIFIED | otp/page.tsx: InputOTP onComplete callback fires handleVerify |
| 6 | Mock OTP verify with '000000' creates a real Supabase session cookie | VERIFIED | otp/verify/route.ts: signInWithPassword + @supabase/ssr cookie injection |
| 7 | After OTP verify, user routed to /register (new) or /home (returning) | VERIFIED | OTP page reads isNewUser + registrationStep from API response |
| 8 | User can fill personal info and advance to step 2 | VERIFIED | personal-info/page.tsx: RHF + zodResolver + useRegistrationStore + API call |
| 9 | User can fill ID details and advance to step 3 | VERIFIED | id-details/page.tsx: same pattern with idDetailsSchema |
| 10 | Step indicator shows correct completed/active/upcoming states | VERIFIED | step-indicator.tsx: 3 conditional renders, aria-current="step" on active |
| 11 | Registration persists to localStorage — browser close resumes at step | VERIFIED | Zustand persist + hydration-safe mounted pattern in both step pages |
| 12 | User can enter 6-digit passcode with numeric keypad (dots fill left to right) | VERIFIED | passcode-keypad.tsx: 6 dot display + 3x4 grid + 100ms onComplete delay |
| 13 | Passcode mismatch shows error + shake + resets to create | VERIFIED | create-passcode/page.tsx: compare + setTimeout reset to 'create' |
| 14 | Passcode hashed PBKDF2 and stored in user_profiles.passcode_hash | FAILED | setup/route.ts uses .eq('user_id', user.id) — wrong PK column (should be 'id'); UPDATE hits 0 rows silently |
| 15 | After passcode creation, registration_complete=true, redirect /home | FAILED | DB update fails silently; client still navigates to /home but DB state is wrong |
| 16 | Correct passcode entry on lock screen redirects to /home | FAILED | verify/route.ts queries .eq('user_id',...) — profile SELECT returns null → 404, never reaches verifyPasscode() |
| 17 | Unauthenticated users visiting /home are redirected to /login | VERIFIED | middleware.ts: !user && !isAuthPage && !isApiRoute → redirect /login; proxy.ts honors this |

**Score:** 14/17 truths verified (3 failed due to same root cause: wrong column name in passcode API routes)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/auth/schemas.ts` | Zod schemas for phone, personal info, ID | VERIFIED | Exports phoneSchema, personalInfoSchema, idDetailsSchema + inferred types |
| `src/lib/auth/passcode.ts` | PBKDF2 hash + verify | VERIFIED | hashPasscode/verifyPasscode, timingSafeEqual, no 'use server' directive |
| `src/lib/auth/admin.ts` | Supabase admin client | VERIFIED | createAdminClient uses SUPABASE_SERVICE_ROLE_KEY |
| `src/stores/registration-store.ts` | Zustand persist store | VERIFIED | wave-registration-state, createJSONStorage, partialize |
| `messages/en/auth.json` | English auth copy | VERIFIED | 7 top-level keys: login, otp, register, passcode, cta, errors, fields |
| `messages/th/auth.json` | Thai auth copy | VERIFIED | Key parity confirmed with en.json |
| `messages/mm/auth.json` | Myanmar auth copy | VERIFIED | Key parity confirmed with en.json |
| `src/app/api/auth/otp/send/route.ts` | Mock OTP send | VERIFIED | phoneSchema validation, mock/real mode toggle |
| `src/app/api/auth/otp/verify/route.ts` | Mock OTP verify + session | VERIFIED | createAdminClient, signInWithPassword, session cookie injection, user_profiles insert |
| `src/app/(auth)/login/page.tsx` | Login screen | VERIFIED | phoneSchema, countryCode Select, disabled CTA, i18n, aria-* |
| `src/app/(auth)/otp/page.tsx` | OTP verification screen | VERIFIED | InputOTP, onComplete, resend timer, Suspense boundary |
| `src/lib/supabase/middleware.ts` | Auth guards | VERIFIED | isAuthPage, isLoginOnlyPage split, /otp included, /passcode excluded from loginOnly |
| `src/proxy.ts` | Middleware composition | VERIFIED | updateSession → redirect check → intlMiddleware |
| `src/components/features/step-indicator.tsx` | 3-step indicator | VERIFIED | completed/active/upcoming dots, aria-current="step", aria-label="Registration progress" |
| `src/app/(auth)/register/personal-info/page.tsx` | Step 1 form | VERIFIED | personalInfoSchema, useRegistrationStore, zodResolver, AlertDialog, i18n |
| `src/app/(auth)/register/id-details/page.tsx` | Step 2 form | VERIFIED | idDetailsSchema, useRegistrationStore, zodResolver, StepIndicator |
| `src/app/api/auth/register/step/route.ts` | Step save API | VERIFIED | auth guard, step 1/2 Zod validation, correct .eq('id', user.id) |
| `src/components/features/passcode-keypad.tsx` | 6-dot keypad | VERIFIED | 6 dots, 3x4 grid, 64px keys, aria-labels, error/loading states |
| `src/app/(auth)/register/create-passcode/page.tsx` | Create passcode | VERIFIED | create/confirm state machine, mismatch detection, clearAll on success |
| `src/app/(auth)/passcode/page.tsx` | Passcode login | VERIFIED (wiring) | PasscodeKeypad, AlertDialog logout, avatar — but profile query uses wrong column |
| `src/app/api/auth/passcode/setup/route.ts` | Passcode setup API | STUB (wiring) | hashPasscode called correctly but .eq('user_id') targets non-existent column |
| `src/app/api/auth/passcode/verify/route.ts` | Passcode verify API | STUB (wiring) | verifyPasscode imported correctly but .eq('user_id') causes profile not found → 404 |
| `src/hooks/use-app-visibility.ts` | Visibility hook | VERIFIED | visibilitychange, 300000ms threshold, excluded paths, sessionStorage |
| `src/app/(main)/layout.tsx` | Main layout with lock | VERIFIED | AppVisibilityGuard wraps children, calls useAppVisibility() |
| `.planning/supabase-schema.sql` | Migration block | VERIFIED | 12 ADD COLUMN IF NOT EXISTS entries for all required fields |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| login/page.tsx | /api/auth/otp/send | fetch POST | WIRED | Line 83: fetch('/api/auth/otp/send') with response handling |
| otp/page.tsx | /api/auth/otp/verify | fetch POST on onComplete | WIRED | Line 74: fetch('/api/auth/otp/verify') with isNewUser routing |
| otp/verify/route.ts | src/lib/auth/admin.ts | createAdminClient | WIRED | Line 4: import + line 44: createAdminClient() call |
| middleware.ts | /login | redirect unauthenticated | WIRED | Line 49: NextResponse.redirect to /login |
| personal-info/page.tsx | registration-store.ts | useRegistrationStore | WIRED | Line 43: destructuring, lines 78/97: setPersonalInfo calls |
| personal-info/page.tsx | /api/auth/register/step | fetch POST | WIRED | Line 85: fetch('/api/auth/register/step') |
| id-details/page.tsx | idDetailsSchema | zodResolver | WIRED | Line 23: import, line 36: zodResolver(idDetailsSchema) |
| passcode/setup/route.ts | src/lib/auth/passcode.ts | hashPasscode | WIRED | Line 3: import, line 34: hashPasscode(passcode) — but DB update uses wrong column |
| passcode/verify/route.ts | src/lib/auth/passcode.ts | verifyPasscode | NOT_WIRED (functionally) | Line 3: import — but profile SELECT fails before verifyPasscode is reached |
| main/layout.tsx | use-app-visibility.ts | useAppVisibility | WIRED | Line 3: import, line 7: useAppVisibility() in AppVisibilityGuard |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| otp/verify/route.ts | profile | admin.from('user_profiles').select() .eq('id', userId) | Yes — correct PK column | FLOWING |
| register/step/route.ts | user | supabase.auth.getUser() | Yes | FLOWING |
| passcode/setup/route.ts | passcode_hash update | .update({passcode_hash}).eq('user_id',...) | No — wrong column, 0 rows affected | DISCONNECTED |
| passcode/verify/route.ts | profile | .select().eq('user_id',...) | No — wrong column, returns null | DISCONNECTED |
| passcode/page.tsx | userName | .select('first_name').eq('user_id',...) | No — wrong column, returns null | DISCONNECTED |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Vitest auth unit tests | `npx vitest run src/lib/auth/__tests__/` | 22/22 passed | PASS |
| phoneSchema exports exist | grep -q "phoneSchema" schemas.ts | Found | PASS |
| Locale key parity | node key-check | "All locale top-level keys match" | PASS |
| passcode setup DB column | `.eq('user_id')` in setup/route.ts vs `id` PK in schema | Mismatch | FAIL |
| passcode verify DB column | `.eq('user_id')` in verify/route.ts vs `id` PK in schema | Mismatch | FAIL |
| register/step DB column | `.eq('id')` in register/step/route.ts vs `id` PK | Match | PASS |
| otp/verify insert | `.insert({id: userId})` vs `id` PK | Match | PASS |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| AUTH-01 | 02-01, 02-02 | User can enter phone number with +66/+95 country code selector | SATISFIED | login/page.tsx: Select +66/+95, phoneSchema validation, CTA gated on min digits |
| AUTH-02 | 02-02 | User receives 6-digit OTP and can verify within time limit | SATISFIED | otp/page.tsx: InputOTP + onComplete, 60s resend timer, mock OTP API |
| AUTH-03 | 02-03, 02-04 | User can complete multi-step registration (personal info, ID details) | PARTIALLY SATISFIED | Steps 1-2 work correctly; step 3 (passcode) does not save to DB due to wrong column |
| AUTH-04 | 02-01, 02-03 | Registration progress checkpointed server-side so returning users resume | SATISFIED | register/step API saves registration_step (correct .eq('id')); Zustand store persists client-side |
| AUTH-05 | 02-04 | User can set up 6-digit passcode for quick login | BLOCKED | hashPasscode called correctly but DB update uses .eq('user_id') — wrong column, update silently fails |
| AUTH-06 | 02-02 | Authenticated routes redirect unauthenticated users to login via proxy.ts | SATISFIED | middleware.ts + proxy.ts: correct guard logic, /otp included, isLoginOnlyPage split |
| AUTH-07 | 02-02 | User session persists across browser refresh with automatic token refresh | SATISFIED | @supabase/ssr session cookies written in otp/verify, updateSession refreshes on each request |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| src/app/api/auth/passcode/setup/route.ts | 45 | `.eq('user_id', user.id)` — wrong column name | BLOCKER | passcode_hash never written; registration_complete never set; user stuck unable to complete registration |
| src/app/api/auth/passcode/verify/route.ts | 40, 69, 84, 99 | `.eq('user_id', user.id)` — wrong column name | BLOCKER | profile SELECT returns null → 404; verifyPasscode() never reached; passcode login broken |
| src/app/(auth)/passcode/page.tsx | 46 | `.eq('user_id', user.id)` — wrong column name | WARNING | first_name never loaded; greeting always shows "User" — cosmetic but confirms column confusion |

---

## Human Verification Required

### 1. Full Auth Flow End-to-End

**Test:** Start dev server, open /login, enter Thai phone number, submit, enter 000000 on OTP screen, complete all 3 registration steps, verify redirect to /home
**Expected:** Seamless flow phone → OTP → personal-info → id-details → create-passcode → /home
**Why human:** Requires live Supabase instance + session cookies; OTP screen requires browser interaction

### 2. Session Persistence Across Refresh

**Test:** After completing registration, press F5 or navigate directly to /home
**Expected:** User remains on /home without redirect to /login
**Why human:** Requires live browser session and Supabase cookie refresh cycle

### 3. Background Lock Screen

**Test:** After logging in, background the browser tab for >5 minutes, return to it
**Expected:** Page redirects to /passcode
**Why human:** Requires actual elapsed time and tab switching — cannot test with grep/static analysis

### 4. Passcode Lock After 5 Wrong Attempts (REQUIRES BUG FIX FIRST)

**Test:** After fixing the .eq('user_id') bug, enter 5 wrong passcodes on the lock screen
**Expected:** Account locks, error message shows, redirect to /login after 3s
**Why human:** Requires live DB state, session, and sequential UI interactions

---

## Gaps Summary

Three truths fail from a single root cause: **column name mismatch in passcode API routes**. The `user_profiles` table defines its primary key as `id` (which references `auth.users.id`). The registration step API correctly uses `.eq('id', user.id)`. However, `passcode/setup/route.ts`, `passcode/verify/route.ts`, and `passcode/page.tsx` all use `.eq('user_id', user.id)` — a column that does not exist on `user_profiles`.

The consequence:
1. `POST /api/auth/passcode/setup` — the UPDATE hits 0 rows. `passcode_hash` is never stored, `registration_complete` remains false. The client receives `{ success: true }` and redirects to `/home` anyway — the UI looks correct but the DB is corrupt.
2. `POST /api/auth/passcode/verify` — the SELECT hits 0 rows, `profile` is null, the route returns 404 immediately. The passcode login screen is completely non-functional.
3. `passcode/page.tsx` — the `first_name` query hits 0 rows; greeting always shows "User".

The fix is a single-line change in each of the three files: change `.eq('user_id', user.id)` to `.eq('id', user.id)`.

All other auth foundation work (Zod schemas, PBKDF2, Zustand store, OTP flow, registration steps 1-2, middleware guards, i18n) is fully implemented and verified.

---

_Verified: 2026-04-14T15:20:00Z_
_Verifier: Claude (gsd-verifier)_
