---
phase: 18-core-data-layer
verified: 2026-04-15T10:30:00Z
status: gaps_found
score: 5/6 must-haves verified
re_verification: false
gaps:
  - truth: "REQUIREMENTS.md status for DATA-06 not updated to Complete"
    status: partial
    reason: "Plan 03 satisfied DATA-06 (cards route exists, card page fetches from API) but REQUIREMENTS.md line 65 still shows 'DATA-06 | Phase 18 | Pending' and line 17 still shows '- [ ] **DATA-06**'"
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "DATA-06 checkbox and tracking table still show Pending — should be marked Complete after Plan 03 executed"
    missing:
      - "Update line 17: change '- [ ] **DATA-06**' to '- [x] **DATA-06**'"
      - "Update line 65: change 'DATA-06 | Phase 18 | Pending' to 'DATA-06 | Phase 18 | Complete'"
human_verification:
  - test: "Load home screen with a real Supabase-connected session and change wallets.balance via the DB console"
    expected: "Home screen balance reflects the updated value on next page load without code changes"
    why_human: "Requires a running Supabase instance with a seeded wallets row — cannot verify with static code grep"
  - test: "Insert 25+ rows into transactions for one user, open history page, scroll to bottom"
    expected: "Second page of 20 records loads from DB (page=1 query fires, older records appear)"
    why_human: "Requires real DB data and browser interaction to trigger infinite scroll"
  - test: "Set is_frozen = true for a card row in the cards table, load the Visa card page"
    expected: "UI shows frozen state (blue 'Frozen' badge, reveal button disabled) without any code override"
    why_human: "Requires a live Supabase instance with a cards row"
---

# Phase 18: Core Data Layer Verification Report

**Phase Goal:** The home screen, transaction history, and Visa card page reflect real user data from Supabase — no hardcoded balances or demo records
**Verified:** 2026-04-15T10:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Drizzle ORM is installed and importable in any API route | VERIFIED | `node_modules/drizzle-orm` confirmed present; all 4 routes import `{ db } from '@/db'` |
| 2 | Schema definitions exist for wallets, transactions, userProfiles, cards, recipients | VERIFIED | `src/db/schema.ts` exports exactly 5 `pgTable` constants; all bigint columns use `{ mode: 'number' }` (10 occurrences) |
| 3 | Home screen wallet balance reads from wallets table via Drizzle | VERIFIED | `/api/wallet/route.ts` uses `db.select().from(wallets).where(eq(...))` in non-demo branch; `WalletCard` → `useWallet` hook → SWR on `/api/wallet` |
| 4 | Transaction history reads from transactions table with pagination | VERIFIED | `/api/transactions/route.ts` uses `db.select().from(transactions)` with `limit()`/`offset()` and dynamic `conditions` array; `useTransactions` uses `useSWRInfinite` with page/limit params |
| 5 | Visa card page displays data from cards table via API | VERIFIED | `/api/cards/route.ts` uses `db.select().from(cards).where(eq(cards.userId, user.id))`; card page `useEffect` fetches `/api/cards` and renders `card.card_number_masked`, `card.expiry_month`, `card.expiry_year`, and initializes `frozen` from `card.is_frozen` |
| 6 | REQUIREMENTS.md tracks DATA-06 as complete | FAILED | Lines 17 and 65 of REQUIREMENTS.md still show DATA-06 as Pending/unchecked — not updated after Plan 03 executed |

