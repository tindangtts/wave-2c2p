# Phase 18: Core Data Layer - Research

**Researched:** 2026-04-15
**Domain:** Drizzle ORM + Supabase PostgreSQL + Next.js App Router API Routes
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Install drizzle-orm + drizzle-kit + @neondatabase/serverless (Supabase uses Neon-compatible PostgreSQL)
- Define Drizzle schema in src/db/schema.ts mirroring .planning/supabase-schema.sql tables
- Connection via Supabase DATABASE_URL (pooler connection string) with drizzle-orm/neon-http adapter
- Keep existing Supabase client for auth (supabase.auth.getUser()) — Drizzle handles data queries only
- RLS consideration: Drizzle bypasses RLS by default. Use service role connection for server-side API routes where the user is already authenticated via Supabase auth. Filter by user_id explicitly in all queries.

### Claude's Discretion
All other implementation choices (file organization, query patterns, error handling) are at Claude's discretion — pure infrastructure phase.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Wallet balance reads from `wallets` table instead of hardcoded demo data | Drizzle select from wallets table where user_id = authenticated user |
| DATA-02 | Transaction history reads from `transactions` table with proper pagination | Drizzle select with limit/offset, orderBy desc, optional type/status filters |
| DATA-06 | Visa card data reads from `cards` table instead of hardcoded mock | New /api/cards route + card page client fetch; Drizzle select from cards table |
</phase_requirements>

## Summary

Phase 18 wires three hardcoded data sources to live Supabase tables using Drizzle ORM as the query layer. The existing API routes for wallet and transactions already have a non-demo Supabase client path that works correctly — the work is to: (1) install Drizzle and create `src/db/schema.ts` matching the existing SQL schema, (2) create `src/db/index.ts` with the neon-http db singleton, (3) replace the Supabase `from('table').select()` calls in /api/wallet, /api/transactions, and /api/wallet/transactions with equivalent Drizzle queries, and (4) create a new /api/cards route plus update the card page to fetch from it.

The non-demo Supabase query paths in wallet/transactions are already correct in terms of query logic — they join the right tables and return the right shapes. Drizzle replacement is a mechanical translation of those queries. The card page is the only one with truly hardcoded mock data that needs a new API endpoint.

**Primary recommendation:** Use `drizzle-orm/neon-http` adapter with `@neondatabase/serverless`. The Supabase pooler connection string works with this adapter. Keep the `{ prepare: false }` option disabled for neon-http (it uses HTTP, not pooled TCP, so prepared statement mode does not apply). Use a single `db` singleton in `src/db/index.ts` exported for use in all route handlers.

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 18 |
|-----------|-------------------|
| Next.js 16.2.3, uses `proxy.ts` not `middleware.ts` | No middleware changes needed — API routes only |
| All amounts stored as bigint (satang/pya) | Drizzle bigint columns map to JS `bigint` — use `{ mode: 'number' }` to keep TypeScript types compatible with existing `Transaction.amount: number` |
| No new packages without justification | drizzle-orm + drizzle-kit + @neondatabase/serverless are locked decisions from CONTEXT.md |
| Mobile-first, no new UI screens | Card page update is minimal — client-side fetch only, no layout changes |
| TypeScript strict mode | All Drizzle schema exports must be typed; infer types from schema with `$inferSelect` |
| `proxy.ts` not `middleware.ts` | Not relevant to this phase |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | 0.45.2 | Type-safe SQL query builder + ORM | User decision; type safety, no runtime magic |
| drizzle-kit | 0.31.10 | CLI for schema introspection + migrations | Required companion to drizzle-orm |
| @neondatabase/serverless | 1.0.2 | HTTP transport for PostgreSQL in serverless | Supabase PostgreSQL is Neon-compatible; HTTP adapter ideal for Next.js API routes (no persistent TCP) |

**Version verified:** 2026-04-15 from `npm view [package] version`

