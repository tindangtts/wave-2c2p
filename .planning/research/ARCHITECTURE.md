# Architecture Patterns

**Project:** 2C2P Wave — Mobile Banking & Remittance PWA
**Researched:** 2026-04-14 (v1.0) | Updated 2026-04-15 (v1.1 integration)
**Confidence:** HIGH (based on scaffolded code + PRD + Next.js 16 App Router conventions)

---

## Recommended Architecture

### System Overview

```
Browser (PWA)
│
├── Next.js 16 App Router (src/app/)
│   ├── proxy.ts              ← session refresh + auth guard (runs on every request)
│   ├── (auth)/               ← unauthenticated shell — no bottom nav
│   ├── (main)/               ← authenticated shell — with BottomNav
│   └── api/                  ← Route Handlers: mock services + server mutations
│
├── Supabase
│   ├── Auth (Phone/OTP)
│   ├── PostgreSQL + RLS
│   ├── Realtime (transaction status)
│   └── Storage (KYC documents)
│
└── Service Worker (PWA)
    ├── Offline fallback pages
    └── Asset caching (static shell)
```

---

## Route Group Organization

### (auth) — Unauthenticated Shell

Renders with no BottomNav. proxy.ts redirects authenticated users away to `/home`.

```
src/app/(auth)/
├── layout.tsx          ← bare <main> wrapper, no navigation
├── login/page.tsx      ← phone entry + country code selector
├── register/           ← multi-step: personal info → ID details
│   └── page.tsx        ← step-driven via URL search params or Zustand
├── kyc/                ← document upload → face verification
│   └── page.tsx
└── passcode/           ← setup (post-registration) + entry (returning user)
    └── page.tsx
```

**Auth guard logic (already scaffolded in proxy.ts):** The `updateSession()` function in `src/lib/supabase/middleware.ts` checks `supabase.auth.getUser()` on every request. Unauthenticated requests to non-auth, non-API routes redirect to `/login`. Authenticated requests to auth routes redirect to `/home`. This is the correct pattern — never read the JWT client-side to guard routes.

### (main) — Authenticated Shell

Renders with BottomNav. All routes here are protected by proxy.ts.

```
src/app/(main)/
├── layout.tsx          ← wraps children + <BottomNav />
├── home/page.tsx       ← dashboard: WalletCard, QuickActions, RecentHistory, PromoCarousel
├── scan/page.tsx       ← QR scanner (camera access — Client Component)
├── add-money/
│   ├── page.tsx        ← channel selection + amount entry
│   └── qr/page.tsx     ← generated QR display + countdown
├── transfer/
│   ├── page.tsx        ← recipient list / search
│   ├── recipient/page.tsx   ← add/edit recipient form
│   ├── amount/page.tsx      ← amount entry + live THB→MMK conversion
│   └── confirm/page.tsx     ← summary + passcode entry
├── withdraw/
│   ├── page.tsx        ← recipient selection + amount + bank
│   └── confirm/page.tsx
├── history/
│   ├── page.tsx        ← transaction list with filters
│   └── [id]/page.tsx   ← transaction detail + receipt
├── card/page.tsx       ← virtual Visa card display
└── profile/
    ├── page.tsx        ← settings menu
    ├── settings/page.tsx
    ├── phone-change/page.tsx
    ├── passcode-change/page.tsx
    ├── refer/page.tsx
    └── contact/page.tsx
```

---

## Server vs Client Component Boundaries

**Rule:** Server Components by default. Add `'use client'` only when the component requires browser APIs, event handlers, hooks, or real-time subscriptions.

### Server Components (no directive needed)

| Component | Why Server |
|-----------|-----------|
| `home/page.tsx` | Fetches wallet balance + recent transactions from Supabase at request time |
| `history/page.tsx` | Server-side filtered transaction list query |
| `history/[id]/page.tsx` | Single transaction fetch by ID |
| `profile/page.tsx` | Reads user profile from Supabase |
| Layout components (`(auth)/layout.tsx`, `(main)/layout.tsx`) | Pure shell wrappers |
| `transfer/page.tsx` (recipient list) | Server-fetched recipients list |

**Data fetching in Server Components:** Call `createClient()` from `src/lib/supabase/server.ts` directly inside the page async function. No API route needed — data goes from Supabase to RSC to HTML in one hop.

```typescript
// Example: home/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance, wallet_id')
    .single()
  return <WalletCard balance={wallet.balance} walletId={wallet.wallet_id} />
}
```

### Client Components (`'use client'`)

| Component | Why Client |
|-----------|-----------|
| `OTPInput` | Auto-advance between digit boxes on input event |
| `PasscodeInput` | Keypad interaction, PIN state, biometric trigger |
| `AmountInput` | Real-time THB→MMK conversion as user types |
| `PhoneInput` | Country code dropdown interaction |
| `QRCodeDisplay` | Countdown timer (setInterval), QR library (browser-only) |
| `scan/page.tsx` | Camera API (getUserMedia) |
| `CameraOverlay` | MediaDevices API |
| `BottomNav` | `usePathname()` for active tab detection |
| `WalletCard` | Balance show/hide toggle |
| `PromoCarousel` | Touch swipe gestures |
| `LanguageSwitcher` | Dropdown open/close state |
| `TransactionStatusPoller` | Supabase Realtime subscription |
| Multi-step form pages (`register/`, `kyc/`, `transfer/amount/`) | Form state via React Hook Form |

