
## From 03-03 Execution

### Pre-existing broken route paths (out-of-scope for 03-03)
These files use `/(auth)/kyc/*` router.push paths (route groups are not included in navigation):
- `src/app/(auth)/kyc/capture/page.tsx:75` — `'/(auth)/kyc/document-type'`
- `src/app/(auth)/kyc/capture/page.tsx:110` — `'/(auth)/kyc/processing'`
- `src/app/(auth)/kyc/document-type/page.tsx:47` — `'/(auth)/kyc/capture'`
- `src/app/(auth)/kyc/resubmit/page.tsx:104` — `'/(auth)/kyc/processing'`
- `src/app/(auth)/kyc/resubmit/page.tsx:111` — `'/(auth)/kyc/status'`
These were pre-existing issues not introduced by 03-03 changes.
