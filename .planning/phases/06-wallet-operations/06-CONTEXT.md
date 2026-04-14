# Phase 6: Wallet Operations - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can add money via bank or convenience store QR, withdraw to a recipient, scan QR codes, and review their full transaction history with filters. This phase completes the wallet management capabilities.

</domain>

<decisions>
## Implementation Decisions

### Add Money Flow
- D-01: Multi-step flow: amount entry → channel selection (bank grid / convenience store) → QR code display with expiry countdown
- D-02: Amount input with wallet balance + max top-up (25,000 THB) display. Minimum top-up 150 THB.
- D-03: Bank channel grid: SCB, KTB, Bay, BBL, KBANK, GSB as icon buttons. Convenience store: 123 Service, CenPay.
- D-04: QR code generated via `react-qr-code` (SVG). Display shows: QR code, payment code, amount, merchant info, expiry countdown timer.
- D-05: Mock API: `POST /api/mock-payment/topup` creates pending transaction, returns QR data. Auto-completes after configurable delay (env var `MOCK_TOPUP_DELAY_MS`, default 5000ms).

### Withdrawal Flow
- D-06: Reuses Phase 5 recipient selection and passcode confirmation patterns.
- D-07: Flow: select recipient → enter amount (validated against balance) → confirm with passcode → success receipt.
- D-08: Mock API: `POST /api/mock-payment/withdraw` creates pending transaction, auto-completes.

### QR Scanner
- D-09: Camera view with scan frame overlay (dark background, white corner markers). Falls back to file picker on iOS PWA.
- D-10: Uses `<input type="file" accept="image/*" capture="environment">` pattern from Phase 3 camera overlay (not a full QR scanning library — mock only).
- D-11: "Receive Money with QR" button generates a QR code with user's wallet ID for receiving payments.

### Transaction History
- D-12: Infinite scroll with `useSWRInfinite` — loads 20 transactions per page, appends on scroll.
- D-13: Date range picker using `react-day-picker` (already installed). Handles Thai Buddhist calendar years (BE = CE + 543).
- D-14: Filter chips: type (All, Transfer, Top-up, Withdrawal) and status (All, Success, Pending, Failed).
- D-15: Transaction rows reuse the RecentHistory component pattern from Phase 4 (type icon, amount, date, status badge).

### Transaction Detail
- D-16: Full receipt view matching Phase 5 `TransferReceipt` component pattern. Shows: status, date, type, sender/receiver, amount breakdown, reference number.

### Claude's Discretion
- QR code content format and encoding
- Infinite scroll threshold and loading indicator
- Date picker locale handling for Thai/Myanmar calendars
- Error states for failed top-ups and withdrawals
- Empty state designs for history filters with no results

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/features/camera-overlay.tsx` — Camera with guide frame (Phase 3)
- `src/components/features/transfer-receipt.tsx` — Receipt card layout (Phase 5)
- `src/components/features/passcode-sheet.tsx` — Passcode confirmation (Phase 5)
- `src/components/features/recipient-list.tsx` — Recipient selection (Phase 5)
- `src/components/features/recent-history.tsx` — Transaction row pattern (Phase 4)
- `src/hooks/use-wallet.ts` — SWR wallet hook (Phase 4)
- `src/lib/currency.ts` — Currency formatting utilities

### Established Patterns
- SWR for data fetching with revalidation
- Zustand stores with persist for multi-step flows
- Mock API routes with configurable behavior via env vars
- i18n messages in `messages/{locale}/{namespace}.json`

### Integration Points
- Bottom nav "Add Money" FAB routes to `/add-money`
- Bottom nav "Scan" tab routes to `/scan`
- QuickActions "History" not present (removed in Phase 4 D-05) — access via RecentHistory CirclePlus icon
- Wallet balance must revalidate after top-up/withdrawal

</code_context>

<specifics>
## Specific Ideas

- Add Money screen matches Pencil (nr3TU): yellow header, balance/max display, bank grid with logos, 123 Service section
- QR code display matches Pencil (xAphU/HDpqP): large QR, payment details, merchant info
- Withdrawal flow reuses transfer patterns — keep consistent UX
- Transaction history should support both Gregorian and Buddhist calendar date display

</specifics>

<deferred>
## Deferred Ideas

- Real QR code scanning with `@yudiel/react-qr-scanner` (mock camera only for now)
- PromptPay QR standard implementation
- Real bank API integration for top-up
- Transaction export (CSV/PDF)

</deferred>

---

*Phase: 06-wallet-operations*
*Context gathered: 2026-04-14 via Smart Discuss (autonomous)*
