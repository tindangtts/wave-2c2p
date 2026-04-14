# 2C2P Wave - Implementation Roadmap

## Milestone 1: MVP - Core Banking Features

### Phase 1: Project Foundation & Design System
**Goal**: Scaffold Next.js project, configure Supabase, establish design system with shadcn/ui matching prototype aesthetics

**Requirements**:
- [R1.1] Next.js 15+ App Router with TypeScript strict mode
- [R1.2] Supabase project configuration (auth, database, storage)
- [R1.3] shadcn/ui initialization with custom 2C2P Wave theme
- [R1.4] CSS design tokens extracted from prototype (colors, typography, spacing, radius)
- [R1.5] Base layout components (MobileLayout, AuthLayout, BottomNavigation)
- [R1.6] PWA manifest and service worker setup
- [R1.7] i18n configuration (EN/TH/MM) with next-intl
- [R1.8] Tailwind CSS custom configuration matching design system

**Success Criteria**:
- Project builds and runs on localhost
- Design tokens render correctly matching prototype colors/fonts
- Bottom navigation component matches prototype layout
- Mobile viewport (375px) renders correctly

---

### Phase 2: UI Design System Components
**Goal**: Build all reusable UI components from prototype as shadcn/ui variants, ensuring pixel-consistent design system

**Requirements**:
- [R2.1] Custom Button variants (primary yellow, outline, secondary blue, danger)
- [R2.2] Form components (PhoneInput with country code, AmountInput with currency, OTPInput 6-digit)
- [R2.3] Card components (TransactionCard, WalletCard, RecipientCard, PromoCard)
- [R2.4] Navigation components (TopHeader with branding, BottomNav, BackHeader)
- [R2.5] Modal/Dialog components (ConfirmDialog, StatusModal, KYCExpiredModal)
- [R2.6] Currency display component (THB/MMK with flags and conversion)
- [R2.7] Status components (TransactionStatus badge, KYC status, loading skeletons)
- [R2.8] Camera overlay components (document scan frame, face verification circle)
- [R2.9] QR code display/scanner placeholder components
- [R2.10] Empty states, error states, maintenance mode screens

**Success Criteria**:
- All components render matching prototype screenshots
- Components support all variants visible in prototype
- Responsive at 375px mobile viewport
- Touch targets meet 44x44px minimum

---

### Phase 3: Authentication & Onboarding
**Goal**: Complete auth flow from login through registration to passcode setup

**Requirements**:
- [R3.1] Login page with phone number + country code selector
- [R3.2] OTP verification screen with 6-digit input and resend timer
- [R3.3] Supabase Phone Auth integration
- [R3.4] Multi-step registration form (personal info, ID details)
- [R3.5] Passcode setup and entry screens
- [R3.6] Registration pending/success/rejected status screens
- [R3.7] Session management (auto-logout, protected routes)
- [R3.8] Auth middleware for route protection

**Success Criteria**:
- User can register with phone number → OTP → profile → passcode
- Protected routes redirect to login
- Registration states (pending/approved/rejected) display correctly

---

### Phase 4: Mock eKYC Service & Verification Flow
**Goal**: Build eKYC document scanning and face verification UI with mock backend service

**Requirements**:
- [R4.1] Document type selection screen (ID, Work Permit, Pink Card, Visa)
- [R4.2] Camera-based document capture UI (front/back) with frame overlay
- [R4.3] Face verification UI with circular liveness frame
- [R4.4] Mock eKYC API endpoints (document verify, face match, status)
- [R4.5] KYC status management (pending, approved, expired, rejected)
- [R4.6] KYC expired modal with re-verification prompt
- [R4.7] Rejection flow with specific reasons and re-upload guidance
- [R4.8] Work permit update / 2nd document verification flow
- [R4.9] Supabase tables for KYC records and document storage

**Success Criteria**:
- Full eKYC flow works end-to-end with mock service
- Document capture UI matches prototype camera overlays
- All KYC states render correctly (pending/approved/rejected/expired)
- Mock service configurable for pass/fail scenarios

---

### Phase 5: Home Dashboard & Wallet
**Goal**: Build main dashboard and wallet management screens

**Requirements**:
- [R5.1] Home dashboard with profile card, balance, quick actions
- [R5.2] Wallet balance display with show/hide toggle
- [R5.3] Quick action grid (Bills, Referral, Withdrawal, History)
- [R5.4] Recent transaction history list (last 5)
- [R5.5] Promotion/information carousel banner
- [R5.6] Add Money screen with amount input and channel grid
- [R5.7] QR code generation for top-up payments
- [R5.8] Payment receipt/confirmation display
- [R5.9] Supabase wallet and transaction tables with RLS

