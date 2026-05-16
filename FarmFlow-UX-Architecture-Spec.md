# FarmFlow UX Architecture Specification Document

## Product Overview

FarmFlow is an agricultural web application designed for smallholder farmers across Africa, with primary focus on Nigeria. The platform enables farmers to track crops, receive farming advice, and connect with buyers through voice-first, image-forward interfaces optimized for low-end devices and limited connectivity.

## Design Principles

1. **Voice-First Architecture** - All core interactions support voice input; text input is secondary
2. **Offline-First** - Critical features work without connectivity; sync when available
3. **Progressive Complexity** - Simple views by default; advanced features revealed on demand
4. **Visual Over Text** - Icons, images, and voice replace written instructions wherever possible
5. **Local Language Priority** - Interface defaults to user's language; English is secondary
6. **Low Data Consumption** - Minimal payloads; heavy caching; compression-first design
7. **Trust Anchoring** - Extension officer verification; community validation; clear provenance on advice

---

# 1. Information Architecture

## 1.1 Full Sitemap

### Section A: Onboarding & Authentication

| Page ID | Page Name | Purpose | Access |
|---------|-----------|---------|--------|
| A1 | Language Selection | Select preferred language and region | Public |
| A2 | Welcome Screen | App introduction and value proposition | Public |
| A3 | Phone Number Input | Enter phone number for OTP | Public |
| A4 | OTP Verification | Verify phone via SMS/voice OTP | Public |
| A5 | Profile Setup | Basic profile (name, location, crops) | Authenticated |
| A6 | Device Permissions | Request microphone, camera, notifications | Authenticated |
| A7 | Main Dashboard Entry | Direct to appropriate dashboard type | Authenticated |

### Section B: Core Feature - Crop Health

| Page ID | Page Name | Purpose | Access |
|---------|-----------|---------|--------|
| B1 | Crop Health Scanner | Capture photo or voice note of crop | Authenticated |
| B2 | Analysis Processing | Show analysis in progress | Authenticated |
| B3 | Disease Result | Display disease identification and treatment | Authenticated |
| B4 | Treatment Details | Full treatment instructions with locally available products | Authenticated |
| B5 | Disease History | List of past disease scans | Authenticated |

### Section C: Core Feature - Planting Calendar

| Page ID | Page Name | Purpose | Access |
|---------|-----------|---------|--------|
| C1 | Planting Calendar Home | View current and upcoming planting activities | Authenticated |
| C2 | Crop Selection | Select crop for planting advice | Authenticated |
| C3 | Region Selection | Confirm or select farming region | Authenticated |
| C4 | Planting Schedule | Display planting windows and recommendations | Authenticated |
| C5 | Weather Integration | Show rainfall predictions and soil conditions | Authenticated |

### Section D: Core Feature - Market & Prices

| Page ID | Page Name | Purpose | Access |
|---------|-----------|---------|--------|
| D1 | Market Dashboard | Overview of prices and active listings | Authenticated |
| D2 | Price Alerts | Configure and view price alerts | Authenticated |
| D3 | Produce Listing | Create new produce listing | Authenticated |
| D4 | My Listings | View active and past listings | Authenticated |
| D5 | Buyer Offers | View incoming offers on listings | Authenticated |
| D6 | Buyer Profile | View buyer information and ratings | Authenticated |
| D7 | Direct Message | Chat with potential buyers | Authenticated |
| D8 | Escrow Payment | Payment processing and confirmation | Authenticated |

### Section E: Core Feature - Livestock Health

| Page ID | Page Name | Purpose | Access |
|---------|-----------|---------|--------|
| E1 | Livestock Dashboard | Overview of animal health status | Authenticated |
| E2 | Animal Health Check | Describe symptoms via voice | Authenticated |
| E3 | Health Result | Display triage result and recommendations | Authenticated |
| E4 | Vet Directory | Find nearby veterinary services | Authenticated |
| E5 | Health History | Past health consultations | Authenticated |

### Section F: Core Feature - Weather & Alerts

| Page ID | Page Name | Purpose | Access |
|---------|-----------|---------|--------|
| F1 | Weather Dashboard | Current and forecasted weather | Authenticated |
| F2 | Weather Alerts | Active weather warnings | Authenticated |
| F3 | Climate Advisory | Seasonal climate guidance | Authenticated |

### Section G: Core Feature - Farm Records

| Page ID | Page Name | Purpose | Access |
|---------|-----------|---------|--------|
| G1 | Farm Records Dashboard | Overview of farm activities | Authenticated |
| G2 | Add Farm Activity | Log planting, harvesting, inputs | Authenticated |
| G3 | Activity History | View past farm activities | Authenticated |
| G4 | Harvest Tracking | Track harvest quantities and dates | Authenticated |
| G5 | Input Tracking | Fertilizer, pesticide, seed usage | Authenticated |

### Section H: User Profile & Settings

| Page ID | Page Name | Purpose | Access |
|---------|-----------|---------|--------|
| H1 | Profile Overview | View and edit profile | Authenticated |
| H2 | Language Settings | Change language and region | Authenticated |
| H3 | Notification Settings | Configure alerts and notifications | Authenticated |
| H4 | Data & Storage | Manage cached data and sync | Authenticated |
| H5 | Privacy Settings | Control data sharing preferences | Authenticated |
| H6 | Help & Support | Get help or contact support | Authenticated |
| H7 | Extension Officer | Connect with local extension officer | Authenticated |

### Section I: USSD Fallback (Feature Phone)

| Page ID | Page Name | Purpose | Access |
|---------|-----------|---------|--------|
| I1 | USSD Menu Home | Main USSD menu | USSD |
| I2 | USSD Crop Health | Crop disease via USSD | USSD |
| I3 | USSD Market Prices | Price lookup via USSD | USSD |
| I4 | USSD Planting Info | Planting calendar via USSD | USSD |

