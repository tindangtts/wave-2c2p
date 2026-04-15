# Pitfalls Research

**Domain:** Mobile Banking PWA — v1.1 Feature Addition to Existing System
**Project:** 2C2P Wave (Next.js 16 + Supabase + shadcn/ui)
**Researched:** 2026-04-15
**Confidence:** HIGH (integration pitfalls validated against codebase; iOS/WebAuthn pitfalls verified against official sources)

---

## Critical Pitfalls

### Pitfall 1: P2P Wallet Transfer Collides with Existing A/C Transfer Store

**What goes wrong:**
The existing `transfer-store.ts` was designed for A/C (bank/agent/cash) transfers and persists `selectedRecipient`, `channel`, `rate`, `rateValidUntil`, and `feeSatang` to localStorage. P2P wallet-to-wallet transfers have a fundamentally different shape: the "recipient" is a wallet ID (not a `Recipient` object), there is no channel selection step, and the exchange rate is irrelevant (THB→THB). If P2P reuses `useTransferStore`, entering P2P flow partially populates the store with incompatible data — then when the user returns to the A/C transfer flow, they hit the confirmation page with a wallet ID where a `Recipient` object is expected. The guard `if (!channel || !selectedRecipient)` redirects them but to the wrong step, losing all form progress.

**Why it happens:**
P2P feels like "just another transfer type" and developers reach for the existing store to avoid duplication.

**Consequences:**
- Corrupt store state bleeds between P2P and A/C flows across navigation
- QR scan from the Scan tab populates the store inconsistently depending on which transfer mode is active
- Passcode confirmation sheet receives wrong data shape, causing silent submission failures

**How to avoid:**
Create a dedicated `p2p-transfer-store.ts` with its own localStorage key (`wave-p2p-store`). The P2P flow reads and writes only to this store. The existing `useTransferStore` is untouched. Add a `reset()` call to each flow's entry point — both P2P and A/C — so stale state from the other flow cannot leak.

**Warning signs:**
- Transfer confirm page briefly renders `undefined` recipient name then redirects
- Console shows `setChannel(null)` being called from the P2P path
- QR scan navigates to `/transfer/recipient` instead of `/p2p/confirm`

**Phase to address:** P2P Wallet Transfer phase (implement before or in parallel with QR scan refactor)

---

### Pitfall 2: iOS Safari Camera Re-Prompts on Every Page Navigation