**Client Component isolation pattern:** Keep Client Components as leaf nodes. Pass server-fetched data down as props. Never fetch from Supabase inside a Client Component — use Server Actions or Route Handlers instead.

```
Page (Server) → fetches data → passes as props
                             → ClientInteractiveWidget ('use client')
                                └── receives data as props
                                └── owns UI state only
```

---

## Supabase RLS Patterns for Financial Data

All tables use Row Level Security. The auth context comes from the JWT in the cookie, validated by `updateSession()` in proxy.ts on every request.

### Policy Pattern by Table

**wallets** — users see only their own wallet:
```sql
CREATE POLICY "Users can read own wallet"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id);

-- No direct UPDATE from client — balance changes only via server-side functions
CREATE POLICY "Service role updates balance"
  ON wallets FOR UPDATE
  USING (false); -- clients never update directly
```

**transactions** — read own, insert via server:
```sql
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "No client inserts"
  ON transactions FOR INSERT
  WITH CHECK (false); -- all inserts via Route Handler with service role key
```

**recipients** — full CRUD scoped to user:
```sql
CREATE POLICY "Users manage own recipients"
  ON recipients FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
```

**kyc_documents / kyc_verifications** — read own, insert own, no update:
```sql
CREATE POLICY "Users read own KYC"
  ON kyc_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users submit own documents"
  ON kyc_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Status updates only by service role (mock KYC API route)
```

**Critical RLS principle for financial tables:** Balance mutations and transaction records must only be created/updated via Route Handlers that use the **service role key** (never exposed to the client). The anon key is used for reads only. This prevents clients from crafting arbitrary balance updates.

### Storage Bucket RLS (KYC Documents)

```
Bucket: kyc-documents (private)
Policy: auth.uid() = (storage.foldername(name))[1]
```

Files stored at path `{user_id}/{document_type}/{filename}`. Signed URLs generated server-side, short-lived (15 min).

---

## Mock Service Architecture

Mock services are Route Handlers in `src/app/api/`. They simulate external vendor APIs (eKYC provider, payment processor) with configurable behavior via environment variables.

### Mock eKYC Service

```
POST /api/mock-kyc/verify-document
  Body: { documentType, imageBase64 }
  Behavior: controlled by MOCK_KYC_RESULT env var
  Returns: { success, extractedData, confidence, rejectionReason? }

POST /api/mock-kyc/verify-face
  Body: { selfieBase64, documentImageBase64 }
  Behavior: controlled by MOCK_KYC_FACE_RESULT env var
  Returns: { success, matchScore, livenessScore }

GET  /api/mock-kyc/status
  Behavior: controlled by MOCK_KYC_DELAY_MS env var
  Returns: { status: 'pending' | 'approved' | 'rejected', reasons? }
```

**Environment variables for mock behavior:**
```
MOCK_KYC_RESULT=pass|fail|pending     # document verification outcome
MOCK_KYC_FACE_RESULT=pass|fail        # face match outcome
MOCK_KYC_DELAY_MS=0                   # simulate review delay (0 = instant)
MOCK_KYC_REJECTION_REASONS=blur,expired  # comma-separated rejection codes
```

### Mock Payment Service

```
GET  /api/mock-payment/exchange-rate
  Returns: { thbToMmk: number, validUntil: ISO8601, rateId: string }

POST /api/mock-payment/calculate-fees
  Body: { amount, channel, rateId }
  Returns: { fee, totalDeducted, recipientReceives, exchangeRate }

POST /api/mock-payment/process-transfer
  Body: { transferOrderId, passcode }
  Behavior: controlled by MOCK_PAYMENT_RESULT env var
  Returns: { status: 'processing', estimatedCompletionMs }

GET  /api/mock-payment/status/[id]
  Returns: { status: 'pending'|'processing'|'completed'|'failed', updatedAt }
```

**Environment variables:**
```
MOCK_PAYMENT_RESULT=success|fail|timeout
MOCK_PAYMENT_DELAY_MS=2000             # simulate processing time
MOCK_EXCHANGE_RATE_THB_MMK=55.5        # fixed rate for mock
MOCK_TRANSFER_FEE_FLAT=100             # flat fee in THB
```

**Security:** Mock route handlers validate that the requesting user owns the transfer order (query `transfer_orders` by ID, check `user_id = auth.uid()`). Even mock services enforce ownership.

---

## State Management for Multi-Step Flows

Multi-step flows (registration, eKYC, transfer) require state that persists across page navigations within the flow.

### Pattern: Zustand Store per Flow + URL as Source of Truth for Step

Do not use URL params to carry form data — they leak sensitive information (name, NRC, phone) into browser history and server logs. Use URL params only for the current step index. Store form data in Zustand, persisted to sessionStorage.

```
URL:    /register?step=2
Zustand: registrationStore = { step: 2, personalInfo: {...}, idDetails: {...} }
```

**Store structure:**

```typescript
// Registration flow store
interface RegistrationStore {
  currentStep: number        // 1-4
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    nationality: string
    phone: string
  } | null
  idDetails: {
    documentType: 'national_id' | 'passport' | 'work_permit'
    documentNumber: string
    expiryDate: string
  } | null
  setPersonalInfo: (data: PersonalInfo) => void
  setIdDetails: (data: IdDetails) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}
```

**Persistence:** Use Zustand `persist` middleware with `sessionStorage` (not localStorage — cleared on tab close, reducing exposure of PII in browser storage).

**Server-side checkpoint saves:** After each step completes, call a Server Action to persist that step's data to the `user_profiles` table with a `registration_step` column. If the user returns, the Server Component reads `registration_step` and redirects to `/register?step={N}`.

### Transfer Flow Store

```typescript
interface TransferStore {
  recipient: Recipient | null
  amount: number | null
  channel: TransferChannel | null
  rateId: string | null           // lock the rate quote from mock API
  feeBreakdown: FeeBreakdown | null
  setRecipient: (r: Recipient) => void
  setAmount: (a: number) => void
  setChannel: (c: TransferChannel) => void
  setRateQuote: (rateId: string, fee: FeeBreakdown) => void
  reset: () => void
}
```

Transfer flow data is NOT persisted to sessionStorage (rate quotes expire; sensitive). It lives in memory only and resets if the user navigates away from the flow. The confirm page re-validates the rate with the mock API before finalising.

---

## Real-Time Transaction Status Updates

Supabase Realtime is used for live status polling on transactions (pending → processing → completed/failed). This covers transfer confirmation screens and history page status badges.

### Pattern: Realtime subscription in a Client Component

```typescript
// components/features/transaction-status-tracker.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function TransactionStatusTracker({ transactionId, initialStatus }) {
  const [status, setStatus] = useState(initialStatus)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`transaction:${transactionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'transactions',
        filter: `id=eq.${transactionId}`,
      }, (payload) => {
        setStatus(payload.new.status)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [transactionId])

  return <StatusBadge status={status} />
}
```

**Layered in the page:** The Server Component fetches initial status at render time. The `TransactionStatusTracker` hydrates and opens the Realtime channel. If status is already terminal (completed/failed) at render time, the client component renders but immediately cleans up the subscription (no wasted connection).

**Mock service drives status changes:** The mock payment Route Handler uses the service role client to update `transactions.status` after its simulated delay, which triggers the Realtime event on the client.

---

## Data Flow Diagram

```
User Action
    │
    ▼
Client Component (form/button)
    │
    ├── [reads] → Server Component props (initial data from SSR)
    │
    ├── [mutations] → Server Action OR fetch() to Route Handler
    │       │
    │       ▼
    │   Route Handler / Server Action
    │       │
    │       ├── createClient (service role) → Supabase DB write
    │       └── → Realtime broadcasts UPDATE to subscribed clients
    │
    └── [queries] → SWR / fetch() → Route Handler → Supabase (anon key + RLS)
                                                     returns filtered rows
```

**Data sensitivity tiers:**

| Tier | Examples | How Fetched |
|------|----------|-------------|
| 1 — Public static | Exchange rates, fee schedules | Mock API Route Handler, cached with `revalidate` |
| 2 — User reads | Wallet balance, transaction list, recipients | Server Component direct Supabase query (anon key + RLS) |
| 3 — Sensitive mutations | Transfer submission, passcode verification | Route Handler with service role key, input validated server-side |
| 4 — KYC documents | ID images, selfies | Supabase Storage, signed URLs only, never base64 in API responses |

---

## PWA Offline Patterns

### Service Worker Strategy (next-pwa or custom)

```
Static assets:        CacheFirst (versioned — safe to cache forever)
App shell (HTML):     StaleWhileRevalidate
API routes:           NetworkOnly (financial data must be fresh)
Offline fallback:     /offline page served when network unavailable
```

### Offline Fallback Page

A static `/app/offline/page.tsx` (no data fetching) is precached by the service worker. When the user is offline and navigates to any page that would require a network request, the service worker serves the offline page instead.

**What works offline:**
- Viewing cached transaction history (last fetch only)
- Reading saved recipient list (if previously cached by SWR)
- Viewing static app content (contact info, T&C)

**What requires connectivity:**
- Any balance display (never serve stale balance)
- Any transfer or add-money flow
- OTP verification
- KYC submission

---

## i18n Architecture

### Library: next-intl

next-intl integrates with App Router and supports Server Components natively. It does not require wrapping every component in a provider for server-side message access.

### Directory Structure

```
src/
├── i18n/
│   ├── routing.ts          ← defineRouting({ locales: ['en', 'th', 'my'], defaultLocale: 'en' })
│   ├── request.ts          ← getRequestConfig() reads locale from cookie/header
│   └── navigation.ts       ← typed Link, redirect, useRouter for locale-aware nav
├── messages/
│   ├── en.json
│   ├── th.json
│   └── my.json             ← Myanmar/Burmese strings
```

**Locale detection:** Cookie-based (`locale` cookie set by proxy.ts fallback). No URL prefixing — avoids restructuring route tree.

---

## v1.1 Feature Integration Map

### Feature 1: P2P Wallet-to-Wallet Transfer

**Integration type:** New parallel flow alongside existing recipient-based transfer

**Context:** `wave_app` channel type already exists in the `TransferChannel` union and `CHANNEL_ORDER`, but the existing transfer flow always requires a recipient record. P2P bypasses recipient selection — it routes to a wallet ID directly.

**New routes:**
```
/transfer/p2p/              — wallet ID entry + QR scan trigger
/transfer/p2p/confirm/      — amount + destination wallet summary + passcode
/transfer/p2p/receipt/      — success screen
```

**New store:** `src/stores/p2p-store.ts` — separate from `transfer-store.ts` to avoid state collision. Tracks `destinationWalletId: string`, `amountSatang: number`, `feeSatang: number`, `transactionId: string`.

**New API route:** `POST /api/wallet/transfer-p2p` — validates destination wallet ID exists in `wallets` table, processes debit/credit, creates transaction record.

**Component reuse:** `PasscodeSheet` (unchanged), `AmountInput`, `QRDisplay` (scan mode)

**New components:** `WalletIdInput` — validates W-prefix format, toggles between keyboard and QR scan. `P2PConfirmCard` — shows source/destination wallet IDs, amount, fee.

**Type change:** Add `'p2p_transfer'` to `TransactionType` in `src/types/index.ts`.

---

### Feature 2: Bank Account Management for Withdrawals

**Integration type:** New CRUD sub-flow + new DB table

**Context:** Current `recipients` table stores Myanmar bank details (for sending money). Withdrawal-specific saved accounts are the user's own Thai bank accounts — a different entity that doesn't belong in `recipients`.

**New routes:**
```
/profile/bank-accounts/         — list saved Thai bank accounts
/profile/bank-accounts/add/     — add new account form
/profile/bank-accounts/[id]/    — edit / delete
```

**New DB table:**
```sql
create table public.bank_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.bank_accounts enable row level security;
create policy "Users manage own bank accounts" on public.bank_accounts
  for all using (auth.uid() = user_id);
```

**New API routes:**
```
GET    /api/bank-accounts
POST   /api/bank-accounts
PUT    /api/bank-accounts/[id]/route.ts
DELETE /api/bank-accounts/[id]/route.ts
```

**New hook:** `src/hooks/use-bank-accounts.ts` — SWR pattern, mirrors `use-recipients.ts`.

**New components:** `BankAccountList`, `BankAccountRow`, `BankAccountForm` (react-hook-form + zod)

**Store change:** Extend `wallet-ops-store.ts` with `withdrawBankAccountId: string | null` and `setWithdrawBankAccount` action.

---

### Feature 3: Cash Pick-up Channel with Secret Code

**Integration type:** Extends existing transfer receipt — no new routes

**Context:** `cash_pickup` channel is already defined in `TransferChannel`, fee is set (`CHANNEL_FEES_THB.cash_pickup = 30`), and it routes through the full transfer flow. What's missing: the receipt/confirmation screen showing the pick-up secret code.

**Store change:** Add `secretCode: string` to `transfer-store.ts` initial state and `setSecretCode` action.

**API change:** `POST /api/mock-payment` response for `cash_pickup` adds `secretCode: string` field (e.g., `WAVE-XXXX-XXXX`).

**Component change:** Modify `/transfer/receipt/page.tsx` — detect `channel === 'cash_pickup'`, conditionally render `SecretCodeDisplay`.

**New component:** `SecretCodeDisplay` — styled code box, copy button, "Show this at the agent" instruction in 3 languages.

---

### Feature 4: T&C / Privacy Consent Screen

**Integration type:** New registration step inserted before passcode creation

**Context:** Current registration flow: `personal-info → id-details → create-passcode`. Step count is `1 | 2 | 3` in `registration-store.ts`.

**New route:** `/register/terms-consent/` — inserted between `id-details` and `create-passcode`.

**Store change:** Add `termsAccepted: boolean` to `RegistrationState`. Add `setTermsAccepted` action. Extend step type to `1 | 2 | 3 | 4`.

**Navigation change:** `id-details/page.tsx` submit navigates to `/register/terms-consent` instead of `/register/create-passcode`. `terms-consent/page.tsx` navigates to `/register/create-passcode`.

**DB change:** `ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;`

**API change:** Modify `POST /api/auth/register` to persist `terms_accepted_at = now()`.

**New component:** `TermsConsentScreen` — scrollable T&C text, checkbox that activates only after scrolling to bottom, continue button.

---

### Feature 5: Selfie/Liveness Capture with Face Guide

**Integration type:** Extends existing KYC capture flow — no new routes

**Context:** `kyc-store.ts` already has `capture-selfie` and `review-selfie` steps. `CameraOverlay` component handles all capture steps. `selfieImage: string` field exists in store. Mock KYC `/api/mock-kyc/verify-face` already exists.

**Gap:** Selfie capture uses the same document-scanning `CameraOverlay`. A liveness capture needs an animated circular face guide and a liveness challenge prompt.

**Component change:** Extend `CameraOverlay` with `mode: 'document' | 'selfie'` prop. In selfie mode: render circular face guide overlay, animated ring, "Look straight / Blink" instruction. No new route needed — controlled by `captureStep` in `kyc-store.ts`.

**KYC store change:** Add `livenessScore: number` field to track mock liveness result.

**API change:** Extend `/api/mock-kyc/verify-face` response to include `livenessScore: number` (0–1). Controlled by existing `MOCK_KYC_FACE_RESULT` env var.

---

### Feature 6: 123 Service Convenience Store Top-up

**Integration type:** New channel in existing add-money flow

**Context:** `ConvenienceChannelList` renders existing channels (7-Eleven, FamilyMart). The QR route at `/add-money/qr` generates PromptPay QR. 123 Service uses a barcode (linear), not a QR code.

**Component change:** Add `123service` entry to the convenience channel data in `ConvenienceChannelList`. Add `mode: 'qr' | 'barcode'` handling in `/add-money/qr/page.tsx` — when `channel=123service`, render barcode instead of QR.

**New component:** `BarcodeDisplay` — renders Code128 barcode via `jsbarcode` or native Canvas. Small scope — only for 123 Service channel.

**No new routes, stores, or API routes needed.** `topupChannel: string | null` in `wallet-ops-store.ts` already handles any string channel ID.

---

### Feature 7: Visa Card Request + Payment Flow

**Integration type:** New sub-routes under `/profile/card/` (currently display-only)

**Context:** `/profile/card/page.tsx` shows `VisaCardDisplay` with hardcoded mock data. Card `status` in DB has `'ordered' | 'delivered' | 'active'` values but UI ignores them.

**New routes:**
```
/profile/card/request/              — card request start
/profile/card/request/address/      — delivery address form
/profile/card/request/review/       — confirm + fee
/profile/card/request/success/      — success
/profile/card/payment/              — card payment entry
/profile/card/payment/confirm/      — confirm with passcode
/profile/card/payment/receipt/      — result
```

**New store:** `src/stores/card-store.ts` — request flow state (delivery address, card status) and payment flow state (amount, merchant).

**New API routes:**
```
POST /api/card/request     — creates card order, sets status = 'ordered'
POST /api/card/payment     — processes mock payment, deducts wallet balance
GET  /api/card             — returns current card + status (extends existing wallet endpoint or new)
```

**Component reuse:** `PasscodeSheet` (payment confirm), `AmountInput` (payment amount), `StepIndicator` (request flow)

**New components:** `AddressForm` (Thailand province/district selectors), `CardRequestSummary`, `CardPaymentForm`

**Type change:** Add `'card_payment'` to `TransactionType`.

---

### Feature 8: Work Permit / 2nd Document Update Flow

**Integration type:** New post-KYC document update flow under `/profile/`

**Context:** Initial KYC is at `/(auth)/kyc/`. Work permit update is a post-approval action — user is already authenticated and KYC-approved. Different entry point, same camera/document components.

**New routes:**
```
/profile/documents/                 — document list + status
/profile/documents/update/          — initiate update
/profile/documents/update/capture/  — camera capture (reuses CameraOverlay)
/profile/documents/update/review/   — review + submit
/profile/documents/update/status/   — processing result
```

**Store change:** Add `mode: 'initial' | 'update'` field to `kyc-store.ts` to distinguish flows, avoid creating a separate store. Reset mode on `clearAll()`.

**API changes:** New `POST /api/kyc/update-document` route that wraps existing mock KYC service with a "document update" context (stores as a new `kyc_documents` row with updated `document_type`).

**Component reuse:** `CameraOverlay`, `StepIndicator`, `DocumentTypeCard` — all unchanged.

---

### Feature 9: Myanmar Address Cascade

**Integration type:** New UI components extending existing recipient forms

**Context:** `Recipient` type has `state_region`, `city`, `address` fields. New-recipient and edit-recipient forms use free-text inputs for these. Myanmar has ~7 states + 7 regions + ~330 townships.

**New component:** `MyanmarAddressSelector` — three `<Select>` components (State/Region → Township → Ward/Village) with cascade dependency. Selecting a state filters township options; selecting township filters ward options.

**New data file:** `src/lib/myanmar-address-data.ts` — static TypeScript export of the administrative hierarchy. ~40KB uncompressed, tree-shaken to only the selected state's data at runtime.

**Form changes:** Replace free-text `state_region`, `city`, `address` fields in `recipientFormSchema` with structured cascade selectors. Update zod schema accordingly.

**Affected routes:** `/transfer/new-recipient/page.tsx` and `/transfer/edit-recipient/[id]/page.tsx` — both forms import `recipientFormSchema`.

---

### Feature 10: E-Receipt Share/Download

**Integration type:** Extends `TransactionDetail` component and `TransferReceipt` component

**Context:** `TransactionDetail` renders at `/history/[id]`. `TransferReceipt` renders at `/transfer/receipt`. Both are HTML receipt layouts. No share/download mechanism exists.

**Implementation:** CSS `@media print` stylesheet as primary path. On iOS Safari, "Share → Save to Files" produces PDF from print layout. On Android Chrome, "Print → Save as PDF" does the same. Zero bundle cost.

Progressive enhancement: Add `ShareReceiptButton` component that calls `window.print()` or `navigator.share({ files: [blob] })` where supported. If `html2canvas` is added for image export, it should be lazy-loaded only when the share button is tapped.

**Component changes:**
- Add `ShareReceiptButton` to `TransactionDetail` and `TransferReceipt`
- Add print-specific CSS to `globals.css` (hide nav, expand receipt, set paper margins)

**No new routes, stores, or API routes needed.**

---

### Feature 11: Recipient Favourites Toggle + Filter

**Integration type:** Extends `RecipientList`, `RecipientRow`, and `/api/recipients`

**Context:** `Recipient.is_favorite: boolean` exists in type and DB schema. `RecipientList` and `RecipientRow` components exist. No toggle or filter UI exists.

**API change:** Add `PATCH /api/recipients/[id]/route.ts` — or extend existing PUT handler — to toggle `is_favorite`. Returns updated recipient.

**Component changes:**
- `RecipientRow` — add heart icon toggle button (44x44 touch target). Optimistic update via SWR `mutate`.
- `RecipientList` — add "All / Favourites" tab filter at top. Filter is client-side on the fetched list.

**Hook change:** `use-recipients.ts` — expose `toggleFavorite(id)` function that calls PATCH and does optimistic SWR update.

---

### Feature 12: Referral Stats + Social Share

**Integration type:** Replaces `/referral/page.tsx` "coming soon" placeholder; extends `/profile/refer-friends/page.tsx`

**Context:** Two referral pages exist. `/referral/page.tsx` is a "coming soon" placeholder. `/profile/refer-friends/page.tsx` has hardcoded `REFERRAL_CODE` and basic `navigator.share`.

**New API route:** `GET /api/referrals` — returns `{ code, completedCount, rewardEarned, pendingCount }`. Queries `referrals` table (already in schema).

**New hook:** `src/hooks/use-referral.ts` — SWR hook wrapping `/api/referrals`.

**Component changes:**
- Replace `/referral/page.tsx` content with full stats page using `use-referral` hook
- `ReferralCard` — extend with stats fields (referred count, reward earned)
- New `SocialShareButtons` — WhatsApp deep link (`https://wa.me/?text=...`), LINE deep link (`https://line.me/R/msg/text/...`), copy link, native share fallback

**Route consolidation:** Consider redirecting `/profile/refer-friends` to `/referral` to eliminate the duplicate entry point.

---

### Feature 13: Pre-Registration Info + Daily Limit Acknowledgment

**Integration type:** New screens at registration entry — before step 1

**Context:** Registration currently routes directly to `/register/personal-info`. There are no info or limit screens. The `registration-store.ts` step starts at `1`.

**New routes:**
```
/register/intro/    — what you need (docs list), what to expect, time estimate
/register/limits/   — daily/monthly limit table by KYC tier, Accept button
```

**Store change:** Add `introSeen: boolean` and `limitsAcknowledged: boolean` to `RegistrationState`. These gate navigation to `personal-info`.

**Navigation change:** New users arriving after OTP verification land at `/register/intro` instead of `/register/personal-info`. Each screen has a "Continue" button that sets the store flag and routes forward.

**New components:** `RegistrationIntroScreen` (feature checklist, document requirements), `LimitsAcknowledgmentScreen` (limit table, accept button).

**No new API routes needed** — purely UI with store state.

---

### Feature 14: Biometric Login

**Integration type:** New auth method, new API routes, new DB columns

**Context:** Profile page has `biometricsEnabled` state toggle (non-functional stub). Passcode is the only post-OTP auth. WebAuthn maps to Face ID (iOS), Touch ID (iOS/macOS), and Android fingerprint/face without a native app bridge.