### Not Needed
| Package | Why Not |
|---------|---------|
| postgres (postgres-js) | postgres-js is the Supabase guide default but requires persistent TCP; neon-http is better for serverless/Edge |
| pg / node-postgres | Same issue — persistent connection, not serverless-appropriate |

### Installation
```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── db/
│   ├── index.ts         # Drizzle db singleton (neon-http connection)
│   └── schema.ts        # Table definitions mirroring supabase-schema.sql
drizzle.config.ts        # drizzle-kit config (for pull/push commands)
```

### Pattern 1: DB Singleton (neon-http)
**What:** Single exported `db` instance initialized from `DATABASE_URL` env var.
**When to use:** Every API route imports from `@/db` — no per-request connection overhead.

```typescript
// src/db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle({ client: sql, schema })
```

### Pattern 2: Drizzle Schema Matching supabase-schema.sql
**What:** `pgTable` definitions in `src/db/schema.ts` that mirror the existing SQL.
**Critical:** Use `{ mode: 'number' }` on `bigint` columns to maintain TypeScript compatibility with existing `Transaction.amount: number` and `Wallet.balance: number` types.

```typescript
// src/db/schema.ts
import { pgTable, uuid, text, bigint, boolean, integer, 
         numeric, timestamptz } from 'drizzle-orm/pg-core'

export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  balance: bigint('balance', { mode: 'number' }).notNull().default(0),
  currency: text('currency').notNull().default('THB'),
  maxTopup: bigint('max_topup', { mode: 'number' }).notNull().default(2500000),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
})

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  currency: text('currency').notNull().default('THB'),
  convertedAmount: bigint('converted_amount', { mode: 'number' }),
  convertedCurrency: text('converted_currency'),
  exchangeRate: numeric('exchange_rate', { precision: 10, scale: 4 }),
  fee: bigint('fee', { mode: 'number' }).default(0),
  status: text('status').notNull().default('pending'),
  recipientId: uuid('recipient_id'),
  channel: text('channel'),
  referenceNumber: text('reference_number').notNull(),
  description: text('description').notNull(),
  metadata: text('metadata'), // jsonb stored as text or use jsonb()
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
})

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey(),
  firstName: text('first_name'),
  walletId: text('wallet_id').notNull(),
  // ... other columns as needed
})

export const cards = pgTable('cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  cardNumberMasked: text('card_number_masked').notNull(),
  cardNumberEncrypted: text('card_number_encrypted'),
  cvvEncrypted: text('cvv_encrypted'),
  expiryMonth: integer('expiry_month').notNull(),
  expiryYear: integer('expiry_year').notNull(),
  balance: bigint('balance', { mode: 'number' }).notNull().default(0),
  isFrozen: boolean('is_frozen').notNull().default(false),
  status: text('status').notNull().default('active'),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
})
```

### Pattern 3: Auth Check Then Drizzle Query
**What:** Keep Supabase client for auth check only; use Drizzle for all data reads.
**When to use:** Every API route that returns user data.

```typescript
// Pattern for every protected route
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { eq, and, desc } from 'drizzle-orm'
import { wallets } from '@/db/schema'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Drizzle query — always filter by user.id to enforce user isolation
  const wallet = await db.select()
    .from(wallets)
    .where(eq(wallets.userId, user.id))
    .limit(1)
    .then(rows => rows[0] ?? null)

  return NextResponse.json({ wallet })
}
```

### Pattern 4: Paginated Transactions Query
**What:** Translate existing Supabase pagination range (`from`, `to`) to Drizzle `limit`/`offset`.

```typescript
import { eq, and, desc, gte, lte } from 'drizzle-orm'
import { transactions } from '@/db/schema'

const page = parseInt(searchParams.get('page') ?? '0', 10)
const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
const offset = page * limit

const rows = await db.select()
  .from(transactions)
  .where(eq(transactions.userId, user.id))
  .orderBy(desc(transactions.createdAt))
  .limit(limit)
  .offset(offset)
```

### Pattern 5: drizzle.config.ts
Required for `drizzle-kit pull` to introspect existing DB schema.