---

## 1.2 Hierarchy Structure

```
FarmFlow App
├── Onboarding & Auth
│   ├── Language Selection (A1)
│   ├── Welcome (A2)
│   ├── Phone Input (A3)
│   ├── OTP Verification (A4)
│   ├── Profile Setup (A5)
│   └── Device Permissions (A6)
│
├── Main Dashboard (Entry Point)
│   ├── Quick Stats Banner
│   ├── Recent Activity
│   ├── Active Alerts
│   └── Navigation to All Sections
│
├── Crop Health (B)
│   ├── Scanner (B1) → Analysis (B2) → Result (B3) → Treatment (B4)
│   └── History (B5)
│
├── Planting Calendar (C)
│   ├── Calendar Home (C1)
│   ├── Crop Selection (C2)
│   ├── Region Selection (C3)
│   ├── Schedule View (C4)
│   └── Weather Integration (C5)
│
├── Market & Prices (D)
│   ├── Dashboard (D1)
│   ├── Price Alerts (D2)
│   ├── Create Listing (D3)
│   ├── My Listings (D4)
│   ├── Buyer Offers (D5)
│   ├── Buyer Profile (D6)
│   ├── Messaging (D7)
│   └── Escrow (D8)
│
├── Livestock Health (E)
│   ├── Dashboard (E1)
│   ├── Health Check (E2) → Result (E3)
│   ├── Vet Directory (E4)
│   └── History (E5)
│
├── Weather & Alerts (F)
│   ├── Dashboard (F1)
│   ├── Alerts (F2)
│   └── Climate Advisory (F3)
│
├── Farm Records (G)
│   ├── Dashboard (G1)
│   ├── Add Activity (G2)
│   ├── History (G3)
│   ├── Harvest (G4)
│   └── Inputs (G5)
│
├── Settings (H)
│   ├── Profile (H1)
│   ├── Language (H2)
│   ├── Notifications (H3)
│   ├── Data & Storage (H4)
│   ├── Privacy (H5)
│   ├── Help (H6)
│   └── Extension Officer (H7)
│
└── USSD Fallback (I)
    ├── USSD Home (I1)
    ├── Crop Health (I2)
    ├── Market Prices (I3)
    └── Planting Info (I4)
```

---

## 1.3 Navigation Structure

### Sidebar Navigation (Primary)

| Section | Items |
|---------|-------|
| Home | Dashboard, Quick Actions |
| Crop Health | Scan Crop, Disease History |
| Planting Calendar | My Schedule, Weather |
| Market | Prices, My Listings, Messages |
| Livestock | Health Check, Vet Directory |
| Weather | Forecast, Alerts |
| Farm Records | Activities, Harvest |
| Settings | Profile, Language, Notifications, Help |
| Profile | My Profile |

### Navigation Pattern Rationale

| Pattern | Justification |
|---------|---------------|
| **Persistent Sidebar** | Primary navigation always visible; reduces cognitive load; familiar to users with PWA experience |
| **Icon + Text Labels** | Icons alone cause confusion for low-literacy users; text labels essential in local languages |
| **Section Grouping** | Related features grouped together; reduces visual clutter; enables quick scanning |
| **Bottom Tab Bar (Mobile)** | Secondary navigation for quick actions; accessible with thumb reach; persists across screens |
| **Floating Action Button** | Primary action (Scan Crop) always accessible; single tap from any screen; high visibility |
| **Breadcrumb Navigation** | Contextual back-navigation within nested flows; prevents getting lost |

### Progressive Disclosure Strategy

| Screen Level | Shown | Hidden |
|--------------|-------|--------|
| **Primary** | Dashboard, Quick Actions, Active Alerts | Historical data, Advanced settings |
| **Secondary** | Section-specific views | Export, bulk actions |
| **Tertiary** | Detail views, forms | Debug info, technical details |

---

# 2. User Flows

## 2.1 Onboarding & Account Creation Flow

### Flow Diagram

```
START
  │
  ▼
Language Selection ──Select language ──▶ A1: Language Screen
  │
  ▼
Welcome Screen ──Continue ──▶ A2: Welcome (value prop)
  │
  ▼
Phone Input ──Enter number ──▶ A3: Phone Input
  │
  ▼
OTP Verification ──Enter OTP ──▶ A4: OTP Screen
  │                         │
  │         ┌───────────────┤
  │         │               │
  │      Success         Invalid/Expired
  │         │               │
  ▼         ▼               ▼
Profile Setup   Resend OTP
  (A5)           (return to A4)
  │
  ▼
Permissions ──Grant ──▶ A6: Permissions
  │
  ▼
Main Dashboard ──Enter ──▶ Dashboard
```

### Step-by-Step Detail

| Step | Screen | User Action | System Response | Branch |
|------|--------|-------------|-----------------|--------|
| 1 | A1 | Select language + region | Save preference, load appropriate locale | → Step 2 |
| 2 | A2 | Tap "Continue" | Load onboarding content in selected language | → Step 3 |
| 3 | A3 | Enter phone number | Validate format, trigger OTP send | → Step 4 |
| 4 | A4 | Enter 6-digit code | Verify OTP; if valid → Step 5, if invalid → Show error | Step 4a (error) or Step 5 |
| 4a | A4 Error | View error message | "Code not recognized. Please check and try again." | → Step 4 (retry) |
| 5 | A5 | Enter name, location, crops | Save profile, create user record | → Step 6 |
| 6 | A6 | Grant permissions (or skip) | Store permissions state | → Step 7 |
| 7 | Dashboard | N/A | Load user dashboard | END |

### Edge Cases

