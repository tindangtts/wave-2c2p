# 2C2P Wave -- Senior UI/UX Lead Review

**Date**: 2026-04-14
**Source**: Pencil prototype (`pencil-new.pen`) -- 24+ screens
**Scope**: Design system extraction, component inventory, UX flow analysis, accessibility, IA, shadcn/ui mapping, design tokens
**Target Platform**: Mobile-first progressive web app (375px viewport, iOS-style chrome)

---

## Table of Contents

1. [Design System Analysis](#1-design-system-analysis)
2. [Component Inventory](#2-component-inventory)
3. [UX Flow Analysis](#3-ux-flow-analysis)
4. [Accessibility Assessment](#4-accessibility-assessment)
5. [Information Architecture](#5-information-architecture)
6. [Design Consistency Issues](#6-design-consistency-issues)
7. [shadcn/ui Component Mapping](#7-shadcnui-component-mapping)
8. [CSS Variables / Design Token Recommendations](#8-css-variables--design-token-recommendations)

---

## 1. Design System Analysis

### 1.1 Color Palette

#### Primary Brand Colors

| Token | Hex | Usage | Psychological Rationale |
|---|---|---|---|
| `--color-brand-yellow` | `#FFE600` | Headers, primary CTAs, brand identity, bottom nav accent | Optimism, energy, financial confidence. Standard in Thai/SEA fintech (KBank, Krungsri). High attention-grabbing for primary actions. |
| `--color-brand-blue` | `#0091EA` | Links, secondary CTAs ("Instant Receive"), status bar tint | Trust, reliability, technology. Balances the warmth of yellow with cool professionalism. |
| `--color-brand-dark` | `#1A1A2E` | Dark overlays (camera/scan views), eKYC backgrounds | Authority, focus. Used for immersive full-screen flows where distraction must be eliminated. |

#### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#00C853` | Successful transactions, completed status, registration success |
| `--color-warning` | `#FF9800` | Pending status, awaiting verification |
| `--color-error` | `#F44336` | Rejected profiles, failed transactions, form validation errors |
| `--color-info` | `#0091EA` | Informational banners, help text (aliases brand-blue) |

#### Neutral Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-white` | `#FFFFFF` | Card backgrounds, content areas, input fields |
| `--color-gray-50` | `#FAFAFA` | Page backgrounds, subtle section dividers |
| `--color-gray-100` | `#F5F5F5` | Disabled input backgrounds, skeleton loading |
| `--color-gray-200` | `#EEEEEE` | Borders, dividers, inactive tab underlines |
| `--color-gray-300` | `#E0E0E0` | Input borders (default state) |
| `--color-gray-400` | `#BDBDBD` | Placeholder text, disabled icons |
| `--color-gray-500` | `#9E9E9E` | Secondary text, helper text |
| `--color-gray-600` | `#757575` | Body text (secondary) |
| `--color-gray-700` | `#616161` | Body text (primary light) |
| `--color-gray-800` | `#424242` | Headings, strong labels |
| `--color-gray-900` | `#212121` | Primary body text, critical UI text |

#### Gradient

| Token | Value | Usage |
|---|---|---|
| `--gradient-card-visa` | `linear-gradient(135deg, #FFE600 0%, #FFB300 100%)` | Visa card face, premium card display |
| `--gradient-header` | `linear-gradient(180deg, #FFE600 0%, #FFF176 100%)` | Header backgrounds with depth |

### 1.2 Typography Scale

**Recommended Font Stack**: `'Kanit', 'Noto Sans Thai', system-ui, -apple-system, 'Segoe UI', sans-serif`

**Rationale**: Kanit is the de facto standard for Thai fintech applications. It supports both Thai and Latin scripts with excellent legibility. Noto Sans Thai provides a robust fallback. The system-ui stack handles edge cases.

**For Myanmar script**: `'Padauk', 'Noto Sans Myanmar', sans-serif` -- required for Myanmar language support (critical for the remittance user base).

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `--text-display` | 28px / 1.75rem | 700 | 1.2 | -0.02em | Wallet balance amount |
| `--text-h1` | 24px / 1.5rem | 700 | 1.3 | -0.01em | Screen titles |
| `--text-h2` | 20px / 1.25rem | 600 | 1.35 | 0 | Section headings |
| `--text-h3` | 18px / 1.125rem | 600 | 1.4 | 0 | Card titles, modal headings |
| `--text-h4` | 16px / 1rem | 600 | 1.4 | 0 | Sub-section titles |
| `--text-body` | 16px / 1rem | 400 | 1.5 | 0 | Primary body text |
| `--text-body-sm` | 14px / 0.875rem | 400 | 1.5 | 0 | Secondary body text, list items |
| `--text-caption` | 12px / 0.75rem | 400 | 1.4 | 0.01em | Helper text, timestamps, labels |
| `--text-overline` | 10px / 0.625rem | 600 | 1.6 | 0.08em | Uppercase section labels |

### 1.3 Spacing System

**Base unit**: 4px

| Token | Value | Usage |
|---|---|---|
| `--space-0` | 0px | Reset |
| `--space-1` | 4px | Inline icon-to-text gap |
| `--space-2` | 8px | Tight element spacing, input padding-x |
| `--space-3` | 12px | Card internal gutters |
| `--space-4` | 16px | Default section padding, card padding |
| `--space-5` | 20px | Medium section gaps |
| `--space-6` | 24px | Section dividers, form field gaps |
| `--space-8` | 32px | Major section breaks |
| `--space-10` | 40px | Screen top/bottom padding |
| `--space-12` | 48px | Hero spacing |
| `--space-16` | 64px | Bottom nav clearance |

### 1.4 Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-none` | 0px | Sharp edges (tables, inline badges) |
| `--radius-sm` | 4px | Small chips, tags |
| `--radius-md` | 8px | Input fields, small cards |
| `--radius-lg` | 12px | Cards, modals, sheets |
| `--radius-xl` | 16px | Large cards, bottom sheets |
| `--radius-2xl` | 24px | Feature cards, promotional banners |
| `--radius-full` | 9999px | Pill buttons, avatars, floating action button |

### 1.5 Shadow / Elevation System

| Token | Value | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle card lift |
| `--shadow-sm` | `0 2px 4px rgba(0,0,0,0.08)` | Default cards, inputs (focus) |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` | Elevated cards, floating elements |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, bottom sheets |
| `--shadow-xl` | `0 12px 40px rgba(0,0,0,0.15)` | Dialogs, overlays |

---

## 2. Component Inventory

### 2.1 Navigation Components

| Component | Description | States | Priority |
|---|---|---|---|
| **BottomNavBar** | 4-tab navigation (Home, Scan, Add Money, Profile). Add Money has a prominent yellow circular FAB-style button elevated above the bar. | Active, inactive, badge (notification dot) | P0 -- Core |
| **TopBar / AppBar** | Yellow gradient header with screen title, back arrow, optional right actions (language switcher, notifications) | Default, with-back, with-actions, transparent (for camera screens) | P0 -- Core |
| **StepIndicator** | Multi-step progress for registration/eKYC (dot-style or numbered steps) | Active, completed, upcoming, error | P0 -- Registration |

### 2.2 Content Components

| Component | Description | States | Priority |
|---|---|---|---|
| **WalletCard** | Balance display with wallet ID, balance amount (large), currency indicator | Default, loading, zero-balance | P0 -- Core |
| **TransactionItem** | Row with icon, description, amount (+/-), status badge, timestamp | Default, pending, completed, failed | P0 -- Core |
| **QuickActionGrid** | Grid of circular icon buttons (Bills, Referral, Withdrawal, History) with labels | Default, disabled, loading | P0 -- Home |
| **PromotionCarousel** | Horizontal scrollable cards for promotions/information | Default, single-item, empty | P1 -- Home |
| **RecipientCard** | Contact-style card with name, phone, flag icon, last transfer info | Default, selected, new | P0 -- Transfer |
| **BankChannelCard** | Bank logo + name tile for payment/withdrawal channel selection | Default, selected, disabled, unavailable | P0 -- Add Money |
| **VisaCardDisplay** | Virtual card rendering with card number, gradient background, balance chart | Front, back, loading | P1 -- Card |
| **QRCodeDisplay** | Generated QR with payment details, merchant info, amount | Default, expired, loading | P0 -- Add Money |
| **FeeBreakdown** | Itemized fee display (transfer amount, fee, exchange rate, total) | Default, loading | P0 -- Transfer |

### 2.3 Form Components

| Component | Description | States | Priority |
|---|---|---|---|
| **PhoneInput** | Country code selector (flag + code) + phone number field | Default, focus, error, disabled | P0 -- Registration |
| **OTPInput** | 6-digit OTP entry with individual digit boxes | Empty, partial, complete, error, resend-timer | P0 -- Registration |
| **AmountInput** | Large numeric input with currency symbol, optional max-limit indicator | Default, focus, error, exceeds-limit | P0 -- Transfer/Add Money |
| **SelectField** | Dropdown with label (Transfer type, Country, Occupation, etc.) | Default, open, selected, error, disabled | P0 -- Forms |
| **TextField** | Standard text input with label, helper text, character count | Default, focus, filled, error, disabled, read-only | P0 -- Forms |
| **DocumentUpload** | Photo capture/upload area for ID, passport, work permit | Empty, captured, uploading, uploaded, error | P0 -- eKYC |
| **DatePicker** | Calendar-style date selector for transaction history filtering | Default, range-selected | P1 -- History |
| **PasscodeInput** | 6-dot PIN entry with numeric keypad | Empty, partial, complete, error, biometric-option | P0 -- Auth |

### 2.4 Feedback Components

| Component | Description | States | Priority |
|---|---|---|---|
| **StatusModal** | Full-screen or centered modal for success/failure/pending states | Success (green check), Error (red X), Pending (yellow clock), Info (blue i) | P0 -- Core |
| **RejectionCard** | Detailed rejection reason display with specific field callouts and re-upload CTA | Default, with-reasons-list | P0 -- eKYC |
| **Toast / Snackbar** | Temporary notification at bottom of screen | Success, error, info, warning | P1 -- Core |
| **LoadingOverlay** | Full-screen spinner with optional message | Default, with-message | P0 -- Core |
| **EmptyState** | Illustration + message + CTA for empty transaction lists, etc. | Default, with-action | P1 -- Core |
| **MaintenanceScreen** | Full-screen maintenance/update notice | Maintenance, update-required, update-optional | P1 -- System |

### 2.5 Overlay Components

| Component | Description | States | Priority |
|---|---|---|---|
| **BottomSheet** | Slide-up panel for confirmations, details, additional options | Open, closed, with-handle | P0 -- Core |
| **ConfirmationDialog** | Centered modal with title, message, dual CTAs (confirm/cancel) | Default, destructive | P0 -- Core |
| **CameraOverlay** | Full-screen camera view with document/face frame guide | Document-front, document-back, selfie-circle | P0 -- eKYC |
| **LanguageSwitcher** | Dropdown or bottom sheet for language selection (EN/TH/MY) | Open, closed | P1 -- Settings |

---

## 3. UX Flow Analysis

### 3.1 Critical User Journeys

#### Journey 1: First-Time Registration (Highest Risk)

```
Welcome -> Phone Entry -> OTP -> Personal Info -> Document Upload (ID front/back)
-> Face Verification -> Selfie -> Review -> Pending -> Approved/Rejected
```

**Pain Points Identified**:

1. **HIGH: No progress save/resume**. If a user drops off during the multi-step registration (common on mobile -- battery, signal loss, distraction), they must restart entirely. This is devastating for migrant worker users who may have limited data plans and time.
   - **Recommendation**: Implement session persistence. Save completed steps server-side. Allow resume from last completed step with a "Continue Registration" entry point on the welcome screen.

2. **HIGH: eKYC camera UX lacks guidance**. The prototype shows a simple circular frame for selfie and rectangular frame for documents, but no instructional overlays.
   - **Recommendation**: Add real-time guidance overlays: "Move closer", "Hold steady", "Align edges", lighting quality indicator. Show example photos of good vs bad captures. Auto-capture when conditions are met rather than requiring a manual tap.

3. **MEDIUM: Rejection flow is a dead end**. The rejection screens show reasons but the path to re-registration is unclear. Users see "Profile Rejected" but the re-upload flow is buried.
   - **Recommendation**: Make the rejection screen actionable. Show exactly which fields/documents failed with inline "Fix This" CTAs that deep-link to the specific step. Add a progress indicator showing "2 of 5 items need attention."

4. **MEDIUM: No back navigation context**. Multi-step forms lack clear "back to previous step" vs "abandon registration" distinction.
   - **Recommendation**: Back arrow goes to previous step. "X" button triggers an "Are you sure?" dialog with "Save & Exit" and "Discard" options.

#### Journey 2: Send Money (P2P Remittance) -- Core Revenue Flow

```
Home -> Transfer -> Select/Add Recipient -> Enter Amount -> Select Channel
-> Review Fees -> Confirm (Passcode) -> Success Receipt
```

**Pain Points Identified**:

1. **HIGH: Exchange rate anxiety**. The THB-to-MMK conversion is shown but there's no indication of rate lock duration, no comparison to yesterday's rate, and no "best rate" indicator.
   - **Recommendation**: Show "Rate valid for 15:00 minutes" countdown. Add a small sparkline or delta indicator (e.g., "+0.3% vs yesterday"). This builds trust and reduces hesitation.

2. **HIGH: New recipient form is overwhelming**. The form requires: name, NRC (national registration card), phone, occupation, transfer purpose, relationship. This is 8+ fields on a single screen.
   - **Recommendation**: Split into 2-3 progressive steps: (1) Name + Phone, (2) ID details, (3) Purpose/Relationship. Save partial recipients as drafts. Auto-fill occupation and purpose from previous transfers.

3. **MEDIUM: Fee transparency comes too late**. Users select a channel (Wave Agent vs Wave App) before seeing the fee difference.
   - **Recommendation**: Show fee previews inline with channel selection. "Wave Agent: 100 THB fee | Wave App: Free". Let users make informed choices upfront.

4. **LOW: No favorite/recent recipients**. Repeat senders (the majority of remittance users) must scroll through a flat list.
   - **Recommendation**: Pin favorites at top. Show "Recent" section. Add a search bar for recipients.

#### Journey 3: Add Money (Top-Up Wallet)

```
Home -> Add Money -> Enter Amount -> Select Channel (Bank/Store) -> QR Code -> Confirmation
```

**Pain Points Identified**:

1. **MEDIUM: Max top-up limit (25,000 THB) shown but not enforced in real-time**. User could enter 30,000 and only see an error after submission.
   - **Recommendation**: Enforce max in the amount input. Show remaining capacity: "You can add up to 15,000 THB more this month." Gray out the continue button and show inline error when limit is exceeded.

2. **MEDIUM: QR code expiration unclear**. The generated QR for payment has no visible timer.
   - **Recommendation**: Add a countdown timer below the QR. "This QR expires in 14:32". Auto-refresh with a "Generate New QR" button when expired.

3. **LOW: Bank channel logos may not be recognizable to Myanmar users**. Thai bank logos (SCB, KBank, BBL) are familiar to Thai users but potentially confusing for migrant workers.
   - **Recommendation**: Always show full bank name alongside logo. Add "Most Popular" badge to the most commonly used channel.

#### Journey 4: KYC Renewal / Document Update

```
KYC Expired Modal -> Update Now/Later -> Document Selection -> Upload -> Review -> Pending
```

**Pain Points Identified**:

1. **HIGH: "Later" option in KYC expired modal has no consequence explanation**. Users don't know what functionality they lose if they defer.
   - **Recommendation**: "If you update later, you won't be able to send money or add funds until your documents are verified." Show a clear list of locked features.

### 3.2 Micro-Interaction Improvements

| Area | Current | Recommended |
|---|---|---|
| Amount entry | Static input field | Animated currency conversion that updates in real-time as user types |
| Transaction list pull | No indication | Pull-to-refresh with animated loading |
| Balance display | Static number | Animate balance changes with a counting-up animation |
| OTP entry | Manual tab between fields | Auto-advance to next digit on entry, auto-submit on 6th digit |
| QR scan | Camera opens cold | Brief camera warming animation, overlay scan guide |
| Success state | Static checkmark | Animated checkmark with confetti or pulse for dopamine hit |

---

## 4. Accessibility Assessment

### 4.1 WCAG 2.1 AA Compliance Audit

#### Color Contrast Issues

| Issue | Severity | Details | Fix |
|---|---|---|---|
| **Yellow (#FFE600) on white** | CRITICAL | Contrast ratio ~1.07:1. Fails all WCAG criteria. Yellow text on white backgrounds is illegible. | Never use yellow as text color. Use yellow only for backgrounds with dark text (#212121 on #FFE600 = 14.7:1, passes AAA). |
| **White text on yellow** | HIGH | Contrast ratio ~1.07:1. White text on yellow buttons is unreadable. | Use `#212121` (dark gray/black) text on yellow buttons. This is the standard pattern (see Grab, KBank apps). |
| **Gray-500 (#9E9E9E) on white** | MEDIUM | Contrast ratio ~2.8:1. Fails AA for normal text. | Use `#757575` (gray-600) minimum for any text on white backgrounds. |
| **Blue links on yellow header** | MEDIUM | Blue (#0091EA) on yellow (#FFE600) = ~2.3:1. Fails. | Use `#212121` for all text on yellow backgrounds. Reserve blue for white/light backgrounds only. |

#### Touch Target Compliance

| Issue | Severity | Details | Fix |
|---|---|---|---|
| Quick action icons | HIGH | Circular icons in the 4-icon grid appear to be ~36px diameter in prototype. Below 44px minimum. | Increase touch target to minimum 48x48px (including padding). Icon can be 24px with 12px padding each side. |
| Transaction list rows | MEDIUM | Row height appears ~48px which passes, but tap area may not span full width. | Ensure entire row is tappable, not just the text. `min-height: 48px; width: 100%`. |
| Bottom nav items | LOW | Likely adequate given standard iOS tab bar sizing, but verify. | Minimum 48x48px per tab target. Label + icon combined target. |
| OTP digit boxes | MEDIUM | Individual boxes may be too small for fat-finger input. | Minimum 44x44px per box. 48px recommended with 8px gap. |
| Country code selector | HIGH | Small flag + code dropdown trigger may be hard to tap. | Make the entire flag + code area a single 44px-tall tappable zone. |

#### Screen Reader & Assistive Technology

| Issue | Severity | Recommendation |
|---|---|---|
| Wallet balance | HIGH | `aria-label="Wallet balance: 10,000 Thai Baht"` -- not just the number. |
| Transaction amounts | HIGH | `aria-label="Received 5,000 Thai Baht from Add Money on January 15"` -- full context. |
| QR code image | HIGH | `alt="QR code for payment of 5,000 Thai Baht. Payment code: XXXX"` |
| eKYC camera | MEDIUM | Provide audio guidance cues for visually impaired users or clearly state this flow requires visual interaction and offer alternative verification path. |
| Step indicators | MEDIUM | `aria-label="Step 2 of 5: Personal Information"` with `aria-current="step"`. |
| Status modals | HIGH | Auto-focus the modal on open. Announce status: `role="alertdialog"` with `aria-label="Registration successful"`. |
| Bottom navigation | MEDIUM | `role="navigation" aria-label="Main"` on the nav container. `aria-current="page"` on active tab. |
| Country flag icons | LOW | `aria-label="Thailand +66"` not just the flag emoji. |
| Form validation errors | HIGH | Use `aria-describedby` linking error message to input. `aria-invalid="true"` on invalid fields. Announce errors with `role="alert"`. |

#### Language & Internationalization

| Issue | Severity | Recommendation |
|---|---|---|
| Bidirectional text | MEDIUM | Myanmar script is LTR but has unique rendering requirements. Test with real Myanmar text, not lorem ipsum. |
| `lang` attribute | HIGH | Set `lang="th"` or `lang="my"` on the `<html>` element based on selected language. Use `lang` attribute on inline elements when mixing languages. |
| Number formatting | MEDIUM | Thai number formatting uses commas (10,000.00). Myanmar may use different conventions. Use `Intl.NumberFormat` with the appropriate locale. |
| Date formatting | MEDIUM | Thai Buddhist calendar year (2569 = 2026 CE). Support both calendar systems based on user locale. |

### 4.2 Motor Accessibility

- **Swipe gestures**: The promotion carousel uses horizontal swipe. Provide arrow buttons as alternative navigation.
- **Form field spacing**: Minimum 8px vertical gap between tappable form fields to prevent mis-taps.
- **Dismiss patterns**: Bottom sheets should support both swipe-down and tap-outside-to-close.
- **Timeout extensions**: OTP resend timer and QR expiration should have extension options for users who need more time.

---

## 5. Information Architecture

### 5.1 Navigation Structure

```
Root
+-- Home (Tab 1)
|   +-- Wallet Balance
|   +-- Quick Actions
|   |   +-- Bills
|   |   +-- Referral -> Refer Friends
|   |   +-- Withdrawal -> Withdraw Flow
|   |   +-- History -> Transaction History
|   +-- More Features (Expandable)
|   +-- Recent History (Last 5 transactions)
|   +-- Promotions Carousel
|
+-- Scan (Tab 2)
|   +-- QR Scanner Camera
|   +-- Manual Code Entry
|
+-- Add Money (Tab 3 -- Elevated FAB)
|   +-- Amount Entry
|   +-- Channel Selection (Banks / Stores)
|   +-- QR Code Generation
|   +-- Payment Confirmation
|
+-- Profile (Tab 4)
|   +-- Account Info
|   +-- Settings
|   |   +-- Information
|   |   +-- Refer Friends
|   |   +-- Change Passcode
|   |   +-- Manage Personal Info
|   |   +-- Notification Settings
|   +-- Help & Support
|   |   +-- Contact Us (Call, Messenger, Email, Viber)
|   |   +-- Languages
|   |   +-- Limits and Fees
|   |   +-- Q&A Session
|   |   +-- Terms and Conditions
|   |   +-- Privacy Policy
|   +-- Logout
|
+-- Transfer (Accessed from Home Quick Actions or via QR Scan)
|   +-- Recipient List
|   +-- New Recipient Form
|   +-- Amount + Channel Selection
|   +-- Fee Review
|   +-- Confirmation
|   +-- Receipt
|
+-- Registration (Pre-auth flow)
|   +-- Welcome / Phone Entry
|   +-- OTP Verification
|   +-- Personal Info
|   +-- eKYC Document Upload
|   +-- Face Verification
|   +-- Pending / Success / Rejected
|
+-- Visa Card (Secondary feature)
    +-- Card Display
    +-- Card Details
    +-- Delivery Address
```

### 5.2 IA Observations & Recommendations

1. **"More Features" is a hidden drawer pattern**: Hiding features behind an expandable section on Home reduces discoverability. If there are more than 4 quick actions, consider a horizontally scrollable chip row or a dedicated "Services" tab.

2. **Transfer is not a top-level tab**: For a remittance app, "Send Money" is arguably the most important action. It is currently buried under Quick Actions on Home. Consider replacing "Scan" as a dedicated tab or making the elevated FAB button a "Send Money" action instead of "Add Money." Alternatively, the Scan tab could serve as the entry to Send Money (scan recipient QR).

3. **Settings page is overloaded**: The Profile/Settings screen combines personal account management with app-level settings (language, T&C, support). Split into:
   - **Account** (personal info, passcode, notifications)
   - **Support** (contact, FAQ, resources)
   - **Legal** (T&C, privacy)
   - **App** (language, version, logout)

4. **Visa Card is orphaned**: It is not accessible from the main navigation. Add it as an item in the Home quick actions grid or as a card on the Home screen below the wallet balance.

5. **Transaction History has dual entry points**: Accessible from both Home (Recent History "See All") and Quick Actions. This is acceptable but ensure both paths land on the same screen with identical state.

---

## 6. Design Consistency Issues

### 6.1 Identified Inconsistencies

| Issue | Screens Affected | Severity | Recommendation |
|---|---|---|---|
| **Multiple home layouts** | Home (STcMA) vs Home Option 3 (CC2WR) | HIGH | Settle on a single canonical home layout. Option 3 with more visible features is better for discoverability. Eliminate the "More Features" pattern. |
| **Inconsistent CTA button styles** | Transfer confirmation vs Add Money QR screen | MEDIUM | Standardize: Primary CTA = full-width, yellow background, dark text, 48px height, `--radius-full` (pill). Secondary CTA = full-width, outlined, dark border, transparent background. |
| **Status indicator inconsistency** | Transaction History (colored dots) vs Home (text badges) | MEDIUM | Use consistent status indicator pattern: colored dot + text label. Colors: green=completed, amber=pending, red=failed. |
| **Card elevation varies** | Some cards use shadow, others use border-only | LOW | Standardize: content cards get `--shadow-sm` + `1px border`. Elevated/floating elements get `--shadow-md` no border. |
| **Header treatment varies** | Some screens have solid yellow header, others have gradient, "Contact Us" has white header | MEDIUM | Rule: Primary screens (Home, Add Money, Transfer, Profile) get yellow header. Sub-screens and modals get white header with back arrow. |
| **Typography weight inconsistency** | Section labels vary between semibold and regular across screens | LOW | All section labels: `--text-body-sm` weight 600. All body text: weight 400. |
| **Country flag usage** | Some screens use emoji flags, others use image flags | LOW | Use consistent SVG flag icons from a single library (e.g., `flag-icons` npm package). Emoji flags render inconsistently across devices. |
| **Form field label placement** | Some fields use floating labels, others use top-aligned labels | MEDIUM | Standardize on top-aligned labels. Floating labels are problematic for i18n (Thai/Myanmar labels are longer) and accessibility. |
| **Rejection screen styles** | Profile Rejected (nQFBa) vs Registration Rejected (9eIFc) have different layouts | LOW | Unify into a single `StatusScreen` component with variants for: success, pending, rejected. Same layout, different icon/color/copy. |

### 6.2 Missing States (Not Visible in Prototype)

| Missing State | Component | Priority |
|---|---|---|
| Loading / Skeleton | All list screens, wallet card, transaction history | P0 |
| Empty state | Transaction history (new user), recipient list | P0 |
| Offline state | All screens -- what happens with no connectivity? | P0 |
| Error state | API failure on any screen | P0 |
| Pull-to-refresh | Home, transaction history | P1 |
| Biometric auth prompt | Passcode entry alternative | P1 |
| Session timeout | All authenticated screens | P1 |
| Amount exceeds limit | Amount input for top-up and transfer | P0 |
| Duplicate transaction warning | Transfer confirmation | P1 |
| Rate change during session | Transfer flow | P1 |

---

## 7. shadcn/ui Component Mapping

### 7.1 Direct Mappings

| Prototype Component | shadcn/ui Component | Customization Required |
|---|---|---|
| Primary Button (yellow, full-width) | `Button` variant="default" | Override default color to brand yellow with dark text. Add `size="lg"` for 48px height. |
| Secondary Button (outlined) | `Button` variant="outline" | Standard usage. |
| Ghost Button (text-only) | `Button` variant="ghost" | Standard usage. |
| Destructive Button (red, for logout/delete) | `Button` variant="destructive" | Standard usage. |
| Text Input | `Input` | Wrap with custom `FormField` for label, helper text, error state. |
| Select Dropdown | `Select` | Standard. Use `SelectTrigger`, `SelectContent`, `SelectItem`. |
| Phone Number Input | `Input` + custom `CountryCodeSelect` | Compose: `Select` (country code with flag) + `Input` (number). Wrap in a single visual container. |
| OTP Input | `InputOTP` (from `input-otp`) | shadcn provides this. Use `InputOTP`, `InputOTPGroup`, `InputOTPSlot`. |
| Date Picker | `Calendar` + `Popover` | Use shadcn's calendar component with popover trigger. Add range selection for history filter. |
| Bottom Sheet | `Drawer` (from `vaul`) | shadcn wraps Vaul. Use `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`. |
| Confirmation Dialog | `AlertDialog` | `AlertDialogAction` + `AlertDialogCancel`. |
| Status Modal | `Dialog` | Custom content with icon, title, description, CTA. |
| Toast / Notification | `Sonner` (toast) | shadcn uses Sonner. `toast.success()`, `toast.error()`, etc. |
| Transaction Item Row | Custom using `Card` or raw div | Not a direct shadcn component. Build from scratch using design tokens. |
| Quick Action Grid | Custom | Grid of `Button` variant="ghost" with icon + label. |
| Wallet Card | `Card` | `Card`, `CardHeader`, `CardContent`. Heavy customization for balance display. |
| Tabs (if used) | `Tabs` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. |
| Progress Steps | Custom `Stepper` | No built-in shadcn stepper. Build custom using design tokens or use a headless stepper library. |
| Avatar (user profile) | `Avatar` | `Avatar`, `AvatarImage`, `AvatarFallback`. |
| Badge (status) | `Badge` | Custom variants: `success`, `warning`, `error`, `pending`. |
| Skeleton Loading | `Skeleton` | Standard usage. Compose for each content card shape. |
| Tooltip (help icons) | `Tooltip` | Standard usage. |
| Separator (dividers) | `Separator` | Standard usage between sections. |
| Scroll Area (transaction list) | `ScrollArea` | For long scrollable lists with custom scrollbar. |
| Carousel (promotions) | `Carousel` (Embla-based) | shadcn wraps Embla. `Carousel`, `CarouselContent`, `CarouselItem`. |
| Navigation Menu | Custom `BottomNav` | No direct shadcn equivalent. Build custom fixed-bottom nav. |
| Country Code Select | `Command` (combobox pattern) | Use `Command` + `CommandInput` + `CommandList` for searchable country list with flags. |

### 7.2 Custom Components Needed (No shadcn Equivalent)

| Component | Build Strategy |
|---|---|
| `BottomNavBar` | Fixed-bottom flex container, 4 tabs, SVG icons, yellow FAB for Add Money. CSS: `position: fixed; bottom: 0; z-index: 50`. |
| `WalletBalanceCard` | Custom card with large display text, currency, wallet ID. Gradient or solid yellow variant. |
| `AmountInput` | Large centered numeric display with currency prefix, linked to a custom numeric keypad or native input. |
| `TransactionRow` | Flex row: icon + text block (title, subtitle) + amount block (amount, status badge). |
| `FeeBreakdown` | Definition list style: label-value rows with separator, total row in bold. |
| `BankChannelGrid` | CSS Grid of selectable bank tiles (logo + name). Single-select radio behavior. |
| `CameraOverlay` | Full-screen overlay with SVG guide frame (rectangle for documents, circle for selfie), instruction text. |
| `StepIndicator` | Horizontal flex with numbered/dotted steps, connecting lines, active/completed/upcoming states. |
| `QRCodeCard` | QR image (use `qrcode.react`) + payment details below in a receipt-style card. |
| `RecipientCard` | Contact-list-style row with avatar/initials, name, phone, country flag. |
| `CurrencyConverter` | Inline display showing `THB amount -> MMK amount` with live rate and fee. |
| `PasscodeKeypad` | 3x4 numeric grid + 6-dot display. Custom build or use a keypad library. |

---

## 8. CSS Variables / Design Token Recommendations

### 8.1 Full Token Set (CSS Custom Properties)

```css
:root {
  /* ============================================
   * BRAND COLORS
   * ============================================ */
  --color-brand-yellow-50: #FFFDE7;
  --color-brand-yellow-100: #FFF9C4;
  --color-brand-yellow-200: #FFF176;
  --color-brand-yellow-300: #FFEE58;
  --color-brand-yellow-400: #FFEB3B;
  --color-brand-yellow: #FFE600;         /* Primary brand */
  --color-brand-yellow-600: #FDD835;
  --color-brand-yellow-700: #FBC02D;
  --color-brand-yellow-800: #F9A825;
  --color-brand-yellow-900: #F57F17;

  --color-brand-blue-50: #E1F5FE;
  --color-brand-blue-100: #B3E5FC;
  --color-brand-blue-200: #81D4FA;
  --color-brand-blue-300: #4FC3F7;
  --color-brand-blue-400: #29B6F6;
  --color-brand-blue: #0091EA;           /* Secondary brand */
  --color-brand-blue-600: #0277BD;
  --color-brand-blue-700: #01579B;

  --color-brand-dark: #1A1A2E;           /* Dark backgrounds */

  /* ============================================
   * SEMANTIC COLORS
   * ============================================ */
  --color-success: #00C853;
  --color-success-light: #E8F5E9;
  --color-warning: #FF9800;
  --color-warning-light: #FFF3E0;
  --color-error: #F44336;
  --color-error-light: #FFEBEE;
  --color-info: #0091EA;
  --color-info-light: #E1F5FE;

  /* ============================================
   * NEUTRAL PALETTE
   * ============================================ */
  --color-white: #FFFFFF;
  --color-gray-50: #FAFAFA;
  --color-gray-100: #F5F5F5;
  --color-gray-200: #EEEEEE;
  --color-gray-300: #E0E0E0;
  --color-gray-400: #BDBDBD;
  --color-gray-500: #9E9E9E;
  --color-gray-600: #757575;
  --color-gray-700: #616161;
  --color-gray-800: #424242;
  --color-gray-900: #212121;

  /* ============================================
   * SHADCN/UI SEMANTIC MAPPING
   * ============================================ */
  --background: #FFFFFF;
  --foreground: #212121;
  --card: #FFFFFF;
  --card-foreground: #212121;
  --popover: #FFFFFF;
  --popover-foreground: #212121;
  --primary: #FFE600;
  --primary-foreground: #212121;
  --secondary: #F5F5F5;
  --secondary-foreground: #212121;
  --muted: #FAFAFA;
  --muted-foreground: #757575;
  --accent: #0091EA;
  --accent-foreground: #FFFFFF;
  --destructive: #F44336;
  --destructive-foreground: #FFFFFF;
  --border: #E0E0E0;
  --input: #E0E0E0;
  --ring: #FFE600;
  --radius: 0.5rem;

  /* ============================================
   * TYPOGRAPHY
   * ============================================ */
  --font-family-primary: 'Kanit', 'Noto Sans Thai', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-family-myanmar: 'Padauk', 'Noto Sans Myanmar', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  --text-display-size: 1.75rem;    /* 28px */
  --text-display-weight: 700;
  --text-display-line-height: 1.2;
  --text-display-letter-spacing: -0.02em;

  --text-h1-size: 1.5rem;         /* 24px */
  --text-h1-weight: 700;
  --text-h1-line-height: 1.3;

  --text-h2-size: 1.25rem;        /* 20px */
  --text-h2-weight: 600;
  --text-h2-line-height: 1.35;

  --text-h3-size: 1.125rem;       /* 18px */
  --text-h3-weight: 600;
  --text-h3-line-height: 1.4;

  --text-h4-size: 1rem;           /* 16px */
  --text-h4-weight: 600;
  --text-h4-line-height: 1.4;

  --text-body-size: 1rem;         /* 16px */
  --text-body-weight: 400;
  --text-body-line-height: 1.5;

  --text-body-sm-size: 0.875rem;  /* 14px */
  --text-body-sm-weight: 400;
  --text-body-sm-line-height: 1.5;

  --text-caption-size: 0.75rem;   /* 12px */
  --text-caption-weight: 400;
  --text-caption-line-height: 1.4;

  --text-overline-size: 0.625rem; /* 10px */
  --text-overline-weight: 600;
  --text-overline-line-height: 1.6;
  --text-overline-letter-spacing: 0.08em;

  /* ============================================
   * SPACING (4px base)
   * ============================================ */
  --space-0: 0px;
  --space-px: 1px;
  --space-0-5: 2px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* ============================================
   * BORDER RADIUS
   * ============================================ */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* ============================================
   * SHADOWS
   * ============================================ */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.10);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.15);

  /* ============================================
   * ANIMATION / MOTION
   * ============================================ */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ============================================
   * Z-INDEX SCALE
   * ============================================ */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-toast: 70;
  --z-tooltip: 80;

  /* ============================================
   * LAYOUT
   * ============================================ */
  --viewport-width: 375px;
  --container-max: 428px;   /* Max width for mobile-first layout */
  --header-height: 56px;
  --bottom-nav-height: 64px;
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --content-padding-x: 16px;
}
```

### 8.2 Tailwind CSS v4 Theme Extension

```css
/* app/globals.css -- Tailwind v4 with CSS-first config */
@import "tailwindcss";

@theme {
  /* Brand */
  --color-brand-yellow: #FFE600;
  --color-brand-blue: #0091EA;
  --color-brand-dark: #1A1A2E;

  /* Semantic */
  --color-success: #00C853;
  --color-warning: #FF9800;
  --color-error: #F44336;

  /* Font */
  --font-primary: 'Kanit', 'Noto Sans Thai', system-ui, -apple-system, sans-serif;
  --font-myanmar: 'Padauk', 'Noto Sans Myanmar', sans-serif;

  /* Radius */
  --radius-card: 12px;
  --radius-button: 9999px;
  --radius-input: 8px;

  /* Shadows */
  --shadow-card: 0 2px 4px rgba(0, 0, 0, 0.08);
  --shadow-elevated: 0 4px 12px rgba(0, 0, 0, 0.10);
  --shadow-modal: 0 8px 24px rgba(0, 0, 0, 0.12);

  /* Animation */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 8.3 Component-Level Token Application

```
BUTTON (Primary):
  background: var(--color-brand-yellow)
  color: var(--color-gray-900)       /* Dark text on yellow -- WCAG AAA */
  height: 48px
  padding: 0 var(--space-6)
  border-radius: var(--radius-full)
  font: var(--text-body-size) / var(--text-body-line-height) var(--font-family-primary)
  font-weight: 600
  transition: all var(--duration-normal) var(--ease-default)
  hover: background var(--color-brand-yellow-700)
  active: scale(0.98)
  disabled: opacity 0.5, pointer-events none

INPUT:
  height: 48px
  padding: var(--space-3) var(--space-4)
  border: 1px solid var(--color-gray-300)
  border-radius: var(--radius-md)
  font: var(--text-body-size) var(--font-family-primary)
  focus: border-color var(--color-brand-yellow), ring 2px var(--color-brand-yellow-200)
  error: border-color var(--color-error), ring 2px var(--color-error-light)

CARD:
  background: var(--color-white)
  border: 1px solid var(--color-gray-200)
  border-radius: var(--radius-lg)
  padding: var(--space-4)
  shadow: var(--shadow-sm)

BOTTOM NAV:
  background: var(--color-white)
  height: var(--bottom-nav-height)
  padding-bottom: var(--safe-area-bottom)
  border-top: 1px solid var(--color-gray-200)
  shadow: 0 -2px 8px rgba(0, 0, 0, 0.06)
  z-index: var(--z-fixed)
  active-tab-color: var(--color-brand-yellow-800)
  inactive-tab-color: var(--color-gray-400)
  fab-button: 56px circle, background var(--color-brand-yellow), shadow var(--shadow-md), transform translateY(-12px)

HEADER / APP BAR:
  height: var(--header-height)
  background: var(--color-brand-yellow)
  color: var(--color-gray-900)
  font: var(--text-h3-size) weight 600
  padding: 0 var(--space-4)
  z-index: var(--z-sticky)

STATUS BADGE:
  height: 24px
  padding: 0 var(--space-2)
  border-radius: var(--radius-full)
  font: var(--text-caption-size) weight 500
  completed: bg var(--color-success-light), color #1B5E20
  pending: bg var(--color-warning-light), color #E65100
  failed: bg var(--color-error-light), color #B71C1C
```

---

## Appendix A: Implementation Priority Matrix

| Priority | Components | Rationale |
|---|---|---|
| **P0 -- Sprint 1** | BottomNavBar, TopBar, Button (all variants), Input, PhoneInput, OTPInput, WalletBalanceCard, StatusModal, LoadingOverlay, PasscodeKeypad | Core shell and authentication flow. Users cannot proceed without these. |
| **P0 -- Sprint 2** | TransactionRow, AmountInput, RecipientCard, BankChannelGrid, FeeBreakdown, QRCodeCard, ConfirmationDialog, BottomSheet, Badge, SelectField | Money transfer and top-up flows -- the revenue-generating features. |
| **P1 -- Sprint 3** | QuickActionGrid, PromotionCarousel, DatePicker, TransactionHistoryFilter, EmptyState, SkeletonLoaders, StepIndicator | Home screen polish and history features. |
| **P1 -- Sprint 4** | VisaCardDisplay, DocumentUpload, CameraOverlay, RejectionCard, LanguageSwitcher, MaintenanceScreen, Toast | eKYC flow, card feature, and system states. |
| **P2 -- Sprint 5** | CurrencyConverter animation, pull-to-refresh, biometric auth prompt, duplicate transaction warning, rate change notification | Polish, edge cases, and trust-building features. |

## Appendix B: Key Design Decisions Log

| Decision | Rationale |
|---|---|
| Dark text on yellow buttons (not white) | WCAG AA compliance. White on yellow fails at 1.07:1 contrast. Dark gray on yellow passes at 14.7:1. |
| Top-aligned form labels (not floating) | Thai and Myanmar text is longer than English. Floating labels truncate. Top labels accommodate all three languages. |
| 48px minimum touch targets | WCAG 2.5.5 (AAA) and Apple HIG recommend 44px minimum. 48px gives additional comfort for the demographic (migrant workers who may use lower-end devices with less precise touch screens). |
| Kanit as primary font | Industry standard for Thai fintech. Supports both Thai and Latin glyphs. Professional yet approachable. |
| Pill-shaped primary buttons | Aligns with prototype's rounded CTA style. Creates visual distinction from card corners (12px) and input fields (8px). |
| 4px spacing grid | Provides fine-grained control needed for mobile layouts. 8px grid is too coarse for compact elements like badges and inline spacing. |
| Separate Myanmar font stack | Myanmar script has unique rendering requirements (complex ligatures, tall ascenders). A single font stack cannot serve both Thai and Myanmar well. Apply the Myanmar font stack conditionally based on `lang` attribute. |

## Appendix C: Risk Register

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Myanmar font rendering issues on older Android devices | HIGH | MEDIUM | Test on actual low-end Android devices (Samsung J series, Xiaomi Redmi). Bundle Padauk as a web font. |
| Yellow brand color fails accessibility on certain screens | HIGH | HIGH | Establish strict rule: yellow is ONLY a background/accent color, never text. All text on yellow surfaces must be `--color-gray-900`. |
| eKYC camera API inconsistencies across mobile browsers | HIGH | HIGH | Use a proven camera library (e.g., `react-webcam` or a commercial eKYC SDK). Test on Chrome Android, Safari iOS, Samsung Internet, UC Browser. |
| OTP delivery failures in Myanmar (SMS reliability) | HIGH | MEDIUM | Implement OTP retry with exponential backoff. Offer Viber/WhatsApp as alternative OTP channels. |
| Exchange rate staleness during transfer flow | MEDIUM | HIGH | Lock rate at confirmation step with visible countdown. Implement WebSocket for real-time rate updates during the flow. |
| Bottom navigation obscures content on small screens | MEDIUM | MEDIUM | Add `padding-bottom: calc(var(--bottom-nav-height) + var(--safe-area-bottom))` to all scrollable content containers. |
| Dual calendar system (Buddhist/Gregorian) confusion | MEDIUM | MEDIUM | Default to Gregorian. Offer Thai Buddhist year as a display preference in settings. Never mix calendar systems on the same screen. |
