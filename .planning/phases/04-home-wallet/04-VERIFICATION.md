---
phase: 04-home-wallet
verified: 2026-04-14T00:00:00Z
status: gaps_found
score: 4/5 success criteria verified
gaps:
  - truth: "Quick actions grid routes to Bills (placeholder), Referral, Withdrawal, AND History"
    status: partial
    reason: "HOME-02 requires History in quick actions grid. Implementation has Transfer instead of History. History is accessible via the CirclePlus header link in RecentHistory, but not as a quick action cell. The UI-SPEC (D-05) and CONTEXT.md define Transfer/Bills/Referral/Withdrawal, overriding the original HOME-02 wording — but neither REQUIREMENTS.md nor ROADMAP success criterion 2 was updated to reflect this decision."
    artifacts:
      - path: "src/components/features/quick-actions.tsx"
        issue: "Has Transfer instead of History as 4th action. HOME-02 explicitly lists 'History' in quick actions."
    missing:
      - "Either add History as a 5th quick action (or replace Transfer) to satisfy HOME-02 and ROADMAP success criterion 2, OR update REQUIREMENTS.md HOME-02 and ROADMAP success criterion 2 to reflect the deliberate design choice to use Transfer instead of History"
  - truth: "Wallet balance updates in real-time via Supabase Realtime (HOME-06)"
    status: failed
    reason: "HOME-06 in REQUIREMENTS.md specifies 'via Supabase Realtime'. Implementation uses SWR with revalidateOnFocus:true and mutate() — no Supabase Realtime channel subscription exists anywhere in src/. The CONTEXT.md (D-10) intentionally chose SWR over Realtime. ROADMAP success criterion 5 is satisfied (no full page reload) but HOME-06 as written is not."
    artifacts:
      - path: "src/hooks/use-wallet.ts"
        issue: "Uses SWR revalidateOnFocus only. No Supabase Realtime channel. No postgres_changes subscription."
    missing:
      - "Either implement Supabase Realtime subscription on the wallets table (replacing or supplementing SWR), OR formally update REQUIREMENTS.md HOME-06 to read 'via SWR revalidation' instead of 'via Supabase Realtime'"
---

# Phase 4: Home & Wallet Verification Report

**Phase Goal:** Authenticated, KYC-approved users can see their wallet balance, recent transactions, quick actions, and navigate the app through the bottom tab bar
**Verified:** 2026-04-14
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Dashboard shows user name, wallet balance with show/hide toggle, wallet ID on load | VERIFIED | `WalletCard` fetches via `useWallet()` SWR hook, renders greeting from `profile.first_name`, balance with Eye/EyeOff toggle persisted in localStorage, masked wallet ID `WAVE-XXXX-XXXX` with clipboard copy |
| 2 | Quick actions grid routes to Bills (placeholder), Referral, Withdrawal, and History | PARTIAL | Has Transfer/Bills/Referral/Withdrawal — History missing as quick action cell. History accessible via `RecentHistory` header CirclePlus link only |
| 3 | Recent History lists up to 5 transactions with type icon, amount, date, and status badge | VERIFIED | `RecentHistory` uses `useRecentTransactions()`, renders typeConfig icons, creditTypes coloring, statusConfig badges, `slice(0,5)`, empty state, 5 skeleton rows |
| 4 | Promotions carousel is horizontally scrollable with at least one banner card rendered | VERIFIED | `PromoCarousel` uses `useEmblaCarousel({loop:false,align:'start'})`, 3 gradient cards rendered, dot indicators synced via `emblaApi.on("select",onSelect)` |
| 5 | Bottom nav shows 4 tabs with yellow FAB; balance updates without full page reload | PARTIAL | Bottom nav: 4 tabs confirmed (Home/Scan/Add Money/Profile), yellow FAB `w-14 h-14 bg-wave-yellow shadow-md`, `border-b-2 border-wave-yellow` active indicator. SWR `revalidateOnFocus:true` satisfies "no full page reload". BUT HOME-06 requires Supabase Realtime specifically — not implemented |

