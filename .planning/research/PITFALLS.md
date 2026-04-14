# Domain Pitfalls

**Domain:** Mobile Banking / Cross-Border Remittance PWA (Thailand → Myanmar)
**Project:** 2C2P Wave
**Researched:** 2026-04-14
**Stack:** Next.js 16 App Router + Supabase + shadcn/ui + Tailwind CSS v4

---

## Critical Pitfalls

Mistakes that cause rewrites, security incidents, or regulatory/financial failures.

---

### Pitfall 1: Supabase RLS Not Enabled on Sensitive Tables

**What goes wrong:** Supabase creates tables with RLS disabled by default. Any table without explicit `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` is fully readable by any authenticated client — including wallets, transactions, kyc_documents, recipients. In January 2025, 170+ apps with this exact mistake exposed 13,000 users' financial and identity data (CVE-2025-48757).

**Why it happens:** Developers test in the SQL Editor, which runs as the `postgres` superuser and bypasses all RLS. Everything looks correct in development; the breach only appears in production.

**Consequences:** Any authenticated user can read every wallet balance, every transaction, every KYC document, and every recipient entry belonging to every other user. In a remittance app serving migrant workers, this is both a PDPA violation (Thailand) and a complete trust collapse.

**Prevention:**
- Enable RLS on every table immediately at schema creation — treat it as a required migration step, not an afterthought
- Create a CI check that queries `pg_tables` and fails the build if any table in the `public` schema has `rowsecurity = false`
- Never test data access logic in the Supabase SQL editor; always test via the Supabase JS client with a real authenticated user session
- Ensure all tables have at minimum a `user_id = auth.uid()` SELECT policy before any UI wires up to them

**Warning signs:** Data appears in the UI for rows you didn't create. Supabase Studio SQL editor returns rows that your app query also returns without any WHERE clause.

**Phase:** Address in Phase 1 (database schema and auth foundation) before any data-reading UI is wired.

---

### Pitfall 2: RLS Policy Using Mutable `user_metadata`

**What goes wrong:** Writing RLS policies that check `auth.jwt() -> 'user_metadata'` (e.g., `role`, `kyc_status`, `tier`) creates a privilege escalation vulnerability. Authenticated users can call `supabase.auth.updateUser({ data: { kyc_status: 'approved' } })` and modify their own metadata, bypassing KYC gates.

**Why it happens:** `user_metadata` is the obvious place to store profile flags. The Supabase docs warn against this in security contexts, but it is easy to miss.

**Consequences:** A user with a rejected KYC status sets `kyc_status: 'approved'` in their own JWT and gains access to transfer and withdrawal flows. For a mock service, this is an embarrassing demo failure. For a real deployment, it is fraud.

