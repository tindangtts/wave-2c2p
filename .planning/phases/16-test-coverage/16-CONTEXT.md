# Phase 16: Test Coverage - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Critical auth, currency, and transfer code paths are verified by automated tests so regressions are caught before deployment. Covers: Vitest + RTL setup, Zod schema unit tests, currency formatter tests, form component RTL tests, and Playwright E2E tests for registration and transfer flows.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure testing infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key constraints from CLAUDE.md:
- Vitest for unit + integration tests (ESM, TypeScript, JSX native)
- React Testing Library for component tests
- Playwright for E2E tests against localhost:3000
- Mock Supabase client for unit tests (not real Supabase)
- async Server Components cannot be unit tested with Vitest (React limitation) — use Playwright
- Synchronous Server Components and all Client Components: test with Vitest + RTL

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Zod schemas in src/lib/ and src/stores/ (auth, transfer, wallet, KYC)
- Currency formatting utilities
- Form components: registration steps, recipient form, amount entry
- Demo mode bypass pattern for testing

### Established Patterns
- react-hook-form + zod for form validation
- Zustand stores for state management
- SWR for data fetching

### Integration Points
- vitest.config.ts — new file
- playwright.config.ts — new file
- package.json scripts: test, test:e2e
- __tests__/ or *.test.ts files

</code_context>

<specifics>
## Specific Ideas

No specific requirements — testing infrastructure phase.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
