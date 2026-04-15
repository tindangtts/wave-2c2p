# Phase 16: Test Coverage - Research

**Researched:** 2026-04-15
**Domain:** Vitest + React Testing Library + Playwright on Next.js 16 / React 19
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Vitest for unit + integration tests (ESM, TypeScript, JSX native)
- React Testing Library for component tests
- Playwright for E2E tests against localhost:3000
- Mock Supabase client for unit tests (not real Supabase)
- async Server Components cannot be unit tested with Vitest (React limitation) — use Playwright
- Synchronous Server Components and all Client Components: test with Vitest + RTL

### Claude's Discretion
All implementation choices are at Claude's discretion — pure testing infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

### Deferred Ideas (OUT OF SCOPE)
None.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TEST-01 | Vitest unit tests cover Zod schemas (auth, transfer, wallet, KYC) | Schemas exist in src/lib/auth/schemas.ts, src/lib/transfer/schemas.ts, src/lib/wallet/schemas.ts, src/lib/kyc/schemas.ts. Auth schemas partially tested already (schemas.test.ts). Transfer/wallet/KYC schemas have no tests yet. |
| TEST-02 | Vitest unit tests cover currency formatting edge cases (THB/MMK) | currency.test.ts already exists and passes. Needs locale-switching edge cases and formatCurrency negative/large-number cases added. |
| TEST-03 | Vitest + RTL tests cover form components (registration, recipient, amount) | All form pages are 'use client' Client Components — testable with RTL. Requires jsdom environment, @testing-library/react, next-intl mock, next/navigation mock, zustand store mock. |
| TEST-04 | Playwright E2E test covers registration → KYC happy path | DEMO_MODE=true in .env.local bypasses Supabase. proxy.ts applies auth guards via Supabase updateSession — must confirm demo mode bypasses guards. |
| TEST-05 | Playwright E2E test covers transfer confirmation → receipt happy path | Transfer store populated by prior steps; confirm + receipt pages are 'use client'. DEMO_MODE=true needed. Requires running dev server at localhost:3000. |
</phase_requirements>

---

## Summary

Phase 16 adds automated test coverage to a Next.js 16 + React 19 project that already has a partial Vitest setup. The vitest.config.ts exists (node environment, @/ alias) but has no React/JSX transform and no jsdom — it works for pure TS unit tests but will fail on component tests. Four test files already pass (44 tests): currency, auth schemas, passcode, and bank-accounts route.

The work splits cleanly into three layers: (1) pure unit tests for Zod schemas and currency formatters using the existing node environment, (2) component tests using RTL which requires upgrading vitest.config.ts with jsdom + @vitejs/plugin-react (both already installed in devDependencies), and (3) Playwright E2E tests which require a fresh install of @playwright/test and running against the DEMO_MODE=true dev server already configured in .env.local.

The key challenge is that form pages use next-intl (`useTranslations`), next/navigation (`useRouter`), SWR (`useWallet`), and Zustand stores — all of which must be mocked for RTL tests. The bank-accounts route.test.ts already demonstrates the established vi.mock pattern for Supabase, which is the model to follow.

**Primary recommendation:** Install three packages (`@testing-library/react`, `@testing-library/user-event`, `jsdom`), update vitest.config.ts with jsdom + React plugin, add RTL tests for form components, install `@playwright/test` and write E2E tests using DEMO_MODE=true.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | 4.1.4 (installed) | Unit + integration test runner | ESM-native, TypeScript-native, already installed |
| @vitejs/plugin-react | 6.0.1 (installed) | JSX transform for vitest | Already in devDependencies, required for RTL tests |
| @testing-library/react | 16.3.2 | Component testing | React 19 peer dep satisfied, RTL 16 supports React 19 |
| @testing-library/user-event | 14.6.1 | Realistic user interactions | Preferred over fireEvent for form interaction realism |
| jsdom | 29.0.2 | DOM environment for vitest | vitest v4 peer dep, required for jsdom test environment |
| @playwright/test | 1.59.1 | E2E browser testing | Locked decision; Node.js 25+ compatible |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/jest-dom | 6.9.1 | Custom DOM matchers (toBeInTheDocument, toHaveValue) | Setup file for RTL tests |
| vite | 8.0.8 (installed) | Underlying build tool for vitest | Already present as transitive dep |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @testing-library/user-event | fireEvent (RTL built-in) | user-event simulates real browser events; fireEvent is lower-level and misses intermediate events |
| jsdom | happy-dom | jsdom is more complete; happy-dom faster but some APIs missing |

