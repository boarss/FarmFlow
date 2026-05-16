# FarmFlow Product Requirements Document (PRD)

**Version**: 1.0
**Date**: May 2026
**Status**: Draft for Internal Review

---

## 1. Product Overview

### 1.1 Product Name
**FarmFlow**

### 1.2 One-Line Description
FarmFlow is a voice-first agricultural web app that helps smallholder farmers in Africa detect crop diseases, get planting advice, track farm records, and connect directly with buyers through interfaces optimized for low-end devices and low-literacy users.

### 1.3 Product Vision
To reduce crop loss by 30% and increase farmer income by 20% within 2 years by providing accessible, localized, and trustworthy agricultural intelligence to farmers who have been excluded from digital agriculture tools.

---

## 2. Problem Statement

### 2.1 Core Problem
Smallholder farmers across Africa lose 30-40% of their harvests to preventable crop diseases, poor timing, and exploitative market practices. Existing agricultural tech solutions are designed for medium-to-large farms, require smartphones, demand high literacy, and consume significant data—making them inaccessible to the majority of African farmers.

### 2.2 Specific Pain Points

| Pain Point | Impact | Affected Users |
|------------|--------|-----------------|
| Cannot identify crop diseases until it's too late | 30-40% harvest loss | Amara Musa, all users |
| No access to accurate planting timing | Wasted seeds, failed seasons | Emmanuel Kwesi |
| Middlemen take 40%+ margin on produce | Income reduction | Fatima Okonkwo, Grace Wambui |
| Lack of post-harvest storage knowledge | Spoilage losses | Ngozi Ifeanyi |
| Goat/livestock health issues unreported | Animal loss, income impact | Diallo Bah |
| Distrust of digital platforms | Low adoption | Olu Adeyemi |
| No smartphone / limited data | Excluded from all digital tools | Emmanuel Kwesi, Diallo Bah |

### 2.3 Why Now
- **Mobile penetration** in rural Africa has reached critical mass (70%+ have basic Android)
- **Voice recognition** accuracy for African languages has improved significantly
- **Satellite imagery** and AI disease detection are now affordable
- **Payment infrastructure** (M-Pesa, mobile money) is widely adopted
- **Policy support** for digital agriculture across African governments

---

## 3. Target User Profile

### 3.1 Primary User Segments

| Segment | Description | Key Characteristics |
|---------|-------------|---------------------|
| **Segment A** | Crop farmers (maize, sorghum, rice, cassava, cocoa) | Ages 25-60, low literacy, basic Android, voice-first |
| **Segment B** | Vegetable farmers / cooperatives | Ages 25-45, moderate literacy, market-focused |
| **Segment C** | Mixed crop + livestock farmers | Ages 30-50, low literacy, animal health priority |
| **Segment D** | Processors / aggregators | Ages 40-60, business-focused, needs supply chain |

### 3.2 User Personas (from research)

#### Persona 1: Amara Musa
- **Role**: Maize and Sorghum farmer
- **Location**: Kaduna State, Nigeria
- **Age**: 42
- **Device**: Basic Android (low storage)
- **Literacy**: Low (Hausa speaker)
- **Channel Preference**: Voice notes, WhatsApp photos
- **Core Need**: Detect crop disease early, know right fertilizer

#### Persona 2: Fatima Okonkwo
- **Role**: Vegetable cooperative leader (12 women)
- **Location**: Oyo State, Nigeria
- **Age**: 35
- **Device**: Mid-range Android
- **Literacy**: Secondary school, reads slowly
- **Channel Preference**: Voice notes, occasional text
- **Core Need**: Connect directly with buyers, fair prices

#### Persona 3: Emmanuel Kwesi
- **Role**: Rice farmer, part-time mechanic
- **Location**: Volta Region, Ghana
- **Age**: 29
- **Device**: Feature phone (KaiOS)
- **Literacy**: Basic English
- **Channel Preference**: Voice calls, USSD
- **Core Need**: Planting calendar, weather-based timing

