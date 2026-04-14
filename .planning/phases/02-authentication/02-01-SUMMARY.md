---
phase: 02-authentication
plan: 01
subsystem: auth-foundation
tags: [auth, zod, zustand, i18n, pbkdf2, supabase, schema]
dependency_graph:
  requires: []
  provides:
    - src/lib/auth/schemas.ts (phoneSchema, personalInfoSchema, idDetailsSchema)
    - src/lib/auth/passcode.ts (hashPasscode, verifyPasscode)
    - src/lib/auth/admin.ts (createAdminClient)
    - src/stores/registration-store.ts (useRegistrationStore)
    - messages/*/auth.json (en/th/mm auth copy)
    - .planning/supabase-schema.sql (migration block)
  affects: [02-02, 02-03, 02-04]
tech_stack:
  added: []
  patterns:
    - Zod v4 superRefine for cross-field phone validation
    - PBKDF2 (310k iterations, sha256, random 16-byte salt) for passcode hashing
    - timingSafeEqual for constant-time hash comparison
    - Zustand v5 persist with partialize to exclude actions from storage
    - next-intl messages merged with spread — common.json + auth.json per locale
key_files:
  created:
    - src/lib/auth/schemas.ts
    - src/lib/auth/passcode.ts
    - src/lib/auth/admin.ts
    - src/lib/auth/__tests__/schemas.test.ts
    - src/lib/auth/__tests__/passcode.test.ts
    - src/stores/registration-store.ts
    - messages/en/auth.json
    - messages/th/auth.json
    - messages/mm/auth.json
  modified:
    - .planning/supabase-schema.sql
    - src/i18n/request.ts
decisions:
  - Zod superRefine used for phone validation to enable cross-field digit-stripping and country-specific length rules in one pass
  - PBKDF2 310k iterations matches OWASP 2023 recommendation for sha256; uses Node.js built-in crypto — no extra package
  - timingSafeEqual prevents timing-based side-channel on passcode comparisons
  - i18n request.ts merges auth.json via spread under 'auth' key — no next-intl plugin changes required
  - Zustand partialize excludes action functions from localStorage — prevents serialization issues
  - supabase-schema.sql migration uses ADD COLUMN IF NOT EXISTS for idempotency — safe to re-run
metrics:
  duration: "4 minutes"
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_created: 9
  files_modified: 2
  tests_written: 22
  tests_passing: 22
---

# Phase 02 Plan 01: Auth Foundation Summary

**One-liner:** Zod phone/identity schemas + PBKDF2 passcode hashing with timingSafeEqual + Zustand persist registration store + en/th/mm auth i18n files.

## What Was Built

### Task 1: Auth Utility Modules + Schema Migration (TDD)

**Zod schemas** (`src/lib/auth/schemas.ts`):
- `phoneSchema`: validates Thai (+66, 9-10 digits) and Myanmar (+95, 7-11 digits) phone numbers; strips non-digit characters before validation using `superRefine`
- `personalInfoSchema`: validates firstName, lastName (min 1), dateOfBirth (DD/MM/YYYY regex), nationality enum
- `idDetailsSchema`: validates idType enum, idNumber (min 1), idExpiry (DD/MM/YYYY regex)

**Passcode utilities** (`src/lib/auth/passcode.ts`):
- `hashPasscode`: PBKDF2 with random 16-byte salt, 310,000 iterations, sha256, 32-byte key — returns `pbkdf2:{salt_hex}:{hash_hex}`
- `verifyPasscode`: recomputes hash and compares with `timingSafeEqual` — no timing side-channel
- Server-only file (`'use server'` directive)

**Admin client** (`src/lib/auth/admin.ts`):
- `createAdminClient`: Supabase client using `SUPABASE_SERVICE_ROLE_KEY`, `autoRefreshToken: false`, `persistSession: false`

**Schema migration** (`.planning/supabase-schema.sql`):
- Appended `ALTER TABLE` block adding 12 new columns to `user_profiles` with `ADD COLUMN IF NOT EXISTS`
- Columns: first_name, last_name, date_of_birth, nationality, id_type, id_number, id_expiry, passcode_hash, registration_complete, registration_step, passcode_attempts, passcode_locked_at

### Task 2: Registration Store + i18n Messages

**Zustand store** (`src/stores/registration-store.ts`):
- Persists step (1|2|3), phone, countryCode, personal info, and ID detail fields
- `name: 'wave-registration-state'`, `createJSONStorage(() => localStorage)`
- `partialize` excludes action functions — only state fields serialized
- Actions: `setStep`, `setPhone`, `setPersonalInfo`, `setIdDetails`, `clearAll`

**i18n auth messages** (7 top-level keys: login, otp, register, passcode, cta, errors, fields):
- `messages/en/auth.json`: full English banking copy
- `messages/th/auth.json`: Thai translations with proper banking terminology
- `messages/mm/auth.json`: Myanmar/Burmese Unicode script translations

**i18n wiring** (`src/i18n/request.ts`):
- Updated to load both `common.json` and `auth.json` in parallel via `Promise.all`
- Auth messages merged under `auth` namespace key

## Test Results

```
Test Files  2 passed (2)
     Tests  22 passed (22)
  Duration  ~600ms
```

All behaviors verified: phone accept/reject cases, digit-stripping, personalInfo validation, idDetails validation, hashPasscode roundtrip, verifyPasscode timing-safe comparison.

## Verification

- `npx vitest run src/lib/auth/__tests__/` — 22/22 passed
- `npx tsc --noEmit` — clean (0 errors)
- `npm run build` — clean (18/18 static pages generated)
- Locale key parity — all 7 top-level keys + all nested keys match across en/th/mm

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All modules export real implementations with no placeholder data.

## Self-Check: PASSED

Files verified:
- src/lib/auth/schemas.ts — FOUND
- src/lib/auth/passcode.ts — FOUND
- src/lib/auth/admin.ts — FOUND
- src/stores/registration-store.ts — FOUND
- messages/en/auth.json — FOUND
- messages/th/auth.json — FOUND
- messages/mm/auth.json — FOUND

Commits verified:
- 5a56a62 test(02-01): failing tests for auth schemas and passcode — FOUND
- c9cc195 feat(02-01): auth schemas, passcode utils, admin client, schema migration — FOUND
- 5d1dbc2 feat(02-01): registration Zustand store and auth i18n message files — FOUND