**Installation (missing packages only):**
```bash
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @playwright/test
npx playwright install chromium
```

---

## Architecture Patterns

### Test File Locations (matches existing convention)
```
src/
├── lib/
│   ├── __tests__/
│   │   └── currency.test.ts          # EXISTS — 44 tests passing
│   ├── auth/__tests__/
│   │   ├── schemas.test.ts            # EXISTS
│   │   └── passcode.test.ts           # EXISTS
│   ├── transfer/__tests__/
│   │   └── schemas.test.ts            # NEW — TEST-01
│   ├── wallet/__tests__/
│   │   └── schemas.test.ts            # NEW — TEST-01
│   └── kyc/__tests__/
│       └── schemas.test.ts            # NEW — TEST-01
├── app/
│   ├── (auth)/register/
│   │   └── __tests__/
│   │       └── personal-info.test.tsx  # NEW — TEST-03
│   └── (main)/transfer/
│       └── __tests__/
│           ├── new-recipient.test.tsx  # NEW — TEST-03
│           └── amount.test.tsx         # NEW — TEST-03
└── e2e/
    ├── registration.spec.ts            # NEW — TEST-04
    └── transfer.spec.ts                # NEW — TEST-05
```

### Pattern 1: vitest.config.ts Upgrade for RTL

Current config (node environment only) must be extended for component tests:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

```typescript
// src/test-setup.ts
import '@testing-library/jest-dom'
```

**Note:** Setting `environment: 'jsdom'` globally is safe — pure node tests (schemas, currency) work fine under jsdom. The existing 44 tests will continue to pass.

### Pattern 2: Mock Strategy for Form Components

Form pages import: `useTranslations` (next-intl), `useRouter` (next/navigation), SWR hooks, Zustand stores. All must be mocked. Follow the established vi.hoisted + vi.mock pattern from `bank-accounts/__tests__/route.test.ts`:

```typescript
// Example: mocking next-intl in component tests
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock SWR hooks (e.g. useWallet)
vi.mock('@/hooks/use-wallet', () => ({
  useWallet: () => ({ data: { wallet: { balance: 1000000 } }, mutate: vi.fn() }),
}))

// Mock Zustand stores — reset between tests
import { useRegistrationStore } from '@/stores/registration-store'
beforeEach(() => useRegistrationStore.setState({ ... initialState }))
```

### Pattern 3: Zod v4 Import Discrepancy

Auth schemas (`src/lib/auth/schemas.ts`) use `from 'zod'` (v4 root export). Transfer/wallet/KYC schemas use `from 'zod/v4'` (explicit subpath). Both work with zod 4.3.6. When writing tests for transfer/wallet/KYC schemas, import from the schema file directly — do NOT import zod in test files. This is already the existing pattern.

### Pattern 4: personalInfoSchema — Required Fields

`personalInfoSchema` requires `title` (enum ms/mr/mrs) and `gender` (enum male/female) which the existing test `schemas.test.ts` does NOT provide in its safeParse calls — those tests pass because the existing test may be checking field-level errors. When writing additional schema tests, include all required fields:

```typescript
const validPersonalInfo = {
  title: 'ms',
  firstName: 'Lalita',
  lastName: 'Tungtrakul',
  gender: 'female',
  dateOfBirth: '15/03/1995',
  email: '',
  nationality: 'thai',
}
```