#### Persona 4: Ngozi Ifeanyi
- **Role**: Cassava and Yam processor
- **Location**: Enugu State, Nigeria
- **Age**: 51
- **Device**: Old Android hand-me-down
- **Literacy**: Minimal English reading
- **Channel Preference**: Voice messages only
- **Core Need**: Post-harvest storage tips, buyer connections

#### Persona 5: Diallo Bah
- **Role**: Mixed crop and livestock farmer
- **Location**: Segou Region, Mali
- **Age**: 38
- **Device**: Shared smartphone with wife
- **Literacy**: No formal schooling (Bambara)
- **Channel Preference**: Voice notes exclusively
- **Core Need**: Animal health alerts, crop rotation advice

#### Persona 6: Grace Wambui
- **Role**: Horticultural smallholder (export-focused)
- **Location**: Kiambu County, Kenya
- **Age**: 27
- **Device**: Smartphone, M-Pesa
- **Literacy**: Form 4 graduate, English fluent
- **Channel Preference**: Text, voice, photos (all)
- **Core Need**: Real-time market prices, export standards

#### Persona 7: Olu Adeyemi
- **Role**: Cocoa and Plantain farmer
- **Location**: Cross River State, Nigeria
- **Age**: 58
- **Device**: Basic Android
- **Literacy**: Primary education, broken English
- **Channel Preference**: Voice calls only
- **Core Need**: Know best selling time, quality grading

### 3.3 User Statistics (Target)

| Metric | Target (Year 1) |
|--------|-----------------|
| Total Users | 50,000 |
| Active Monthly Users | 25,000 |
| Daily Active Users | 10,000 |
| Geographic Focus | Nigeria (70%), Ghana (15%), Kenya (10%), Mali (5%) |
| Language Distribution | Hausa (40%), Yoruba (20%), Igbo (15%), English (15%), Other (10%) |

---

## 4. Core Features (Phase 1)

### 4.1 Feature Overview

Phase 1 focuses on the four highest-impact, most differentiated features:

1. **Crop Disease Detection** (Voice + Image AI)
2. **Planting Calendar** (Weather-integrated)
3. **Market Prices & Listings** (Buyer connection)
4. **Farm Records** (Activity tracking)

### 4.2 Feature 1: Crop Disease Detection

**Priority**: P0 (Critical)
**User Story**: US-01 (Amara Musa)

#### Description
Farmers capture photos or record voice notes of crops showing symptoms. The system identifies the disease with >80% accuracy and provides treatment recommendations in the user's local language via voice.

#### Functional Requirements

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F1.1 | Photo capture via camera | User can take photo within app; compressed for low data |
| F1.2 | Voice note input | User can record up to 60s voice; transcribed locally if possible |
| F1.3 | Image-based disease identification | API returns disease name, confidence score |
| F1.4 | Multi-language response | Response in Hausa/Yoruba/Igbo/English based on user preference |
| F1.5 | Voice output | Text-to-speech in local language |
| F1.6 | Treatment recommendations | Steps + locally available products |
| F1.7 | Extension officer verification | Badge showing "Verified by [Officer Name]" |
| F1.8 | History storage | All scans saved locally + synced |
| F1.9 | Offline queuing | If offline, queue request and process when connected |

#### Technical Implementation

- **Frontend**: React component with camera API, audio recorder
- **API**: Python FastAPI microservice on Railway (PyTorch/TensorFlow model)
- **Cache**: Redis for session data, rate limiting
- **Database**: Supabase for scan history, disease catalog

#### Out of Scope

- Laboratory-grade disease confirmation
- Real-time video streaming analysis
- Fertilizer recommendation engine (Phase 2)

---

### 4.3 Feature 2: Planting Calendar

**Priority**: P0 (Critical)
**User Story**: US-03 (Emmanuel Kwesi)

#### Description
Farmers input their crop and location. The system provides a localized planting calendar based on rainfall patterns, soil conditions, and historical data. Accessible via USSD for feature phone users.