```typescript
// drizzle.config.ts (root level)
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

### Anti-Patterns to Avoid
- **Using postgres-js or node-postgres**: These use persistent TCP connections, unsuitable for serverless API routes. The neon-http adapter uses HTTP and is stateless.
- **Creating db instance inside request handler**: Creates a new connection per request. Always use a module-level singleton.
- **Omitting `{ mode: 'number' }` on bigint columns**: Drizzle bigint returns JS `BigInt` by default. Existing TypeScript types use `number`. Add `{ mode: 'number' }` to all bigint columns.
- **Skipping explicit `user_id` filter**: Drizzle bypasses RLS. A missing `where eq(userId, user.id)` would leak all users' data.
- **Importing drizzle-kit at runtime**: drizzle-kit is a dev tool only. Never import it in API routes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Type-safe SQL queries | Raw SQL strings or template literals | Drizzle `db.select().from().where()` | Compile-time type errors, no SQL injection |
| Pagination | Manual slice/splice | `limit()` + `offset()` | Standard SQL, correct edge cases |
| Schema introspection | Reading SQL file manually | `npx drizzle-kit pull` | Generates correct TypeScript schema from live DB |
| Auth user isolation | Middleware or custom guards | Explicit `eq(table.userId, user.id)` in every query | Simple, auditable, no magic |

**Key insight:** The existing non-demo Supabase query paths in wallet and transactions routes are already correct in logic — Drizzle replacement is a direct translation, not a redesign.

## Common Pitfalls

### Pitfall 1: Supabase Pooler Requires Transaction Mode — Wrong for neon-http
**What goes wrong:** Supabase's connection pooler (Supavisor) in Transaction mode doesn't support prepared statements. With postgres-js this means `{ prepare: false }` is required.
**Why it happens:** Confusion between connection modes.
**How to avoid:** Using `drizzle-orm/neon-http` sidesteps this entirely — neon-http uses plain HTTP calls, not TCP connections or prepared statements at all. No `{ prepare: false }` needed.
**Warning signs:** If you see "prepared statement not supported" errors, you are accidentally using postgres-js instead of neon-http.

### Pitfall 2: bigint Type Mismatch
**What goes wrong:** Drizzle's `bigint()` column returns JavaScript `BigInt` type by default. Existing code uses `number` (e.g., `wallet.balance / 100` arithmetic fails with BigInt).
**Why it happens:** Drizzle follows PostgreSQL's bigint type strictly by default.
**How to avoid:** Define all bigint columns with `{ mode: 'number' }` in schema.ts. This tells Drizzle to return a JS number instead of BigInt.
**Warning signs:** TypeScript error "Operator '/' cannot be applied to types 'bigint' and 'number'" in currency formatting code.

### Pitfall 3: Missing DATABASE_URL Environment Variable
**What goes wrong:** Supabase provides `NEXT_PUBLIC_SUPABASE_URL` but Drizzle needs the raw PostgreSQL connection string (DATABASE_URL).
**Why it happens:** The Supabase URL is the REST API URL, not the database connection string.
**How to avoid:** Add `DATABASE_URL` to `.env.local`. Get it from Supabase dashboard: Project Settings → Database → Connection string → URI (use the Transaction pooler URI: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`).
**Warning signs:** `neon()` constructor throws "Invalid connection string" or similar at startup.

### Pitfall 4: Drizzle Schema Column Name vs JS Property Name Mismatch
**What goes wrong:** SQL column is `user_id`, Drizzle maps it to camelCase `userId` by default when you name it that way. Using wrong case in `where()` clause causes type errors or missed results.
**Why it happens:** Drizzle table property names are what you declare, not auto-camelCased from SQL names.
**How to avoid:** Always pass the SQL column name as the first string argument to column definitions: `uuid('user_id')`. Then use the JS property name (`userId`) in queries.
**Warning signs:** Query returns empty array when data clearly exists, or TypeScript complains about unknown property.

