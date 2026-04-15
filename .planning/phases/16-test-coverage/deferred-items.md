# Deferred Items — Phase 16 Test Coverage

## Pre-existing Test Failures (Out of Scope for 16-02)

### new-recipient.test.tsx: "shows first_name validation error on empty first name" [FAILS]

- **File:** src/app/(main)/transfer/__tests__/new-recipient.test.tsx:97
- **Discovered during:** 16-02 (full suite run)
- **Root cause:** `screen.getByText('required_field')` throws because multiple form fields fail validation simultaneously, rendering multiple `<p>required_field</p>` elements. The test assumes only one required_field error appears but the form shows all of them at once.
- **Fix needed:** Change `getByText('required_field')` to `getAllByText('required_field')` and assert length >= 1, OR use `getByRole('alert', { name: /required_field/ })` with a more specific selector (e.g., within the first_name field group).
- **Confirmed pre-existing:** Fails on commit 2b8a211 (16-01 plan commit), before any 16-02 changes.
- **Assign to:** 16-03 plan (component tests) or create a 16-02.1 patch plan