#### Functional Requirements

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F2.1 | Crop selection | User selects from 20+ common crops |
| F2.2 | Location detection | GPS auto-detect or manual region selection |
| F2.3 | Planting window calculation | Returns optimal planting dates |
| F2.4 | Weather integration | Shows rainfall forecast for planting window |
| F2.5 | SMS/USSD delivery | Calendar sent via SMS or accessible via USSD |
| F2.6 | Reminder notifications | Push notification before planting date |
| F2.7 | Offline access | Calendar cached for offline viewing |

#### Technical Implementation

- **Frontend**: Calendar UI component with offline storage
- **API**: Python microservice for planting logic
- **Weather**: Integration with OpenWeatherMap or similar
- **USSD**: Africa's Talking or similar gateway
- **Database**: PostGIS for region-based planting windows

#### Out of Scope

- Real-time soil moisture sensor integration
- Automated irrigation scheduling
- Multi-season planning (beyond current season)

---

### 4.4 Feature 3: Market Prices & Listings

**Priority**: P0 (High)
**User Story**: US-02 (Fatima), US-06 (Grace), US-07 (Olu)

#### Description
Farmers view real-time market prices for their crops and can list produce for sale. Connected to verified buyers with escrow payment protection.

#### Functional Requirements

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F3.1 | Price dashboard | Shows today's prices by crop and region |
| F3.2 | Price alerts | User subscribes to crops; receives notification on price change |
| F3.3 | Produce listing creation | Farmer posts produce with photos, quantity, quality grade, price |
| F3.4 | Auto-listing generation | AI generates listing description from photos |
| F3.5 | Buyer matching | Match listings to verified buyers based on location/crop |
| F3.6 | Offer management | Farmer receives offers with buyer rating; can accept/reject |
| F3.7 | Direct messaging | In-app chat between farmer and buyer |
| F3.8 | Escrow payment | Payment held until delivery confirmed |
| F3.9 | Buyer verification | Buyers have ratings, verification status |
| F3.10 | Price export | Download price history as CSV |

#### Technical Implementation

- **Frontend**: Market dashboard, listing form, chat UI
- **API**: Python service for matching, price aggregation
- **Payments**: Integration with mobile money (M-Pesa, Flutterwave)
- **Database**: Supabase for listings, offers, messages, buyer profiles
- **Cache**: Redis for real-time price data

#### Out of Scope

- Commodity futures trading
- Bulk logistics/transportation
- Insurance products
- International export paperwork (Phase 2)

---

### 4.5 Feature 4: Farm Records

**Priority**: P1 (Medium)
**User Story**: Implicit from G1-G5

#### Description
Farmers log farm activities (planting, inputs, harvesting) to build a simple record system. Data stored locally first to minimize data usage.

#### Functional Requirements

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F4.1 | Activity logging | Log planting, harvesting, fertilizer, pesticide |
| F4.2 | Voice-first input | User can dictat activity details |
| F4.3 | Activity history | View past activities by date/crop |
| F4.4 | Harvest tracking | Record quantities harvested |
| F4.5 | Input tracking | Track fertilizer/pesticide usage |
| F4.6 | Simple reports | Yield summary by season |
| F4.7 | Offline-first | All data stored locally; sync when online |
| F4.8 | Data export | Export records as CSV/JSON |

#### Technical Implementation

- **Frontend**: Activity form, timeline view, reports
- **Storage**: IndexedDB for local-first; sync to Supabase
- **Database**: Supabase for synced records

#### Out of Scope

- Advanced analytics / dashboards
- Integration with accounting software
- PDF report generation

---

### 4.6 Feature 5: Livestock Health (Phase 1.5)

**Priority**: P2 (Post-Launch)
**User Story**: US-05 (Diallo Bah)

#### Description
Farmers describe animal symptoms via voice. System triages and provides home remedy or vet referral.

#### Functional Requirements

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F5.1 | Animal type selection | Select from common livestock (goats, chickens, cows) |
| F5.2 | Voice symptom input | Record description of symptoms |
| F5.3 | Triage logic | Classify as home remedy / vet needed |
| F5.4 | Vet directory | Show nearby vets with contact info |
| F5.5 | Health history | Log past health issues |