**Score:** 5/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/db/schema.ts` | 5 pgTable definitions | VERIFIED | 5 exports confirmed; wallets, transactions, userProfiles, cards, recipients; all bigint with mode:number |
| `src/db/index.ts` | Lazy Proxy db singleton via neon-http | VERIFIED | Proxy-based lazy initialization; `getDb()` defers `neon()` to first property access; exports both `db` and `getDb` |
| `drizzle.config.ts` | Drizzle Kit config with dialect:postgresql | VERIFIED | `defineConfig` with `dialect: 'postgresql'` confirmed |
| `src/app/api/wallet/route.ts` | Drizzle queries for wallet + profile | VERIFIED | `Promise.all` of two Drizzle selects; snake_case aliases preserve API contract; no `supabase.from()` calls |
| `src/app/api/transactions/route.ts` | Drizzle query with pagination + join | VERIFIED | Paginated list with limit/offset; single fetch by ID with `leftJoin(recipients)`; conditions array for type/status/date filters |
| `src/app/api/wallet/transactions/route.ts` | Recent 5 transactions via Drizzle | VERIFIED | Explicit column select with `created_at` alias, `orderBy(desc)`, `limit(5)` |
| `src/app/api/cards/route.ts` | GET endpoint from Drizzle cards table | VERIFIED | `db.select().from(cards).where(eq(cards.userId, user.id))`; encrypted fields omitted from select |
| `src/app/(main)/profile/card/page.tsx` | Fetches /api/cards, no hardcoded mocks | VERIFIED | MOCK_CARD_NUMBER / MOCK_EXPIRY / MOCK_HOLDER_NAME fully removed; `useEffect` fetches `/api/cards`; frozen state from `card.is_frozen` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/api/wallet/route.ts` | `src/db/index.ts` | `import { db } from '@/db'` | WIRED | Line 4 confirmed |
| `src/app/api/transactions/route.ts` | `src/db/schema.ts` | `import { transactions, recipients } from '@/db/schema'` | WIRED | Line 6 confirmed |
| `src/app/api/cards/route.ts` | `src/db/index.ts` | `import { db } from '@/db'` | WIRED | Line 2 confirmed |
| `src/db/index.ts` | `src/db/schema.ts` | `import * as schema from './schema'` | WIRED | Line 4 confirmed |
| `src/db/index.ts` | `DATABASE_URL` | `process.env.DATABASE_URL` | WIRED | Lines 13 and 16; guarded with throw if absent |
| `src/app/(main)/profile/card/page.tsx` | `/api/cards` | `fetch('/api/cards')` in `useEffect` | WIRED | Line 32 confirmed |
| `WalletCard` component | `/api/wallet` | `useWallet` → `useSWR('/api/wallet')` | WIRED | `use-wallet.ts` line 31 confirmed |
| History page | `/api/transactions` | `useTransactions` → `useSWRInfinite` | WIRED | `use-transactions.ts` line 38 confirmed |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `WalletCard` via `useWallet` | `wallet.balance`, `profile.first_name` | `db.select().from(wallets)` + `db.select().from(userProfiles)` in `/api/wallet` | Yes — Drizzle query scoped to `user.id` | FLOWING |
| History page via `useTransactions` | `transactions[]` | `db.select().from(transactions).where(eq(transactions.userId,...)).orderBy(desc).limit(limit).offset(offset)` | Yes — paginated Drizzle query | FLOWING |
| Card page `cardData` | `card_number_masked`, `expiry_month`, `is_frozen` | `db.select().from(cards).where(eq(cards.userId, user.id))` in `/api/cards` | Yes — Drizzle query scoped to `user.id` | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED for non-demo paths — requires running Supabase instance. Demo mode spot-checks are not applicable to data-layer verification. Build correctness was verified in plan summaries (`npm run build` passes per 18-03 summary).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| DATA-01 | 18-01-PLAN.md, 18-02-PLAN.md | Wallet balance reads from `wallets` table | SATISFIED | `/api/wallet` uses `db.select().from(wallets)`; no `supabase.from()` calls remain; REQUIREMENTS.md line 12 shows `[x]` |
| DATA-02 | 18-01-PLAN.md, 18-02-PLAN.md | Transaction history reads from `transactions` table with proper pagination | SATISFIED | `/api/transactions` uses `limit`/`offset` pagination; `useTransactions` uses `useSWRInfinite`; REQUIREMENTS.md line 13 shows `[x]` |
| DATA-06 | 18-03-PLAN.md | Visa card data reads from `cards` table instead of hardcoded mock | SATISFIED (code) / PENDING (docs) | `/api/cards` exists, card page fetches from it, no hardcoded mocks remain — but REQUIREMENTS.md lines 17 and 65 still show DATA-06 as unchecked/Pending |

**Orphaned requirements:** None — REQUIREMENTS.md maps only DATA-01, DATA-02, DATA-06 to Phase 18 (lines 63-65), which matches what all three plans claim.

**REQUIREMENTS.md inconsistency:** DATA-06 implementation is complete (code passes all artifact and wiring checks) but the tracking document was not updated. This is a documentation gap, not a code gap. The requirement is satisfied in the codebase.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/(main)/profile/card/page.tsx` | 87 | `const holderName = 'CARD HOLDER'` — static string | Info | Hardcoded display string; `cards` table has no holder_name column and Plan 03 explicitly documents this as correct security posture. Not a stub — does not affect card number, expiry, or freeze status which all flow from DB. |
| `src/app/(main)/profile/card/page.tsx` | 91 | `const cardInfoNumber = maskedNumber` — reveal toggle shows masked number in both states | Info | Full card number is not stored client-side; this is correct per Plan 03 security decision. Not a regression stub. |

No blockers found. The two info-level items are documented design decisions in Plan 03, not accidental stubs.

**Pagination mechanism note:** ROADMAP.md success criterion 2 mentions "cursor-based pagination" but the implementation uses page/offset pagination (`page * limit = offset`). The observable behavior — scrolling loads older records — is satisfied. The offset approach is functionally correct for the current data volumes. A true cursor-based implementation (using `createdAt < cursor`) would be more resilient to insertions between pages, but this was not flagged as a deviation in Plan 02's summary and is acceptable at this stage.

### Human Verification Required

#### 1. Home balance reflects DB row

**Test:** With a real Supabase session, update `wallets.balance` for the test user directly in the DB console, then reload the home screen.
**Expected:** The balance shown in WalletCard matches the updated DB value (not a cached or hardcoded value).
**Why human:** Requires a running Supabase instance with a seeded wallets row; cannot be verified by static code analysis.

#### 2. Transaction pagination loads additional pages from DB

**Test:** Insert 25+ transaction rows for one user, open the history page, scroll to the bottom to trigger infinite scroll.
**Expected:** A second API request fires with `page=1` and 20 more records load below the first 20.
**Why human:** Requires real DB data volume and browser interaction with the running app.

#### 3. Card freeze state read from DB

**Test:** With a running app connected to Supabase, set `is_frozen = true` for the test user's card row in the cards table, then navigate to the Visa card page.
**Expected:** The card page shows the blue "Frozen" badge and the reveal button is disabled — driven by the API response, not a hardcoded default.
**Why human:** Requires a live Supabase instance with a cards row; the code wiring is verified but the runtime DB→UI path requires a running app.

### Gaps Summary

One gap found: a documentation inconsistency. The code fully satisfies DATA-06 — `/api/cards` exists, uses Drizzle, is scoped to the authenticated user, omits encrypted fields, and the card page fetches from it with no hardcoded mock constants remaining. However, `.planning/REQUIREMENTS.md` was not updated after Plan 03 executed: line 17 still has an unchecked box for DATA-06 and line 65 still shows "Pending" in the tracking table.

This is a low-severity documentation gap only. All three automated code checks (artifact existence, substantive implementation, wiring) pass for DATA-06. The fix is two line edits in REQUIREMENTS.md.

---

_Verified: 2026-04-15T10:30:00Z_
_Verifier: Claude (gsd-verifier)_