### Pitfall 5: Card Page is a Client Component — Cannot Call Drizzle Directly
**What goes wrong:** The card page (`page.tsx`) is `"use client"` — it cannot import or call `db` directly.
**Why it happens:** Drizzle requires Node.js/server context; client components run in the browser.
**How to avoid:** Create `/api/cards` route handler that calls Drizzle, then fetch from the client page with `useEffect`/`fetch` or SWR (already installed).
**Warning signs:** Build error "Cannot use import statement in a Client Component" if you try to import drizzle-orm in the card page.

## Code Examples

### Wallet Route — Drizzle Version
```typescript
// src/app/api/wallet/route.ts (Drizzle replacement)
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { wallets, userProfiles } from '@/db/schema'
import { NextResponse } from 'next/server'
import { isDemoMode, DEMO_WALLET, DEMO_PROFILE } from '@/lib/demo'

export async function GET() {
  if (isDemoMode) { /* existing demo branch unchanged */ }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [walletRows, profileRows] = await Promise.all([
    db.select({
      id: wallets.id,
      balance: wallets.balance,
      currency: wallets.currency,
      maxTopup: wallets.maxTopup,
    }).from(wallets).where(eq(wallets.userId, user.id)).limit(1),
    db.select({
      firstName: userProfiles.firstName,
      walletId: userProfiles.walletId,
    }).from(userProfiles).where(eq(userProfiles.id, user.id)).limit(1),
  ])

  const wallet = walletRows[0] ?? null
  const profile = profileRows[0]

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 500 })
  }

  return NextResponse.json({ wallet, profile })
}
```

### Cards API Route (New)
```typescript
// src/app/api/cards/route.ts
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { cards } from '@/db/schema'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userCards = await db.select().from(cards).where(eq(cards.userId, user.id))
  return NextResponse.json({ cards: userCards })
}
```

### PATCH /api/cards/[id] — Freeze Toggle
```typescript
// The card page has a freeze toggle that currently uses local state only.
// Phase 18 scope: read card data. Freeze persistence is a separate concern.
// Pattern: PATCH /api/cards/[id] can be added as a future enhancement.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Supabase `from('table').select()` | Drizzle `db.select().from(table)` | Phase 18 | Type-safe at compile time; IDE autocomplete on column names |
| Hardcoded MOCK_CARD_NUMBER | DB read from `cards` table | Phase 18 | Actual user card data; supports real card issuance later |
| `isDemoMode` branches remain | Demo branches kept; real path uses Drizzle | Phase 18 (demo removal is Phase 22) | Incremental migration — demo still works during transition |

**Note on drizzle-kit pull vs manual schema:** The locked decision is to write `schema.ts` manually mirroring supabase-schema.sql. This is preferred because: (1) the SQL schema has `auth.users` foreign key reference which drizzle-kit pull may not handle cleanly for Supabase, (2) we want control over column naming (camelCase properties), (3) we only need the 4 tables for this phase (wallets, transactions, user_profiles, cards).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime for neon-http | ✓ | (darwin) | — |
| npm | Package installation | ✓ | (in PATH) | — |
| DATABASE_URL env var | Drizzle db connection | Unknown | — | Must be set from Supabase dashboard; no fallback |
| drizzle-orm | Data queries | ✗ (not yet installed) | — | Install per plan |
| drizzle-kit | Schema tooling | ✗ (not yet installed) | — | Install per plan |
| @neondatabase/serverless | HTTP transport | ✗ (not yet installed) | — | Install per plan |

**Missing dependencies with no fallback:**
- `DATABASE_URL` — must be added to `.env.local` manually. Get from: Supabase Dashboard → Settings → Database → Connection string → URI (Transaction pooler, port 6543). Not in `.env.local.example` yet — plan must include adding the variable there.

**Missing dependencies with fallback:**
- None (all packages are installable via npm)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | vitest.config.ts (root) |
| Quick run command | `npm test -- --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | Wallet route returns balance/currency from DB | unit | `npm test -- src/app/api/wallet` | ❌ Wave 0 |
| DATA-02 | Transaction route paginates correctly | unit | `npm test -- src/app/api/transactions` | ❌ Wave 0 |
| DATA-06 | Cards route returns card data per user | unit | `npm test -- src/app/api/cards` | ❌ Wave 0 |