#### Technical Implementation

- **Frontend**: Animal health form, vet directory
- **API**: Python service for symptom matching
- **Database**: Supabase for vet directory, health logs

#### Out of Scope

- AI-powered animal identification
- Integration with veterinary clinics (beyond directory)
- Vaccination scheduling

---

## 5. User Stories

### 5.1 Crop Disease Detection (US-01)

**As a** maize farmer who cannot always tell when my crops are sick,
**I want to** send a voice note or photo of my crops
**So that** the assistant can identify the disease and tell me in Hausa what treatment to apply before I lose my harvest.

**Acceptance Criteria**:
- [ ] App accepts voice or image input
- [ ] Identifies disease with >80% accuracy
- [ ] Responds in local language via voice within 30 seconds
- [ ] Recommends locally available treatment

### 5.2 Market Connection (US-02)

**As a** cooperative leader selling tomatoes and peppers,
**I want to** post photos of my produce and receive verified buyer offers
**So that** I can cut out middlemen and earn a fairer price for my 12-member group.

**Acceptance Criteria**:
- [ ] Farmer uploads produce photo
- [ ] Assistant auto-generates produce listing
- [ ] Matched buyers are notified
- [ ] Farmer receives offer with price and buyer rating
- [ ] Payment is held in escrow

### 5.3 Planting Calendar (US-03)

**As a** rice farmer with only a feature phone and small data budget,
**I want to** access planting advice through USSD or voice messages
**So that** I can know the right time to plant without needing a smartphone or internet.

**Acceptance Criteria**:
- [ ] USSD menu works on SIM with no data
- [ ] User selects crop and region
- [ ] System returns SMS with localized planting calendar
- [ ] Works offline after initial sync

### 5.4 Post-Harvest Storage (US-04)

**As an** older farmer who loses cassava to spoilage every season,
**I want to** send a voice message asking how to store my harvest
**So that** the assistant replies with a clear voice note in Igbo I can listen to without reading.

**Acceptance Criteria**:
- [ ] Voice input accepted
- [ ] Reply delivered as voice note in Igbo within 60s
- [ ] Advice is practical with no jargon
- [ ] Response works on 2G connection

### 5.5 Livestock Health (US-05)

**As a** farmer raising goats alongside crops,
**I want to** describe my goat's symptoms by voice in Bambara
**So that** the assistant tells me whether I need a vet or can treat the animal myself, without my wife needing to present.

**Acceptance Criteria**:
- [ ] Bambara voice input supported
- [ ] Triage response within 45s
- [ ] Response classifies urgency (home remedy vs vet referral)
- [ ] Nearest vet location provided if critical

### 5.6 Market Prices (US-06)

**As a** farmer growing produce for export,
**I want to** receive daily market price alerts for French beans and avocados
**So that** I can decide when to sell and to whom, and stop guessing based on what other farmers say.

**Acceptance Criteria**:
- [ ] Farmer subscribes to commodity
- [ ] Daily push notification or WhatsApp message sent by 7am
- [ ] Price includes local market, wholesale, and export rates
- [ ] Tap to contact buyer directly

### 5.7 Trust Adoption (US-07)

**As an** older cocoa farmer who distrusts digital platforms,
**I want to** receive advice confirmed by trusted local extension officer
**So that** I can believe what the says and start using it confidently.

**Acceptance Criteria**:
- [ ] AI advice flagged as "Verified by Extension Officer [Name]"
- [ ] Extension officer reviews AI output weekly
- [ ] Farmer can call officer to confirm
- [ ] Trust rating visible on all advice cards

---

## 6. Technical Architecture

