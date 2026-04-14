---
phase: 2
slug: authentication
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-14
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 (installed in Phase 1) |
| **Config file** | vitest.config.ts (exists, environment: node) |
| **Quick run command** | `npx vitest run src/lib/auth` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/auth`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | AUTH-01, AUTH-05 | unit | `npx vitest run src/lib/auth` | Created by task | pending |
| 02-01-02 | 01 | 1 | AUTH-04 | unit | `npx vitest run src/stores` | Created by task | pending |
| 02-02-01 | 02 | 2 | AUTH-01, AUTH-02 | grep+build | `grep "MOCK_OTP_AUTO_BYPASS" src/app/api/auth/otp/verify/route.ts && npm run build` | Created by task | pending |
| 02-02-02 | 02 | 2 | AUTH-06, AUTH-07 | grep+build | `grep "redirectTo.*login" src/lib/supabase/middleware.ts && npm run build` | Yes | pending |
| 02-03-01 | 03 | 2 | AUTH-03 | grep | `grep "StepIndicator" src/components/features/step-indicator.tsx` | Created by task | pending |
| 02-03-02 | 03 | 2 | AUTH-03, AUTH-04 | grep+build | `grep "useRegistrationStore" src/app/\\(auth\\)/register` && npm run build` | Created by task | pending |
| 02-04-01 | 04 | 3 | AUTH-05 | grep | `grep "PasscodeKeypad" src/components/features/passcode-keypad.tsx` | Created by task | pending |
| 02-04-02 | 04 | 3 | AUTH-05, AUTH-07 | grep+build | `grep "useAppVisibility" src/hooks/use-app-visibility.ts && npm run build` | Created by task | pending |
| 02-04-03 | 04 | 3 | AUTH-05 | manual | Browser E2E: create passcode, close browser, reopen, enter passcode | N/A | pending |

*Status: pending / green / red / flaky*

---

## Plan-Requirement Coverage

| Requirement | Plan(s) | Verification |
|-------------|---------|--------------|
| AUTH-01 | 01, 02 | vitest run phone schema tests; grep country code select in login page |
| AUTH-02 | 02 | grep MOCK_OTP_AUTO_BYPASS in verify route; grep OTP input in otp page |
| AUTH-03 | 03, 04 | grep StepIndicator; grep register step pages exist; build passes |
| AUTH-04 | 01, 03, 04 | vitest run registration store tests; grep persist middleware |
| AUTH-05 | 01, 04 | vitest run passcode hash tests; grep PasscodeKeypad |
| AUTH-06 | 02 | grep redirectTo login in middleware; manual test protected route |
| AUTH-07 | 02, 04 | grep updateSession in proxy.ts; manual test session persistence |

---

## Wave 0 Requirements

- [x] `vitest` — already installed (Phase 1)
- [x] `vitest.config.ts` — exists (Phase 1)
- [ ] `src/lib/auth/__tests__/phone-schema.test.ts` — created by Plan 01 Task 1
- [ ] `src/lib/auth/__tests__/passcode.test.ts` — created by Plan 01 Task 1
- [ ] `src/stores/__tests__/registration-store.test.ts` — created by Plan 01 Task 2

*Note: Test files are created within the plan tasks themselves (TDD pattern). No separate Wave 0 setup needed beyond existing vitest infrastructure.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Route protection redirect | AUTH-06 | Requires browser session state | Visit /home without session, verify redirect to /login |
| Session persistence across refresh | AUTH-07 | Requires real browser behavior | Log in, refresh page, verify session remains |
| Passcode lock after 5min background | AUTH-05 | Requires visibility API timing | Log in, switch tabs for >5min, return, verify passcode screen |
| Registration resume after browser close | AUTH-04 | Requires browser close/reopen | Start registration, close browser, reopen, verify step preserved |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready
