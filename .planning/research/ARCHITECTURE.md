# Architecture Patterns

**Project:** 2C2P Wave — Mobile Banking & Remittance PWA
**Researched:** 2026-04-14
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

**Implementation:** In `next.config.js`, integrate `@ducanh2912/next-pwa` (maintained fork of next-pwa compatible with App Router). The manifest.json is in `/public/manifest.json`. `proxy.ts` matcher already excludes `manifest.json` from session refresh.

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
└── app/
    └── [locale]/           ← optional: locale prefix in URL (/th/home, /my/home)
```

**Locale detection strategy:** Store the selected locale in a cookie (`NEXT_LOCALE`). The `getRequestConfig()` function reads this cookie. The LanguageSwitcher component sets the cookie and reloads. This avoids locale-prefixed URLs (which would break the existing route structure) while still supporting Server Component message access.

**Alternative (simpler):** Use `next-intl` without URL prefixing. Set locale in cookie only. Trade-off: no URL-based locale sharing, but avoids restructuring `app/(main)/home/` to `app/[locale]/(main)/home/`.

**Font loading for scripts:**

```typescript
// src/app/layout.tsx
import { Kanit } from 'next/font/google'

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-kanit',
})
// Myanmar script: load Padauk or Noto Sans Myanmar via @font-face in globals.css
// (not available in next/font/google — must self-host from Google Fonts CDN)
```

**Message key conventions:**
```json
{
  "home": {
    "walletBalance": "Wallet Balance",
    "quickActions": {
      "bills": "Bills",
      "refer": "Refer Friends"
    }
  },
  "transfer": {
    "exchangeRate": "Exchange Rate",
    "fee": "Transfer Fee",
    "confirm": "Confirm Transfer"
  }
}
```

---

## Component Boundaries Summary

### What Talks to What

```
proxy.ts
  └── reads Supabase Auth session → redirects or passes through

Server Components (pages)
  └── createClient() [server] → Supabase DB (anon key + RLS)
  └── renders initial HTML + passes props to Client Components

Client Components
  └── own UI state (forms, toggles, animations)
  └── call Server Actions → mutate Supabase via service role
  └── call Route Handlers → mock services (KYC, payment)
  └── createClient() [browser] → Supabase Realtime subscriptions only

Route Handlers (/api/*)
  └── mock-kyc/* → simulate eKYC vendor, update kyc_verifications via service role
  └── mock-payment/* → simulate payment processor, update transactions via service role
  └── auth/* → phone OTP flow via Supabase Auth

Supabase Realtime
  └── postgres_changes on 'transactions' table
  └── consumed by TransactionStatusTracker (Client Component)

Service Worker
  └── intercepts fetch() for static assets + offline fallback
  └── never intercepts /api/* routes (NetworkOnly)

Zustand Stores (browser memory + sessionStorage)
  └── registrationStore → feeds multi-step registration form
  └── transferStore → feeds transfer flow (in-memory only)
  └── consumed by Client Components within each flow
```

---

## Suggested Build Order (Phase Dependencies)

Build in this order — each phase's output is required by the next.

1. **Foundation** — proxy.ts auth guard working, Supabase project configured, RLS policies on all tables, design tokens in globals.css, shadcn/ui theme override. This unblocks everything.

2. **Auth flows** — `(auth)/` route group: login, OTP, register (multi-step), passcode setup. Zustand registrationStore. Server Action checkpoint saves. This is the entry gate — no other feature works without an authenticated user.

3. **Mock services** — `/api/mock-kyc/*` and `/api/mock-payment/*` Route Handlers with env-var-controlled behavior. eKYC depends on this. Transfer depends on this. These can be built in parallel with auth.

4. **eKYC flow** — `(auth)/kyc/` pages. CameraOverlay component. DocumentUpload component. Depends on: Auth (user must be authenticated), Mock KYC API, Supabase Storage bucket.

5. **Home dashboard + Wallet** — `(main)/home/page.tsx` (Server Component), WalletCard, QuickActions, RecentHistory, PromoCarousel. Depends on: Auth, wallets table, transactions table (read), i18n setup.

6. **Transfer flow** — recipient management, amount + conversion, channel selection, confirm + passcode, receipt. Depends on: Mock Payment API (exchange rate + fees + process-transfer), Supabase Realtime (status updates), transferStore (Zustand), recipients table.

7. **Add Money + Withdraw** — top-up channels, QR generation, withdrawal confirmation. Depends on: Mock Payment API (process-topup), QR library (browser-only Client Component).

8. **Transaction History** — list with filters, detail/receipt view. Depends on: transactions table, date range filter UI (Calendar component), Realtime for pending status badges.

9. **Profile + Settings** — settings menu, passcode change, phone change, refer, contact. Mostly Server Components reading user_profiles. Phone change re-uses OTP flow.

10. **Card page** — virtual Visa display. Mostly static UI with fake data. No external dependencies.

11. **PWA shell** — service worker, manifest.json, offline fallback page, install prompt. Can be done last — doesn't block any functional flow, but should be done before any performance or offline testing.

12. **i18n messages** — translation strings can be filled in throughout, but the i18n infrastructure (next-intl routing, message loading) should be set up in Phase 1 Foundation to avoid retrofitting string literals across all components.

---

## Architecture Decisions Log

| Decision | Rationale |
|----------|-----------|
| proxy.ts over middleware.ts | Next.js 16 convention. Runs in Node.js runtime (not Edge), giving full access to Node APIs if needed. Already scaffolded. |
| `createClient` (server) for RSC data fetching | One network hop: Supabase → RSC → HTML. No client-side loading spinners for initial data. |
| Route Handlers for mock services, not Server Actions | Mock services have their own request/response contract (POST body, status codes) that mirrors a real vendor API. Route Handlers model this correctly. Server Actions are for mutations tied to UI forms. |
| Zustand + sessionStorage for multi-step flows | URL params leak PII. localStorage survives too long. Zustand + sessionStorage is scoped to the tab and cleared on close. |
| Realtime only for transaction status | Realtime connections are persistent WebSockets — expensive. Only status updates are time-critical. Balance and history are refreshed on navigation (server-side rerender). |
| Service role key only in Route Handlers + Server Actions | Never expose service role key to browser. All privileged DB operations go through server-side code only. |
| next-intl without URL locale prefix | Avoids restructuring the entire route tree. Cookie-based locale is simpler for a mobile app where users don't share links expecting a specific locale. |

---

## Sources

- Scaffolded project code: `src/proxy.ts`, `src/lib/supabase/middleware.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`
- PRD: `.planning/PRD-REFERENCE.md` (Technical Architecture, Mock Services Architecture sections)
- UI/UX Review: `.planning/UI-UX-REVIEW.md` (Component inventory, UX flow analysis)
- Project context: `.planning/PROJECT.md`
- Confidence: HIGH — architecture is grounded in the existing scaffold, not hypothetical. The patterns described match the conventions already established in the codebase.
