---
phase: 13-engagement-auth
plan: "04"
subsystem: auth
tags: [webauthn, biometrics, face-id, touch-id, fingerprint, pwa]
dependency_graph:
  requires:
    - 13-engagement-auth-01
    - 13-engagement-auth-02
  provides:
    - webauthn-registration-api
    - webauthn-authentication-api
    - profile-biometrics-toggle
    - passcode-biometric-button
  affects:
    - src/app/(auth)/passcode
    - src/app/(main)/profile
tech_stack:
  added:
    - "@simplewebauthn/browser@13.3.0"
    - "@simplewebauthn/server@13.3.0"
  patterns:
    - WebAuthn platform authenticator ceremony (platform attachment, UV required)
    - Challenge stored in user_profiles.webauthn_challenge; cleared after verification
    - Demo mode short-circuits WebAuthn ceremony — enrollment writes mock credential
    - isoBase64URL.fromBuffer/toBuffer for Uint8Array ↔ text column storage
key_files:
  created:
    - src/app/api/auth/webauthn/register/route.ts
    - src/app/api/auth/webauthn/register/verify/route.ts
    - src/app/api/auth/webauthn/authenticate/route.ts
    - src/app/api/auth/webauthn/authenticate/verify/route.ts
  modified:
    - src/app/(main)/profile/page.tsx
    - src/app/(auth)/passcode/page.tsx
    - messages/en/profile.json
    - messages/th/profile.json
    - messages/mm/profile.json
    - messages/en/auth.json
    - messages/th/auth.json
    - messages/mm/auth.json
decisions:
  - "@simplewebauthn/server v13: generateRegistrationOptions requires userID as Uint8Array not string — used new TextEncoder().encode(user.id)"
  - "@simplewebauthn/server v13: allowCredentials item has no 'type' field — removed from generateAuthenticationOptions call"
  - "isoBase64URL exported from @simplewebauthn/server/helpers sub-path — used for encode/decode of public key Uint8Array for text column storage"
  - "Demo mode skips full WebAuthn ceremony: register/verify writes mock credential; authenticate/verify returns authenticated:true immediately"
  - "SQL migration required (not run here): ADD COLUMN webauthn_credential_id, webauthn_public_key, webauthn_counter, webauthn_challenge to user_profiles"
metrics:
  duration_minutes: 7
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_changed: 12
---

# Phase 13 Plan 04: WebAuthn Biometric Authentication Summary

WebAuthn platform authenticator enrollment + login using @simplewebauthn/browser/server with profile toggle enrollment, passcode screen Fingerprint button, and full demo mode support.

## What Was Built

### Task 1: @simplewebauthn packages + 4 API routes

Installed `@simplewebauthn/browser@13.3.0` and `@simplewebauthn/server@13.3.0`.

Created 4 WebAuthn API routes:

- **POST /api/auth/webauthn/register** — Generates `generateRegistrationOptions` with platform attachment, UV required. Stores challenge in `user_profiles.webauthn_challenge`. Demo mode returns `{ options: null, mock: true }`.
- **POST /api/auth/webauthn/register/verify** — Calls `verifyRegistrationResponse`, stores `credential.id`, base64url-encoded `credential.publicKey`, and `credential.counter` in `user_profiles`. Clears challenge on success.
- **POST /api/auth/webauthn/authenticate** — Generates `generateAuthenticationOptions` with credential ID from profile. Stores challenge.
- **POST /api/auth/webauthn/authenticate/verify** — Calls `verifyAuthenticationResponse` with decoded public key. Updates counter. Demo mode returns `{ authenticated: true }` immediately.

SQL migration needed (commented in register/route.ts):
```sql
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS webauthn_credential_id text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS webauthn_public_key text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS webauthn_counter bigint DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS webauthn_challenge text;
```

### Task 2: Profile toggle + passcode button + i18n

**Profile page (`src/app/(main)/profile/page.tsx`):**
- Added `startRegistration` import from `@simplewebauthn/browser`
- `fetchUser` now selects `webauthn_credential_id` — sets initial toggle state from DB
- `handleBiometricToggle(enabled)`: on enable, gates on `isUserVerifyingPlatformAuthenticatorAvailable`; calls register → register/verify; on disable, clears credential columns from DB
- Switch now calls `handleBiometricToggle` instead of `setBiometricsEnabled`

**Passcode page (`src/app/(auth)/passcode/page.tsx`):**
- Added `startAuthentication` import and `Fingerprint` icon
- `biometricAvailable` state checked on mount alongside profile fetch
- `handleBiometricLogin()`: calls authenticate → authenticate/verify; redirects to `/home` on success; shows error and hides button on failure (fallback to passcode)
- Fingerprint button rendered above PasscodeKeypad, conditionally on `biometricAvailable`

**i18n (all 3 locales):**
- `profile.json` → `menu.biometricsEnrolled`, `menu.biometricsEnrollFailed`, `menu.biometricsUnavailable`
- `auth.json` → `passcode.biometricCta`, `passcode.biometricFailed`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] @simplewebauthn/server v13 — userID must be Uint8Array**
- **Found during:** Task 1
- **Issue:** v13 throws `"String values for userID are no longer supported"` — plan used `Buffer.from(user.id)`
- **Fix:** Used `new TextEncoder().encode(user.id)` which produces a Uint8Array directly
- **Files modified:** `src/app/api/auth/webauthn/register/route.ts`

**2. [Rule 1 - Bug] @simplewebauthn/server v13 — allowCredentials item has no 'type' field**
- **Found during:** Task 1 TypeScript compilation
- **Issue:** TS2353 error — `type: 'public-key'` is not part of the v13 AllowCredential type
- **Fix:** Removed the `type` property from the allowCredentials entry
- **Files modified:** `src/app/api/auth/webauthn/authenticate/route.ts`

**3. [Rule 1 - Bug] Public key storage — isoBase64URL import path**
- **Found during:** Task 1
- **Issue:** `isoBase64URL` is not exported from the main `@simplewebauthn/server` package root; it lives in the `helpers` sub-path export
- **Fix:** Used `import { isoBase64URL } from '@simplewebauthn/server/helpers'`
- **Files modified:** `src/app/api/auth/webauthn/register/verify/route.ts`, `src/app/api/auth/webauthn/authenticate/verify/route.ts`

## Known Stubs

None — all biometric flows are fully wired. Demo mode provides mock enrollment/auth path. Real WebAuthn ceremony requires SQL migration (documented above) and `NEXT_PUBLIC_DOMAIN` / `NEXT_PUBLIC_APP_ORIGIN` env vars to be set.

## Self-Check: PASSED
