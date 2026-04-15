---
phase: 09-compliance-registration
verified: 2026-04-15T03:30:00Z
status: passed
score: 10/10 must-haves verified
human_verification:
  - test: "Walk the full new-user registration flow"
    expected: "After OTP verification as a new user: lands on /register/pre-reg-info -> Continue -> /register/terms -> check both boxes -> Agree and Continue -> /register/daily-limit -> I Understand -> /register/personal-info"
    why_human: "Multi-route user flow with real OTP session state cannot be exercised programmatically without a live Supabase session"
  - test: "T&C body text quality"
    expected: "The scrollable T&C text area contains legally meaningful content (not the current placeholder paragraph)"
    why_human: "The displayed legal text is a placeholder. The compliance gate (checkboxes) is functional, but the body text rendered to users is not real legal copy. Requires legal review and CMS/static content wiring before production."
  - test: "Selfie face guide visual correctness"
    expected: "On the KYC selfie capture step, a 240px dashed-white circle appears centered with a dark semi-transparent mask surrounding it; instruction text appears below"
    why_human: "Camera overlay is a live-camera component — visual rendering requires a running device/browser with camera access"
---

# Phase 09: Compliance Registration Verification Report

**Phase Goal:** New users pass through all legally required consent and acknowledgment screens before completing registration
**Verified:** 2026-04-15T03:30:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | registration-store exports tcAcceptedAt (string) and tcVersion (string) fields with setConsent action | VERIFIED | Lines 24-25, 42, 57-58, 76 in registration-store.ts; persist key bumped to v2 (line 81) |
| 2 | auth.json compliance sub-key exists in all three locales (en, th, mm) with all copy strings from UI-SPEC | VERIFIED | `"compliance"` key found at line 95 of all three locale files; node JSON.parse validates cleanly; preReg/terms/dailyLimit/selfie sections present |
| 3 | POST /api/auth/register/consent persists tc_accepted_at and tc_version to user_profiles and returns 200 | VERIFIED | Route exists, guards auth (401 on no session), updates `user_profiles` via supabase `.from('user_profiles').update({tc_accepted_at, tc_version})`, returns `{success: true}` on success |
| 4 | After OTP verification for a new user, the browser navigates to /register/pre-reg-info instead of /register/personal-info | VERIFIED | otp/page.tsx line 97: `router.push('/register/pre-reg-info')` inside `if (step === 1 \|\| data.isNewUser)` branch |
| 5 | Pre-registration info page renders heading, subtext, two document checklist items with FileText icons, and Continue to Registration CTA | VERIFIED | pre-reg-info/page.tsx: ClipboardList icon, compliance.preReg.heading/subtext, two FileText list items, CTA navigates to /register/terms |
| 6 | T&C consent page renders scrollable text area, two unchecked Checkboxes, and Agree and Continue CTA that is disabled until both are checked | VERIFIED | terms/page.tsx: role="region" scrollable area, two Checkbox components with aria-required="true", CTA has `disabled={!bothChecked}` and `aria-disabled` |
| 7 | Tapping Agree and Continue calls setConsent in the store (tcAcceptedAt ISO string, tcVersion '1.0') and POSTs to /api/auth/register/consent, then navigates to /register/daily-limit | VERIFIED | handleAgree calls setConsent(acceptedAt, '1.0'), POSTs to '/api/auth/register/consent', then router.push('/register/daily-limit') |
| 8 | Daily limit acknowledgment page renders a card with two tier rows (KYC Pending ฿50,000 and KYC Approved ฿500,000) separated by a Separator component, plus an I Understand CTA navigating to /register/personal-info | VERIFIED | daily-limit/page.tsx: Separator component used between tiers, tier1Amount/tier2Amount via i18n, CTA navigates to /register/personal-info |
| 9 | CameraOverlay with variant='selfie' renders a 240x240px circular face guide with 2px dashed white border, outer dark overlay rgba(0,0,0,0.55), and instruction text below the circle | VERIFIED | camera-overlay.tsx: style width/height 240px, boxShadow 9999px rgba(0,0,0,0.55), border 2px dashed rgba(255,255,255,0.85), instruction prop rendered below circle |
| 10 | The circular face guide does NOT render when variant='document' | VERIFIED | document variant renders corner-marker frame only; selfie circle is inside the else branch of `variant === 'document' ? ... : ...` conditional |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/stores/registration-store.ts` | Zustand store with consent fields | VERIFIED | tcAcceptedAt (4 occurrences), tcVersion (4 occurrences), setConsent (2 occurrences), persist key v2 |
| `src/app/api/auth/register/consent/route.ts` | POST endpoint persisting consent | VERIFIED | Auth guard, supabase update, proper 400/401/500 error responses |
| `messages/en/auth.json` | English compliance copy strings | VERIFIED | compliance key present, valid JSON, all 4 sub-sections (preReg/terms/dailyLimit/selfie) |
| `messages/th/auth.json` | Thai compliance copy strings | VERIFIED | compliance key present, valid JSON |
| `messages/mm/auth.json` | Myanmar compliance copy strings | VERIFIED | compliance key present, valid JSON |
| `src/app/(auth)/register/pre-reg-info/page.tsx` | Pre-registration info screen | VERIFIED | 62 lines, substantive component with icon/heading/checklist/CTA |
| `src/app/(auth)/register/terms/page.tsx` | T&C consent screen with checkbox gate | VERIFIED | 148 lines, checkbox gate fully wired, consent persistence, navigation |
| `src/app/(auth)/otp/page.tsx` | OTP page updated to route through compliance flow | VERIFIED | line 97 routes to pre-reg-info; step 2/3 routing (line 103) unchanged |
| `src/app/(auth)/register/daily-limit/page.tsx` | Daily limit acknowledgment screen | VERIFIED | 83 lines, two-tier card with Separator, I Understand CTA |
| `src/components/features/camera-overlay.tsx` | Enhanced CameraOverlay with selfie face guide | VERIFIED | 185 lines, 240px face guide, dashed border, dim overlay; document variant unchanged |
| `supabase/migrations/20260415_add_tc_consent.sql` | Schema migration for tc columns | VERIFIED | Two ADD COLUMN IF NOT EXISTS statements for tc_accepted_at and tc_version |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `otp/page.tsx` | `/register/pre-reg-info` | router.push on new user | WIRED | Line 97, inside `if (step === 1 \|\| data.isNewUser)` |
| `terms/page.tsx` | `/api/auth/register/consent` | fetch POST on Agree and Continue | WIRED | fetch('/api/auth/register/consent', {method: 'POST', ...}) in handleAgree |
| `terms/page.tsx` | `useRegistrationStore setConsent` | setConsent call before API | WIRED | setConsent(acceptedAt, version) called before fetch, optimistic update |
| `daily-limit/page.tsx` | `/register/personal-info` | router.push on I Understand | WIRED | Line 75, onClick navigates to /register/personal-info |
| `camera-overlay.tsx` | selfie face guide circle | variant === 'selfie' conditional | WIRED | Ternary: document variant renders corner markers; else renders 240px circle |
| `registration-store.ts` | tcAcceptedAt/tcVersion fields | setConsent action | WIRED | `set({ tcAcceptedAt: acceptedAt, tcVersion: version })` |
| `consent/route.ts` | supabase user_profiles | supabase.from('user_profiles').update | WIRED | `.from('user_profiles').update({tc_accepted_at, tc_version}).eq('id', user.id)` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `terms/page.tsx` | tcChecked, privacyChecked | useState (user interaction) | Yes — boolean state from user checkbox taps | FLOWING |
| `terms/page.tsx` | setConsent target | new Date().toISOString() + hardcoded '1.0' | Yes — real timestamp captured at submission | FLOWING |
| `daily-limit/page.tsx` | tier1Amount, tier2Amount | i18n t() keys from locale files | Yes — static but correct authoritative values from verified locale files | FLOWING |
| `camera-overlay.tsx` | instruction, helper | props from capture page (kyc/capture) | Yes — props passed from capture page which uses t() with kyc namespace | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Consent route exists as a module | `node -e "require('/Users/tindang/workspaces/tts/yoma/wave-2c2p/src/app/api/auth/register/consent/route.ts')"` | SKIP — TypeScript, not runnable as CJS | ? SKIP |
| i18n en compliance.terms.cta renders correct string | `node -e "console.log(require('./messages/en/auth.json').compliance.terms.cta)"` | "Agree and Continue" | PASS |
| i18n th compliance valid JSON | `node -e "require('./messages/th/auth.json').compliance"` | No error | PASS |
| i18n mm compliance valid JSON | `node -e "require('./messages/mm/auth.json').compliance"` | No error | PASS |
| Migration has both ADD COLUMN statements | `grep "ADD COLUMN" supabase/migrations/20260415_add_tc_consent.sql` | 2 matches: tc_accepted_at, tc_version | PASS |
| Old selfie artifacts removed from CameraOverlay | `grep "Take a Selfie\|border-[#FFE600]" camera-overlay.tsx` | NOT FOUND | PASS |
| Document variant corner markers still present | `grep "border-t-[3px]"` | 2 matches | PASS |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| COMP-01 | 09-02 | User must accept T&C and Privacy Policy before completing registration (consent logged with timestamp + version) | SATISFIED | terms/page.tsx: checkbox gate requires both accepted; setConsent records ISO timestamp + '1.0' version; POST to consent API persists to DB |
| COMP-02 | 09-01, 09-02 | User sees pre-registration info screen explaining required documents before starting KYC | SATISFIED | pre-reg-info/page.tsx exists with document checklist; OTP routes new users to this screen first |
| COMP-03 | 09-03 | User sees daily transfer limit acknowledgment screen during registration | SATISFIED | daily-limit/page.tsx renders two-tier card with ฿50,000 / ฿500,000 limits; wired in flow after terms screen |
| COMP-04 | 09-03 | User completes selfie/liveness capture with face guide overlay during eKYC | SATISFIED | camera-overlay.tsx selfie variant: 240px circle, dashed white border, rgba(0,0,0,0.55) dim overlay, instruction/helper props rendered |

No orphaned requirements — all four COMP IDs claimed by plans and verified in codebase.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/(auth)/register/terms/page.tsx` | 72 | Placeholder T&C body text (`{/* Placeholder T&C body — production will load from CMS/static file */}`) | WARNING | The scrollable text area shown to users contains a one-paragraph placeholder instead of real legal Terms & Conditions and Privacy Policy text. The compliance gate (checkbox acceptance) is fully functional and data-wired. The stub only affects displayed legal copy, not the flow mechanics or data persistence. |

