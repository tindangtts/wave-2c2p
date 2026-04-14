# Phase 3: eKYC Onboarding — Research

**Researched:** 2026-04-14
**Status:** Complete

## Standard Stack

| Component | Library | Version | Notes |
|-----------|---------|---------|-------|
| Component library | shadcn/ui (base-nova) | v4.2.0 | Already installed |
| Styling | Tailwind CSS v4 | ^4 | CSS custom properties in globals.css |
| Forms | react-hook-form + zod | v7 + v4 | Pattern established in Phase 2 registration |
| State | Zustand (persist middleware) | v5 | Pattern established in Phase 2 registration store |
| Icons | lucide-react | v1.8.0 | Already installed |
| i18n | next-intl | v4.9.1 | Pattern: messages/{locale}/{namespace}.json |
| Camera | Native `<input capture>` | N/A | No third-party camera library — per D-01 |

## Architecture Patterns

### Route Structure
KYC screens live under `src/app/(auth)/kyc/` — no bottom nav (auth route group).

**Proposed routes:**
- `/(auth)/kyc/document-type/page.tsx` — document type selection
- `/(auth)/kyc/capture/page.tsx` — camera capture (front, back, selfie — state-driven)
- `/(auth)/kyc/processing/page.tsx` — verification processing
- `/(auth)/kyc/status/page.tsx` — KYC status display
- `/(auth)/kyc/resubmit/page.tsx` — re-submission flow

**Rationale for consolidated capture route:** Single route with state machine (select-front → review-front → capture-back → review-back → capture-selfie → review-selfie) avoids iOS PWA camera permission re-prompts on route navigation (documented in CLAUDE.md tech stack notes). All capture steps happen within one page component using internal state.

### State Management
- **KYC store (Zustand with persist):** Mirrors registration-store pattern. Tracks: selected document type, capture step, image data (base64 refs), submission status.
- **Component state:** Camera capture images held in component state as base64 (per D-04). Only written to store after review confirmation.

### Camera Capture Pattern
```
Primary: <input type="file" accept="image/*" capture="environment"> (back camera for docs)
Selfie:  <input type="file" accept="image/*" capture="user"> (front camera)
Fallback: File picker on iOS PWA standalone (automatic, no error)
```
- Hidden `<input>` element triggered by visible shutter button
- `onChange` handler reads file via `FileReader.readAsDataURL()`
- Base64 string stored in component state for preview
- No upload — images included in POST body to mock API

### Mock API Integration
Existing routes ready for use:
- `POST /api/mock-kyc/verify-document` — accepts `document_type`, returns approval/rejection based on `MOCK_KYC_AUTO_APPROVE` env var
- `POST /api/mock-kyc/verify-face` — returns face match result based on same env var
- Both have configurable delay via `MOCK_KYC_DELAY_MS`

**New API route needed:**
- `POST /api/mock-kyc/submit` — orchestrates full KYC submission: accepts all images + document type, calls verify-document + verify-face internally, writes to `kyc_documents` table, updates `user_profiles.kyc_status`

### Database
Existing schema covers KYC needs:
- `kyc_documents` table: id, user_id, document_type, front_image_url, back_image_url, selfie_image_url, status, rejection_reason, verified_at, expires_at
- `user_profiles.kyc_status`: 'not_started' | 'pending' | 'approved' | 'rejected' | 'expired'
- RLS policies: users can view/insert own KYC documents

**Note:** Image URLs in `kyc_documents` will store mock placeholder paths (not real uploads). Base64 images are sent to mock API for "verification" but not persisted to storage.

### Existing Components to Reuse
- `StepIndicator` — needs adaptation for 5 steps (currently typed for `1 | 2 | 3`)
- `BackHeader` — used as-is for all KYC screens
- `Badge` — status badges on KYC status page
- `Card` — status card, document type cards
- `Select` — document type selection (or custom radio cards)
- `AlertDialog` — KYC expired modal, cancel confirmation
- `Button` — CTAs throughout

### i18n Pattern
- New file: `messages/{locale}/kyc.json` (en, th, mm)
- Load via `getRequestConfig` spread pattern (same as auth.json)
- All user-facing copy in kyc namespace

## Key Technical Decisions

1. **Single capture route vs multi-route:** Single route to avoid iOS PWA camera permission re-prompts
2. **Base64 in state, not uploads:** Per D-04 — no real file upload, mock verification only
3. **StepIndicator type widening:** Change from literal union `1 | 2 | 3` to `number` type
4. **No third-party camera library:** Native `<input capture>` is sufficient per D-01
5. **Zustand for KYC state:** Follows registration store pattern for step persistence
6. **Mock submission API route:** New route orchestrates existing verify endpoints + DB write

## Validation Architecture

### Critical Path Validation
| Requirement | Validation Approach |
|-------------|-------------------|
| EKYC-01 | Document type selection renders 5 types, selection state works |
| EKYC-02 | Camera capture shows guide overlay, produces image |
| EKYC-03 | `<input capture>` present, no error handler for missing camera API |
| EKYC-04 | Face verification uses `capture="user"`, circle overlay renders |
| EKYC-05 | Mock API called, response parsed, status displayed |
| EKYC-06 | Status page renders 4 states with correct styling |
| EKYC-07 | Re-submission shows accepted/rejected fields, retake works |
| EKYC-08 | Expired modal renders with consequences list |

### Risk Areas
- iOS PWA camera permissions: mitigated by single-route capture
- Large base64 strings in component state: acceptable for mock (no real high-res images in dev)
- StepIndicator type change: backward-compatible (number includes 1 | 2 | 3)

## RESEARCH COMPLETE