**New routes:**
```
/profile/biometric-setup/   — guided WebAuthn enrollment
```

**New DB columns:**
```sql
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS webauthn_credential_id text,
  ADD COLUMN IF NOT EXISTS webauthn_public_key text,
  ADD COLUMN IF NOT EXISTS biometric_enabled boolean NOT NULL DEFAULT false;
```

**New API routes:**
```
POST /api/auth/biometric/register-challenge   — generate WebAuthn registration challenge
POST /api/auth/biometric/register-verify      — verify attestation + store credential
POST /api/auth/biometric/auth-challenge       — generate authentication challenge
POST /api/auth/biometric/auth-verify          — verify assertion, issue session
```

**New library:** `@simplewebauthn/browser` (client) + `@simplewebauthn/server` (server). Node.js runtime required for server — compatible with Next.js API routes (not Edge runtime).

**New components:** `BiometricSetupFlow` (enrollment in profile settings), `BiometricLoginButton` (shown on passcode page when `biometric_enabled = true`)

**Passcode page change:** `/passcode/page.tsx` — detect biometric availability + user preference, render "Use Biometrics" button below keypad.

---

### Feature 15: Notification Inbox

**Integration type:** New page + new API + new DB table + top-header badge

**Context:** Profile has a notifications toggle list for preferences (push notification types). Bottom nav has 5 items filling 430px. Adding a 6th item breaks touch target minimums.

**Placement decision:** Notification bell in `TopHeader` of `(main)` layout — not in bottom nav. Most mobile banking apps (GCash, BPI) use this pattern. `top-header.tsx` needs a bell icon with `UnreadBadge` overlay.

**New routes:**
```
/notifications/         — inbox list
/notifications/[id]/    — detail view (for long-body notifications)
```

