---
phase: 11-wallet-operations
verified: 2026-04-15T00:00:00Z
status: passed
score: 19/19 must-haves verified
re_verification: false
---

# Phase 11: Wallet Operations Verification Report

**Phase Goal:** Users can top up their wallet at any 123 Service convenience store, manage multiple saved bank accounts for withdrawals, and enter Myanmar addresses with correct administrative hierarchy
**Verified:** 2026-04-15
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User taps 123 Service channel and lands on /add-money/123-service | VERIFIED | `add-money/page.tsx` line 50-51: `if (channel === 'service_123') { router.push('/add-money/123-service?amount=${amountSatang}')` |
| 2 | Page shows Code 128 barcode rendered as SVG | VERIFIED | `123-service/page.tsx`: `<Barcode format="CODE128" ...>` from `react-barcode` (in package.json: `"react-barcode": "^1.6.1"`) |
| 3 | Page shows Ref.1, Ref.2, amount, pay-before timestamp | VERIFIED | `123-service/page.tsx` lines 109-125: explicit Ref.1, Ref.2, amount THB, format(expiresAt) rows rendered from `barcodeData` |
| 4 | Barcode data comes from POST /api/mock-payment/topup with channel='service_123' | VERIFIED | `123-service/page.tsx` line 49-53: `fetch('/api/mock-payment/topup', { method: 'POST', body: JSON.stringify({ amount, channel: 'service_123' })})` |
| 5 | When timer expires user can generate a new barcode via CTA | VERIFIED | `123-service/page.tsx`: `expired` state shown with "Generate New Barcode" button; `handleGenerateNew` resets `hasFetched.current = false` and re-fires `createTopup()` |
| 6 | GET /api/bank-accounts returns authenticated user's saved bank accounts | VERIFIED | `bank-accounts/route.ts` lines 15-41: GET handler queries `supabase.from('bank_accounts').select('*').eq('user_id', user.id)`; returns `{ bank_accounts }` |
| 7 | POST /api/bank-accounts creates new bank account with validation | VERIFIED | `bank-accounts/route.ts` lines 43-90: POST with Zod schema validation (`/^\d{10,12}$/`), inserts to supabase, returns 201 `{ bank_account }` |
| 8 | DELETE /api/bank-accounts?id={id} deletes the account | VERIFIED | `bank-accounts/route.ts` lines 92-144: DELETE reads `id` from searchParams, deletes from supabase |
| 9 | DELETE returns 409 Conflict if pending withdrawal references bank_account_id | VERIFIED | `bank-accounts/route.ts` lines 112-128: checks `supabase.from('transactions').contains('metadata', { bank_account_id: id })`, returns 409 if found |
| 10 | BankAccount TypeScript type exported from src/types/index.ts | VERIFIED | `types/index.ts` line 130: `export interface BankAccount` with all 6 fields |
| 11 | Withdraw page shows saved bank accounts instead of recipients | VERIFIED | `withdraw/page.tsx`: imports `useBankAccounts`, renders `BankAccountRow` list from `data?.bank_accounts` |
| 12 | User can tap Add Bank Account to navigate to /withdraw/add-bank | VERIFIED | `withdraw/page.tsx` line 138: `router.push('/withdraw/add-bank')` button present |
| 13 | Add-bank form collects bank name (select), account number, account name and saves via POST | VERIFIED | `withdraw/add-bank/page.tsx`: 3-field form with shadcn Select, validated by Zod, POSTs to `/api/bank-accounts` |
| 14 | Selecting bank account navigates to /withdraw/amount?bankAccountId={id} | VERIFIED | `withdraw/page.tsx` line 104: `router.push('/withdraw/amount?bankAccountId=${account.id}')` |
| 15 | Withdraw amount page shows bank account summary card | VERIFIED | `withdraw/amount/page.tsx` lines 92-108: renders bank account card with bank_name, masked account_number, account_name |
| 16 | Withdrawal POST passes bank_account_id in metadata | VERIFIED | `withdraw/amount/page.tsx` line 55: `bank_account_id: bankAccountId` in POST body; `withdraw/route.ts` line 115: `const metadata = bank_account_id ? { bank_account_id } : null` stored in transaction |
| 17 | Myanmar address picker shows three linked Select dropdowns | VERIFIED | `myanmar-address-picker.tsx`: 3 `<Select>` components for State, Township, Ward |
| 18 | Cascade resets work (State resets Township+Ward, Township resets Ward) | VERIFIED | `myanmar-address-picker.tsx` line 32: `handleStateChange` sets `{ state, township: '', ward: '' }`; line 36: `handleTownshipChange` sets `{ ...value, township, ward: '' }` |
| 19 | Myanmar address picker appears in new-recipient and edit-recipient for cash_pickup/bank_transfer | VERIFIED | Both `new-recipient/page.tsx` and `edit-recipient/[id]/page.tsx`: `isMyanmarRecipient = transferType === 'cash_pickup' \|\| transferType === 'bank_transfer'`; picker rendered conditionally; `form.setValue` calls wire state→form fields |