### Pattern 5: Playwright Config with DEMO_MODE

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './src/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      DEMO_MODE: 'true',
    },
  },
})
```

**Critical:** DEMO_MODE=true is already set in `.env.local`. The webServer env block ensures it is active during E2E tests even in CI. Since DEMO_MODE bypasses Supabase auth in API routes, the registration and transfer flows will complete without a real Supabase instance.

### Pattern 6: E2E Auth State — DEMO_MODE Bypass

`src/proxy.ts` calls `updateSession(request)` from `@/lib/supabase/middleware`. In DEMO_MODE, the API routes bypass Supabase. However, the proxy itself still runs `updateSession` which may redirect unauthenticated requests. For E2E tests:

- Registration flow starts at `/login` → `/otp` → `/register/...` — these are public routes
- Transfer flow requires being "logged in" — Playwright global setup should navigate through the demo login flow first, or store auth state via `storageState`

Check whether the proxy/updateSession redirects unauthenticated users away from `/transfer/*`. If it does, use Playwright's `storageState` to persist a demo session cookie.

### Anti-Patterns to Avoid
- **Testing implementation details:** Assert on rendered text and form behavior, not internal state
- **Async Server Component unit tests:** Cannot test with Vitest (React limitation) — confirmed in CLAUDE.md
- **Real Supabase in unit tests:** Use vi.mock pattern from bank-accounts test
- **Importing from 'next-intl/server' in client component tests:** Will fail in jsdom; mock the entire module
- **Not clearing mocks between tests:** Always use `beforeEach(() => vi.clearAllMocks())` — established pattern in existing tests

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DOM environment for component tests | Custom JSDOM setup | `environment: 'jsdom'` in vitest.config.ts | Vitest v4 has built-in jsdom support via peer dep |
| User interaction simulation | Manual dispatchEvent | @testing-library/user-event | Handles pointer events, focus, blur, keyboard — matches real browser behavior |
| Custom Supabase mock | Full Supabase client reimplementation | vi.mock with minimal chain mock | Established pattern already in codebase (bank-accounts route.test.ts) |
| Playwright browser management | Manual browser install scripts | `npx playwright install chromium` | Playwright manages browser binaries |

---

## Common Pitfalls

### Pitfall 1: vitest.config.ts not including React plugin
**What goes wrong:** Component tests fail with `React is not defined` or JSX transform error
**Why it happens:** Current vitest.config.ts has no `plugins: [react()]`
**How to avoid:** Add `import react from '@vitejs/plugin-react'` and `plugins: [react()]` — @vitejs/plugin-react 6.0.1 is already in devDependencies
**Warning signs:** Error message mentions JSX or unexpected token `<`

### Pitfall 2: next-intl `useTranslations` throws in jsdom
**What goes wrong:** RTL tests crash with "Could not find next-intl provider"
**Why it happens:** `useTranslations` expects a NextIntlClientProvider in the tree
**How to avoid:** Mock the entire `next-intl` module: `vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))`
**Warning signs:** Error references NextIntlClientProvider or missing messages

### Pitfall 3: `useRouter` / `usePathname` not mocked
**What goes wrong:** `invariant: useRouter must be used inside next/navigation context`
**Why it happens:** Next.js navigation hooks require App Router context
**How to avoid:** `vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), ... }))`

### Pitfall 4: Playwright can't reach transfer pages without auth
**What goes wrong:** E2E test navigates to `/transfer/confirm` but gets redirected to `/login`
**Why it happens:** `proxy.ts` calls `updateSession` which checks Supabase session; demo mode bypasses API routes but not the proxy session check
**How to avoid:** E2E tests should flow through the full login → OTP → passcode sequence with demo credentials, OR use `storageState` to inject a pre-built demo session. Verify by checking `updateSession` behavior with DEMO_MODE.
**Warning signs:** Playwright navigates but ends up on `/login`

### Pitfall 5: personalInfoSchema test failures due to missing required fields
**What goes wrong:** Existing schemas.test.ts passes valid objects without `title` or `gender` — but the schema requires them
**Why it happens:** Tests written before schema was fully locked
**How to avoid:** Always validate with all required fields. Run `pnpm test` after writing new schema tests to confirm
**Warning signs:** `success: false` on supposedly valid inputs

### Pitfall 6: zod/v4 vs zod import path mismatch in tests
**What goes wrong:** Test imports `z` from `'zod'` but schema was written with `'zod/v4'` — error messages or type inference may differ
**Why it happens:** Inconsistency between auth schemas (use `'zod'`) and transfer/wallet/KYC schemas (use `'zod/v4'`)
**How to avoid:** Never import zod directly in test files. Import schemas and types from the schema files, call `.safeParse()` on imported schema objects.

---

## Code Examples

### Existing Supabase Mock Pattern (from bank-accounts/__tests__/route.test.ts)
```typescript
// Source: src/app/api/bank-accounts/__tests__/route.test.ts
const { mockGetUser, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))
```

### Schema Test Pattern (from src/lib/auth/__tests__/schemas.test.ts)
```typescript
// Source: src/lib/auth/__tests__/schemas.test.ts
it('rejects TH number with 8 digits', () => {
  const result = phoneSchema.safeParse({ countryCode: '+66', phone: '08123456' })
  expect(result.success).toBe(false)
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message)
    expect(messages.some((m) => m.includes('9-10'))).toBe(true)
  }
})
```

### RTL Form Component Test Pattern
```typescript
// Pattern for Client Component form tests
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

describe('PersonalInfoForm', () => {
  it('shows validation error on empty firstName submit', async () => {
    const user = userEvent.setup()
    render(<PersonalInfoPage />)
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(await screen.findByText(/required/i)).toBeInTheDocument()
  })
})
```

### Playwright E2E Pattern
```typescript
// Source: playwright.config.ts pattern
import { test, expect } from '@playwright/test'

test('registration → KYC happy path', async ({ page }) => {
  await page.goto('/')
  // DEMO_MODE=true — OTP auto-verifies, KYC auto-approves
  await page.getByLabel(/phone/i).fill('0812345678')
  // ... follow flow
  await expect(page).toHaveURL(/kyc\/status/)
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest + babel for Next.js | Vitest (ESM-native) | 2023+ | No babel transform needed, faster |
| @testing-library/react v14 | v16 (React 19 support) | 2024 | React 19 concurrent features supported |
| Playwright v1.40 | v1.59.1 | 2025 | `webServer.env` available, better mobile emulation |

---

## Open Questions

1. **Does proxy.ts/updateSession redirect unauthenticated requests in DEMO_MODE?**
   - What we know: DEMO_MODE bypasses Supabase in API routes. proxy.ts calls `updateSession` from `@/lib/supabase/middleware` without any DEMO_MODE check.
   - What's unclear: Whether `updateSession` with fake Supabase env vars (demo.supabase.co) redirects unauthenticated users from protected routes.
   - Recommendation: Plan 16-04 should start by navigating the full demo login flow (phone → OTP → passcode) to establish session state, then use `storageState` for subsequent tests. This is the safest approach regardless.

2. **Does the personalInfoSchema existing test have a bug with missing required fields?**
   - What we know: `personalInfoSchema` requires `title` and `gender` (both enum fields with no default). The existing test omits them.
   - What's unclear: Whether safeParse returns `success: false` on those test cases or zod coerces/ignores missing enum fields.
   - Recommendation: Plan 16-02 should include a test that verifies the schema rejects missing `title`/`gender` before writing passing tests. Run `npm test` after writing to confirm.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | vitest, playwright | ✓ | v25.8.1 | — |
| vitest | TEST-01/02/03 | ✓ | 4.1.4 | — |
| @vitejs/plugin-react | TEST-03 (RTL) | ✓ | 6.0.1 | — |
| vite | vitest peer dep | ✓ | 8.0.8 | — |
| @testing-library/react | TEST-03 | ✗ | — | Must install |
| @testing-library/user-event | TEST-03 | ✗ | — | Must install |
| jsdom | TEST-03 (vitest env) | ✗ | — | Must install |
| @testing-library/jest-dom | TEST-03 setup | ✗ | — | Must install |
| @playwright/test | TEST-04/05 | ✗ | — | Must install |
| Playwright Chromium browser | TEST-04/05 | ✗ | — | `npx playwright install chromium` |
| dev server (localhost:3000) | TEST-04/05 | ✓ (on demand) | — | playwright webServer config starts it |

**Missing dependencies with no fallback:**
- `@testing-library/react`, `@testing-library/user-event`, `jsdom` — required for TEST-03; no alternative given locked stack
- `@playwright/test` — required for TEST-04/05; no alternative given locked stack

**Missing dependencies with fallback:**
- `@testing-library/jest-dom` — optional; custom matchers can be skipped but recommended for DX

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | `vitest.config.ts` (exists, needs jsdom + React plugin) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TEST-01 | Zod schemas parse valid + reject invalid inputs | unit | `npx vitest run src/lib/transfer src/lib/wallet src/lib/kyc` | ❌ Wave 0 |
| TEST-02 | Currency formatter edge cases (zero, large, locale switch) | unit | `npx vitest run src/lib/__tests__/currency.test.ts` | ✅ (partial) |
| TEST-03 | Form components: valid submit passes, invalid shows errors | component | `npx vitest run src/app` | ❌ Wave 0 |
| TEST-04 | Registration → KYC E2E happy path | e2e | `npx playwright test src/e2e/registration.spec.ts` | ❌ Wave 0 |
| TEST-05 | Transfer confirmation → receipt E2E happy path | e2e | `npx playwright test src/e2e/transfer.spec.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run && npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/test-setup.ts` — jest-dom matchers import
- [ ] `vitest.config.ts` — add react plugin + jsdom environment + setupFiles
- [ ] `src/lib/transfer/__tests__/schemas.test.ts` — REQ TEST-01
- [ ] `src/lib/wallet/__tests__/schemas.test.ts` — REQ TEST-01
- [ ] `src/lib/kyc/__tests__/schemas.test.ts` — REQ TEST-01
- [ ] `src/app/(auth)/register/__tests__/personal-info.test.tsx` — REQ TEST-03
- [ ] `src/app/(main)/transfer/__tests__/new-recipient.test.tsx` — REQ TEST-03
- [ ] `src/app/(main)/transfer/__tests__/amount.test.tsx` — REQ TEST-03
- [ ] `playwright.config.ts` — REQ TEST-04/05
- [ ] `src/e2e/registration.spec.ts` — REQ TEST-04
- [ ] `src/e2e/transfer.spec.ts` — REQ TEST-05
- [ ] Package install: `npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @playwright/test`
- [ ] Browser install: `npx playwright install chromium`

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — vitest.config.ts, package.json, all existing test files, schema files
- `src/app/api/bank-accounts/__tests__/route.test.ts` — canonical mock pattern for this project
- `src/lib/__tests__/currency.test.ts`, `src/lib/auth/__tests__/schemas.test.ts` — existing passing test patterns

### Secondary (MEDIUM confidence)
- npm registry: `@testing-library/react@16.3.2` peerDependencies confirmed React 19 support (`react: '^18.0.0 || ^19.0.0'`)
- npm registry: `@playwright/test@1.59.1` confirmed available
- vitest 4.1.4 package.json: jsdom listed as optional peer dep

### Tertiary (LOW confidence)
- E2E DEMO_MODE proxy bypass behavior — inferred from code structure, not verified by running

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified from node_modules and npm registry
- Architecture: HIGH — based on direct codebase inspection of existing test files and form components
- Pitfalls: HIGH — based on actual code patterns (zod import discrepancy verified, schema required fields verified)
- E2E proxy behavior: LOW — inferred, not tested

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (stable libraries — Vitest, RTL, Playwright patch releases only)
