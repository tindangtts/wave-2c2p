# 2C2P Wave - Mobile Banking & Remittance Web App

## Project Overview

**Product**: 2C2P Wave - A mobile-first banking and cross-border remittance web application
**Target Markets**: Thailand (THB) ↔ Myanmar (MMK) corridor
**Platform**: Progressive Web App (mobile-first, responsive)
**Tech Stack**: Next.js 15+ (App Router) + Supabase + shadcn/ui + Tailwind CSS

## Vision

2C2P Wave enables migrant workers and individuals to send money across borders (Thailand ↔ Myanmar), manage digital wallets, perform eKYC verification, and access basic banking services through a simple, accessible mobile web interface.

---

## Target Users

### Primary Persona: Migrant Worker
- **Demographics**: Myanmar nationals working in Thailand, ages 20-45
- **Tech Literacy**: Basic smartphone users, may have limited internet
- **Needs**: Send money home quickly and affordably, comply with regulations
- **Pain Points**: Complex registration, language barriers (Thai/Myanmar/English), limited banking access

### Secondary Persona: Thai National
- **Demographics**: Thai residents using digital wallet services
- **Needs**: Top-up wallet, pay bills, manage funds, referral rewards

---

## Feature Modules

### 1. Authentication & Onboarding
- **Phone Login**: Country code selector (+66 TH, +95 MM), phone number input
- **OTP Verification**: 6-digit SMS OTP with resend timer
- **Registration Flow**: Multi-step form (personal info, ID details)
- **Passcode Setup**: 6-digit app passcode for quick login
- **Biometric Login**: Optional fingerprint/face unlock (future)
- **Session Management**: Auto-logout, session timeout warnings

### 2. eKYC (Electronic Know Your Customer) - MOCK SERVICE
- **Document Scanning**: 
  - ID card front/back capture with camera overlay guide
  - Work permit / Pink Card / OWIC / Visa document upload
  - Document type selection
- **Face Verification**: 
  - Liveness detection with circular frame guide
  - Selfie capture and comparison
- **KYC Status Management**:
  - Pending review state
  - Approved state
  - Rejected state with specific reasons
  - KYC Expired modal with "Later/Now" options
  - Re-submission flow after rejection
- **Mock Implementation**: 
  - Simulated document OCR extraction
  - Simulated face match scoring (configurable pass/fail)
  - Configurable review delay (instant/delayed approval)
  - Mock rejection reasons library

### 3. Home Dashboard
- **Header**: 2C2P Wave branding, notification bell, language switcher
- **User Profile Card**: Name, wallet balance (THB), wallet ID, eye toggle for balance
- **Quick Actions Grid**: 
  - Bills, Referral, Withdrawal, History
  - "More Features" expandable section
- **Recent History**: Last 5 transactions with status (Success/Rejected/Pending)
- **Promotions Carousel**: Banner slider with promotional content
- **Bottom Navigation**: Home, Scan, Add Money (prominent), Profile

### 4. Wallet & Add Money
- **Balance Display**: Current balance + maximum top-up limit
- **Amount Input**: Numeric keypad with THB currency
- **Top-up Channels Grid**:
  - Bank transfers (SCB, KBank, Bangkok Bank, Krungsri, etc.)
  - Convenience stores (7-Eleven, CashPay, FamilyMart)
  - QR code generation
- **QR Payment Flow**:
  - Generate QR with amount
  - Payment code display
  - Receipt/confirmation with merchant details
  - Timer for payment validity

### 5. Money Transfer (P2P & Remittance) - MOCK PAYMENT SERVICE
- **Transfer Initiation**:
  - Select recipient or scan QR
  - Amount entry with real-time currency conversion (THB → MMK)
  - Exchange rate display with fee breakdown
- **Receiving Channels**:
  - Wave Agent (with fees)
  - Wave App (with fees)
  - Cash Pickup at Yoma Bank
  - Bank Transfer
- **Recipient Management**:
  - Add new recipient form
  - Recipient list with favorites
  - Recipient details: name, phone, NRC, occupation, transfer purpose, relationship
- **Transfer Confirmation**:
  - Summary with converted amounts
  - Fee breakdown
  - Passcode/OTP confirmation