**Prevention:**
- Store KYC status, user tiers, and access flags in a server-controlled `user_profiles` table, not in `user_metadata`
- Write RLS policies that JOIN against this table: `EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.kyc_status = 'approved')`
- Only use `auth.uid()` (the user's immutable UUID) in RLS policies — never `auth.jwt() -> 'user_metadata'`
- Use `auth.jwt() -> 'app_metadata'` (server-only, not user-modifiable) if you must embed flags in the JWT

**Warning signs:** Any RLS policy referencing `user_metadata`. Any policy that can be satisfied by calling `updateUser()` from the client.

**Phase:** Address in Phase 1 (auth schema design) and review in every phase that adds new RLS policies.

---

### Pitfall 3: Supabase Storage Buckets Set to Public for KYC Documents

**What goes wrong:** Creating the `kyc-documents` storage bucket as "Public" means anyone with the file URL can download any user's passport, NRC, work permit, or selfie — no authentication required. Public buckets bypass all access controls for retrieval.

**Why it happens:** Public buckets are simpler to implement (no signed URL generation needed), and developers reach for them during rapid scaffolding.

**Consequences:** KYC documents are biometric and identity data subject to Thailand's PDPA and Myanmar's equivalent laws. A public bucket is a regulatory violation and a catastrophic privacy breach.

**Prevention:**
- Create `kyc-documents` as a **private** bucket from day one
- Generate short-lived signed URLs server-side (via Supabase service role on an API route) for displaying documents — never expose permanent URLs to the client
- Apply storage RLS policies: `bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]` — prefix all uploads with the user's UUID as the first path segment
- Restrict upload to authenticated users only; restrict download to the document owner and backend service role only

**Warning signs:** `isPublic: true` in any bucket creation migration. Storing file paths directly in the database without signed URL generation on read.

**Phase:** Address in Phase 2 (eKYC flow) when storage is first used.

---

### Pitfall 4: Floating-Point Arithmetic for THB/MMK Currency Calculations

**What goes wrong:** Using JavaScript `number` (IEEE 754 float) for currency math introduces silent precision errors. `0.1 + 0.2 = 0.30000000000000004`. In a remittance context, applying a 1.5% fee to 10,000 THB might yield `149.99999999999` instead of `150.00`, and when this is stored and displayed across multiple operations, errors compound.

**Why it happens:** JavaScript's native number type is ubiquitous and "works" for display purposes. The precision errors only surface during multi-step fee calculation chains — exactly what a remittance app does.

**Consequences:** Fee amounts that don't match receipts. Exchange rate calculations that differ between the preview screen and the confirmation screen. Potential regulatory issues if stored amounts don't reconcile.

**Prevention:**
- **Never use native JavaScript `number` for currency calculations.** Use integer arithmetic in the smallest unit (satang for THB, pya for MMK) throughout all calculation code
- For display only, use `Intl.NumberFormat` with the correct locale and currency — this is a formatting tool, not a calculation tool
- For complex fee calculations, use `dinero.js` (type-safe, immutable money arithmetic) or `big.js` (arbitrary precision decimal)
- Store all monetary values in the database as `NUMERIC(20,0)` integers in the smallest unit, never as `FLOAT` or `DECIMAL` with floating precision
- Write unit tests that verify `fee(10000) + fee(10000) === fee(20000)` (fee must be associative)

**Warning signs:** Any calculation that multiplies or divides a raw JavaScript number by an exchange rate. Any `parseFloat()` in financial logic. Database columns typed as `FLOAT8` or `DOUBLE PRECISION` for amounts.

**Phase:** Address in Phase 1 (data model design) and Phase 3 (transfer fee calculation engine).

---

### Pitfall 5: Exchange Rate Staleness Creating Race Conditions at Confirmation

**What goes wrong:** The rate displayed on the amount-entry screen is fetched once and cached. The user spends 3 minutes filling in recipient details, then confirms the transfer — but the rate shown in the confirmation summary is the stale value from 3 minutes ago, not the live rate. If rates are mock and deterministic, this seems harmless. When wired to real rates, users confirm at one rate and receive transfers calculated at another, creating disputes.

**Why it happens:** Developers fetch the rate on page load and use it for the entire multi-step flow without re-fetching or invalidating.

**Consequences:** User sees "1 THB = 48.5 MMK" when they initiated; confirmation shows the same stale rate; actual processing uses a newer rate. User confusion, support tickets, trust erosion.

**Prevention:**
- Assign each exchange rate a TTL (e.g., 15 minutes) and a `rate_expires_at` timestamp
- Display a countdown timer ("Rate valid for 14:23") on the amount-entry screen — the UI review already identified this as a UX need; treat it as a technical requirement too
- Re-fetch the rate at the confirmation screen (before the user commits); if the rate changed by more than a configured threshold (e.g., 0.5%), show a "Rate Updated" alert and require re-confirmation
- Lock the rate server-side when the user submits confirmation — the locked rate is what gets processed, regardless of subsequent market movement
- For the mock service: expose a `rate_locked_at` and `rate_expires_at` in the API response to build this discipline into the mock from day one

**Warning signs:** Exchange rate fetched in `useEffect` on component mount and stored in local state without expiry logic. No `rate_id` or `rate_expires_at` passed to the confirmation endpoint.

**Phase:** Address in Phase 3 (transfer flow) when the amount-entry and confirmation screens are built.

---

### Pitfall 6: iOS Safari Camera Access Failure in PWA Mode

**What goes wrong:** When a user installs the Wave PWA to their iOS home screen (standalone mode), `getUserMedia()` and `navigator.mediaDevices` can fail silently or throw a `NotAllowedError` even after the user previously granted camera permission in Safari. This specifically breaks the eKYC document scanning and face verification flows.

**Why it happens:** WebKit has a documented, long-standing bug (WebKit bug #185448) where camera access granted in Safari's browser does not carry over to the standalone PWA context. The PWA is treated as a separate origin for permission purposes.

**Consequences:** Users who install the app (the desired outcome for a remittance PWA) cannot complete eKYC. The registration funnel breaks entirely for the most engaged users.

**Prevention:**
- Test the eKYC camera flow explicitly in iOS Safari in **both** browser mode and home-screen standalone mode during every sprint that touches the camera feature
- Detect standalone mode: `window.matchMedia('(display-mode: standalone)').matches` — if true and camera fails, show a specific error: "For camera access, please open Wave in Safari directly"
- Implement a fallback: allow document upload from the camera roll (`<input type="file" accept="image/*" capture="environment">`) — this works in all iOS contexts including standalone mode
- Never rely solely on `getUserMedia()` for a flow that must complete on iOS PWA; always offer the file-input fallback
- The mock eKYC service should accept file uploads as an alternate path to the live camera path

**Warning signs:** Camera flow tested only in Chrome on desktop or Android. No test device running iOS in standalone mode. No file upload fallback for document capture.

**Phase:** Address in Phase 2 (eKYC flow) before the camera overlay component is built.

---

### Pitfall 7: Myanmar Zawgyi/Unicode Font Collision

**What goes wrong:** Myanmar script has two incompatible encoding systems: Zawgyi (a legacy non-Unicode encoding used on an estimated 90%+ of Myanmar devices) and Unicode (the standard). Text stored as Unicode renders as gibberish with a Zawgyi font, and vice versa. If the app stores user-entered names and recipients in Unicode (correct) but a user's device has Zawgyi set as the system font, every Myanmar-script name appears as scrambled characters.

**Why it happens:** Developers test with Unicode Myanmar fonts (Noto Sans Myanmar, Padauk) installed. Myanmar users in the field have Zawgyi as their system font or keyboard. The mismatch is invisible during development.

**Consequences:** Recipient names appear corrupted in the transaction list and receipt. Users cannot verify they are sending to the correct person — a critical trust and safety failure in a financial app.

**Prevention:**
- Embed the Myanmar font explicitly in the app: load `Noto Sans Myanmar` or `Padauk` via `next/font` (or a self-hosted WOFF2) and apply it to all elements that render Myanmar-script text
- Use `font-family: 'Noto Sans Myanmar', 'Padauk', sans-serif` in the CSS stack specifically for the `lang="my"` context — this overrides the system font
- Store all text server-side in Unicode only; if user input arrives in Zawgyi (detectable via library), convert it server-side before storage
- Use a Zawgyi-to-Unicode detection/conversion library (e.g., `myanmar-tools` from Google) on input fields to handle paste from Zawgyi keyboards
- Test with a real Android device that has Zawgyi keyboard installed, not just with developer machines

**Warning signs:** Myanmar text displayed using `system-ui` or no explicit `font-family`. No self-hosted or `next/font` Myanmar font loaded. Input fields accepting Myanmar text without Zawgyi detection.

**Phase:** Address in Phase 1 (design system, font loading) and Phase 4 (recipient management forms).

---

### Pitfall 8: Thai Buddhist Era Year Mismatch in Date Formatting

**What goes wrong:** When `lang` is set to `th` (Thai), `Intl.DateTimeFormat` and `date.toLocaleDateString('th-TH')` output years in the Buddhist Era (BE), which is 543 years ahead of Gregorian (2026 CE = 2569 BE). Components that mix Gregorian dates in state/storage with `th-TH` display formatting will show the correct month/day but a year 543 years in the future. Worse: date range pickers and calendar components may interpret user input in BE as Gregorian, creating off-by-543-year date filters in transaction history.

**Why it happens:** Developers implement date formatting once with `new Date()` and `toLocaleDateString()`, test in English, and miss the Buddhist Era offset. Calendar components from libraries (shadcn Calendar, react-date-picker) are often not aware of Buddhist Era.

**Consequences:** Transaction history date filters return wrong results for Thai-locale users. Receipts show year 2569 where a Thai user expects 2569 (correct) but backend queries in Gregorian (2026) — if the conversion isn't applied to the query parameters, the filter returns nothing.

**Prevention:**
- Always store dates in the database as UTC ISO 8601 (Gregorian) — never store Buddhist Era dates
- For display in Thai locale: use `Intl.DateTimeFormat('th-TH-u-ca-gregory', {...})` (explicit `ca-gregory`) to display Gregorian years consistently, or `'th-TH-u-ca-buddhist'` to display Buddhist Era explicitly — never leave the calendar system implicit
- Document which convention the app uses (the prototype uses Gregorian years in all visible dates — match this)
- When building date range pickers for transaction history, always parse user input as Gregorian regardless of locale; apply locale formatting only for display
- Write a unit test: `new Intl.DateTimeFormat('th-TH').format(new Date('2026-01-01'))` should be verified to produce the expected output and confirmed acceptable

**Warning signs:** `toLocaleDateString('th-TH')` used anywhere without specifying `calendar` extension. Date range filter results empty for Thai-locale users. Year values > 2500 appearing in the UI.

**Phase:** Address in Phase 1 (i18n setup) and Phase 5 (transaction history date filter).

---

### Pitfall 9: Supabase Phone OTP Rate Limiting Causing Signup Failures

**What goes wrong:** Supabase Auth enforces a default rate limit of 30 SMS OTPs per hour globally and a per-user minimum interval of 60 seconds between sends. During any user acquisition event (campaign, referral spike), or if OTP delivery fails and users hit "Resend" repeatedly, the limit is hit quickly. The error manifests as a `429` response with a misleading generic error message in the UI.

**A secondary edge case:** If a user's phone number is registered but their registration is incomplete (dropped off mid-flow), re-initiating OTP for the same number can conflict with the existing auth record. Supabase's phone auth creates or upserts users; incomplete users may be in a limbo state.

**Why it happens:** Rate limits are invisible in development (free tier) and only appear under real traffic patterns.

**Consequences:** Legitimate users cannot receive OTPs. Resend button appears to do nothing. Migrant workers on limited data plans may have already paid for the session.

**Prevention:**
- Expose a user-facing countdown timer for OTP resend (60 seconds) — never show the resend button as active before the interval expires
- Catch `429` errors explicitly and show a specific message: "You've requested too many codes. Please wait 60 seconds before trying again."
- For the mock OTP flow (dev/staging), auto-bypass OTP with a dev shortcode (e.g., `000000`) — do not burn real SMS quota during development
- Configure OTP expiry to 300 seconds (5 minutes) minimum in Supabase dashboard — the default 60-second expiry is too short for users on slow connections who must switch apps to read the SMS
- Plan the production Supabase tier's SMS limits against expected concurrent registrations at launch

**Warning signs:** OTP resend button is enabled immediately after first send. No user-facing countdown. Generic "Something went wrong" error on OTP failure instead of a specific message.

**Phase:** Address in Phase 1 (auth flow) and Phase 2 (registration).

---

### Pitfall 10: NRC Number Validation Using Regex Only

**What goes wrong:** Myanmar NRC (National Registration Card) numbers have a structured format: `[State]/[Township 6-char code]([Type])[5-6 digit number]` — e.g., `12/OUKAMA(N)123456`. However, the township codes are a finite, enumerated list (per official records). A regex like `/\d{1,2}\/[A-Z]{6}\((N|E|P|T|R|S)\)\d{5,6}/` accepts any 6-letter string — including completely fictional township codes that do not exist in Myanmar.

**Why it happens:** The NRC structure looks regex-validatable, and the full township enumeration (hundreds of codes) is not well-known to non-Myanmar developers.

**Consequences:** Users can accidentally (or intentionally) enter invalid NRC numbers that pass frontend validation but fail KYC review downstream. The rejection happens late in the flow, after the user has uploaded documents, waited for review, and received a confusing rejection reason.

**Prevention:**
- Use the `mm-nrc` npm package (or equivalent) which bundles the complete official list of NRC township codes and validates both the format and the legitimacy of the township code
- Provide a structured NRC input component (state number selector + township dropdown + type selector + number field) rather than a free-text field — this eliminates the regex-vs-enumeration mismatch
- The `react-mm-nrcform` library provides a React component for this exact UX pattern
- For the mock eKYC service, validate NRC against the known township list and return a specific rejection reason for invalid township codes

**Warning signs:** NRC input is a single `<input type="text">` with only a regex pattern attribute. No township code dropdown. Mock eKYC accepts any NRC that matches the pattern.

**Phase:** Address in Phase 4 (recipient management) and Phase 2 (registration personal info, if NRC is collected there).

---

## Moderate Pitfalls

Mistakes that degrade UX, create support load, or require significant rework.

---

### Pitfall 11: Supabase JWT Refresh Race Condition in Multi-Step Flows

**What goes wrong:** In Next.js App Router with Supabase SSR, multiple server-side requests (layout + page + nested server components) can simultaneously attempt to refresh an expired JWT. The first succeeds, invalidating the refresh token. The second fails with `AuthApiError: Invalid Refresh Token: Already Used`, signing the user out mid-flow — potentially in the middle of submitting a transfer.

**Prevention:**
- Use `@supabase/ssr` with a single `createServerClient` instance scoped to the request (via cookies), not a shared module-level client
- In the Next.js proxy.ts (middleware), refresh the token once at the edge before any route handler runs, so all downstream server components receive a fresh token
- Test multi-step flows specifically when the JWT is about to expire (token age close to `JWT_EXPIRY`) by setting a short expiry in the dev Supabase project

**Phase:** Address in Phase 1 (auth architecture).

---

### Pitfall 12: Hydration Mismatch from Locale-Dependent Rendering

**What goes wrong:** Server renders a component using the server's locale/timezone (UTC). Client hydrates with the browser's locale (e.g., `th-TH`). If any component renders a formatted date, currency amount, or Buddhist Era year during the initial render, the server and client output differ, producing a React hydration error. This is particularly acute for the wallet balance (formatted with `Intl.NumberFormat`) and transaction timestamps.

**Prevention:**
- Wrap all locale-dependent rendering in `<Suspense>` with a skeleton fallback, or use the `useEffect` pattern to defer locale-specific formatting to client-only
- For currency display, render the raw number on the server and apply `Intl.NumberFormat` formatting client-side only
- iOS Safari additionally auto-detects phone numbers and converts them to links, causing hydration mismatches in transaction detail screens displaying phone numbers — add `<meta name="format-detection" content="telephone=no,date=no,address=no,email=no">` to the root layout

**Phase:** Address in Phase 1 (root layout and design system) and Phase 3 (dashboard wallet card).

---

### Pitfall 13: Touch Targets Below 44px on Low-End Android Devices

**What goes wrong:** The prototype's quick-action icons, country code selector, OTP digit boxes, and some list items render at approximately 36px — below the WCAG 2.5.8 Level AA minimum of 24px (recommended 44px). On low-end Android devices (screen density varies 160-480 dpi), CSS pixels do not map 1:1 to physical pixels predictably. Targets that appear tappable on a high-end device can be near-impossible to hit on a 5-year-old budget Android phone — exactly the device profile of the migrant worker target persona.

**Prevention:**
- Enforce a design system rule: all interactive elements have a minimum computed `height` and `width` of 44px (use CSS `min-height: 2.75rem` as a reset on interactive elements)
- For icon-only buttons, use padding to expand the tap area while keeping the visual icon smaller: `padding: 10px; icon-size: 24px`
- Test on a physical low-end Android device (Realme C-series, Samsung A0x) at each phase — emulator DPR does not reproduce real touch imprecision
- The country code selector flag+code trigger is specifically called out in the UI review as HIGH severity — treat it as a component-level constraint, not a styling detail

**Phase:** Address in Phase 1 (design system component creation) with enforcement in every subsequent phase.

---

### Pitfall 14: PWA iOS Safari Storage and Service Worker Instability

**What goes wrong:** Safari enforces a 50MB storage quota for PWA caches (significantly lower than Chrome). More critically, Safari purges PWA storage (IndexedDB, Cache API) when the app has not been used for an extended period — potentially clearing cached exchange rates, draft registration state, and offline fallback pages. Service worker cache in Safari is also documented to disappear unexpectedly between sessions.

**Prevention:**
- Keep the PWA cache budget lean: cache only the offline fallback pages, the design system CSS, and critical UI assets — not transaction data
- Do not rely on IndexedDB for any data that must survive across sessions on iOS — use Supabase as the source of truth and treat the PWA cache as a temporary performance layer
- For draft registration state (the UI review identifies no save/resume as HIGH risk), persist to Supabase (server-side) rather than localStorage or IndexedDB
- Test specifically: install PWA → use for one session → leave for 48 hours → reopen → verify offline fallback still renders

**Phase:** Address in Phase 1 (PWA manifest and service worker configuration) and Phase 2 (registration state persistence).

---

### Pitfall 15: Mock Service Toggle Leaking Into Production

**What goes wrong:** The mock eKYC and mock payment services are configured via environment variables (e.g., `MOCK_KYC_ENABLED=true`). If the production deployment inherits development environment variables — or if the default value of the flag is `true` — production users receive simulated approvals and zero-fee transfers.

**Prevention:**
- Default all mock flags to `false` at the application level; enable explicitly via env vars in dev/staging only
- Validate mock flags at server startup: if `NODE_ENV === 'production'` and any mock flag is `true`, log a critical error and refuse to start
- Use Vercel Environment Variables scoped per environment (Preview vs Production) — set mock vars only on Preview

**Warning signs:** `MOCK_KYC_ENABLED` not present in `.env.example` with explicit instructions. Mock bypass code that checks `process.env.MOCK_KYC_ENABLED` with a fallback of `true`.

**Phase:** Address in Phase 1 (project configuration) and validate at each deployment milestone.

---

## Minor Pitfalls

Technical debt and UX issues that create support tickets but not failures.

---

### Pitfall 16: QR Code Expiration Not Enforced Client-Side

**What goes wrong:** The generated payment QR code has a server-side validity window (typically 15 minutes), but the client displays it indefinitely. Users screenshot the QR, open it later, and attempt to pay — the QR fails at the payment provider but the error message is generic.

**Prevention:** Display a countdown timer below the QR code. When the timer reaches zero, blur/overlay the QR with a "This QR has expired — Tap to generate a new one" state. Validate QR age server-side before processing.

**Phase:** Address in Phase 3 (add-money QR flow).

---

### Pitfall 17: Balance Display Showing Stale Data After Transactions

**What goes wrong:** The wallet balance on the home dashboard is fetched once on mount. After the user completes a transfer in another tab or the transfer flow navigates back to home, the balance still shows the pre-transfer amount until the user manually refreshes.

**Prevention:** Use Supabase Realtime to subscribe to the `wallets` table for the authenticated user's row. Update the balance display reactively on any change. Invalidate the balance cache on navigation back to the home screen from any financial flow.

**Phase:** Address in Phase 3 (home dashboard and transfer flow).

---

### Pitfall 18: Language Switching Without Persistent Font Loading

**What goes wrong:** When a user switches from English to Myanmar, the Myanmar font (`Noto Sans Myanmar`) may not be loaded yet (it is a large font file). The switch triggers a flash of unstyled/system-font text before the font downloads.

**Prevention:** Preload the Myanmar font file as a `<link rel="preload">` in the document head, even when the initial language is English. Use `font-display: swap` with a fallback stack that keeps Myanmar text legible during load. Consider subsetting the Myanmar font to only the characters needed.

**Phase:** Address in Phase 1 (font loading strategy).

---

### Pitfall 19: `user_metadata` Write Conflict During Concurrent Registration Steps

**What goes wrong:** If a user somehow submits two registration steps concurrently (double-tap, network retry), the second `auth.updateUser()` call can overwrite the first. In multi-step registration, this can result in a user profile where Step 3 data overwrites Step 2 data.

**Prevention:** Use database transactions on the `user_profiles` table rather than sequential `auth.updateUser()` calls. Track registration step server-side; reject out-of-order step submissions. Use idempotency keys on API calls that mutate user data.

**Phase:** Address in Phase 2 (registration flow API design).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Database schema creation | RLS not enabled | Enable RLS in the same migration that creates the table — never in a separate later migration |
| Auth flow (OTP) | Rate limiting during load testing | Use dev bypass code `000000` in non-production |
| eKYC camera (iOS) | `getUserMedia` failure in standalone PWA | File-input fallback, detect standalone mode |
| Font system (Myanmar) | Zawgyi/Unicode collision | Self-host Noto Sans Myanmar, detect and convert Zawgyi input |
| i18n setup (Thai) | Buddhist Era year in date components | Explicitly specify `ca-gregory` or `ca-buddhist` in `Intl.DateTimeFormat` |
| Transfer fee calculation | Floating-point precision | Integer arithmetic in smallest currency unit from day one |
| Exchange rate display | Stale rate at confirmation | Re-fetch rate at confirmation step, enforce server-side rate lock |
| Recipient form (NRC) | Invalid township codes passing validation | Use `mm-nrc` package for township enumeration validation |
| Storage (KYC documents) | Public bucket exposure | Private bucket + signed URLs from day one |
| Mock services | Mock flags defaulting to true | Default false, production startup check |
| PWA service worker | iOS Safari cache purge | Persist registration state to Supabase, not IndexedDB |
| Home dashboard | Stale wallet balance | Supabase Realtime subscription on wallets row |
| JWT refresh | Race condition in App Router layouts | Single `createServerClient` per request via middleware |
| Touch targets | Below 44px on budget Android | Design system min-height constraint, physical device testing |

---

## Sources

- Supabase RLS Documentation: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase RLS Performance and Best Practices: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv
- Supabase Production Checklist: https://supabase.com/docs/guides/deployment/going-into-prod
- Supabase Storage Access Control: https://supabase.com/docs/guides/storage/security/access-control
- CVE-2025-48757 / 170+ exposed Supabase apps: https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/
- Concurrent token refresh race condition: https://github.com/supabase/auth-js/issues/213
- Camera access in iOS PWA (WebKit bug #185448): https://kb.strich.io/article/29-camera-access-issues-in-ios-pwa
- PWA iOS limitations 2026: https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide
- Zawgyi vs Unicode: https://www.globalapptesting.com/blog/zawgyi-vs-unicode
- Myanmar NRC format: https://github.com/wai-lin/mm-nrc
- Myanmar NRC React component: https://github.com/empiretylh/react-mm-nrcform
- JavaScript currency precision: https://www.honeybadger.io/blog/currency-money-calculations-in-javascript/
- JavaScript rounding errors in financial apps: https://www.robinwieruch.de/javascript-rounding-errors/
- Thai Buddhist calendar in JS Intl: https://day.js.org/docs/en/plugin/buddhist-era
- Thai year input/display mismatch: https://github.com/wojtekmaj/react-date-picker/issues/294
- Touch target WCAG 2.5.8: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- Next.js hydration errors: https://nextjs.org/docs/messages/react-hydration-error
- Supabase phone OTP rate limiting: https://supabase.com/docs/guides/auth/rate-limits