**Score:** 3 fully verified / 5 success criteria (2 partial — see gaps)

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/app/api/wallet/route.ts` | VERIFIED | GET endpoint, `supabase.auth.getUser()`, parallel queries to `wallets` + `user_profiles`, returns `{wallet, profile}`, null wallet for zero state |
| `src/app/api/wallet/transactions/route.ts` | VERIFIED | GET endpoint, auth guard, `.order('created_at',{ascending:false}).limit(5)`, returns `{transactions:[]}` on empty |
| `src/hooks/use-wallet.ts` | VERIFIED | Exports `useWallet` and `useRecentTransactions`, both use `useSWR` with `revalidateOnFocus:true, dedupingInterval:30000`, typed with `WalletData`/`TransactionsData` |
| `messages/en/home.json` | VERIFIED | All required keys present: greeting, balanceHidden, showBalance, hideBalance, copyWalletId, walletIdCopied, walletIdLabel, quickActions.{transfer,bills,referral,withdrawal}, recentHistory.{title,empty.{heading,body}}, promotions.{title,promo1-3}, comingSoon.{heading,body}, errors.{balanceFetch,transactionFetch}, notifications |
| `src/components/layout/bottom-nav.tsx` | VERIFIED | `border-b-2 border-wave-yellow` active indicator, `border-transparent` inactive, `stroke-[2.5]`/`stroke-[1.5]` differentiation, FAB `w-14 h-14 bg-wave-yellow shadow-md`, `aria-label="Add Money"`, `min-h-[44px]` on all items |

### Plan 02 Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/app/(main)/home/page.tsx` | VERIFIED | Server Component, imports TopHeader/WalletCard/QuickActions/RecentHistory/PromoCarousel, layout matches spec: yellow bg → `-mt-4` QuickActions → `mt-6` sections |
| `src/components/features/wallet-card.tsx` | VERIFIED | `useWallet()` hook (no props), `formatCurrency`, localStorage persistence with SSR-safe `useState(true)+useEffect`, eye toggle 44px, masked wallet ID, sonner toast on copy |
| `src/components/features/quick-actions.tsx` | PARTIAL | `grid-cols-2`, 4 actions, `active:scale-95`, blue circles `bg-[#0091EA]` — but actions are Transfer/Bills/Referral/Withdrawal, not Bills/Referral/Withdrawal/History per HOME-02 |
| `src/components/features/recent-history.tsx` | VERIFIED | `useRecentTransactions()`, typeConfig icons per spec, statusConfig badges, divide-y separators, empty state, 5 skeleton rows, CirclePlus→/history header link, tap-to-retry mutate() |
| `src/components/features/promo-carousel.tsx` | VERIFIED | `useEmblaCarousel`, 3 gradient cards `from-[#0091EA] to-[#01579B]`, `flex-[0_0_80%] max-w-[340px]`, dot sync via `emblaApi.on("select")`, active `#FFE600`/inactive `#E0E0E0` |
| `src/components/layout/top-header.tsx` | VERIFIED | `bg-[#FFE600]`, `h-14`, bell button with `aria-label={t('notifications')}`, 44px touch target, `useTranslations('home')` |
| `src/app/(main)/bills/page.tsx` | VERIFIED | Coming Soon content, Receipt icon, `t('comingSoon.heading')`, router.back() |
| `src/app/(main)/referral/page.tsx` | VERIFIED | Coming Soon content, Users icon, `t('comingSoon.heading')`, router.back() |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `wallet-card.tsx` | `src/hooks/use-wallet.ts` | `import { useWallet }` | WIRED | Line 7: `import { useWallet } from "@/hooks/use-wallet"` |
| `recent-history.tsx` | `src/hooks/use-wallet.ts` | `import { useRecentTransactions }` | WIRED | Line 15: `import { useRecentTransactions } from "@/hooks/use-wallet"` |
| `wallet-card.tsx` | `src/lib/currency.ts` | `formatCurrency` | WIRED | Line 8: `import { formatCurrency } from "@/lib/currency"`, used on wallet.balance |
| `home/page.tsx` | `src/components/features/` | import WalletCard/QuickActions/RecentHistory/PromoCarousel | WIRED | Lines 2-5: all 4 components imported and rendered |
| `use-wallet.ts` | `/api/wallet` | `useSWR('/api/wallet', fetcher, ...)` | WIRED | Line 30: `useSWR<WalletData>("/api/wallet", fetcher, SWR_OPTIONS)` |
| `use-wallet.ts` | `/api/wallet/transactions` | `useSWR('/api/wallet/transactions', fetcher, ...)` | WIRED | Line 40: `useSWR<TransactionsData>("/api/wallet/transactions", fetcher, SWR_OPTIONS)` |
| `api/wallet/route.ts` | Supabase `wallets` table | DB query | WIRED | `.from("wallets").select("id, balance, currency, max_topup").eq("user_id", user.id)` |
| `api/wallet/transactions/route.ts` | Supabase `transactions` table | DB query | WIRED | `.from("transactions").select(...).eq("user_id", user.id).order(...).limit(5)` |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `wallet-card.tsx` | `data.wallet.balance` | `useWallet()` → `GET /api/wallet` → `supabase.from("wallets").select(...)` | Yes — DB query to wallets table | FLOWING |
| `wallet-card.tsx` | `data.profile.first_name` | `useWallet()` → `GET /api/wallet` → `supabase.from("user_profiles").select(...)` | Yes — DB query | FLOWING |
| `recent-history.tsx` | `data.transactions` | `useRecentTransactions()` → `GET /api/wallet/transactions` → `supabase.from("transactions").select(...).limit(5)` | Yes — DB query | FLOWING |
| `promo-carousel.tsx` | promo titles/bodies | `useTranslations('home')` → `messages/en/home.json` | Intentional static i18n content (mock promo copy per D-08) | FLOWING (by design) |

