# Phase 17: Features & Polish - Research

**Researched:** 2026-04-15
**Domain:** PDF generation (jsPDF), spending limits API (Supabase user_profiles), Next.js App Router client components
**Confidence:** HIGH (stack/patterns verified against codebase), MEDIUM (jsPDF font embedding for Thai/Myanmar)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
None — all choices are at Claude's discretion.

### Claude's Discretion
All implementation choices are at Claude's discretion. Key constraints:
- PDF generation: use jsPDF or similar lightweight library
- Statement download integrates with existing transaction history page (date range filter already exists)
- Spending limits: API route (GET/PATCH) + profile menu entry + screen with tier selector
- Follow existing page patterns (BackHeader, mobile-first 430px, shadcn/ui components)
- i18n support for all 3 languages (en/th/mm)

### Deferred Ideas (OUT OF SCOPE)
None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FEAT-01 | User can download transaction statement as PDF for a date range | jsPDF 4.2.1 client-side generation; existing date range state in history page; transactions API already supports dateFrom/dateTo filters; download via URL.createObjectURL(blob) |
| FEAT-02 | User can view and edit personal spending limits from profile | New spending_limits columns on user_profiles (or separate table); existing PATCH pattern from recipients/[id]; profile page already uses ProfileMenuItem; SWR for data fetching |
</phase_requirements>

---

## Summary

Phase 17 delivers two standalone features that extend existing pages: a PDF transaction statement download (FEAT-01) and a user-configurable spending limits screen (FEAT-02). Both are additive — they do not touch existing flows, just extend them.

For FEAT-01, the transaction history page already holds date range state (`dateRange.from` / `dateRange.to`) and passes them to the `/api/transactions` route which already accepts `dateFrom`/`dateTo` filters. The plan is to add a "Download PDF" button that fetches all transactions for the selected range (no pagination), builds a PDF client-side with jsPDF, and triggers a browser download. The critical constraint is that jsPDF does not render Thai or Myanmar script with its built-in fonts — custom TTF font embedding is required. The recommended approach is to use English labels in the PDF (locale-independent template) and fall back to transliterated ASCII for names — this avoids the 500KB+ font embedding cost per language. If i18n in the PDF is a hard requirement, Noto Sans Thai and Noto Sans Myanmar TTF files must be base64-encoded and embedded at build time.

For FEAT-02, the user_profiles table has no daily_limit or monthly_limit columns. A SQL migration adding two nullable bigint columns (in satang — matching the monetary convention) is required before the API routes can be built. The profile page's Settings section already has a "Manage Personal Limitation" entry pointing to `/profile/limits-fees` (a static read-only page). The plan renames or extends this into an editable `/profile/spending-limits` screen with a tier selector.

**Primary recommendation:** Use jsPDF 4.2.1 with English-only PDF labels (no custom font embedding) for FEAT-01. Add `daily_limit_satang` and `monthly_limit_satang` bigint columns to `user_profiles` for FEAT-02. Follow the notifications API (GET + PATCH) as the reference pattern for the spending limits API.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| jsPDF | 4.2.1 (latest) | Client-side PDF generation | CONTEXT.md prescription; lightweight; no server cost; 'use client' component |
| SWR | already installed | Spending limits data fetching | Established pattern for all data hooks in this project |
| Supabase (server client) | already installed | Spending limits GET/PATCH in API route | Established pattern |
| date-fns | already installed | Date formatting in PDF header | Already used in history page |
| next-intl | ^4.9.1 (installed) | i18n strings for UI (not PDF content) | Established project i18n |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jsPDF-AutoTable | bundled with jsPDF | Table layout in PDF | Use for the transactions table rows |
| Zod v4 | already installed | Spending limits PATCH body validation | All API route validation uses Zod |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jsPDF (client) | @react-pdf/renderer | react-pdf is heavier (~350KB), requires RSC-safe dynamic import, more suited to complex layouts |
| jsPDF (client) | Puppeteer (server) | Puppeteer requires headless Chrome, not viable in Vercel serverless functions |
| jsPDF (client) | html2canvas + jsPDF | html2canvas produces raster images inside PDF — large file size, no text selection |

**Installation:**
```bash
npm install jspdf
```
Note: jsPDF-AutoTable is bundled with jsPDF 4.x and does not need a separate install.

**Version verification:** `npm view jspdf version` → confirmed `4.2.1` as of 2026-04-15.

---

## Architecture Patterns

