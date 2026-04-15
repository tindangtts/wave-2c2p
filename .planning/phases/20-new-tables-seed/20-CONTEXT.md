# Phase 20: New Tables & Seed - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — smart discuss skipped)

<domain>
## Phase Boundary

Create missing Supabase tables (notifications, vouchers), wire their API routes to Drizzle, and create a comprehensive seed SQL file. After this phase: notification inbox reads from DB, voucher redemption validates against DB, and a fresh Supabase project can be seeded with demo data.

</domain>

<decisions>
## Implementation Decisions

### New Tables
- notifications: id, user_id, type, title, body, is_read, deep_link, created_at
- vouchers: id, code, type (cashback/free_transfer), amount, description, active, redeemed_by, redeemed_at, expires_at, created_at
- Add both to Drizzle schema (src/db/schema.ts) and create SQL migration

### Seed Data
- Seed SQL in supabase/seed.sql — insertable against any fresh Supabase project
- Must populate: user_profiles, wallets, transactions, cards, notifications, vouchers, recipients, bank_accounts
- Use the same demo data currently in src/lib/demo.ts as the seed baseline

### Claude's Discretion
All implementation choices at Claude's discretion — infrastructure phase.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- src/db/schema.ts — Drizzle schema (add notifications + vouchers tables)
- src/app/api/notifications/route.ts — Currently returns hardcoded demo array
- src/app/api/voucher/route.ts — Currently validates against inline mock codes
- src/lib/demo.ts — DEMO_TRANSACTIONS, DEMO_RECIPIENTS etc. — use as seed data source

### Established Patterns
- Phase 18 pattern: Drizzle schema → API route → keep isDemoMode branch
- Phase 19 pattern: db.batch() for atomic writes
- Notification API: GET returns list, PATCH marks read (needs Drizzle rewrite)
- Voucher API: POST with code → validate → credit wallet

### Integration Points
- /api/notifications — home bell badge + inbox page
- /api/voucher — voucher redemption page
- Seed SQL — used by developers on fresh installs

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
