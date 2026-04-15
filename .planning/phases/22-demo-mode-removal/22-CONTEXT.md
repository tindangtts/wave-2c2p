# Phase 22: Demo Mode Removal - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — smart discuss skipped)

<domain>
## Phase Boundary

Delete src/lib/demo.ts entirely. Remove all isDemoMode imports and conditional branches from every file in the codebase. After this phase: zero references to DEMO_MODE, isDemoMode, or demo.ts. The app runs exclusively on Supabase data. npm run build must pass with DEMO_MODE unset.

</domain>

<decisions>
## Implementation Decisions

### Removal Strategy
- Delete src/lib/demo.ts
- For each API route: remove `import { isDemoMode, ... } from '@/lib/demo'` and the `if (isDemoMode) { ... }` branch
- For non-API files (proxy.ts, middleware.ts, page.tsx): remove isDemoMode checks
- Remove DEMO_MODE from .env.local.example
- Verify: grep -r "isDemoMode\|DEMO_MODE\|demo\.ts" src/ returns zero matches

### Claude's Discretion
All implementation choices at Claude's discretion. The task is mechanical — find and remove all demo branches. The non-demo Supabase/Drizzle paths are already functional from Phases 18-21.

</decisions>

<code_context>
## Existing Code Insights

### Files to Clean
- src/lib/demo.ts — DELETE entirely
- ~30+ API routes under src/app/api/ that import isDemoMode
- src/proxy.ts — has isDemoMode redirect logic
- src/lib/supabase/middleware.ts — may have demo checks
- src/app/page.tsx — may have demo redirect
- .env.local.example — remove DEMO_MODE line

### Established Patterns
- Every API route follows: `if (isDemoMode) { return mock } else { real Drizzle query }`
- Removing the if branch leaves just the Drizzle path
- Some routes may need the demo data constants removed from inline usage too

</code_context>

<specifics>
## Specific Ideas

No specific requirements — mechanical removal task.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