| Scenario | Handling |
|----------|----------|
| **No network at OTP** | Show "Connection problem" → offer voice OTP alternative → allow skip with limited access |
| **Phone number already registered** | Detect via API → prompt "This number is registered. Log in instead?" → redirect to login |
| **OTP expired (5 min)** | Auto-show "Code expired" after timeout → provide "Resend" button with 30s cooldown |
| **Permission denied** | Allow "Skip" but show limited feature notice; prompt again on next attempt |
| **Profile incomplete** | Allow access but show persistent banner to complete profile in Settings |

---

## 2.2 Core Action Flow: Crop Disease Detection

### Flow Diagram

```
START (from Dashboard or FAB)
  │
  ▼
B1: Crop Scanner
"What's wrong with my crop?"
  │          │
  │    ┌─────┴─────┐
  │    │           │
  Voice Note   Photo
  │    │           │
  ▼    ▼           ▼
Voice Input   Camera/Gallery
  │    │           │
  └────┴───────────┘
         │
         ▼
B2: Analysis
"Analyzing your crop..."
  │
    ┌────┴────┐
    │         │
Success   Low Conf
    │         │
    ▼         ▼
B3:Result   "Try another photo"
    │
    ▼
B4: Treatment
    │
    ▼
B5: History (Auto-save)
```

### Step-by-Step Detail

| Step | Screen | User Action | System Response | Branch |
|------|--------|-------------|-----------------|--------|
| 1 | B1 | Select input method (voice/photo) | Show appropriate input interface | → Step 2 |
| 2a | B1 Voice | Record voice (max 60s), playback, confirm | Transcribe + extract key terms | → Step 3 |
| 2b | B1 Photo | Take photo or select from gallery, preview | Compress, prepare for analysis | → Step 3 |
| 3 | B2 | View progress indicator | Send to disease identification API | Step 3a (success) or 3b (fail) |
| 3a | B2 Fail | N/A | "We couldn't analyze this. Try again with a clearer photo." | → Step 1 |
| 4 | B3 | View result (disease name, confidence %, image) | Show result with confidence indicator | → Step 5 |
| 5 | B4 | View treatment details | Display treatment steps, local product availability | → Step 6 |
| 6 | B5 | View history (optional) | Save to history, return to dashboard | END |

### Edge Cases

| Scenario | Handling |
|----------|----------|
| **No camera permission** | Show permission request; if denied, allow voice-only input |
| **Photo too blurry** | Detect blur → prompt "Photo is unclear. Please hold steady and try again." |
| **Multiple diseases detected** | Show all with confidence % → "We found 2 issues. Here are treatments for both." |
| **No match found** | Show "We don't recognize this. An extension officer will review your photo." |
| **Analysis timeout (>30s)** | Show partial result if available → "Taking longer than usual. We'll notify you when ready." |
| **Offline during analysis** | Queue request → show "Saved offline. We'll analyze when connected." |

---

## 2.3 Core Action Flow: Market Listing & Buyer Connect

### Flow Diagram

```
START (Market Section)
  │
  ▼
D1: Market Dashboard
  │
  ▼
D3: Create Listing
- Select produce
- Quantity
- Quality grade
- Expected price
- Upload photos
  │
  ▼
Listing Preview
  │
  ▼
Listing Published
  │
    ┌────┴────┐
    │         │
Offer   No Offer
Received  (24h)
    │         │
    ▼         ▼
D5:Buyer   "No offers yet"
Offers
    │
    ▼
D7: Direct Message
    │
    ▼
D8: Escrow
```

### Step-by-Step Detail

| Step | Screen | User Action | System Response | Branch |
|------|--------|-------------|-----------------|--------|
| 1 | D1 | View market dashboard | Show prices, own listings summary | → Step 2 |
| 2 | D3 | Fill listing form | Validate all fields | Step 2a (error) or → Step 3 |
| 2a | D3 Error | View validation errors | Highlight missing/invalid fields | → Step 2 |
| 3 | D3 | Preview listing | Show complete listing | → Step 4 |
| 4 | D3 | Confirm publish | Create listing, notify matched buyers | → Step 5 |
| 5 | D5 | Wait for offers | System monitors for incoming offers | Step 5a (offer) or 5b (timeout) |
| 5a | D5 | View offer(s) | Show offer details with buyer rating | → Step 6 |
| 5b | D5 Timeout | View "no offers" state | Suggest sharing more or adjusting price | → END |
| 6 | D7 | Chat with buyer | Exchange messages, agree on terms | → Step 7 |
| 7 | D8 | Confirm payment | Hold escrow, arrange delivery | → Step 8 |
| 8 | D8 | Confirm delivery | Release payment to farmer | END |

### Edge Cases

| Scenario | Handling |
|----------|----------|
| **No produce photos** | Allow listing without photos but add "No photo" badge; encourage photo upload |
| **Price too high** | Show "Your price is 20% above market average. Accept lower offers?" |
| **Buyer cancels** | Return to offers list; no penalty |
| **Dispute on quality** | Show escrow hold; prompt farmer to upload delivery photos |
| **Payment fails** | Retry 3x → notify both parties → hold listing for manual resolution |

---

## 2.4 Core Action Flow: Planting Calendar

### Flow Diagram

```
START (Calendar Section)
  │
  ▼
C1: Calendar Home
  │
  ▼
C2: Crop Selection
  │
  ▼
C3: Region Confirm
  │
  ▼
C4: Planting Schedule
  │
  ▼
C5: Weather Integration
```

---

## 2.5 Settings & Profile Management Flow

### Flow Diagram

```
START (From sidebar)
  │
  ▼
H1: Profile Overview
  │
  ▼
H2: Language Settings
  │
  ▼
H3: Notifications
  │
  ▼
H4: Data & Storage
```

---

## 2.6 Error Recovery Flow

### Network Error Recovery

```
ACTION
  │
  ▼
Network Error Detected
  │
  ▼
Is action critical?
  │         │
Yes       No
  │         │
  ▼         ▼
Queue for   Show cached
retry when  data + "Offline"
connected   indicator
```