- **Mock Implementation**:
  - Simulated transfer processing (configurable delay)
  - Mock exchange rates (configurable)
  - Mock fee calculation engine
  - Simulated status updates (pending → processing → completed/failed)

### 6. Withdrawal
- **Recipient Selection**: Choose from saved recipients
- **Amount Entry**: THB amount with balance validation
- **Bank Selection**: Supported bank list
- **Withdrawal Confirmation**: Summary and passcode entry
- **Status Tracking**: Real-time withdrawal status

### 7. Transaction History
- **Transaction List**: Chronological with infinite scroll
- **Filters**: 
  - Date range picker (calendar component)
  - Transaction type filter
  - Status filter (Success/Pending/Rejected)
- **Transaction Detail/Receipt**:
  - Full transaction breakdown
  - Sender/receiver details
  - Exchange rate at time of transaction
  - Reference number
  - Share/download receipt

### 8. Visa Card Management
- **Virtual Card Display**: Card design with masked number
- **Card Details**: Full card number reveal, CVV, expiry
- **Card Balance**: Separate card balance with chart visualization
- **Card Actions**: Freeze, set limits
- **Delivery Address**: Physical card order with address form
- **Card Status**: Order tracking, activation

### 9. Profile & Settings
- **Profile Information**: View/edit personal details
- **Phone Number Change**: Multi-step verification flow
- **Passcode Change**: Current → New passcode flow
- **Manage Personal Information**: Update address, occupation, etc.
- **Notification Settings**: Push notification preferences
- **Language Selection**: English / Thai / Myanmar
- **Refer Friends**: 
  - Monthly referral count with rewards
  - QR code generation for sharing
  - Share link functionality
- **Contact Us**: 
  - Call center number with direct dial
  - Social channels (Messenger, Email, Viber)
  - App resources and help videos
- **Legal**: Terms & Conditions, Privacy Policy
- **Limits & Fees**: Transaction limits and fee schedule
- **Q&A / FAQ**: Help section
- **App Version**: Display current version
- **Logout**: Session termination

### 10. System States
- **Software Update Required**: Force update prompt
- **Server Maintenance**: Maintenance mode with message
- **Network Error**: Offline state handling
- **Registration Pending**: Waiting for approval screen
- **Profile/Registration Rejected**: Rejection with reasons and next steps

---

## Technical Architecture

### Frontend (Next.js 15+ App Router)
```
app/
├── (auth)/                    # Auth group - no bottom nav
│   ├── login/                 # Phone + OTP login
│   ├── register/              # Multi-step registration
│   ├── kyc/                   # eKYC document + face verification
│   └── passcode/              # Passcode setup/entry
├── (main)/                    # Main app group - with bottom nav
│   ├── home/                  # Dashboard
│   ├── scan/                  # QR scanner
│   ├── add-money/             # Top-up wallet
│   │   └── qr/               # QR code payment
│   ├── profile/               # Settings & profile
│   │   ├── settings/
│   │   ├── phone-change/
│   │   ├── refer/
│   │   └── contact/
│   ├── transfer/              # P2P transfer flow
│   │   ├── recipient/         # Add/select recipient
│   │   ├── amount/            # Amount + conversion
│   │   └── confirm/           # Confirmation
│   ├── withdraw/              # Withdrawal flow
│   ├── history/               # Transaction history
│   │   └── [id]/              # Transaction detail
│   └── card/                  # Visa card management
├── api/                       # API routes
│   ├── auth/
│   ├── mock-kyc/              # Mock eKYC service
│   ├── mock-payment/          # Mock payment processing
│   ├── transfer/
│   └── wallet/
├── layout.tsx                 # Root layout
└── globals.css                # Global styles + design tokens
```

### Backend (Supabase)
```sql
-- Core tables
users                    -- User accounts
user_profiles            -- Extended profile info
kyc_documents            -- KYC document records
kyc_verifications        -- Verification status/results
wallets                  -- User wallets (THB)
transactions             -- All transaction records
recipients               -- Saved recipients
transfer_orders          -- Transfer/remittance orders
cards                    -- Virtual/physical card records
notifications            -- Push notification records
referrals                -- Referral tracking
otp_codes                -- OTP verification codes

-- RLS policies for row-level security on all tables
```