### 6.1 Tech Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | React 18 + TypeScript + Vite | Fast dev, small bundle, type safety |
| **Styling** | Tailwind CSS | Low CSS footprint, rapid development |
| **PWA** | Workbox | Offline capability, service workers |
| **Hosting** | Vercel | Edge deployment, excellent DX |
| **Database** | Supabase (PostgreSQL + PostGIS) | Open source, PostGIS for geodata, auth, realtime |
| **Cache** | Upstash Redis | Serverless Redis, low latency |
| **ML Services** | Python (FastAPI) on Railway | Disease detection, NDVI analysis |
| **USSD** | Africa's Talking | Pan-African USSD gateway |
| **SMS** | Twilio / Africa's Talking | Bulk SMS for calendar delivery |
| **Voice** | Web Speech API + backend TTS | Browser-native + server TTS |

### 6.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                              CLIENT                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │ React 18    │  │ Workbox     │  │ Tailwind    │               │
│  │ PWA         │  │ Service     │  │ CSS         │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           VERCEL                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Next.js / React App                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │  │
│  │  │ Auth     │  │ UI       │  │ API      │  │ PWA      │     │  │
│  │  │ (Supabase)│  │ Routes   │  │ Routes   │  │ Assets   │     │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │  │
│  └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   SUPABASE      │ │   UPSTASH       │ │   RAILWAY       │
│                 │ │   REDIS         │ │                 │
│ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────────────┐ │
│ │ PostgreSQL  │ │ │ │ Rate Limit  │ │ │ │ Disease     │ │
│ │ + PostGIS   │ │ │ │ Sessions    │ │ │ │ Detection   │ │
│ └─────────────┘ │ │ │ Cache       │ │ │ │ Service     │ │
│                 │ │ └─────────────┘ │ │ └─────────────┘ │
│ ┌─────────────┐ │ │                 │ │                 │
│ │ Auth        │ │ └─────────────────┘ │ ┌─────────────┐ │
│ └─────────────┘ │                     │ │ NDVI        │ │
│                 │                     │ │ Analysis    │ │
│ ┌─────────────┐ │                     │ └─────────────┘ │
│ │ Realtime    │ │                     └─────────────────┘
│ └─────────────┘ │
└─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Africa       │  │ Weather      │  │ Payment      │             │
│  │ Talking      │  │ API          │  │ Gateways     │             │
│  │ (USSD/SMS)  │  │ (OpenWeather)│  │ (M-Pesa,     │             │
│  └──────────────┘  └──────────────┘  │ Flutterwave) │             │
│                                       └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 Database Schema (High-Level)

#### Core Tables

```sql
-- Users
users (
  id UUID PRIMARY KEY,
  phone VARCHAR(20) UNIQUE,
  name VARCHAR(100),
  language VARCHAR(10),
  region_id UUID,
  created_at TIMESTAMP
)

-- Farms
farms (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  name VARCHAR(100),
  size_hectares DECIMAL,
  location GEOGRAPHY(Point)
)

-- Crops
crops (
  id UUID PRIMARY KEY,
  name VARCHAR(50),
  local_names JSONB
)

-- Farm Crops (what user grows)
farm_crops (
  id UUID PRIMARY KEY,
  farm_id UUID REFERENCES farms,
  crop_id UUID REFERENCES crops,
  season VARCHAR(20)
)

-- Disease Scans
disease_scans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  image_url TEXT,
  voice_note_url TEXT,
  disease_name VARCHAR(100),
  confidence DECIMAL,
  treatment_text TEXT,
  verified_by UUID REFERENCES users,
  created_at TIMESTAMP
)

-- Market Listings
listings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  crop_id UUID REFERENCES crops,
  quantity_kg DECIMAL,
  quality_grade VARCHAR(10),
  price_per_kg DECIMAL,
  status VARCHAR(20),
  created_at TIMESTAMP
)

-- Offers
offers (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings,
  buyer_id UUID REFERENCES users,
  price_per_kg DECIMAL,
  status VARCHAR(20)
)

-- Farm Activities
farm_activities (
  id UUID PRIMARY KEY,
  farm_id UUID REFERENCES farms,
  activity_type VARCHAR(20),
  crop_id UUID REFERENCES crops,
  date DATE,
  notes TEXT,
  created_at TIMESTAMP
)
```

---

## 7. Out of Scope (Phase 1)