---

## Behavioral Spot-Checks

| Behavior | Check | Result | Status |
|----------|-------|--------|--------|
| Build compiles cleanly | `npm run build` | No errors. Routes `/api/wallet`, `/api/wallet/transactions`, `/home`, `/bills`, `/referral`, `/withdrawal` all appear in build output | PASS |
| Wallet API route exported | File exists with GET export | `src/app/api/wallet/route.ts` exports `GET`, auth guard present | PASS |
| Transactions API correct ordering | `.order('created_at',{ascending:false}).limit(5)` | Confirmed in `src/app/api/wallet/transactions/route.ts` lines 20-22 | PASS |
| SWR revalidateOnFocus enabled | `revalidateOnFocus: true` in SWR_OPTIONS | Confirmed in `src/hooks/use-wallet.ts` line 25 | PASS |
| Bottom nav active indicator | `border-b-2 border-wave-yellow` classes | Confirmed in `src/components/layout/bottom-nav.tsx` line 50 | PASS |
| Supabase Realtime subscription | `postgres_changes` channel subscribe | Not found anywhere in `src/` | FAIL — HOME-06 gap |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| HOME-01 | 04-02-PLAN.md | Dashboard displays user name, wallet balance with show/hide toggle, wallet ID | SATISFIED | WalletCard: greeting from `profile.first_name`, balance toggle, masked wallet ID `WAVE-XXXX-XXXX` |
| HOME-02 | 04-02-PLAN.md | Quick actions grid shows Bills, Referral, Withdrawal, History with correct icons | PARTIAL | Has Transfer/Bills/Referral/Withdrawal. History not in quick actions. UI-SPEC D-05 defined Transfer instead, but HOME-02 and ROADMAP SC-2 were never updated |
| HOME-03 | 04-02-PLAN.md | Recent History shows last 5 transactions with status badges | SATISFIED | `useRecentTransactions()`, `slice(0,5)`, typeConfig + statusConfig mapping |
| HOME-04 | 04-02-PLAN.md | Promotion carousel displays scrollable banner cards | SATISFIED | Embla carousel with 3 gradient cards and dot sync |
| HOME-05 | 04-01-PLAN.md | Bottom navigation renders 4 tabs with yellow FAB | SATISFIED | 4 tabs (Home/Scan/Add Money/Profile), `w-14 h-14 bg-wave-yellow shadow-md` FAB |
| HOME-06 | 04-01-PLAN.md | Wallet balance updates in real-time after transactions via Supabase Realtime | NOT SATISFIED | REQUIREMENTS.md specifies Supabase Realtime. Implementation uses SWR `revalidateOnFocus` only. No Realtime subscription found anywhere in src/. CONTEXT.md D-10 intentionally chose SWR but REQUIREMENTS.md was never updated |