### Recommended Project Structure (additions only)
```
src/
├── app/
│   ├── api/
│   │   └── spending-limits/
│   │       └── route.ts          # GET + PATCH for user spending limits
│   └── (main)/
│       └── profile/
│           └── spending-limits/
│               └── page.tsx      # New screen: tier selector
├── components/
│   └── features/
│       └── statement-download-button.tsx  # Download PDF button for history page
├── hooks/
│   └── use-spending-limits.ts    # SWR hook for spending limits
└── lib/
    └── pdf/
        └── generate-statement.ts # jsPDF document builder
```

### Pattern 1: jsPDF Client-Side Download (FEAT-01)

**What:** Build a PDF in the browser from transaction data; trigger native download.
**When to use:** User taps "Download Statement" on history page with a date range selected.

```typescript
// src/lib/pdf/generate-statement.ts
// Dynamic import required — jsPDF must NOT run during SSR
export async function generateStatement(
  transactions: Transaction[],
  dateFrom: string,
  dateTo: string
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Header
  doc.setFontSize(16)
  doc.text('2C2P Wave — Transaction Statement', 20, 20)
  doc.setFontSize(10)
  doc.text(`Period: ${dateFrom} – ${dateTo}`, 20, 30)

  // Table rows — use doc.autoTable() from the bundled AutoTable plugin
  // Amounts: use formatCurrency() from src/lib/currency.ts for display values
  // ...

  // Trigger download — no server needed
  doc.save(`statement-${dateFrom}-${dateTo}.pdf`)
}
```

**Key constraints:**
- Must be called inside a client event handler (click), not during render — jsPDF uses `window`/`document`.
- Use `dynamic import('jspdf')` to prevent SSR bundle inclusion.
- Do NOT use `html2canvas` — produces raster-only PDFs with no text search/copy.
- The `doc.save()` method uses `URL.createObjectURL` internally — works in all modern browsers and PWA context.

### Pattern 2: Fetch All Transactions for Date Range Before PDF Build

**What:** The existing `/api/transactions` route supports `dateFrom`/`dateTo` but returns paginated results. The PDF needs all records in range, not paginated.

**Options:**
1. Add `limit=1000` param to the existing endpoint (simple, no new route).
2. Add a dedicated `/api/statement` route that fetches all and returns JSON (cleaner separation).

**Recommendation:** Option 2 — a dedicated `/api/statement` route. This avoids polluting the paginated endpoint with a bypass flag and makes the statement data contract explicit. The route signature mirrors `/api/transactions` but omits pagination and returns `{ transactions: Transaction[] }` directly.

```typescript
// src/app/api/statement/route.ts  
// GET /api/statement?dateFrom=2026-01-01&dateTo=2026-01-31
// Returns all transactions for authenticated user in range (max 500 rows)
```

### Pattern 3: Spending Limits API — GET + PATCH (FEAT-02)

**What:** Read and update daily/monthly limits stored on user_profiles.
**Pattern reference:** `src/app/api/notifications/route.ts` (GET + PATCH on authenticated user's own data).

```typescript
// src/app/api/spending-limits/route.ts
// GET  — returns { daily_limit_satang, monthly_limit_satang }
// PATCH — body: { daily_limit_satang?: number, monthly_limit_satang?: number }
//          Validates against allowed tier values
//          Updates user_profiles row for auth.uid()
```

Demo mode: return static DEMO_SPENDING_LIMITS object on GET; return `{ success: true }` on PATCH.

### Pattern 4: Spending Limits DB Migration

The `user_profiles` table has no limit columns. A SQL migration is required before the API works.

```sql
-- Add to Supabase SQL Editor (idempotent with IF NOT EXISTS)
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS daily_limit_satang bigint DEFAULT 5000000,   -- 50,000 THB
  ADD COLUMN IF NOT EXISTS monthly_limit_satang bigint DEFAULT 20000000; -- 200,000 THB
```

Default values match the existing static display in `limits-fees/page.tsx` (50,000 THB daily, 200,000 THB monthly).

### Pattern 5: Spending Limits Screen — Tier Selector

**What:** A new `'use client'` page at `/profile/spending-limits` using BackHeader + shadcn/ui Select or radio group to pick a tier.

**Tier structure (Claude's discretion — reasonable defaults):**

| Tier | Daily (THB) | Monthly (THB) |
|------|-------------|---------------|
| Basic | 10,000 | 50,000 |
| Standard | 30,000 | 100,000 |
| Premium | 50,000 | 200,000 |

Store as satang (multiply display by 100). Display with `formatCurrency` from `src/lib/currency.ts`.

### Anti-Patterns to Avoid

- **`html2canvas` + jsPDF:** Produces a screenshot image embedded in the PDF. Text is unselectable, file size is 5-10x larger, and it breaks on non-Latin scripts.
- **Server-side PDF in Route Handler:** Puppeteer requires a headless Chromium binary; Vercel serverless functions do not support it without `@sparticuz/chromium`. Use client-side jsPDF instead.
- **SSR import of jsPDF:** `import { jsPDF } from 'jspdf'` at module top level in a Server Component or layout will throw because jsPDF references `window`. Always dynamic-import inside an event handler or a client component effect.
- **Embedding full Noto Thai + Myanmar fonts:** Each is ~300-500KB base64. Combined they add ~1MB to the initial JS bundle even with dynamic import chunking. Use English-only PDF labels and ASCII-safe formatting unless i18n in PDF is explicitly required.
- **Reusing the paginated `/api/transactions` route for PDF:** The paginated route returns 20 rows. The PDF needs all rows for the range. Use the dedicated `/api/statement` route.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF table layout | Custom row/column calculations | jsPDF AutoTable plugin (bundled) | AutoTable handles column widths, row overflow, page breaks automatically |
| PDF file download trigger | Manual blob assembly | `doc.save(filename)` | jsPDF handles Blob + createObjectURL + anchor click internally |
| Currency display in PDF | Custom number formatter | `formatCurrency()` from `src/lib/currency.ts` | Already handles satang→baht/kyat with correct decimal places |
| Date formatting for PDF header | Custom date string | `format(date, 'dd MMM yyyy')` from date-fns | Already installed and used throughout the app |

---

## Common Pitfalls

### Pitfall 1: jsPDF SSR Import Crash
**What goes wrong:** Importing jsPDF at module level in any component or hook causes a build error or runtime crash: `ReferenceError: window is not defined`.
**Why it happens:** jsPDF v4 references browser globals at import time.
**How to avoid:** Always use `const { jsPDF } = await import('jspdf')` inside an async function that runs client-side (event handler or `useEffect`). Never import at module top level.
**Warning signs:** Build output shows `ReferenceError: window is not defined` during `next build`.

### Pitfall 2: jsPDF AutoTable Not Found
**What goes wrong:** `doc.autoTable is not a function` at runtime.
**Why it happens:** AutoTable registers itself via side-effect import. You must import it after jsPDF to register the plugin.
**How to avoid:**
```typescript
const { jsPDF } = await import('jspdf')
await import('jspdf-autotable') // registers doc.autoTable side effect
```
**Warning signs:** Runtime error on PDF download button click.

### Pitfall 3: Thai/Myanmar Characters Render as Boxes
**What goes wrong:** Transaction descriptions or recipient names containing Thai or Myanmar Unicode characters appear as empty rectangles in the PDF.
**Why it happens:** jsPDF's built-in 14 standard PDF fonts (Helvetica, Times, Courier etc.) only cover Latin-1 code points. Complex scripts require embedded TTF fonts.
**How to avoid:** One of:
1. (Recommended) Pre-process text through a transliteration or trim-to-ASCII function before adding to PDF. Keep headers/labels in English.
2. (Heavy) Embed Noto Sans Thai + Noto Sans Myanmar UI TTF as base64 strings and call `doc.addFileToVFS()` + `doc.addFont()` before rendering. Font files must be pre-converted via [jsPDF Font Converter](https://peckconsulting.s3.amazonaws.com/fontconverter/fontconverter.html).
**Warning signs:** Rendered PDF shows □□□□ for non-Latin content.

### Pitfall 4: Missing user_profiles Columns — API Returns Null
**What goes wrong:** `GET /api/spending-limits` returns `{ daily_limit_satang: null, monthly_limit_satang: null }` because the columns don't exist yet.
**Why it happens:** The SQL migration has not been applied to Supabase.
**How to avoid:** Plan 17-02 Wave 0 must include the SQL migration step. API should return defaults when columns are null (falls back to `DEMO_SPENDING_LIMITS` values).
**Warning signs:** UI shows undefined/NaN in limit display fields.

### Pitfall 5: Profile Page Has Two Limit-Related Menu Items
**What goes wrong:** The profile page has BOTH `menu.manageLimit` → `/profile/limits-fees` (Settings section) AND `menu.limitsFees` → `/profile/limits-fees` (Help & Support section). Adding a new spending limits screen requires deciding which entry to modify/add to and whether to keep or deprecate the static page.
**Why it happens:** The static `/profile/limits-fees` page shows regulatory transfer limits and fees (read-only system data). The new spending limits screen shows user-adjustable personal limits. These are different concepts.
**How to avoid:** Keep `/profile/limits-fees` (static fees). Add a new `/profile/spending-limits` route. Update the `menu.manageLimit` entry in the Settings section to point to the new `/profile/spending-limits` route. The "Limits and Fees" entry in Help & Support continues to point to the static page.
**Warning signs:** Users navigate to the wrong page; confusion between system fees and personal limits.

### Pitfall 6: PDF Download Blocked in PWA / iOS Safari
**What goes wrong:** `doc.save()` triggers a file download that is blocked by iOS Safari PWA or intercepted by the service worker.
**Why it happens:** iOS Safari PWA has restrictions on automatic file downloads; Serwist's NetworkFirst strategy may interfere with blob URLs.
**How to avoid:** Use `doc.output('blob')` + `URL.createObjectURL(blob)` + anchor click with `download` attribute as a fallback if `doc.save()` fails. Test specifically in installed PWA on iOS.
**Warning signs:** Tap download button → nothing happens on iOS.

---

## Code Examples

### jsPDF Dynamic Import + AutoTable (Statement Generation)
```typescript
// Source: jsPDF GitHub + jsPDF docs (https://artskydj.github.io/jsPDF/docs/jsPDF.html)
// Must run inside 'use client' component event handler

async function downloadStatement(transactions: Transaction[], from: string, to: string) {
  const { jsPDF } = await import('jspdf')
  await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Header
  doc.setFontSize(14)
  doc.text('2C2P Wave — Transaction Statement', 14, 18)
  doc.setFontSize(9)
  doc.text(`Period: ${from} to ${to}`, 14, 26)
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 31)

  // Table
  ;(doc as any).autoTable({
    startY: 38,
    head: [['Date', 'Description', 'Type', 'Amount (THB)', 'Status']],
    body: transactions.map((tx) => [
      format(new Date(tx.created_at), 'dd MMM yyyy'),
      tx.description,
      tx.type,
      formatCurrency(tx.amount, 'THB'),
      tx.status,
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 230, 0], textColor: [33, 33, 33] },
  })

  doc.save(`statement-${from}-${to}.pdf`)
}
```

### Spending Limits API — GET Pattern
```typescript
// Source: Existing notifications route pattern (src/app/api/notifications/route.ts)
// GET /api/spending-limits
export async function GET() {
  if (isDemoMode) {
    return NextResponse.json({ daily_limit_satang: 5000000, monthly_limit_satang: 20000000 })
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await supabase
    .from('user_profiles')
    .select('daily_limit_satang, monthly_limit_satang')
    .eq('id', user.id)
    .single()
  return NextResponse.json({
    daily_limit_satang: data?.daily_limit_satang ?? 5000000,
    monthly_limit_satang: data?.monthly_limit_satang ?? 20000000,
  })
}
```

### SWR Hook for Spending Limits
```typescript
// Source: Established project pattern (src/hooks/use-transactions.ts)
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useSpendingLimits() {
  const { data, isLoading, mutate } = useSWR('/api/spending-limits', fetcher)
  return {
    dailyLimitSatang: data?.daily_limit_satang ?? 5000000,
    monthlyLimitSatang: data?.monthly_limit_satang ?? 20000000,
    isLoading,
    mutate,
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jsPDF 2.x separate autotable install | jsPDF 4.x bundles autotable | ~v3.0 | No separate `npm install jspdf-autotable` needed; still need side-effect import |
| jsPDF `doc.addFont(base64)` string | `doc.addFileToVFS(name, base64)` + `doc.addFont()` | v2.0+ | Two-step custom font registration |

**Deprecated/outdated:**
- `html2canvas` + jsPDF combo: Still works but produces raster PDFs. Prefer table-based text PDF for statements.
- `next-pwa` dynamic PDF serving: Not applicable — pure client-side generation.

---

## Open Questions

1. **i18n content in PDF (Thai/Myanmar scripts in descriptions)**
   - What we know: jsPDF 4.2.1 requires custom embedded TTF fonts for any non-Latin script. Each font file is ~300-500KB base64 encoded.
   - What's unclear: Whether transaction descriptions will contain Thai/Myanmar characters in production (recipient names, bank names).
   - Recommendation: Default to English-only PDF labels. Add a code comment explaining the font embedding path if localized PDFs are needed in a future phase.

2. **Spending limits tier enforcement vs. UI-only**
   - What we know: The PATCH API can validate that submitted values match allowed tiers. The existing daily limit acknowledgment (Phase 9, COMP-03) shows the user fixed transfer limits.
   - What's unclear: Whether these personal spending limits should override or be capped by regulatory limits. The static limits-fees page shows 50,000 THB daily / 200,000 THB monthly as system caps.
   - Recommendation: Personal spending limits should be ≤ the system cap. PATCH validation: `daily_limit_satang` must be in the allowed tier list AND ≤ 5,000,000 satang (50,000 THB). Monthly ≤ 20,000,000 satang.

---

## Environment Availability

Step 2.6: SKIPPED — Phase is purely client/server code changes. No new CLI tools, databases, or external services beyond already-running Supabase (local or hosted) and npm registry.

The only "new" dependency is jsPDF, which installs from npm. No external service availability to audit.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x + React Testing Library |
| Config file | `vitest.config.ts` (root, jsdom environment) |
| Quick run command | `npm test` |
| Full suite command | `npm test -- --run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FEAT-01 | `generateStatement()` returns a PDF blob for a given transaction array and date range | unit | `npm test -- src/lib/pdf/generate-statement.test.ts` | ❌ Wave 0 |
| FEAT-01 | Download button appears when date range is selected; triggers download call | unit (RTL) | `npm test -- src/components/features/statement-download-button.test.tsx` | ❌ Wave 0 |
| FEAT-02 | `GET /api/spending-limits` returns `{ daily_limit_satang, monthly_limit_satang }` in demo mode | unit | `npm test -- src/app/api/spending-limits/__tests__/route.test.ts` | ❌ Wave 0 |
| FEAT-02 | `PATCH /api/spending-limits` rejects invalid tier values with 400 | unit | `npm test -- src/app/api/spending-limits/__tests__/route.test.ts` | ❌ Wave 0 |
| FEAT-02 | Spending limits screen shows current limits and tier selector | unit (RTL) | `npm test -- src/app/(main)/profile/spending-limits/__tests__/page.test.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --run` (full suite, fast ~15s)
- **Per wave merge:** `npm test -- --run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/pdf/generate-statement.test.ts` — covers FEAT-01 PDF builder unit test
- [ ] `src/components/features/statement-download-button.test.tsx` — covers FEAT-01 download button RTL
- [ ] `src/app/api/spending-limits/__tests__/route.test.ts` — covers FEAT-02 API GET + PATCH
- [ ] `src/app/(main)/profile/spending-limits/__tests__/page.test.tsx` — covers FEAT-02 UI render

Note: `jsPDF` must be mocked in Vitest tests — it references `window` internally and the real implementation would need full browser environment. Mock pattern: `vi.mock('jspdf', () => ({ jsPDF: vi.fn().mockReturnValue({ text: vi.fn(), save: vi.fn(), autoTable: vi.fn() }) }))`.

---

## Sources

### Primary (HIGH confidence)
- Codebase audit — `src/app/(main)/history/page.tsx`, `src/app/api/transactions/route.ts`, `src/app/(main)/profile/page.tsx`, `src/app/api/notifications/route.ts`, `src/types/index.ts`, `src/lib/currency.ts`, `src/lib/demo.ts`, `.planning/supabase-schema.sql` — all read directly
- npm registry — `npm view jspdf version` → `4.2.1` confirmed 2026-04-15

### Secondary (MEDIUM confidence)
- [jsPDF GitHub (parallax/jsPDF)](https://github.com/parallax/jsPDF) — API reference, AutoTable integration, custom font pattern
- [jsPDF Documentation](https://artskydj.github.io/jsPDF/docs/jsPDF.html) — constructor options, `addFileToVFS`, `addFont`
- [How To Use Custom Fonts (Thai) With jsPDF — naiwaen.debuggingsoft.com (2025)](https://naiwaen.debuggingsoft.com/2024/12/how-to-use-custom-fonts-such-as-thai-with-jspdf/) — Thai script embedding process confirmed
- [jsPDF npm page](https://www.npmjs.com/package/jspdf) — version and install confirmation

### Tertiary (LOW confidence)
- [jsPDF Unicode Languages Support Issue #2093](https://github.com/parallax/jsPDF/issues/2093) — Myanmar/Thai rendering limitation via community reports

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — jsPDF version verified from npm; all other libraries already installed and in use
- Architecture: HIGH — all patterns derived directly from existing codebase (notifications, recipients PATCH, SWR hooks)
- Pitfalls: HIGH for SSR/font/profile-menu pitfalls (verified from code reading); MEDIUM for iOS PWA download (iOS-specific, not testable locally)
- DB migration: HIGH — user_profiles table schema read directly; columns confirmed absent

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (jsPDF 4.2.1 is current; library is stable)
