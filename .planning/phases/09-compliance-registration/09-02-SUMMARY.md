---
phase: 09-compliance-registration
plan: "02"
subsystem: auth-registration
tags: [compliance, pdpa, terms-and-conditions, consent, otp-routing]
dependency_graph:
  requires: ["09-01"]
  provides: ["pre-reg-info-screen", "terms-consent-screen", "compliance-otp-routing"]
  affects: ["register/personal-info", "register/daily-limit"]
tech_stack:
  added: ["shadcn/checkbox"]
  patterns: ["checkbox-gate", "optimistic-store-update", "non-fatal-api"]
key_files:
  created:
    - src/app/(auth)/register/pre-reg-info/page.tsx
    - src/app/(auth)/register/terms/page.tsx
    - src/components/ui/checkbox.tsx
  modified:
    - src/app/(auth)/otp/page.tsx
decisions:
  - "T&C consent API failure is non-fatal: store is updated optimistically and navigation proceeds regardless — UI consent is the meaningful signal, not the API ack"
  - "Checkbox component added via shadcn CLI (was missing from component library) as a blocking dependency fix"
metrics:
  duration_seconds: 110
  completed_date: "2026-04-15"
  tasks_completed: 3
  files_changed: 4
---

# Phase 09 Plan 02: Compliance Registration Flow Summary

**One-liner:** PDPA-compliant pre-registration info screen + T&C checkbox-gate consent screen wired into OTP routing so new users pass through compliance before entering personal data.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create pre-registration info page | 837b6ae | src/app/(auth)/register/pre-reg-info/page.tsx |
| 2 | Create T&C consent page with checkbox gate | 221810e | src/app/(auth)/register/terms/page.tsx |
| 3 | Update OTP routing + add Checkbox component | 6049608 | src/app/(auth)/otp/page.tsx, src/components/ui/checkbox.tsx |

## What Was Built

**Pre-registration info screen** (`/register/pre-reg-info`):
- ClipboardList focal icon (brand blue #0091EA)
- Heading and subtext via i18n `compliance.preReg.*` keys
- Two-item document checklist with FileText icons (Thai National ID/Passport, Work Permit)
- "Continue to Registration" CTA navigating to `/register/terms`
- BackHeader returning to `/otp`

**T&C consent screen** (`/register/terms`):
- Scrollable text area (`role="region"`) bounded to avoid overflow
- Two shadcn Checkboxes with `aria-required="true"` for T&C and Privacy Policy
- CTA (`aria-disabled`) locked until both checkboxes ticked
- On submit: `setConsent(acceptedAt, '1.0')` written to Zustand store, then POST to `/api/auth/register/consent`
- API failure is non-fatal — navigation to `/register/daily-limit` proceeds regardless
- Loading state with Loader2 spinner during async submission

**OTP routing update** (`/otp/page.tsx`):
- New users (`step === 1 || data.isNewUser`) now route to `/register/pre-reg-info` instead of `/register/personal-info`
- Step 2/3 routing (`/register/id-details`, `/register/create-passcode`) unchanged
- Existing user routing (`/home`) unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing shadcn Checkbox component**
- **Found during:** Task 3 (build verification)
- **Issue:** `@/components/ui/checkbox` did not exist in the project — `npm run build` failed with "Module not found"
- **Fix:** Added via `npx shadcn@latest add checkbox --yes`
- **Files modified:** src/components/ui/checkbox.tsx (new)
- **Commit:** 6049608

## Known Stubs

- T&C body text in `/register/terms/page.tsx` is a placeholder paragraph. Production content should come from a CMS or static MDX file. The compliance gate (checkbox acceptance) is fully functional — the stub only affects the displayed legal text, not the flow.

## Self-Check: PASSED

Files exist:
- FOUND: src/app/(auth)/register/pre-reg-info/page.tsx
- FOUND: src/app/(auth)/register/terms/page.tsx
- FOUND: src/components/ui/checkbox.tsx

Commits exist:
- FOUND: 837b6ae
- FOUND: 221810e
- FOUND: 6049608
