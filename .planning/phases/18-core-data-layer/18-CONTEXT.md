# Phase 18: Core Data Layer - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — smart discuss skipped)

<domain>
## Phase Boundary

Wire wallet balance, transaction history, and Visa card reads to real Supabase tables via Drizzle ORM. Set up Drizzle schema definitions matching existing supabase-schema.sql, configure connection to Supabase PostgreSQL, and replace demo data returns in /api/wallet, /api/transactions, /api/wallet/transactions with Drizzle queries. The Visa card page (/profile/card) should read from the cards table.

</domain>

<decisions>
## Implementation Decisions

### Drizzle ORM Setup
- Install drizzle-orm + drizzle-kit + @neondatabase/serverless (Supabase uses Neon-compatible PostgreSQL)
- Define Drizzle schema in src/db/schema.ts mirroring .planning/supabase-schema.sql tables
- Connection via Supabase DATABASE_URL (pooler connection string) with drizzle-orm/neon-http adapter
- Keep existing Supabase client for auth (supabase.auth.getUser()) — Drizzle handles data queries only
- RLS consideration: Drizzle bypasses RLS by default. Use service role connection for server-side API routes where the user is already authenticated via Supabase auth. Filter by user_id explicitly in all queries.

### Claude's Discretion
All other implementation choices (file organization, query patterns, error handling) are at Claude's discretion — pure infrastructure phase.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- src/lib/supabase/server.ts — createClient() for server-side Supabase (keep for auth)
- src/lib/supabase/client.ts — browser-side Supabase client (keep for auth)
- src/types/ — Transaction, Recipient, and other TypeScript types already defined
- src/lib/demo.ts — DEMO_WALLET, DEMO_TRANSACTIONS, DEMO_PROFILE (being replaced)

### Established Patterns
- API routes: src/app/api/*/route.ts using Next.js App Router
- Auth check: `const { data: { user } } = await supabase.auth.getUser()` at top of each route
- Demo branch: `if (isDemoMode) return NextResponse.json(DEMO_DATA)` — then real Supabase path
- Wallet API already has Supabase query path (src/app/api/wallet/route.ts:33-44) — reads from wallets + user_profiles
- Transactions API already has Supabase query path (src/app/api/transactions/route.ts:25-96) — with pagination, filters

### Integration Points
- /api/wallet — home screen wallet card fetches this
- /api/transactions — history page + recent transactions on home
- /api/wallet/transactions — another transactions endpoint (check for duplication)
- Profile card page — src/app/(main)/profile/card/page.tsx has hardcoded mock card data
- Supabase schema tables: wallets, transactions, cards, user_profiles, bank_accounts, recipients

</code_context>

<specifics>
## Specific Ideas

- User chose Drizzle ORM over keeping raw Supabase client or Prisma
- Drizzle should be the query layer for all data operations; Supabase client kept only for auth
- Existing non-demo Supabase query paths in wallet/transactions routes can serve as reference for what Drizzle queries need to return

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