**Note:** All three routes use async Server-side logic and Drizzle. Tests should mock `@/db` and `@/lib/supabase/server` modules to avoid real DB calls in unit tests.

### Sampling Rate
- **Per task commit:** `npm test -- --reporter=dot` (fast smoke check)
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/app/api/wallet/__tests__/route.test.ts` — covers DATA-01, mocks `@/db` and Supabase client
- [ ] `src/app/api/transactions/__tests__/route.test.ts` — covers DATA-02, tests pagination params
- [ ] `src/app/api/cards/__tests__/route.test.ts` — covers DATA-06, new endpoint
- [ ] `src/db/__tests__/schema.test.ts` — optional sanity check that schema exports exist and have expected column names

## Open Questions

1. **DATABASE_URL Pooler vs Direct Connection**
   - What we know: Transaction pooler (port 6543) is recommended for serverless; neon-http sidesteps the prepared-statement issue
   - What's unclear: Whether Supabase's pooler URL works identically to Neon's connection string with @neondatabase/serverless
   - Recommendation: Use the Transaction pooler URI from Supabase dashboard. If connection issues occur, try the Session pooler (port 5432) — neon-http works with both since it doesn't use persistent connections.

2. **Card Page Freeze Toggle — Persist to DB or Local State Only?**
   - What we know: Phase 18 scope is reads only (DATA-06 says "reads from cards table"); freeze persistence is not listed in requirements
   - What's unclear: Whether the is_frozen column should be writable in this phase
   - Recommendation: Phase 18 reads `is_frozen` from DB as initial state; keep local toggle behavior for UI responsiveness; defer PATCH endpoint to Phase 19 or later.

3. **recipients join in /api/transactions**
   - What we know: Current Supabase query does `select('*, recipients(*)')` for a join. Drizzle can do this via leftJoin.
   - What's unclear: Whether the recipient join is needed for the current UI consumers
   - Recommendation: Keep the join for the full transaction fetch by ID; for the paginated list, skip the join (same as /api/wallet/transactions which selects only 6 columns). The plan should spec this per endpoint.

## Sources

### Primary (HIGH confidence)
- https://orm.drizzle.team/docs/get-started/supabase-new — Supabase + Drizzle adapter selection; postgres-js approach documented
- https://orm.drizzle.team/docs/connect-neon — neon-http initialization syntax verified
- https://orm.drizzle.team/docs/sql-schema-declaration — pgTable column type syntax verified
- https://orm.drizzle.team/docs/select — select/where/orderBy/limit/offset API verified
- https://orm.drizzle.team/docs/rqb — relational query API syntax
- https://orm.drizzle.team/docs/drizzle-kit-pull — drizzle-kit pull command
- npm registry: drizzle-orm@0.45.2, drizzle-kit@0.31.10, @neondatabase/serverless@1.0.2 — version verified 2026-04-15

### Secondary (MEDIUM confidence)
- Codebase inspection: src/app/api/wallet/route.ts, src/app/api/transactions/route.ts — confirmed existing non-demo Supabase query paths are correct and can serve as Drizzle translation reference
- .planning/supabase-schema.sql — full schema reviewed; all tables for DATA-01/02/06 present with correct column types

### Tertiary (LOW confidence)
- Supabase pooler compatibility with @neondatabase/serverless: not directly tested in this research. Confidence: MEDIUM based on neon-http using HTTP (not TCP) which avoids pooler mode restrictions.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm versions verified, adapter choice confirmed via official Drizzle docs
- Architecture: HIGH — patterns derived from official Drizzle docs + codebase inspection
- Pitfalls: HIGH — bigint mode issue and user_id filter requirements are documented in Drizzle docs; pooler/prepared statement issue comes from Supabase docs

**Research date:** 2026-04-15
**Valid until:** 2026-07-15 (Drizzle 0.x — moderate churn; check for 1.0 release)