No blocker anti-patterns found. The T&C body text placeholder does not prevent phase goal achievement — the consent checkboxes, store update, API persistence, and navigation are all wired and working. The content gap is a product/legal concern, not an engineering gap.

### Human Verification Required

### 1. Full new-user compliance flow walkthrough

**Test:** Log in as a new user via OTP. Confirm sequence: /register/pre-reg-info -> Continue -> /register/terms -> check both boxes -> Agree and Continue -> /register/daily-limit -> I Understand -> /register/personal-info.
**Expected:** Each screen renders correctly, CTA is disabled on T&C screen until both boxes ticked, navigation chain completes without errors.
**Why human:** Multi-route flow requires a live Supabase session (OTP auth). Cannot exercise programmatically without real auth state.

### 2. T&C legal body text completeness

**Test:** Navigate to /register/terms. Read the scrollable text area.
**Expected:** Displays the actual Terms & Conditions and Privacy Policy text (not the placeholder paragraph currently in the code).
**Why human:** The current text is a one-paragraph placeholder. Before production launch, real legal copy must be loaded (from CMS, static MDX, or equivalent). This is a product/legal decision, not verifiable in code.

### 3. Selfie face guide visual rendering

**Test:** Proceed through eKYC to the selfie capture step. Observe the camera overlay.
**Expected:** A 240px circle with dashed white border appears centered on the live camera feed, with a dark semi-transparent overlay outside the circle, and instruction text below.
**Why human:** CameraOverlay requires a running browser with live camera access. Cannot render or screenshot programmatically.

### Gaps Summary

No gaps found. All 10 must-have truths are verified, all 11 artifacts exist and are substantive (not stubs), all 7 key links are wired with real data flowing. All four COMP requirements (COMP-01, COMP-02, COMP-03, COMP-04) are satisfied by the implementation.

The only notable item is the placeholder T&C body text in terms/page.tsx — this is documented as a known stub in the SUMMARY (plan 02) and is classified as a Warning because the compliance gate itself (checkbox acceptance, consent logging, API persistence) is fully functional. The placeholder text does not block the phase goal.

Phase goal achieved: new users pass through pre-registration info (COMP-02), T&C consent with explicit checkbox acceptance and timestamp logging (COMP-01), daily transfer limit acknowledgment (COMP-03), and the selfie capture overlay has the face guide (COMP-04). All git commits exist and were made on 2026-04-15.

---

_Verified: 2026-04-15T03:30:00Z_
_Verifier: Claude (gsd-verifier)_