**New DB table:**
```sql
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  type text not null check (type in ('transaction', 'kyc', 'promo', 'system')),
  title text not null,
  body text not null,
  is_read boolean not null default false,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index idx_notifications_user_id_created on public.notifications(user_id, created_at desc);
create index idx_notifications_unread on public.notifications(user_id, is_read) where is_read = false;
alter table public.notifications enable row level security;
create policy "Users view own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications
  for update using (auth.uid() = user_id);
```

**New API routes:**
```
GET   /api/notifications              — paginated list + unread count
PATCH /api/notifications/[id]/read/   — mark single read
POST  /api/notifications/read-all/    — mark all read
```

**New hook:** `src/hooks/use-notifications.ts` — SWR with `refreshInterval: 30000` for unread count polling.

**New components:** `NotificationInbox` (list with skeleton), `NotificationRow` (icon by type, read/unread state, timestamp), `UnreadBadge` (red dot count overlay)

**TopHeader change:** Add bell icon with `UnreadBadge` — reads from `use-notifications()` unread count.

**Notification triggers:** Mock payment and KYC API routes insert notification rows after processing (using service role key). This simulates real-time notification delivery without push infrastructure.

---

## Updated Project Structure (v1.1 additions highlighted)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── register/
│   │   │   ├── intro/              NEW — pre-registration info screen
│   │   │   ├── limits/             NEW — daily limit acknowledgment
│   │   │   ├── terms-consent/      NEW — T&C consent step
│   │   │   ├── personal-info/      existing
│   │   │   ├── id-details/         existing
│   │   │   └── create-passcode/    existing
│   │   ├── kyc/                    existing (capture modified: selfie liveness)
│   │   └── passcode/               existing (modified: biometric login option)
│   ├── (main)/
│   │   ├── transfer/
│   │   │   ├── p2p/                NEW — P2P wallet transfer
│   │   │   │   ├── page.tsx
│   │   │   │   ├── confirm/
│   │   │   │   └── receipt/
│   │   │   └── ...existing
│   │   ├── add-money/
│   │   │   └── qr/                 existing (modified: barcode for 123 Service)
│   │   ├── profile/
│   │   │   ├── bank-accounts/      NEW — bank account CRUD
│   │   │   │   ├── page.tsx
│   │   │   │   ├── add/
│   │   │   │   └── [id]/
│   │   │   ├── biometric-setup/    NEW — WebAuthn enrollment
│   │   │   ├── documents/          NEW — work permit update
│   │   │   │   └── update/
│   │   │   └── card/
│   │   │       ├── request/        NEW — card request flow
│   │   │       └── payment/        NEW — card payment flow
│   │   ├── notifications/          NEW — notification inbox
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   └── referral/               existing (replace coming-soon with full page)
│   └── api/
│       ├── auth/
│       │   └── biometric/          NEW — WebAuthn routes
│       ├── bank-accounts/          NEW
│       │   └── [id]/
│       ├── card/                   NEW
│       ├── kyc/
│       │   └── update-document/    NEW
│       ├── notifications/          NEW
│       │   └── [id]/read/
│       ├── referrals/              NEW
│       └── wallet/
│           └── transfer-p2p/       NEW
├── components/
│   ├── features/
│   │   ├── wallet-id-input.tsx           NEW
│   │   ├── p2p-confirm-card.tsx          NEW
│   │   ├── secret-code-display.tsx       NEW
│   │   ├── terms-consent-screen.tsx      NEW
│   │   ├── liveness-overlay.tsx          NEW (or extend camera-overlay.tsx)
│   │   ├── bank-account-list.tsx         NEW
│   │   ├── bank-account-row.tsx          NEW
│   │   ├── bank-account-form.tsx         NEW
│   │   ├── myanmar-address-selector.tsx  NEW
│   │   ├── social-share-buttons.tsx      NEW
│   │   ├── notification-inbox.tsx        NEW
│   │   ├── notification-row.tsx          NEW
│   │   ├── unread-badge.tsx              NEW
│   │   └── biometric-login-button.tsx    NEW
│   └── layout/
│       └── top-header.tsx          MODIFY — add notification bell + unread badge
├── hooks/
│   ├── use-bank-accounts.ts        NEW
│   ├── use-notifications.ts        NEW
│   ├── use-referral.ts             NEW
│   └── ...existing
├── stores/
│   ├── p2p-store.ts                NEW
│   ├── card-store.ts               NEW
│   ├── registration-store.ts       MODIFY (add termsAccepted, introSeen, limitsAcknowledged)
│   ├── transfer-store.ts           MODIFY (add secretCode)
│   ├── kyc-store.ts                MODIFY (add mode: 'initial'|'update', livenessScore)
│   └── wallet-ops-store.ts         MODIFY (add withdrawBankAccountId)
├── lib/
│   └── myanmar-address-data.ts     NEW — static cascade data (~40KB)
└── types/
    └── index.ts                    MODIFY (add types below)
```

---

## Type System Changes Required

```typescript
// src/types/index.ts additions

// Extend TransactionType
export type TransactionType =
  | "add_money" | "send_money" | "withdraw" | "receive"
  | "bill_payment"
  | "p2p_transfer"    // NEW: wallet-to-wallet
  | "card_payment"    // NEW: Visa card payment