### Mock Services Architecture
```
/api/mock-kyc/
├── verify-document      # Mock document OCR + validation
├── verify-face          # Mock face liveness + match
├── status               # Mock KYC review status
└── reject-reasons       # Mock rejection reasons

/api/mock-payment/
├── exchange-rate        # Mock THB↔MMK rates
├── calculate-fees       # Mock fee calculation
├── process-transfer     # Mock transfer processing
├── process-topup        # Mock top-up processing
└── status/[id]          # Mock transaction status polling
```

### Key Technical Decisions
- **Mobile-first PWA**: 375px base viewport, responsive up
- **Server Components by default**: Client components only for interactivity
- **Supabase Auth**: Phone/OTP authentication
- **Supabase Realtime**: Live transaction status updates
- **Image handling**: next/image for optimized document/card images
- **i18n**: next-intl for English/Thai/Myanmar language support
- **State management**: Zustand for client state, server state via SWR/fetch
- **Form handling**: React Hook Form + Zod validation

---

## Design System (shadcn/ui + Custom Theme)

### Color Palette (extracted from prototype)
```css
--wave-yellow: #FFE600;          /* Primary brand - headers, CTAs */
--wave-yellow-light: #FFF9C4;    /* Light yellow backgrounds */
--wave-blue: #0091EA;            /* Secondary - links, accents */
--wave-blue-dark: #01579B;       /* Status bar, dark blue */
--wave-white: #FFFFFF;           /* Content backgrounds */
--wave-gray-50: #F5F5F5;         /* Page backgrounds */
--wave-gray-100: #EEEEEE;        /* Dividers */
--wave-gray-300: #BDBDBD;        /* Disabled states */
--wave-gray-500: #9E9E9E;        /* Secondary text */
--wave-gray-900: #212121;        /* Primary text */
--wave-success: #4CAF50;         /* Success states */
--wave-error: #F44336;           /* Error states */
--wave-warning: #FF9800;         /* Warning states */
```

### Typography Scale
```css
--font-heading-xl: 700 24px/32px;   /* Page titles */
--font-heading-lg: 700 20px/28px;   /* Section headers */
--font-heading-md: 600 18px/24px;   /* Card titles */
--font-body-lg: 400 16px/24px;      /* Body text */
--font-body-md: 400 14px/20px;      /* Secondary text */
--font-body-sm: 400 12px/16px;      /* Captions, fees */
--font-label: 500 14px/20px;        /* Form labels */
--font-amount: 700 28px/36px;       /* Money amounts */
```

### Component Mapping (Prototype → shadcn/ui)
| Prototype Component | shadcn/ui Equivalent | Customization |
|---------------------|---------------------|---------------|
| Yellow CTA Button | Button (default) | Yellow bg, rounded-full, full-width |
| Outlined Button | Button (outline) | Border, rounded-full |
| Text Input | Input | Custom label, country prefix |
| Phone Input | Input + Select | Country code dropdown + input |
| OTP Input | InputOTP | 6-digit, auto-focus |
| Amount Input | Input | Numeric, currency suffix |
| Dropdown Select | Select | Custom trigger styling |
| Bottom Sheet | Drawer | Mobile bottom sheet |
| Modal Dialog | Dialog | Centered, rounded |
| Transaction Card | Card | Custom layout |
| Tab Navigation | Tabs | Bottom nav custom |
| Toast/Alert | Toast | Status-colored |
| Calendar Picker | Calendar | Date range mode |
| Avatar | Avatar | User profile image |
| Badge | Badge | Status badges |
| Carousel | Carousel | Promotion banners |
| Skeleton | Skeleton | Loading states |

---

## Non-Functional Requirements

- **Performance**: LCP < 2.5s, FID < 100ms on 3G
- **Accessibility**: WCAG 2.1 AA minimum, touch targets 44x44px
- **Security**: HTTPS, CSP headers, input sanitization, rate limiting
- **Offline**: Basic offline support with service worker
- **i18n**: RTL-ready, 3 languages (EN/TH/MM)
- **Testing**: Component tests + integration tests for critical flows

---

## Success Metrics (KPIs)
- Registration completion rate > 80%
- Average transfer time < 30 seconds
- App crash rate < 0.1%
- Customer support ticket rate < 5%
- Monthly active users growth > 10% MoM