---

## Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `src/app/(main)/bills/page.tsx` | Coming Soon content | Info | Intentional per D-12 — placeholder awaiting Phase 6 |
| `src/app/(main)/referral/page.tsx` | Coming Soon content | Info | Intentional per D-12 — placeholder awaiting Phase 6 |
| `src/app/(main)/withdrawal/page.tsx` | Coming Soon content | Info | Intentional per D-12 — placeholder awaiting Phase 6 |

No unintentional stubs or placeholders found. All `return null` and empty state patterns traced to legitimate conditional rendering (loading/error/empty data states).

---

## Human Verification Required

### 1. Balance Show/Hide Persistence

**Test:** Load /home, toggle balance to hidden, reload the page
**Expected:** Balance remains hidden after reload (localStorage persisted)
**Why human:** Cannot verify localStorage behavior in a static code check

### 2. Wallet ID Copy Toast

**Test:** Tap the Copy icon on the wallet card
**Expected:** Sonner toast "Wallet ID copied" appears at bottom-center for ~2 seconds
**Why human:** Toast appearance and positioning require browser interaction

### 3. Promo Carousel Scrollability

**Test:** Swipe or drag the promo carousel horizontally on mobile viewport
**Expected:** Cards scroll smoothly, dot indicator updates to match active card
**Why human:** Embla carousel drag behavior requires browser rendering

### 4. Quick Actions Navigation

**Test:** Tap Transfer, Bills, Referral, Withdrawal cells
**Expected:** Transfer routes to /transfer; Bills/Referral/Withdrawal show Coming Soon pages with back navigation
**Why human:** Navigation behavior requires browser interaction

---

## Gaps Summary

Two gaps prevent complete goal achievement:

**Gap 1 — HOME-02 discrepancy (partial, low severity):** The REQUIREMENTS.md and ROADMAP success criterion 2 specify "History" as one of the 4 quick actions. The UI-SPEC (D-05) and implementation use "Transfer" instead. History is accessible via a secondary path (CirclePlus icon in the RecentHistory section header linking to /history). This is a planning artifact inconsistency — the design deliberately chose Transfer but REQUIREMENTS.md was not updated to match. Resolution: either add History as an accessible quick action, or update REQUIREMENTS.md HOME-02 and ROADMAP success criterion 2 to reflect Transfer as the first action.

**Gap 2 — HOME-06 Supabase Realtime not implemented (definitive gap):** REQUIREMENTS.md HOME-06 explicitly states "via Supabase Realtime". The implementation uses SWR `revalidateOnFocus: true`, which updates the balance when the user returns focus to the tab — not in true real-time. While CONTEXT.md D-10 intentionally chose SWR (and ROADMAP SC-5 only requires "without full page reload"), the requirement as written is not met. If Supabase Realtime is genuinely deferred or replaced, REQUIREMENTS.md needs to be updated. If it is required, a Supabase `postgres_changes` channel subscription on the `wallets` table needs to be added to `use-wallet.ts`.

---

_Verified: 2026-04-14_
_Verifier: Claude (gsd-verifier)_