**Success Criteria**:
- Dashboard renders with user data from Supabase
- Balance updates in real-time after transactions
- Add Money flow generates QR and shows confirmation
- Promo carousel scrolls and displays banners

---

### Phase 6: Money Transfer & Mock Payment Service
**Goal**: Build P2P transfer and remittance flow with mock payment processing

**Requirements**:
- [R6.1] Transfer initiation screen with recipient selection
- [R6.2] Amount entry with real-time THB→MMK currency conversion
- [R6.3] Receiving channel selection (Wave Agent, Wave App, Bank, Cash Pickup)
- [R6.4] Fee calculation and display per channel
- [R6.5] Transfer confirmation screen with full summary
- [R6.6] Recipient management (add new, list, edit, delete)
- [R6.7] New recipient form (name, NRC, phone, occupation, purpose, relationship)
- [R6.8] Mock payment API (exchange rates, fees, transfer processing, status)
- [R6.9] Transfer status tracking (pending → processing → completed/failed)
- [R6.10] Withdrawal flow (select recipient, amount, bank, confirm)

**Success Criteria**:
- Full send money flow works with mock backend
- Currency conversion updates in real-time
- Fees display correctly per channel
- Transfer status updates via polling/realtime

---

### Phase 7: Transaction History & Receipts
**Goal**: Build transaction history with filtering, detail views, and receipt generation

**Requirements**:
- [R7.1] Transaction history list with infinite scroll
- [R7.2] Date range filter with calendar picker
- [R7.3] Transaction type and status filters
- [R7.4] Transaction detail/receipt screen
- [R7.5] Receipt sharing/download functionality
- [R7.6] Transaction status indicator (Success/Pending/Rejected badges)

**Success Criteria**:
- History loads and scrolls with proper pagination
- Filters work correctly
- Receipt detail shows all transaction info matching prototype

---

### Phase 8: Profile, Settings & Support
**Goal**: Build profile management, settings, referral, and support screens

**Requirements**:
- [R8.1] Profile settings page with menu items matching prototype
- [R8.2] Phone number change multi-step flow
- [R8.3] Passcode change flow
- [R8.4] Personal information management
- [R8.5] Notification settings toggles
- [R8.6] Language switcher (EN/TH/MM)
- [R8.7] Refer friends screen with QR code and share link
- [R8.8] Contact us page (call center, social channels, resources)
- [R8.9] Limits & Fees information page
- [R8.10] Terms, Privacy Policy, FAQ pages
- [R8.11] Logout functionality
- [R8.12] App version display

**Success Criteria**:
- All settings pages render matching prototype
- Phone change and passcode change flows work end-to-end
- Referral QR generates and share works
- Language switching persists preference

---

### Phase 9: Visa Card & Advanced Features
**Goal**: Build virtual card management and remaining features

**Requirements**:
- [R9.1] Virtual card display with card design matching prototype
- [R9.2] Card detail reveal (number, CVV, expiry)
- [R9.3] Card balance chart visualization
- [R9.4] Card delivery address form
- [R9.5] Card activation/freeze functionality
- [R9.6] System state screens (maintenance, update required)
- [R9.7] QR scanner page placeholder
- [R9.8] Bills payment placeholder

**Success Criteria**:
- Card renders matching prototype yellow gradient design
- Card details toggle show/hide correctly
- System state screens display appropriately

---

### Phase 10: Polish, Testing & PWA
**Goal**: Final polish, comprehensive testing, PWA optimization

**Requirements**:
- [R10.1] End-to-end testing of all critical flows
- [R10.2] Performance optimization (LCP < 2.5s on 3G)
- [R10.3] Accessibility audit and fixes (WCAG 2.1 AA)
- [R10.4] PWA manifest, icons, splash screens
- [R10.5] Offline fallback pages
- [R10.6] Error boundary components
- [R10.7] Loading states and skeleton screens
- [R10.8] Cross-browser testing (Chrome, Safari mobile)
- [R10.9] Security hardening (CSP, rate limiting, input sanitization)
- [R10.10] Final UI polish pass matching prototype pixel-perfect

**Success Criteria**:
- All critical flows pass E2E tests
- Lighthouse score > 90 on mobile
- No critical accessibility issues
- PWA installable on mobile devices