### 7.1 Explicitly Not Building

| Category | Item | Reason |
|----------|------|--------|
| **Features** | Insurance products | Regulatory complexity, Phase 2+ |
| **Features** | Credit/loan products | Regulatory, Phase 2+ |
| **Features** | Input e-commerce (buying seeds/fertilizer) | Supply chain complexity, Phase 2 |
| **Features** | Logistics/transportation | Operational complexity, Phase 2 |
| **Features** | Export documentation | Regulatory, Phase 2 |
| **Features** | Real-time satellite monitoring (NDVI) | Too expensive for Phase 1; can add as premium |
| **Features** | Advanced analytics dashboards | Focus on core value first |
| **Features** | Multi-language app beyond 6 languages | MVP constraint |
| **Features** | Offline maps | Storage constraints |
| **Technical** | iOS native app | Android-first; PWA works on iOS |
| **Technical** | WebRTC video calls | Data cost too high |
| **Technical** | Push notifications on feature phones | Not supported |

### 7.2 Future Phase Considerations

The following will be considered for Phase 2:

- **NDVI Analysis**: Satellite-based crop health monitoring (premium tier)
- **Input Marketplace**: Buy seeds, fertilizer in-app
- **Logistics**: Connect to transport providers
- **Weather Stations**: Integration with IoT sensors
- **Financial Services**: Micro-insurance, input credit
- **Export Features**: EU compliance, documentation

---

## 8. Success Metrics (Phase 1)

### 8.1 Product Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Users registered | 50,000 | Supabase user count |
| Monthly active users | 25,000 | DAU/MAU from analytics |
| Daily active users | 10,000 | Daily event count |
| Disease scan completion rate | 70% | From scan start to result |
| Listing creation rate | 15% | Of active users |
| USSD usage rate | 20% | Of feature phone users |

### 8.2 Business Metrics

| Metric | Target |
|--------|--------|
| Crop loss reduction (self-reported) | 20% reduction |
| Price improvement (market users) | 10% higher price |
| User satisfaction (NPS) | 40+ |

### 8.3 Technical Metrics

| Metric | Target |
|--------|--------|
| API response time (p95) | < 2 seconds |
| Disease detection accuracy | > 80% |
| Uptime | 99.5% |
| Offline functionality | Core features work offline |

---

## 9. Timeline (Phase 1)

| Phase | Duration | Focus |
|-------|----------|-------|
| Discovery & Design | 4 weeks | Research, IA, design system |
| MVP Development | 12 weeks | Core features, backend |
| Internal Testing | 3 weeks | Alpha testing, bug fixes |
| Beta Launch | 4 weeks | 500 users, feedback collection |
| Public Launch | 2 weeks | Full launch, marketing |
| Iterate | Ongoing | Based on feedback |

**Estimated Launch**: Q3 2026

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low literacy users can't navigate | High | Voice-first UI, extensive testing |
| Feature phone USSD complexity | Medium | Partner with Africa's Talking early |
| Disease detection accuracy | High | Human verification loop, extension officer |
| Data cost barrier | High | Offline-first, minimal payloads, compressed images |
| Trust/adoption | Medium | Extension officer partnership, community pilots |
| Weather API reliability | Medium | Cache aggressively, show last known data |
| Payment regulatory | Medium | Use licensed payment partners, escrow model |

---

## 11. Appendix

### 11.1 Glossary

| Term | Definition |
|------|------------|
| **USSD** | Unstructured Supplementary Service Data - text-based menu on feature phones |
| **NDVI** | Normalized Difference Vegetation Index - satellite-based crop health |
| **Escrow** | Payment held by third party until delivery confirmed |
| **PWA** | Progressive Web App - installable web app with offline capability |
| **PostGIS** | Geographic database extension for PostgreSQL |

### 11.2 References

- User research documentation
- Competitor analysis (e.g., AgroStar, Farmerline, Hello Tractor)
- Accessibility guidelines for low-literacy users

---

**End of PRD**

*This document is a living spec and will be updated based on learnings from user research and development.*