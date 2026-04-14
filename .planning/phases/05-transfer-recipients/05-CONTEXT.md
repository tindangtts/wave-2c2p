# Phase 5: Transfer & Recipients - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can select or create a recipient, enter an amount in THB with live MMK conversion, choose a receiving channel, confirm with passcode, and receive a receipt. This phase delivers the core remittance flow — the primary value proposition of the app.

</domain>

<decisions>
## Implementation Decisions

### Transfer Flow Architecture
- D-01: Multi-route pages: `/transfer/recipient` → `/transfer/amount` → `/transfer/channel` → `/transfer/confirm` → `/transfer/receipt`. Each screen is a distinct page, consistent with eKYC pattern.
- D-02: Zustand store with persist (`useTransferStore`) holds recipient, amount, channel, rate, fees across route transitions. Same pattern as `useKYCStore`.
- D-03: Mock exchange rate via `/api/mock-payment/rate` endpoint — returns `{ rate: 133.0, validUntil: timestamp }` with configurable rate via env var `MOCK_EXCHANGE_RATE`. Timer countdown on confirmation screen.
- D-04: Inline passcode entry on confirmation screen — bottom sheet with 6-digit input, reuses PBKDF2 verification from Phase 2. No separate route.

### Recipient Management
- D-05: Flat list with sections — Favorites (starred) at top, then all recipients sorted alphabetically. Search bar filters both sections.
- D-06: Single scrollable page for new recipient form — all AML/EDD fields on one long form (bank, name, NRC, phone, occupation, purpose, relationship, address).
- D-07: Yellow circle avatar with first initial for recipient display. No photo upload.
- D-08: Mock API routes for recipient CRUD — `GET/POST /api/recipients`, `PUT/DELETE /api/recipients/[id]`. Supabase `recipients` table. Favorite toggle via PATCH.

### Amount Entry & Conversion
- D-09: Full-page amount input — large numeric display with "THB" label, converted MMK amount shown below in real-time. Yellow "Next" CTA.
- D-10: 5-minute rate lock timer — rate fetched on amount entry, `validUntil` displayed on confirmation screen as "Rate expires in MM:SS". If expired, re-fetch before submit.
- D-11: Client-side Zod validation + balance check — min 100 THB, max 25,000 THB, cannot exceed wallet balance. Inline error messages.
- D-12: Side-by-side conversion card — "Amount: THB" left, "Converted Amount: MMK" right with flag icons. Rate line below: "1 THB = 133.0 MMK".

### Receiving Channels & Receipt
- D-13: Card list with fee breakdown — 4 channels (Wave Agent, Wave App, Bank Transfer, Cash Pickup) as selectable cards. Each shows channel name, converted amount in MMK, fee in THB.
- D-14: Mock flat fee schedule — Wave Agent: 10 THB, Wave App: 10 THB, Bank Transfer: 50 THB, Cash Pickup: 30 THB. Configurable via env vars.
- D-15: Full receipt card — "Success!" badge, 2c2p WAVE logo, date, sender/receiver details, amount/fee/total breakdown, note, "Share" button + "Close" CTA.
- D-16: Optimistic status with polling — show "pending" immediately after submit, poll `/api/mock-payment/status/[id]` every 2s (mock auto-completes after 3s). Status: pending → processing → completed.

### Claude's Discretion
- Exact Zod schema field names and validation rules for recipient form (NRC format, phone format by country)
- API response shapes for mock endpoints
- Error handling patterns (network errors, validation errors, rate expiry during submit)
- Loading/skeleton states during data fetching
- Accessibility labels for all interactive elements

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/kyc/schemas.ts` — Zod schema patterns for form validation
- `src/stores/kyc-store.ts` — Zustand persist pattern to replicate for transfer store
- `src/lib/currency.ts` — Currency formatting utilities (integer arithmetic, THB/MMK)
- `src/lib/auth/passcode.ts` — PBKDF2 passcode verification utilities
- `src/hooks/use-wallet.ts` — SWR hook pattern for data fetching
- `src/components/features/step-indicator.tsx` — Step progress indicator

### Established Patterns
- API routes return JSON with Supabase server client
- Zustand stores use `partialize` for selective persistence
- SWR hooks with `revalidateOnFocus: true`, `dedupingInterval: 30000`
- i18n messages in `messages/{locale}/{namespace}.json`, wired in `src/i18n/request.ts`
- Form validation via react-hook-form + Zod resolvers

### Integration Points
- `/transfer` routes under `/(main)` layout (has bottom nav)
- QuickActions "Transfer" button routes to `/transfer/recipient`
- Bottom nav does not highlight during transfer flow (no dedicated tab)
- Wallet balance must update after successful transfer (SWR revalidation)

</code_context>

<specifics>
## Specific Ideas

- Pencil design shows P2P transfer with wallet IDs — but ROADMAP requires cross-border with MMK conversion and receiving channels. Implementation follows ROADMAP (cross-border), using Pencil visual patterns.
- Recipient list uses yellow circle avatars with first initial (Pencil: bIuz1)
- Confirmation screen layout: amount at top, sender→receiver flow, note field, "Confirm" yellow CTA (Pencil: IxC56)
- Receipt matches "Transaction Detail" screen from Pencil (edUVA): Success badge, logo, date, breakdown, Share + Close

</specifics>

<deferred>
## Deferred Ideas

- Real payment gateway integration (mock only for now)
- Recipient import from contacts
- Transfer scheduling (send later)
- Batch transfers
- Transfer limits management UI

</deferred>

---

*Phase: 05-transfer-recipients*
*Context gathered: 2026-04-14 via Smart Discuss (autonomous)*