**Score:** 19/19 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/(main)/add-money/123-service/page.tsx` | 123 Service barcode display screen | VERIFIED | 174 lines; Code 128 barcode, Ref.1/Ref.2/amount/pay-before, timer+expiry, regenerate CTA |
| `src/app/api/mock-payment/topup/route.ts` | Extended topup API with 123_service barcode response | VERIFIED | 211 lines; branches on `channel === 'service_123'` returning `barcode_data`; all other channels return `qr_data` |
| `src/app/api/bank-accounts/route.ts` | Bank account CRUD API (GET, POST, DELETE) | VERIFIED | 144 lines; all 3 handlers; Zod validation; 409 pending-withdrawal guard; demo mode support |
| `src/types/index.ts` | BankAccount interface | VERIFIED | `export interface BankAccount` with id, user_id, bank_name, account_number, account_name, created_at |
| `.planning/supabase-schema.sql` | bank_accounts table DDL + RLS policies | VERIFIED | CREATE TABLE + 3 RLS policies (select/insert/delete) |
| `src/app/(main)/withdraw/page.tsx` | Bank account selector with add + delete actions | VERIFIED | `useBankAccounts` SWR, empty state, Add button, BankAccountRow with delete, AlertDialog with 409 handling |
| `src/app/(main)/withdraw/add-bank/page.tsx` | Add bank account form | VERIFIED | react-hook-form + Zod, bank Select (10 options), account_number tel input, POST to /api/bank-accounts |
| `src/app/(main)/withdraw/amount/page.tsx` | Withdraw amount screen using bank account | VERIFIED | `bankAccountId` from searchParams, `useBankAccounts` to find match, bank account card, `bank_account_id` in POST |
| `src/hooks/use-bank-accounts.ts` | SWR hook for /api/bank-accounts | VERIFIED | `useSWR('/api/bank-accounts', fetcher, { dedupingInterval: 10_000 })` |
| `src/lib/transfer/myanmar-address-data.ts` | Static hierarchical address data | VERIFIED | 146 lines; 15 states/regions/territories; getTownships + getWards helpers exported |
| `src/components/features/myanmar-address-picker.tsx` | Three linked Select dropdowns | VERIFIED | 105 lines; controlled component with cascade reset; disabled states for dependent selects |
| `src/app/(main)/transfer/new-recipient/page.tsx` | Myanmar address section added | VERIFIED | `MyanmarAddressPicker` rendered when `isMyanmarRecipient`; `form.setValue` to state_region/city/address_line_1 |
| `src/app/(main)/transfer/edit-recipient/[id]/page.tsx` | Myanmar address section with pre-load | VERIFIED | Picker rendered; `setMyanmarAddress` in `useEffect` when recipient loads (state_region, city, address) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `add-money/page.tsx` | `/add-money/123-service` | `channel === 'service_123'` routing | WIRED | Line 50: explicit branch with router.push |
| `123-service/page.tsx` | `/api/mock-payment/topup` | POST with channel: 'service_123' | WIRED | Line 49-53: fetch call with channel hardcoded |
| `bank-accounts/route.ts` | `supabase.from('bank_accounts')` | Supabase server client CRUD | WIRED | GET/POST/DELETE all query bank_accounts table |
| DELETE handler | `supabase.from('transactions')` | Check pending withdrawals by bank_account_id | WIRED | Line 113-121: `.contains('metadata', { bank_account_id: id })` |
| `withdraw/page.tsx` | `/api/bank-accounts` | `useBankAccounts` SWR hook | WIRED | Line 98: `const { data, isLoading, mutate } = useBankAccounts()` |
| `withdraw/amount/page.tsx` | `/api/mock-payment/withdraw` | POST with bank_account_id in body | WIRED | Line 50-57: `body: JSON.stringify({ amount: amountSatang, bank_account_id: bankAccountId })` |
| `withdraw/route.ts` | supabase transactions | insert with metadata.bank_account_id | WIRED | Line 115+129: `metadata = bank_account_id ? { bank_account_id } : null` included in insert |
| `myanmar-address-picker.tsx` | `myanmar-address-data.ts` | import MYANMAR_STATES/getTownships/getWards | WIRED | Line 11: `import { MYANMAR_STATES, getTownships, getWards }` |
| `new-recipient/page.tsx` | `MyanmarAddressPicker` | rendered when isMyanmarRecipient | WIRED | Line 10 import; line 434: conditional render; onChange writes to form fields |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `123-service/page.tsx` | `barcodeData` | POST /api/mock-payment/topup → `data.barcode_data` | Yes — API returns barcode_data from Supabase transaction insert (or demo mode) | FLOWING |
| `withdraw/page.tsx` | `bankAccounts` | `useBankAccounts()` → GET /api/bank-accounts → supabase.from('bank_accounts') | Yes — DB query returns real rows | FLOWING |
| `withdraw/amount/page.tsx` | `bankAccount` | `bankAccountsData?.bank_accounts.find(a => a.id === bankAccountId)` | Yes — derived from SWR data | FLOWING |
| `myanmar-address-picker.tsx` | `stateNames`, `townships`, `wards` | `MYANMAR_STATES` static data + `getTownships`/`getWards` helpers | Yes — 15 states, hierarchical data | FLOWING |

### Behavioral Spot-Checks

| Behavior | Check | Result | Status |
|----------|-------|--------|--------|
| Topup API returns barcode_data for service_123 | `grep "barcode_data" src/app/api/mock-payment/topup/route.ts` | Found in both demo and production paths | PASS |
| Bank accounts API has all 3 HTTP methods | `grep -c "^export async function" src/app/api/bank-accounts/route.ts` | 3 (GET, POST, DELETE) | PASS |
| 409 guard uses pending withdrawal check | `grep "409" src/app/api/bank-accounts/route.ts` | Present: line 126 | PASS |
| Myanmar states count | `grep -c "name:.*Region\|State\|Territory" myanmar-address-data.ts` | 15 states/regions/territories | PASS |
| TypeScript build | `npm run build` | 0 errors | PASS |
| react-barcode installed | `grep "react-barcode" package.json` | `"react-barcode": "^1.6.1"` | PASS |
| All 3 i18n locales have topup123Service | `grep "topup123Service" messages/*/wallet.json` | en, th, mm all present | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| TOPUP-01 | 11-01 | User can top up via 123 Service convenience store channel | SATISFIED | add-money routing → /add-money/123-service; topup API channel support |
| TOPUP-02 | 11-01 | User sees barcode (Code 128) with Ref.1, Ref.2, amount, pay-before timestamp | SATISFIED | 123-service/page.tsx full barcode display with all required fields |
| BANK-01 | 11-02, 11-03 | User can add a bank account for withdrawal | SATISFIED | /withdraw/add-bank form + POST /api/bank-accounts |
| BANK-02 | 11-02, 11-03 | User can delete a saved bank account (with confirmation dialog) | SATISFIED | withdraw/page.tsx AlertDialog + DELETE /api/bank-accounts |
| BANK-03 | 11-03 | User can select from saved bank accounts during withdrawal flow | SATISFIED | withdraw/page.tsx list → /withdraw/amount?bankAccountId= |
| BANK-04 | 11-02, 11-03 | System prevents deletion of bank account with pending withdrawal | SATISFIED | DELETE handler: JSONB contains check → 409; UI shows error toast on 409 |
| REC-04 | 11-04 | User can enter Myanmar address via cascading pickers (State → Township → Ward) | SATISFIED | MyanmarAddressPicker in new-recipient and edit-recipient forms for cash_pickup/bank_transfer |

**Orphaned requirements:** None. All 7 requirements from phase plans are covered.

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `src/app/api/bank-accounts/route.ts` (demo DELETE) | Demo mode DELETE does NOT check for pending transactions before delete | Info | In demo mode, the 409 guard is bypassed entirely — a user deleting a bank account in demo mode with a pending withdrawal will succeed without conflict check. This is acceptable for a demo/mock context. |

No blockers or warnings found.

### Human Verification Required

#### 1. 123 Service Barcode Visual Display

**Test:** Navigate to /add-money, enter an amount, select "123 Service" channel.
**Expected:** Page loads with a scannable Code 128 barcode SVG, Ref.1 and Ref.2 values displayed, amount in THB, pay-before timestamp. Timer counts down. When timer expires, "Barcode has expired" text appears in red and "Generate New Barcode" yellow button appears.
**Why human:** Visual barcode rendering and timer countdown behavior require browser execution.

#### 2. Myanmar Address Cascade Behavior

**Test:** Navigate to new-recipient form, select "Cash Pickup" transfer type. Verify 3 address selects appear. Select a State/Division. Verify Township dropdown is populated. Select a Township. Verify Ward dropdown populates. Change the State. Verify Township and Ward both reset.
**Expected:** Each dropdown is dependent; changing a parent resets children; all 15 states shown; corresponding townships and wards load correctly.
**Why human:** Interactive dropdown cascade behavior requires browser execution.

#### 3. Bank Account Delete with Pending Withdrawal (409 path)

**Test:** Create a withdrawal transaction with a bank account. While that transaction is pending, attempt to delete the bank account.
**Expected:** Delete confirmation dialog appears. After confirming, a toast with "Cannot delete bank account with pending withdrawal" appears. The account remains in the list.
**Why human:** Requires an actual pending transaction in Supabase to test the 409 guard path.

### Gaps Summary

No gaps found. All 19 truths verified across all 4 plans. Phase goal is fully achieved:
- 123 Service top-up: barcode page, Code 128 barcode, all reference fields, timer and regenerate flow — complete
- Bank account management: CRUD API, bank selector in withdraw flow, add-bank form, delete with 409 guard, AlertDialog confirmation — complete
- Myanmar address picker: 15 states hierarchical data, cascade reset logic, integrated in both recipient forms with pre-load on edit — complete

---

_Verified: 2026-04-15_
_Verifier: Claude (gsd-verifier)_