### Payment Failure Recovery

```
PAYMENT ACTION
  │
  ▼
Payment Failed
  │
  ▼
Is retryable?
  │         │
Yes        No
  │         │
  ▼         ▼
Retry with  "Contact support"
alternate   with reference num
method
```

---

# 3. Screen-by-Screen Breakdown

## 3.1 Onboarding Screens

### A1: Language Selection Screen

| Element | Detail |
|---------|--------|
| **Purpose** | Allow user to select preferred language and region for full app experience |
| **Key Elements** | Language list with flag icons, region selector, "Continue" button |
| **Primary Action** | Select language → Continue |
| **Secondary Actions** | Skip (use English default) |
| **Navigation** | Forward only; cannot go back after selection |

### A2: Welcome Screen

| Element | Detail |
|---------|--------|
| **Purpose** | Introduce app value proposition in user's language |
| **Key Elements** | Value proposition cards (3), voice intro option, "Get Started" button |
| **Primary Action** | Tap "Get Started" |
| **Secondary Actions** | Play voice overview (in local language) |
| **Navigation** | Forward to Phone Input |

### A3: Phone Input Screen

| Element | Detail |
|---------|--------|
| **Purpose** | Capture phone number for authentication |
| **Key Elements** | Country code selector, phone input field, "Send Code" button, voice input option |
| **Primary Action** | Enter phone → Send Code |
| **Secondary Actions** | Use voice to dictate number |
| **Navigation** | Forward to OTP |

### A4: OTP Verification Screen

| Element | Detail |
|---------|--------|
| **Purpose** | Verify phone number via OTP |
| **Key Elements** | 6-digit input (individual boxes), "Resend" link, voice OTP option, countdown timer |
| **Primary Action** | Enter OTP → Verify |
| **Secondary Actions** | Resend via SMS or Voice |
| **Navigation** | Success → Profile Setup; Failure → Show error, allow retry |

### A5: Profile Setup Screen

| Element | Detail |
|---------|--------|
| **Purpose** | Capture basic user profile for personalized experience |
| **Key Elements** | Name input (voice), location selector (map or list), crop selector (multi), farm size input |
| **Primary Action** | Save Profile → Continue |
| **Secondary Actions** | Skip (limited experience) |
| **Navigation** | Forward to Permissions |

### A6: Device Permissions Screen

| Element | Detail |
|---------|--------|
| **Purpose** | Request necessary device permissions |
| **Key Elements** | Permission cards (Camera, Microphone, Location, Notifications) with explanation icons |
| **Primary Action** | Grant All → Continue |
| **Secondary Actions** | Grant individually, Skip all |
| **Navigation** | Forward to Dashboard |

---

## 3.2 Core Feature Screens

### B1: Crop Health Scanner

| Element | Detail |
|---------|--------|
| **Purpose** | Primary interface for capturing crop issue |
| **Key Elements** | Large capture button, recent scan thumbnails, voice input button, gallery access |
| **Primary Action** | Tap camera icon to take photo OR tap mic to record voice |
| **Secondary Actions** | View past scans, switch camera (front/back) |
| **Navigation** | From FAB (floating action button) or sidebar |

### B2: Analysis Processing Screen

| Element | Detail |
|---------|--------|
| **Purpose** | Show analysis progress while system processes input |
| **Key Elements** | Animated crop illustration, progress indicator, status text, "Cancel" option |
| **Primary Action** | Wait for completion (auto-advance) |
| **Secondary Actions** | Cancel analysis |
| **Navigation** | Auto-forward to Result or back to Scanner |

### B3: Disease Result Screen

| Element | Detail |
|---------|--------|
| **Purpose** | Display identified disease with confidence level |
| **Key Elements** | Disease name (local language), confidence indicator (high/medium/low), disease image, "View Treatment" button |
| **Primary Action** | View Treatment Details |
| **Secondary Actions** | Share result, save to history, try again |
| **Navigation** | Forward to Treatment, back to Scanner |

### B4: Treatment Details Screen

| Element | Detail |
|---------|--------|
| **Purpose** | Show treatment instructions with locally available products |
| **Key Elements** | Treatment steps (numbered), product recommendations with prices, application video (voice-over), verification badge |
| **Primary Action** | Mark as "Done" or "Need Help" |
| **Secondary Actions** | Share treatment, save offline, contact extension officer |
| **Navigation** | Back to Scanner or forward to History |

### C1: Planting Calendar Home

| Element | Detail |
|---------|--------|
| **Purpose** | Display current planting status and upcoming activities |
| **Key Elements** | Current season card, task list (planting, fertilizing, harvesting), calendar mini-view, weather widget |
| **Primary Action** | View task details or add new crop |
| **Secondary Actions** | Switch season view, change region |
| **Navigation** | Sidebar navigation |

### D1: Market Dashboard

| Element | Detail |
|---------|--------|
| **Purpose** | Overview of market prices and active listings |
| **Key Elements** | Price ticker (top), crop price cards, "My Listings" summary, active alerts |
| **Primary Action** | View prices or manage listings |
| **Secondary Actions** | Set price alerts, refresh data |
| **Navigation** | Sidebar navigation |

### E1: Livestock Dashboard

| Element | Detail |
|---------|--------|
| **Purpose** | Overview of animal health status |
| **Key Elements** | Animal count by type, health alerts, quick health check button, vet contact |
| **Primary Action** | Start health check |
| **Secondary Actions** | View vet directory |
| **Navigation** | Sidebar navigation |

### F1: Weather Dashboard

| Element | Detail |
|---------|--------|
| **Purpose** | Display weather forecast and alerts |
| **Key Elements** | Current weather card, 7-day forecast, rainfall chart, weather alerts banner |
| **Primary Action** | View detailed forecast |
| **Secondary Actions** | Set location, manage alerts |
| **Navigation** | Sidebar navigation |