**What goes wrong:**
iOS Safari PWA does not persist camera permissions across page loads. Every time Next.js performs a client-side navigation to a new route while `getUserMedia` is active or re-requested, iOS will show the camera permission dialog again. This is a documented WebKit bug (WebKit bug #215884) that remains open as of April 2025. The v1.0 CLAUDE.md already flags this for eKYC — but v1.1 adds *two more* camera flows: Selfie/Liveness capture and the QR scanner (for P2P wallet ID entry). Both are new entry points that can trigger this re-prompt.

**Why it happens:**
iOS Safari revokes camera access whenever the route changes (including hash changes and Next.js soft navigations that swap the document). The PWA standalone mode does not grant persistent camera access.

**Consequences:**
- Liveness capture (selfie overlay) prompts for camera permission even if the user already granted it during document scan
- QR scanner on the Scan tab triggers a re-prompt if the user navigated away then returned
- Users on older iOS (pre-15) must re-grant every single time, causing drop-off

**How to avoid:**
- Implement Selfie/Liveness as a *continuation of the same page/component* where camera was already active — do not navigate to a new route between document capture and selfie capture. The KYC flow should be a single-page state machine (`captureStep` in `useKYCStore`) as it already is — never break this into separate routes
- The QR scanner must initialize `getUserMedia` only once per component mount, not per render. Cache the MediaStream reference in a `useRef` and stop it only on unmount
- On the Scan tab, keep the video element mounted in the background (not unmounted on tab switch) to avoid re-requesting permissions on re-entry — use CSS visibility instead of conditional rendering

**Warning signs:**
- Users report "camera permission pops up twice"
- QR scanner shows blank video frame on iOS after navigating away and back
- Selfie step shows permission dialog even after document capture succeeded

**Phase to address:** Selfie/Liveness phase and QR Scanner refactor

---

### Pitfall 3: Cash Pick-up Secret Code Generated Client-Side

**What goes wrong:**
The cash pick-up channel requires a secret code the recipient presents at an agent to collect funds. If this code is generated on the client (e.g., `Math.random()` or even `crypto.getRandomValues()` in the browser), the code is never authoritatively stored before the user sees it. On a flaky 3G connection, the POST to record the transaction may fail *after* the client already showed the code to the user. Now the user has memorized (or screenshotted) a code that does not exist in the backend. Alternatively, if the code is generated in the frontend component and the user refreshes the receipt page, the component re-renders and generates a *different* code — but the backend has the original.

**Why it happens:**
Developers generate the code before the API call for display purposes, then pass it to the API. This feels simpler than a round-trip but creates a split-brain state.

**Consequences:**
- Recipient arrives at agent with a code that cannot be verified
- Double-generation on refresh causes different codes on every page visit
- No audit trail if the code is never persisted server-side

**How to avoid:**
- Generate the secret code *server-side only* (in the mock-payment API route) using `crypto.randomBytes(4).toString('hex').toUpperCase()` — 8-character alphanumeric
- The API response includes the code; the client only receives and displays it
- Store the code in the transaction record in Supabase — never derive it from client state
- The receipt page fetches the transaction by ID (from SWR) — it does not store the code in Zustand

**Warning signs:**
- Code shown on confirmation page differs from code on receipt page
- Refresh of receipt page shows a different code
- No `secret_code` field in the transaction record from the API

**Phase to address:** Cash Pick-up channel phase

---

### Pitfall 4: Bank Account Deletion with Pending Withdrawals

**What goes wrong:**
When a user deletes a saved bank account that has a pending withdrawal referencing it, the withdrawal record loses its destination. The existing `Recipient` type has `bank_name` and `account_no` fields — if bank accounts are managed as a separate entity (not embedded in recipients), the foreign key relationship must be handled. A hard delete cascades to the transaction reference and corrupts the audit trail. If there is no cascade and the FK is violated, the delete will throw a 23503 PostgreSQL error that surfaces as an unhandled exception in the UI.

**Why it happens:**
Bank account CRUD is added as a new feature without checking for outstanding FK references in existing withdrawal records.

**Consequences:**
- Pending withdrawals reference a deleted bank account — agent cannot process
- PostgreSQL FK violation crashes the delete operation with an unhelpful error message
- Audit trail for regulatory compliance is broken

**How to avoid:**
- Before allowing delete, query for pending/processing withdrawals that reference the account and block deletion with an explicit user message: "This account has a pending withdrawal. Please wait for it to complete."
- Use soft delete (`deleted_at` timestamp) instead of hard delete — RLS policy filters `WHERE deleted_at IS NULL` from user queries but preserves records for the audit trail
- Add a Supabase DB migration that enforces the FK constraint with `ON DELETE RESTRICT` so the database itself blocks deletions that would break referential integrity

**Warning signs:**
- Delete succeeds but transaction history shows blank destination for a withdrawal
- 500 error on delete with no user-facing message
- Supabase logs show `ERROR: 23503 foreign key violation`

**Phase to address:** Bank Account Management phase

---

### Pitfall 5: T&C Consent Step Breaks Registration Store State Machine

**What goes wrong:**
The registration flow currently has steps 1–3 tracked in `useRegistrationStore` with a `step: 1 | 2 | 3` type. Inserting a T&C consent screen requires either: (a) renumbering all existing steps (breaking all step-guard logic), or (b) adding a separate boolean `tcAccepted` field and a new step value `0` or `4`. Option (a) is a regression risk — every `setStep(2)` call in the existing codebase would move to the wrong step. Option (b) requires updating the TypeScript union type and persisted schema, plus migrating any existing localStorage state that has `step: 1 | 2 | 3` to the new schema.

**Why it happens:**
Step numbers feel like a simple counter; adding a step feels like incrementing. The hidden cost is that step numbers are referenced by value throughout the routing guards.

**Consequences:**
- Users mid-registration when the deploy happens have stale `step: 1` in localStorage; after the deploy they are shown the wrong step
- Back button navigation breaks (step 2 goes to step 1, skipping consent)

**How to avoid:**
- Add T&C as a separate boolean field: `tcAccepted: boolean` to the store — not a renumbered step
- Place T&C as the *first* screen *before* the numeric step flow starts, gated by the `tcAccepted` check in the layout or entry point
- Add a Zustand `version` field to the persist middleware and increment it on schema change — this triggers `onRehydrateStorage` to clear stale state: `{ version: 2, migrate: (state, version) => version < 2 ? initialState : state }`
- Do not reuse `step: 1 | 2 | 3` for the T&C screen

**Warning signs:**
- Users report being sent back to step 1 after already completing step 2
- TypeScript complains about `step: 0` being assigned to `1 | 2 | 3`
- Console shows hydration mismatch warnings after deploy

**Phase to address:** T&C / Pre-registration screens phase

---

### Pitfall 6: KYC State Machine Regression on Work Permit Update

**What goes wrong:**
The KYC status can be `not_started | pending | approved | rejected | expired`. The Work Permit update flow allows an `APPROVED` user to upload a new document. This is a legitimate update (work permit expires), but it must transition the status back to `PENDING` for re-review. The risk is a race condition: the user submits a transfer while the work permit upload is in-flight. If the status transitions to `PENDING` before the transfer is authorized, the transfer guard (`kyc_status === 'approved'`) will block a legitimate in-progress transfer. The reverse is also dangerous: if the guard is not added and the update is silently accepted without re-review, an expired or fraudulent work permit bypasses compliance checks.

**Why it happens:**
The update flow is added as a UI feature without modeling the state transition as a deliberate, guarded operation.

**Consequences:**
- In-flight transfers aborted by KYC status change mid-flow
- Or: expired work permits accepted without re-verification (compliance failure)
- `useKYCStore.kycStatus` in localStorage gets out of sync with the server-side status

**How to avoid:**
- The work permit update triggers a server-side status transition: `APPROVED → PENDING_UPDATE` (add this new status to the KYC state machine)
- Existing transfers that are already in `processing` state are NOT affected — only new transfer initiations check the status
- The transfer entry guard checks the *server-fetched* status (SWR), not the Zustand cache, to avoid stale-cache gating errors
- Add a clear UI state: "Your KYC is being re-reviewed after document update. Transfers are temporarily paused."

**Warning signs:**
- User can initiate a transfer immediately after submitting a new work permit
- `kycStatus` in localStorage shows `approved` but Supabase shows `pending`
- Transfer confirm page does not re-check KYC status before passcode verification

**Phase to address:** Work Permit / Document Update phase

---

### Pitfall 7: FX Rate Staleness on Visa Card Payment

**What goes wrong:**
The existing transfer flow has rate expiry logic and a `RateTimer` component — the Visa card payment flow is a *separate* flow that also involves FX conversion (THB to USD or MMK). If the Visa card payment flow does not reuse the same rate-refresh pattern and relies on a rate fetched at page load, the user could confirm a payment at a rate that is 5–10 minutes stale. More critically: if the user hits "Confirm" twice (double-tap on slow connection), and the idempotency key is not enforced, two charges are submitted. A refund flow does not exist in v1.1.

**Why it happens:**
Visa card payment feels like a different domain from the main transfer flow, so the rate-refresh pattern is not ported over. Double-submit is missed because the mock payment API does not enforce idempotency.

**Consequences:**
- User charged at wrong exchange rate
- Double charge on slow network retry — no undo mechanism
- Rate shown in confirmation is different from rate used in processing

**How to avoid:**
- Reuse `RateTimer` and the `handleRateExpired` callback from `transfer/confirm/page.tsx` in the Visa payment confirm step
- Generate a `uuid()` idempotency key client-side when the user lands on the payment confirm page and pass it in every retry of the POST — the mock API must reject duplicate keys within a 5-minute window
- Disable the "Confirm" button immediately on first tap and show a loading spinner — re-enable only on explicit error
- Rate expiry check must run *immediately before* the passcode is accepted, not before the page renders

**Warning signs:**
- Visa payment confirm page does not show a countdown timer
- Two transactions appear in history after a slow-network submission
- Rate shown on confirm differs from rate in the receipt

**Phase to address:** Visa Card Payment phase

---

### Pitfall 8: E-Receipt Image Export Fails on Cross-Origin Assets and Myanmar Script

**What goes wrong:**
`html2canvas` (the standard choice for DOM-to-image) cannot capture cross-origin images without CORS headers. The receipt page renders: (a) a Supabase Storage avatar/profile image, (b) the Wave logo from `/public`, and (c) Myanmar Unicode text (Noto Sans Myanmar UI). If Supabase Storage is on a different origin and does not have CORS configured for `image/png` responses, `html2canvas` will render a blank rectangle where the image should be. Additionally, the Noto Sans Myanmar UI font must be loaded *and fully rendered* before the canvas capture — if the export is triggered before `document.fonts.ready` resolves, Myanmar script renders as boxes or falls back to a system font.

**Why it happens:**
Developers test on desktop Chrome with fast font loading and same-origin assets; the issues surface only on mobile with remote images and non-Latin fonts.

**Consequences:**
- Receipt exports with blank logo — looks fraudulent
- Myanmar script characters render as tofu (boxes) in the exported image
- File size is unexpectedly large on high-DPI screens because `devicePixelRatio` is 3 on modern iPhones

**How to avoid:**
- Await `document.fonts.ready` before calling `html2canvas`
- Set `{ useCORS: true, allowTaint: false, scale: 2 }` — scale 2 is sufficient for sharing, avoid `devicePixelRatio` directly (can be 3 on iPhone = 9x pixel area)
- Configure Supabase Storage bucket CORS to allow `GET` from the app's origin
- Consider `html-to-image` as an alternative — lighter weight and handles CSS custom properties better; but has identical CORS and font constraints
- Provide a "Share via link" fallback for users where image export fails (Web Share API with a URL instead of a File)

**Warning signs:**
- White rectangle where logo should appear in downloaded image
- Myanmar text looks correct in browser but garbled in the PNG
- Exported image is > 2MB for a simple receipt (indicates scale too high)

**Phase to address:** E-Receipt Share/Download phase

---

### Pitfall 9: Biometric Login Uses Wrong Credential Storage on iOS PWA

**What goes wrong:**
WebAuthn is supported in iOS Safari 13.3+ and works in PWA standalone mode. However, there are critical storage caveats: if credentials are stored using `document.cookie` (set from JavaScript), Safari's Intelligent Tracking Prevention caps cookie expiry at 7 days — the biometric credential association expires and the user is silently downgraded to passcode. The correct storage is the Credential Management API's `navigator.credentials.store()`, which persists in the system keychain. Additionally, if the PWA is not installed to the Home Screen (just opened in Safari), Face ID / Touch ID may not trigger the expected authenticator — the user sees a browser-level authentication prompt instead of the system biometric UI.

**Why it happens:**
Developers conflate WebAuthn credential IDs with session cookies and store the association in `localStorage` or `document.cookie` for convenience.

**Consequences:**
- Biometric login silently stops working after 7 days for Safari cookie storage
- Users who open the app in Safari browser (not installed) get a confusing "Use passkey" dialog instead of Face ID
- Zustand persist for the `biometricEnabled: boolean` flag survives but the underlying credential is gone — user sees a broken "Use biometrics" button

**How to avoid:**
- Store only the credential ID in the Supabase `user_preferences` table (server-side), not in localStorage or cookies
- On biometric enable, register the credential via `navigator.credentials.create()` and save the `rawId` (as base64) to Supabase
- Check `navigator.credentials.get()` availability before showing the biometric option — if unavailable (not installed as PWA), hide the toggle entirely
- Add a `biometricEnabled` field to the user profile in Supabase, not just in Zustand — so the setting survives a Zustand store wipe

**Warning signs:**
- "Use Touch ID" button appears but tapping it shows "No saved credentials" error
- Biometric works on day 1 but fails on day 8
- `localStorage` contains a credential ID but `navigator.credentials.get()` returns null

**Phase to address:** Biometric Login phase

---

### Pitfall 10: 123 Service Barcode Uses Wrong Format or Is Unscanneable at Print Size

**What goes wrong:**
The 123 Service / Bill Payment convenience store channel requires a *linear barcode* (Code 128 or Interleaved 2 of 5), not a QR code. The existing `react-qr-code` library generates QR codes only. If the developer reuses it for the 123 channel, the cashier's scanner cannot read it — convenience store scanners use laser scanners optimized for 1D barcodes, not 2D QR readers. Additionally, barcode quiet zones (whitespace on left/right) are mandatory for scanning — rendering the barcode at small size in a card component often clips these zones.

**Why it happens:**
"Barcode" and "QR code" are treated as interchangeable in the UI. The existing QR generation code is right there.

**Consequences:**
- 123 Service payment cannot be processed — cashier cannot scan
- User believes payment was initiated but nothing is recorded
- Quiet zone clipping causes scan failures even with the correct library

**How to avoid:**
- Use `bwip-js` (`@bwip-js/browser`) for Code 128 barcode generation — it renders to a `<canvas>` element with configurable quiet zones
- Set `includetext: true`, `textxalign: 'center'`, and ensure the barcode container has at least 10px left/right padding on white background
- Minimum scannable width is 2cm at 96 DPI — on a 430px mobile screen at ~411 DPI, set the canvas width to at least 280px
- Test by actually scanning with a phone camera or 1D laser scanner before shipping

**Warning signs:**
- 123 Service page shows a QR code, not a linear barcode
- Barcode is flush to the card edge with no quiet zone
- The barcode number is not visible as human-readable text beneath the bars

**Phase to address:** 123 Service Top-up phase

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Reuse `useTransferStore` for P2P transfers | No new store to create | Flow state corruption across two incompatible flows | Never |
| Generate secret code client-side | No API round-trip | Split-brain state; code shown ≠ code stored | Never for financial codes |
| Hard-delete bank accounts | Simple SQL | FK violations; broken audit trail | Never in banking |
| Store biometric credential ID in localStorage | Easy access | 7-day ITP expiry in Safari; silent failure | Never |
| Use `Math.random()` for any financial reference | Fast | Predictable; not cryptographically secure | Never |
| Skip font-ready check before html2canvas | Simpler export trigger | Myanmar script renders as boxes | Never for Myanmar locale |
| Reuse QR code component for 1D barcodes | Reuse existing code | Unscannable at POS; payment failure | Never |
| Step renumbering to insert T&C | Simple to reason about | Breaks all mid-flow users on deploy | Never in multi-step persisted flows |
| Poll notifications on short interval (< 10s) | Near real-time feel | Battery drain on mobile; Supabase read quota | Use Supabase Realtime instead |
| Check KYC status from Zustand cache for transfer gate | No extra fetch | Stale status allows transfers after KYC revision | Never for financial gates |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Storage (CORS) | Assets render in browser but blank in html2canvas | Add CORS policy to Storage bucket allowing GET from app origin |
| Supabase Realtime (notifications) | Subscribe without cleanup on unmount | Always call `channel.unsubscribe()` in useEffect cleanup |
| WebAuthn on iOS PWA | Show biometric option in browser Safari (not installed) | Gate on `window.matchMedia('(display-mode: standalone)')` |
| SWR + Supabase session | SWR fetcher uses stale Supabase token after session refresh | Use `supabase.auth.onAuthStateChange` to call `mutate()` globally |
| next-intl + registration step store | Step number stored in `localStorage`; locale changes cause re-render but step rehydrates from old store | Store locale preference separately; registration step store is locale-agnostic |
| bwip-js (barcode) | Font files not copied to `public/` | Copy `node_modules/@bwip-js/browser/fonts/` to `public/bwip-fonts/` and set `fonturl` option |
| ios camera + MediaStream | Stop tracks on component unmount is missed, camera stays on | Always call `stream.getTracks().forEach(t => t.stop())` in useEffect cleanup |
| Supabase FK (soft delete) | RLS SELECT policy blocks the UPDATE that sets `deleted_at` | Use `SECURITY DEFINER` function or service role for soft-delete mutation |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Notification polling on 5s interval | Battery drain, Supabase read costs spike | Use Supabase Realtime subscriptions; poll at 30s fallback | Day 1 if polling interval is < 10s |
| html2canvas on full viewport receipt | Export takes 3–5 seconds, UI freezes | Render receipt in a hidden fixed-position container at 390px wide; capture only that node | Any receipt with > 20 DOM nodes |
| Myanmar address cascade loads all options upfront | 300+ options in a dropdown on mount | Load State list only; lazy-fetch Township on State select; lazy-fetch Ward on Township select | First render on 3G with full cascade |
| SWR for recipient favourites re-fetches full list on every toggle | Visible flash; extra network round-trips | Use SWR `mutate` with optimistic update; revalidate only on error | > 20 recipients |
| Large base64 images in Zustand localStorage (KYC) | localStorage quota exceeded (5MB iOS) | Store only image URLs after upload, not base64 strings | KYC with 3 images at 1MB each |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Display secret pick-up code in URL params | Code visible in browser history, server logs | Store code in state/SWR only; never in URL |
| Pass transfer amount in client-controlled POST body without server validation | Amount tampering (send 0 THB, backend records full amount) | Server-side fee and amount recalculation before processing |
| Biometric credential ID stored in Zustand localStorage | Credential ID leaked if device storage is inspected | Store credential ID in Supabase user record only |
| Cash pick-up code derived from transaction ID | Predictable — anyone with a transaction ID can guess the code | Generate server-side with `crypto.randomBytes` independently |
| Referral code in URL with no expiry / rate-limit | Referral farming | Limit to one referral redemption per phone number at DB level |
| Notification inbox shows sensitive transaction amounts without auth re-check | Push preview on lock screen shows financial data | Mark notification content as generic until user unlocks; detail only after passcode/biometric |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Recipient favourites sort order inconsistent with search results | User cannot find favourite in search | Favourites appear first in unfiltered list; search returns all results ranked by favourite status |
| Social share uses `navigator.share()` without Web Share API feature detection | "undefined is not a function" crash on older Android | `if (navigator.share) { ... } else { fallback to copy link }` |
| Liveness selfie guide overlay covers the shutter button on small screens | Users cannot trigger capture | Test layout at 375px (iPhone SE); ensure overlay does not extend beyond `100dvh` |
| Daily limit acknowledgment screen appears mid-transfer after KYC | Breaks user's mental model of "already registered" | Show daily limit screen during initial registration, not as a transfer gate |
| Notification unread badge count does not reset on inbox open | Badge stays red even after reading all | Mark all as read on inbox mount; decrement SWR cache count optimistically |
| Myanmar address cascade shows English state names to Myanmar-locale users | Confusing for low-literacy users | Store both `name_en` and `name_mm` in the address data source; render based on locale |

---

## "Looks Done But Isn't" Checklist

- [ ] **P2P Transfer:** QR scan from Scan tab correctly routes to P2P confirm (not A/C transfer confirm) — verify the router.push target is `/p2p/confirm`, not `/transfer/confirm`
- [ ] **Cash Pick-up:** Secret code is present in the transaction record in Supabase — verify the mock API returns `secret_code` in the response body and it is stored
- [ ] **Biometric Login:** Biometric toggle is hidden in Safari browser (non-installed PWA) — verify `window.matchMedia('(display-mode: standalone)').matches` gate exists
- [ ] **Bank Account Delete:** Delete is blocked when pending withdrawals exist — verify the guard query runs before the delete mutation
- [ ] **Work Permit Update:** Transfer initiation is blocked while KYC status is `pending_update` — verify the transfer entry point checks server-fetched status, not Zustand cache
- [ ] **E-Receipt Export:** Myanmar text renders correctly in the PNG — test on a device with Myanmar locale and Noto Sans Myanmar UI loaded
- [ ] **123 Service Barcode:** A linear barcode (Code 128) is rendered, not a QR code — verify by scanning with a 1D barcode scanner app
- [ ] **Visa Card Payment:** Double-tap "Confirm" does not submit two charges — verify the button is disabled after first tap and the mock API rejects duplicate idempotency keys
- [ ] **Notification Inbox:** Unread badge disappears after opening inbox — verify badge count resets on `NotificationInbox` mount
- [ ] **T&C Consent:** Mid-registration users on deploy do not lose progress — verify Zustand store version migration resets only `tcAccepted`, not the entire registration state
- [ ] **Selfie/Liveness:** Camera permission is NOT re-prompted between document scan and selfie — verify both steps use the same component page, not separate routes
- [ ] **Recipient Favourites:** Favourites filter correctly combines with date/status filters — verify the filter logic is AND (not OR) with other active filters

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| P2P store collision causes corrupt transfer state | LOW | Add `reset()` call to both flow entry points; clear localStorage key `wave-transfer-store` on P2P entry |
| Cash pick-up code split-brain | HIGH | Requires customer support to void transaction and re-initiate; prevent by server-side generation only |
| Bank account deletion broke FK reference | MEDIUM | Restore soft-delete; backfill `deleted_at` for affected records; add DB constraint migration |
| T&C step numbering broke mid-flow users | LOW | Bump Zustand `version` to trigger store clear; users restart registration (< 3 steps to redo) |
| Biometric credential expired (7-day cookie) | LOW | UI detects null credential and prompts user to re-enable biometrics; no data loss |
| html2canvas Myanmar font boxes | LOW | Await `document.fonts.ready` before capture; no data loss, just re-export needed |
| 123 barcode unscanneable | MEDIUM | Switch to bwip-js on next deploy; affected users need to re-initiate top-up |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| P2P / A/C store collision | P2P Wallet Transfer | QA: navigate P2P → A/C transfer; confirm confirm page shows correct recipient type |
| iOS camera re-prompt on selfie | Selfie / Liveness Capture | QA: test on physical iPhone, grant camera on document scan, proceed to selfie without re-prompt |
| Cash pick-up secret code | Cash Pick-up Channel | QA: refresh receipt page; verify code is unchanged and matches Supabase record |
| Bank account deletion safety | Bank Account Management | QA: create pending withdrawal, attempt account delete; verify blocked |
| T&C step number regression | Pre-Registration / T&C | QA: set localStorage `step: 2`, deploy, verify user is not sent to wrong step |
| KYC state machine regression | Work Permit Update | QA: APPROVED user uploads new permit; verify transfer initiation is blocked; verify existing processing transfers complete |
| FX rate staleness / double charge | Visa Card Payment | QA: wait for rate to expire on confirm page; verify rate refreshes. Double-tap confirm; verify single transaction |
| E-receipt Myanmar font | E-Receipt Share/Download | QA: switch locale to Myanmar, generate receipt, export image, verify Myanmar script in PNG |
| Biometric credential storage | Biometric Login | QA: enable biometrics, clear cookies, reopen app; verify biometric still works (credential in Supabase, not cookie) |
| 123 barcode format | 123 Service Top-up | QA: render 123 barcode, scan with 1D barcode scanner app; verify successful scan |

---

## Sources

- iOS PWA camera permission re-prompt: https://kb.strich.io/article/29-camera-access-issues-in-ios-pwa
- WebKit bug #215884 (camera permission on hash change): https://bugs.webkit.org/show_bug.cgi?id=215884
- WebAuthn iOS Safari ITP cookie 7-day cap: https://webkit.org/blog/11312/meet-face-id-and-touch-id-for-the-web/
- Zustand persist hydration mismatch in Next.js: https://github.com/pmndrs/zustand/discussions/1382
- html2canvas cross-origin and font pitfalls: https://blog.logrocket.com/export-react-components-as-images-html2canvas/
- html-to-image as alternative: https://medium.com/better-programming/heres-why-i-m-replacing-html2canvas-with-html-to-image-in-our-react-app-d8da0b85eadf
- Web Share API iOS limitations: https://web.dev/web-share/
- Idempotency key double-charge prevention: https://medium.com/javarevisited/idempotency-strategies-for-modern-payment-systems-c285165382f4
- Supabase soft delete with RLS: https://github.com/orgs/supabase/discussions/2799
- bwip-js browser barcode generation: https://www.npmjs.com/package/@bwip-js/browser
- Supabase Realtime with Next.js: https://supabase.com/docs/guides/realtime/realtime-with-nextjs
- PWA iOS limitations 2025: https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide

---
*Pitfalls research for: 2C2P Wave v1.1 feature additions*
*Researched: 2026-04-15*