// New: Bank Account (user's own Thai bank accounts for withdrawal)
export interface BankAccount {
  id: string
  user_id: string
  bank_name: string
  account_number: string
  account_name: string
  is_default: boolean
  created_at: string
}

// New: Notification
export interface Notification {
  id: string
  user_id: string
  type: "transaction" | "kyc" | "promo" | "system"
  title: string
  body: string
  is_read: boolean
  metadata?: Record<string, unknown>
  created_at: string
}
```

---

## Recommended Build Order for v1.1

Dependencies determine order. Features that enable other features come first.

| # | Feature | Deps | Rationale |
|---|---------|------|-----------|
| 1 | T&C Consent (F4) | registration-store | Simplest registration addition; establishes the pattern |
| 2 | Pre-reg + Limits (F13) | registration-store | Same store, same pattern — group with F4 |
| 3 | Selfie/Liveness (F5) | KYC store, CameraOverlay | Self-contained KYC extension |
| 4 | Work Permit Update (F8) | KYC store + F5 liveness | Reuses liveness capture from F5 |
| 5 | Myanmar Address Cascade (F9) | RecipientForm | Static data; needed before any recipient form work |
| 6 | Recipient Favourites (F11) | use-recipients, F9 | Extend existing CRUD after address cascade stabilizes |
| 7 | Bank Account CRUD (F2) | New DB table | Independent; enables better withdrawal UX |
| 8 | Cash Pick-up Code (F3) | transfer-store, mock-payment | Extends existing flow; quick win |
| 9 | P2P Transfer (F1) | passcode-sheet, F7 pattern | New flow; borrows bank-account store patterns |
| 10 | 123 Service Top-up (F6) | add-money flow | Extends add-money; independent |
| 11 | E-Receipt Share (F10) | TransactionDetail stable | Pure UI; no backend; do after receipt screens settle |
| 12 | Referral Stats + Sharing (F12) | New API /api/referrals | Replaces coming-soon; independent backend |
| 13 | Notification Inbox (F15) | New DB table + TopHeader | DB migration + API; do after schema stabilizes |
| 14 | Visa Card Request + Payment (F7) | card-store, passcode-sheet | Most complex new flow; penultimate |
| 15 | Biometric Login (F14) | WebAuthn libs, new DB cols | Most complex auth; do last to avoid regressions |

---

## Architectural Decisions Log

| Decision | Rationale |
|----------|-----------|
| proxy.ts over middleware.ts | Next.js 16 convention. Runs in Node.js runtime (not Edge), giving full access to Node APIs if needed. Already scaffolded. |
| `createClient` (server) for RSC data fetching | One network hop: Supabase → RSC → HTML. No client-side loading spinners for initial data. |
| Route Handlers for mock services, not Server Actions | Mock services have their own request/response contract (POST body, status codes) that mirrors a real vendor API. Route Handlers model this correctly. Server Actions are for mutations tied to UI forms. |
| Zustand + sessionStorage for multi-step flows | URL params leak PII. localStorage survives too long. Zustand + sessionStorage is scoped to the tab and cleared on close. |
| Realtime only for transaction status | Realtime connections are persistent WebSockets — expensive. Only status updates are time-critical. Balance and history are refreshed on navigation (server-side rerender). |
| Service role key only in Route Handlers + Server Actions | Never expose service role key to browser. All privileged DB operations go through server-side code only. |
| next-intl without URL locale prefix | Avoids restructuring the entire route tree. Cookie-based locale is simpler for a mobile app where users don't share links expecting a specific locale. |
| Separate P2P store (not extending transfer-store) | transfer-store is tightly coupled to recipient-based flow. P2P has different state shape (walletId vs recipient, no channel selection). Mixing creates state collision bugs. |
| Notification bell in TopHeader, not bottom nav | Bottom nav already has 5 items at 430px. Adding a 6th compresses below 44px touch target minimum (WCAG 2.1 AA). TopHeader bell is the standard mobile banking pattern. |
| Myanmar address as static data file | ~330 townships are administratively stable. Static JSON eliminates an API call on every recipient form render. Code-split — only loaded when recipient form mounts. |
| CSS print stylesheet for e-receipt (not html2canvas) | Zero bundle cost. iOS Safari "Share → Save to Files" produces PDF from print layout natively. html2canvas adds ~45KB for marginal gain. |
| WebAuthn via @simplewebauthn/* for biometrics | Maps to Face ID, Touch ID, Android biometrics via standard browser API. No native app bridge required. Node.js runtime compatible (not Edge). |

---

## Sources

- Full codebase read: `src/stores/`, `src/app/`, `src/types/index.ts`, `src/components/features/`, `.planning/supabase-schema.sql`
- Project PRD: `.planning/PROJECT.md`
- WebAuthn spec: https://www.w3.org/TR/webauthn-3/
- SimpleWebAuthn docs: https://simplewebauthn.dev/docs/
- Supabase RLS patterns: https://supabase.com/docs/guides/auth/row-level-security
- Next.js 16 Route Handlers: `node_modules/next/dist/docs/`
- Confidence: HIGH — all integration points verified against actual codebase. No speculative patterns.