### G1: Farm Records Dashboard

| Element | Detail |
|---------|--------|
| **Purpose** | Overview of farm activities and records |
| **Key Elements** | Activity summary cards, harvest timeline, input usage chart |
| **Primary Action** | Add new activity |
| **Secondary Actions** | View history, export records |
| **Navigation** | Sidebar navigation |

---

# 4. Microcopy

## 4.1 Onboarding Screens

### A1: Language Selection

| Element | Copy |
|---------|------|
| **Page Title** | Choose Your Language |
| **Subheading** | Select your preferred language to continue |
| **CTA Button** | Continue |
| **Option Labels** | English, Hausa, Yoruba, Igbo, Français, Bambara |
| **Region Label** | Select your region |
| **Skip Link** | Use English → |

### A2: Welcome

| Element | Copy |
|---------|------|
| **Page Title** | Welcome to FarmFlow |
| **Subheading** | Your farming assistant in your language |
| **Card 1 Title** | Crop Health |
| **Card 1 Text** | Send a photo of your crops and get advice instantly |
| **Card 2 Title** | Planting Calendar |
| **Card 2 Text** | Know the right time to plant and harvest |
| **Card 3 Title** | Better Prices |
| **Card 3 Text** | Connect directly with buyers and get fair prices |
| **Voice Button** | Listen in [Language] |
| **CTA Button** | Get Started |

### A3: Phone Input

| Element | Copy |
|---------|------|
| **Page Title** | Enter Your Phone Number |
| **Subheading** | We'll send a code to verify your number |
| **Input Label** | Phone Number |
| **Input Placeholder** | Enter your phone number |
| **Voice Button** | Say your number |
| **CTA Button** | Send Code |
| **Privacy Note** | Your number is kept private and secure |

### A4: OTP Verification

| Element | Copy |
|---------|------|
| **Page Title** | Enter Verification Code |
| **Subheading** | We sent a 6-digit code to [phone number] |
| **Input Label** | Verification Code |
| **Input Placeholder** | Enter 6 digits |
| **Resend Link** | Didn't receive code? Resend |
| **Voice OTP Link** | Get code as voice call |
| **CTA Button** | Verify |

### A5: Profile Setup

| Element | Copy |
|---------|------|
| **Page Title** | Set Up Your Profile |
| **Subheading** | Tell us about your farm |
| **Name Label** | Your Name |
| **Name Placeholder** | Enter your name |
| **Name Voice** | Record your name |
| **Location Label** | Your Location |
| **Location Placeholder** | Select your state/region |
| **Crops Label** | What do you grow? |
| **Crops Placeholder** | Select your crops |
| **Farm Size Label** | Farm Size |
| **Farm Size Options** | Less than 1 hectare, 1-5 hectares, 5-10 hectares, More than 10 hectares |
| **CTA Button** | Continue |
| **Skip Link** | Skip for now → |

### A6: Device Permissions

| Element | Copy |
|---------|------|
| **Page Title** | Enable Features |
| **Subheading** | Allow access to make the app work better |
| **Permission 1 Title** | Camera |
| **Permission 1 Text** | Take photos of your crops |
| **Permission 2 Title** | Microphone |
| **Permission 2 Text** | Record voice messages |
| **Permission 3 Title** | Location |
| **Permission 3 Text** | Get weather and prices for your area |
| **Permission 4 Title** | Notifications |
| **Permission 4 Text** | Receive weather alerts and price updates |
| **CTA Button** | Allow All |
| **Skip Link** | Skip → |

---

## 4.2 Core Feature Screens

### B1: Crop Health Scanner

| Element | Copy |
|---------|------|
| **Page Title** | What's wrong with your crop? |
| **Subheading** | Take a photo or describe the problem |
| **Primary Action** | Take Photo |
| **Secondary Action 1** | Record Voice |
| **Secondary Action 2** | Choose from Gallery |
| **Recent Scans Label** | Recent Scans |
| **Voice Prompt** | "Describe what's wrong with your crop" |

### B2: Analysis Processing

| Element | Copy |
|---------|------|
| **Page Title** | Analyzing your crop... |
| **Loading Text** | Comparing your image with our database |
| **Cancel Button** | Cancel |
| **Tip Text** | Tip: A clear, close photo gives better results |

### B3: Disease Result

| Element | Copy |
|---------|------|
| **Page Title** | [Disease Name in Local Language] |
| **Confidence High** | We're confident about this |
| **Confidence Medium** | We're fairly sure |
| **Confidence Low** | Not sure - an expert will check |
| **Primary CTA** | See Treatment → |
| **Secondary Action** | Try Another Photo |
| **Verification Badge** | Verified by Extension Officer |

### B4: Treatment Details

| Element | Copy |
|---------|------|
| **Page Title** | Treatment for [Disease] |
| **Section 1 Title** | What to do |
| **Step Text** | Step [N]: [Instruction] |
| **Section 2 Title** | Products to use |
| **Product Name** | [Product Name] |
| **Product Availability** | Available at local agro-dealer |
| **Section 3 Title** | When to apply |
| **Primary CTA** | Mark as Done |
| **Secondary CTA** | Call Extension Officer |

### C1: Planting Calendar

| Element | Copy |
|---------|------|
| **Page Title** | Your Planting Calendar |
| **Current Season** | Current Season: [Season Name] |
| **Task Card** | [Task Name] - Due [Date] |
| **CTA Button** | Add Crop to Calendar |
| **Weather Widget** | Rain expected in [X] days |

### D1: Market Dashboard

| Element | Copy |
|---------|------|
| **Page Title** | Market Prices |
| **Subheading** | Today's prices in your area |
| **Price Card** | [Crop Name] - [Price]/kg |
| **Trend Indicator** | Up, Down, Stable |
| **Primary CTA** | Set Price Alert |
| **Secondary CTA** | + Create Listing |

