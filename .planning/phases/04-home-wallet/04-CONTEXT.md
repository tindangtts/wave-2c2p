# Phase 4: Home & Wallet - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the home dashboard with wallet balance display (show/hide toggle), user greeting, wallet ID, quick actions 2x2 grid (Transfer, Bills placeholder, Referral, Withdrawal), recent transactions list (last 5), promotions carousel, and enhanced bottom navigation with yellow Add Money FAB. Balance updates via SWR without full page reload.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout & Wallet Display
- **D-01:** Wallet balance fetched from `wallets` table via Server Component for initial load, then SWR for client-side revalidation after transactions. Wallet row created on KYC approval.
- **D-02:** Balance show/hide: eye icon toggle, persist preference in localStorage. Shows "฿ •••••" when hidden.
- **D-03:** Wallet ID: masked format "WAVE-XXXX-XXXX" (last 8 chars of UUID), tap to copy full ID.
- **D-04:** User greeting: "Hello, {first_name}" from `user_profiles.first_name` at top of dashboard.

### Quick Actions & Recent History
- **D-05:** Quick actions: 2x2 grid — Transfer, Bills (placeholder), Referral, Withdrawal. Each cell has icon + label, 44px touch targets.
- **D-06:** Recent transactions: fetch last 5 from `transactions` table. Type icon + amount + date + status badge. Empty state: "No transactions yet" with illustration.
- **D-07:** Transaction type icons: Lucide — ArrowUpRight (send/red), ArrowDownLeft (receive/green), Plus (topup/green), Minus (withdraw/red).
- **D-08:** Promotions carousel: Embla Carousel (already installed), 3 mock promo cards, swipeable, dot indicators, auto-scroll disabled.

### Bottom Navigation & Updates
- **D-09:** Add Money FAB: yellow circular (#FFE600), 56px diameter, Plus icon, elevated above bottom nav bar center.
- **D-10:** Balance updates: SWR with `mutate()` after transaction actions. `revalidateOnFocus: true`. No full page reload.
- **D-11:** Active tab: yellow bottom border + filled icon. Inactive uses outline icons. Build on Phase 1 bottom-nav.
- **D-12:** Unbuilt features: placeholder pages with "Coming Soon" message for Bills, Referral. Withdrawal and History built in Phase 6.

### Claude's Discretion
- Mock promo card content and imagery
- Empty state illustration choice
- Transaction amount formatting (uses Phase 1 currency utils)
- Exact SWR configuration (dedupingInterval, refreshInterval)
- Dashboard section spacing and card shadows

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/layout/bottom-nav.tsx` — existing nav with ARIA, 44px targets (Phase 1)
- `src/lib/currency.ts` — formatCurrency, convertSatangToPya (Phase 1)
- `src/components/ui/badge.tsx` — success/warning/info variants (Phase 1)
- `src/components/ui/card.tsx`, `carousel.tsx`, `skeleton.tsx` — shadcn components
- `embla-carousel-react` — already installed
- `src/app/(main)/home/page.tsx` — existing placeholder
- `src/app/(main)/layout.tsx` — main layout with bottom nav + visibility guard

### Established Patterns
- i18n: `messages/{locale}/home.json` via next-intl
- Auth: Supabase session cookies, proxy.ts guards
- CSS: design tokens in globals.css, brand yellow/blue
- Touch targets: 44px minimum enforced

### Integration Points
- `src/app/(main)/home/page.tsx` — rebuild as dashboard
- `src/components/layout/bottom-nav.tsx` — enhance with FAB
- `src/app/(main)/` — new placeholder pages (bills, referral)
- `.planning/supabase-schema.sql` — `wallets`, `transactions` tables exist

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following prototype screens.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