### D3: Create Listing

| Element | Copy |
|---------|------|
| **Page Title** | Sell Your Produce |
| **Produce Label** | What are you selling? |
| **Quantity Label** | How much do you have? |
| **Quality Label** | What quality is it? |
| **Quality Options** | Grade A (Best), Grade B (Good), Grade C (Standard) |
| **Price Label** | Your price per kg |
| **Photo Label** | Add photos of your produce |
| **Primary CTA** | Publish Listing |
| **Secondary CTA** | Preview |

### E1: Livestock Dashboard

| Element | Copy |
|---------|------|
| **Page Title** | Animal Health |
| **Subheading** | Keep your animals healthy |
| **Animal Count** | [X] Goats, [Y] Chickens, [Z] Cows |
| **Primary CTA** | Check Animal Health |
| **Secondary CTA** | Find Vet |

### E2: Animal Health Check

| Element | Copy |
|---------|------|
| **Page Title** | Describe the problem |
| **Subheading** | What's wrong with your animal? |
| **Primary Action** | Describe Symptoms |
| **Secondary Action** | Select from common symptoms |

### F1: Weather Dashboard

| Element | Copy |
|---------|------|
| **Page Title** | Weather |
| **Current Temp** | [Temperature]C |
| **Condition** | [Weather Condition] |
| **Alert Banner** | [Alert Type]: [Message] |
| **Forecast Day** | [Day]: [Temp] - [Condition] |

### G1: Farm Records

| Element | Copy |
|---------|------|
| **Page Title** | Farm Records |
| **Subheading** | Track your farm activities |
| **Primary CTA** | + Add Activity |
| **Activity Type** | Planted, Harvested, Applied Fertilizer, Applied Pesticide, Irrigated |

---

## 4.3 Settings Screens

### H1: Profile Overview

| Element | Copy |
|---------|------|
| **Page Title** | My Profile |
| **Name Field** | Name |
| **Location Field** | Location |
| **Crops Field** | My Crops |
| **Phone Field** | Phone Number |
| **CTA Button** | Save Changes |
| **Secondary CTA** | Change Password |

### H2: Language Settings

| Element | Copy |
|---------|------|
| **Page Title** | Language & Voice |
| **Language Label** | App Language |
| **Voice Label** | Voice Response |
| **Voice Options** | Voice (default), Text only, Both |
| **Text Size Label** | Text Size |
| **Text Size Options** | Small, Medium (default), Large |

### H3: Notification Settings

| Element | Copy |
|---------|------|
| **Page Title** | Notifications |
| **Weather Toggle** | Weather Alerts |
| **Price Toggle** | Price Alerts |
| **Disease Toggle** | Disease Alerts |
| **Marketing Toggle** | Tips and Updates |
| **CTA Button** | Save Preferences |

### H4: Data & Storage

| Element | Copy |
|---------|------|
| **Page Title** | Data & Storage |
| **Storage Used** | [X] MB used |
| **Clear Cache** | Clear Cache |
| **Download Data** | Download My Data |
| **Delete Account** | Delete My Account |
| **Warning** | Deleting your account cannot be undone |

---

# 5. Error States

## 5.1 Form Validation Errors

### Phone Number Validation

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| Empty field | Phone number required | Please enter your phone number | Enter number |
| Invalid format | Wrong format | Please enter a valid phone number | Try again |
| Already registered | Number already used | This number is registered. Log in instead? | Log in |

### OTP Validation

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| Empty field | Code required | Enter the 6-digit code we sent | Enter code |
| Wrong code | Code not recognized | The code you entered is wrong. Try again. | Try again |
| Expired code | Code expired | The code expired. We'll send a new one. | Resend code |

### Profile Setup Validation

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| No name entered | Name required | Please tell us your name | Enter name |
| No location selected | Location required | Select your farming region | Select location |
| No crops selected | Select crops | Choose at least one crop you grow | Select crops |

### Market Listing Validation

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| No produce selected | Select produce | What are you selling? | Select produce |
| No quantity entered | Enter quantity | How much are you selling? | Enter quantity |
| Price too high | Price is high | Your price is above market average. Accept? | Adjust or post |

---

## 5.2 Network & Connection Errors

### No Internet Connection

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| No connection | No internet | Check your connection and try again | Try Again |
| Connection lost | Connection lost | We'll save your work and try again | Wait |
| Slow connection | Taking long | Your connection is slow. This may take a while. | Continue or Cancel |

### API Errors

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| Server error | Server problem | We're having trouble. Try again in a moment. | Try Again |
| Timeout | Taking too long | The request timed out. Try again. | Try Again |
| Maintenance | Under maintenance | We'll be back soon. Check back in a few minutes. | OK |

---

## 5.3 Permission Errors

### Camera Permission

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| Denied permanently | Camera blocked | Allow camera access to take photos of your crops | Open Settings |
| Denied temporarily | Camera needed | We need camera access to scan your crops | Allow |

### Microphone Permission

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| Denied | Microphone blocked | Allow microphone to record voice messages | Open Settings |

### Location Permission

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| Denied | Location needed | Allow location to get weather and prices for your area | Allow |
| Disabled in settings | Location off | Turn on location to get local prices and weather | Open Settings |

---

## 5.4 Session & Authentication Errors

### Session Expired

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| Session timeout | Session ended | Your session expired. Log in to continue. | Log In |
| Token invalid | Please log in | Your login is no longer valid. Please log in again. | Log In |

### Account Issues

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| Account suspended | Account paused | Your account is temporarily paused. Contact support. | Contact Support |
| Verification pending | Verification needed | Please verify your account to continue. | Verify Now |

---

## 5.5 Payment Errors (Market Feature)

### Payment Failure

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| Card declined | Payment failed | Your payment didn't go through. Try another method. | Try Again |
| Insufficient funds | Not enough money | The account doesn't have enough funds. Add funds and try again. | Add Funds |
| Bank processing | Processing delay | Your bank is processing. You'll get a notification when it's done. | Wait |
| Duplicate payment | Already paid | This payment was already processed. Check your account. | View Payment |

### Escrow Errors

| Scenario | Headline | Body Copy | CTA Label |
|----------|----------|-----------|-----------|
| Buyer cancelled | Buyer cancelled | The buyer cancelled the order. Your listing is still active. | View Listing |
| Dispute opened | Dispute opened | A dispute has been opened. An agent will review the case. | View Details |

---

# 6. Empty States

## 6.1 First-Time User Empty States

### Dashboard Empty State

| Element | Copy |
|---------|------|
| **Illustration** | Farmer standing next to healthy crops with question mark |
| **Headline** | Welcome to FarmFlow! |
| **Body Copy** | Start by adding your crops to get personalized advice and alerts |
| **CTA Button** | + Add Your First Crop |

### Crop Health History Empty

| Element | Copy |
|---------|------|
| **Illustration** | Camera icon with arrow |
| **Headline** | No crop scans yet |
| **Body Copy** | Take a photo of your crops to get instant disease identification |
| **CTA Button** | Scan Your First Crop |

### Market Listings Empty

| Element | Copy |
|---------|------|
| **Illustration** | Empty market stall |
| **Headline** | No listings yet |
| **Body Copy** | List your produce to connect with buyers and get fair prices |
| **CTA Button** | + Create Your First Listing |

### Farm Records Empty

| Element | Copy |
|---------|------|
| **Illustration** | Blank notebook with pencil |
| **Headline** | No farm records yet |
| **Body Copy** | Start tracking your planting, harvesting, and inputs |
| **CTA Button** | + Add First Activity |

### Price Alerts Empty

| Element | Copy |
|---------|------|
| **Illustration** | Bell with plus sign |
| **Headline** | No price alerts |
| **Body Copy** | Set alerts to get notified when prices change for your crops |
| **CTA Button** | + Set Price Alert |

### Livestock Empty

| Element | Copy |
|---------|------|
| **Illustration** | Animal silhouettes |
| **Headline** | No animals added |
| **Body Copy** | Add your animals to track their health and get veterinary alerts |
| **CTA Button** | + Add Animals |

---

## 6.2 Zero-Result Search/Filter States

### No Price Data

| Element | Copy |
|---------|------|
| **Illustration** | Empty price chart |
| **Headline** | No prices available |
| **Body Copy** | We don't have prices for [crop] in your area yet |
| **CTA Button** | Set alert to notify you |

### No Search Results

| Element | Copy |
|---------|------|
| **Illustration** | Magnifying glass with question mark |
| **Headline** | Nothing found |
| **Body Copy** | Try a different search term or filter |
| **CTA Button** | Clear Filters |

### No Buyers Found

| Element | Copy |
|---------|------|
| **Illustration** | Empty buyer directory |
| **Headline** | No buyers nearby |
| **Body Copy** | We're looking for buyers in your area. Check back soon. |
| **CTA Button** | Share Your Listing |

### No Weather Data

| Element | Copy |
|---------|------|
| **Illustration** | Cloud with question mark |
| **Headline** | Weather unavailable |
| **Body Copy** | We couldn't get weather data for your location |
| **CTA Button** | Update Location |

---

# 7. Loading & Transition States

## 7.1 Loading States by Screen

### Dashboard Loading

| Element | Copy |
|---------|------|
| **Skeleton Layout** | Cards with shimmer animation |
| **Loading Text** | Loading your dashboard... |
| **Duration Displayed** | After 2 seconds |

### Crop Analysis Loading

| Element | Copy |
|---------|------|
| **Animation** | Crop image with scanning line animation |
| **Loading Text** | Analyzing your crop... |
| **Subtext** | Comparing with [N] known diseases |
| **Progress** | Indeterminate progress bar |
| **Cancel Option** | Visible after 5 seconds |

### Market Prices Loading

| Element | Copy |
|---------|------|
| **Skeleton Layout** | Price cards with shimmer |
| **Loading Text** | Getting latest prices... |
| **Background Refresh** | Silent refresh every 15 minutes |

### Listing Publish Loading

| Element | Copy |
|---------|------|
| **Animation** | Spinning produce icon |
| **Loading Text** | Publishing your listing... |
| **Success Transition** | Auto-advance to success screen |

### Weather Loading

| Element | Copy |
|---------|------|
| **Skeleton Layout** | Weather cards with shimmer |
| **Loading Text** | Getting weather for [Location]... |
| **Fallback** | Show cached data with "Last updated [time]" |

---

## 7.2 Transition States

### Success Transitions

| Action | Transition | Message |
|--------|------------|---------|
| Crop scan complete | Slide to result screen | Disease identified |
| Listing published | Modal with confetti | Listing published! |
| Profile saved | Toast notification | Changes saved |
| Payment successful | Confirmation screen | Payment complete |

### Confirmation Modals

| Action | Headline | Body | Confirm CTA | Cancel CTA |
|--------|----------|------|-------------|------------|
| Delete listing | Delete this listing? | This cannot be undone. | Delete | Keep |
| Cancel order | Cancel order? | The buyer will be notified. | Yes, cancel | Keep order |
| Clear data | Clear all data? | You'll need to download again. | Clear | Keep |

### Action Feedback

| Action | Feedback Type | Message |
|--------|---------------|---------|
| Save draft | Toast | Draft saved |
| Add to calendar | Toast | Added to calendar |
| Set alert | Toast | Alert set for [crop] |
| Share listing | Toast | Shared to [N] buyers |

---

# 8. Structural Recommendations

## 8.1 Navigation Pattern Recommendation

### Primary Pattern: Persistent Sidebar + Bottom Tab Bar

| Reason | Explanation |
|--------|-------------|
| **Familiarity** | Sidebar navigation is standard in PWA/web apps; users recognize it from other apps |
| **Accessibility** | Sidebar always visible reduces cognitive load; bottom tabs easy to reach on mobile |
| **Scalability** | Supports 7+ main sections without excessive scrolling or nesting |
| **Voice-First Compatible** | Navigation announcements work with screen readers; large tap targets for touch |

### Fallback Pattern: Voice Navigation for Feature Phones

| Channel | Implementation |
|---------|----------------|
| **USSD** | Full USSD menu for basic features: crop disease, market prices, planting calendar |
| **Voice IVR** | Phone tree for key features; works on any phone with voice capability |

---

## 8.2 Flows to Simplify or Merge

### Recommended Mergers

| Current | Proposed | Rationale |
|---------|----------|------------|
| Separate "Add Crop" from "Scan Crop" | Merge into single "Crop Action" menu | Both are crop-related; single entry point reduces cognitive load |
| "Weather" and "Climate Advisory" | Merge into single Weather section with tabs | Users don't distinguish; single weather view with toggle for forecast/advisory |
| "Farm Records" separate from "Dashboard" | Add record summary to Dashboard | Quick glance at recent activity; deeper dive available |

### Recommended Simplifications

| Current | Simplified |
|---------|------------|
| 5-step profile setup | 3-step: Name → Location → Crops |
| Separate buyer offer flow | Integrate offers into listing detail as notifications |
| Full settings menu | Progressive disclosure: show common settings first |

---

## 8.3 Progressive Disclosure Application

### Where to Apply

| Screen | Apply To | Strategy |
|--------|----------|----------|
| **Dashboard** | Advanced features | Show 3-4 key actions; "More" button for additional features |
| **Market Listing** | Optional fields | Hide quality grade, price details behind "More options" |
| **Profile** | Detailed info | Basic info on main screen; farm details behind edit |
| **Settings** | Advanced options | Show language, notifications first; data/storage, privacy in "More" |
| **Treatment Details** | Product info | Show steps first; product recommendations as expandable section |

### Progressive Disclosure Pattern

```
Level 1: Essential (visible by default)
    │
    ▼ Show more
Level 2: Important (one tap/click)
    │
    ▼ Show more
Level 3: Advanced (scroll or expand)
```

---

## 8.4 Accessibility Considerations

### By Screen Type

| Screen Type | Accessibility Requirement |
|-------------|---------------------------|
| **All screens** | Minimum touch target 44x44px, sufficient color contrast (4.5:1 minimum), screen reader compatible labels |
| **Voice-heavy screens** | Visual alternatives for all voice functions, clear audio feedback |
| **Input screens** | Large input fields, error messages announced, autofill/voice input support |
| **Image-heavy screens** | Alt text for all images, image descriptions for crop photos |
| **Navigation** | Breadcrumb trail visible, current location announced, skip navigation option |

### Language-Specific

| Consideration | Implementation |
|---------------|----------------|
| **Low literacy users** | Large icons, minimal text, voiceover available on all screens |
| **Multi-language** | All UI text translatable, right-to-left support for applicable languages |
| **Voice-first languages** | Prioritize voice output, allow voice navigation commands |

### Device-Specific

| Device | Accessibility |
|--------|---------------|
| **Low-end Android** | Lightweight UI, minimal animations, works without GPU acceleration |
| **Feature phone** | USSD fallback for all critical features, voice-only alternative |
| **Small screens** | Single-column layouts, collapsible sections, sticky headers |

---

## 8.5 Data Architecture Considerations

### Offline Strategy

| Feature | Offline Support |
|---------|-----------------|
| **Crop disease history** | Full offline with local cache |
| **Planting calendar** | Offline with sync when connected |
| **Market listings (read)** | Cache last 50 listings |
| **Market listings (write)** | Queue when offline, sync when connected |
| **Weather** | Cache last 24 hours, show "last updated" timestamp |

### Data Minimization

| Practice | Justification |
|----------|---------------|
| **Lazy load images** | Reduce data consumption for low-bandwidth users |
| **Compress all payloads** | Minimize data costs for price-sensitive users |
| **Cache aggressively** | Reduce redundant requests |
| **Sync delta only** | Only sync changed data, not full dataset |

---

## 8.6 Trust-Building Features (Per User Story)

| User Need | Feature Implementation |
|-----------|------------------------|
| **Olu Adeyemi's trust concern** | Extension officer verification badge on all AI advice; visible "Verified by [Officer Name]" with rating |
| **Fatima's scam concern** | Buyer verification system with rating, escrow payment holding, buyer ID verification |
| **Emmanuel's adoption barrier** | USSD fallback ensures no smartphone required; works on feature phone |
| **Ngozi's tech comfort** | Voice-only interface option; no typing required for core features |

---

## 8.7 Localization Priority

### Language Priority Order

1. **Hausa** - Primary (largest user base in Nigeria, Northern region)
2. **Yoruba** - Secondary (Western Nigeria)
3. **Igbo** - Secondary (Eastern Nigeria)
4. **English** - Default/fallback
5. **French** - Mali, Francophone West Africa
6. **Bambara** - Mali (for voice commands)

### Localization Checklist

| Item | Status |
|------|--------|
| All UI text in all languages | Required |
| Date/time format localized | Required |
| Currency format localized | Required |
| Number format localized | Required |
| Voice prompts in local language | Required |
| Disease names in local language | Required |
| Measurement units (kg, hectares) | Required |

---

*End of UX Architecture Specification Document*

---

**Document Version**: 1.0
**Created**: May 2026
**Purpose**: Developer handoff for FarmFlow web application
**Coverage**: Full UX specification from sitemap through microcopy to accessibility guidelines