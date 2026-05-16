# FarmPulse — Technical Requirements Document

**Agritech Farming Assistant · Progressive Web App**

---

| Attribute | Value |
|---|---|
| Document Version | 1.1 |
| Date | May 2026 |
| Status | Draft — Pending Engineering Review |
| Classification | Confidential |
| Platform | Progressive Web App (Mobile & Tablet First) |
| Target Region | Nigeria & Sub-Saharan Africa |
| Build Tool | IBM Bob (AI-first IDE) |
| Database | Supabase (PostgreSQL 15 + PostGIS) |
| Hosting | Vercel (Frontend + API) · Railway (Python microservices) |

---

## Document Control

### Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | May 2026 | Product Team | Initial draft — Docker + self-hosted PostgreSQL |
| 1.1 | May 2026 | Product Team | Updated to Supabase (database, auth, storage) and Vercel (hosting, CI/CD). Python microservices moved to Railway. Upstash Redis replaces self-hosted Redis. |

### Definitions & Acronyms

| Term | Definition |
|---|---|
| PWA | Progressive Web App — a web application installable on mobile home screens |
| TRD | Technical Requirements Document |
| NDVI | Normalised Difference Vegetation Index — satellite crop health metric |
| WCS | Web Coverage Service — protocol for downloading geospatial raster data |
| ETL | Extract, Transform, Load — pipeline for importing raw data into a database |
| PostGIS | PostgreSQL extension for spatial/geographic data — available natively in Supabase |
| RLS | Row Level Security — Supabase's built-in per-row access control policy system |
| STT | Speech-to-Text — voice transcription for low-literacy farmers |
| TTS | Text-to-Speech — voice playback of AI advisory responses |
| MOU | Memorandum of Understanding — data-sharing agreement with government bodies |
| NFR | Non-Functional Requirement |
| NAERLS | National Agricultural Extension and Research Liaison Services (ABU Zaria) |
| IITA | International Institute of Tropical Agriculture (Ibadan, Nigeria) |
| NiMET | Nigerian Meteorological Agency (Abuja) |
| Edge Function | Supabase serverless functions running on Deno, deployed globally |
| Serverless Function | Vercel API Routes — Node.js functions deployed at the edge |

---

## 1. Introduction

### 1.1 Purpose

This Technical Requirements Document defines the complete functional, non-functional, and integration requirements for FarmPulse — a Progressive Web App designed to serve smallholder farmers across Nigeria and Sub-Saharan Africa. It is the authoritative reference for engineering, design, QA, and data partnerships throughout the development lifecycle.

### 1.2 Product Vision

FarmPulse empowers smallholder farmers with decision-support tools previously available only to large agribusinesses: real-time weather intelligence, satellite crop health monitoring, soil-specific fertiliser recommendations, crop disease detection via phone camera, market price alerts, and direct buyer connections — all accessible on a basic Android smartphone with intermittent 2G connectivity.

### 1.3 Scope

This document covers:

- Frontend PWA (React 18 + TypeScript, Vite, Tailwind CSS, Workbox)
- Backend API via Vercel Serverless Functions (Node.js + TypeScript)
- Supabase — database (PostgreSQL + PostGIS), authentication, storage, real-time subscriptions
- AI/ML microservices (Python FastAPI — hosted on Railway)
- External data integrations (12 data sources across weather, soil, market, satellite)
- Offline-first architecture and Workbox background sync
- Multilingual support (English, Hausa, Yoruba, Igbo)
- CI/CD pipeline (GitHub → Vercel auto-deploy)

### 1.4 Out of Scope

- WhatsApp integration (Phase 2)
- Native iOS or Android app builds
- USSD / SMS channel (Phase 2 — feature phones)
- Payment processing and escrow (Phase 3)
- Desktop layout (mobile and tablet only)

---

## 2. System Architecture

### 2.1 Architecture Overview

> FarmPulse uses a serverless architecture. The React PWA and all Node.js API logic are hosted on Vercel. Supabase provides the PostgreSQL database (with PostGIS), authentication, file storage, and real-time subscriptions. Python microservices (disease detection, satellite NDVI) run on Railway as persistent web services. Upstash Redis provides serverless caching compatible with Vercel's edge network.

### 2.2 System Components

| Component | Technology | Host | Responsibility |
|---|---|---|---|
| PWA Frontend | React 18 + TypeScript + Vite | Vercel (CDN) | Farmer-facing UI, offline caching, camera & voice input |
| API Layer | Vercel Serverless Functions (Node.js) | Vercel Edge | Request routing, business logic, external API orchestration |
| Database | Supabase (PostgreSQL 15 + PostGIS) | Supabase Cloud | Farmer profiles, crop data, soil rasters, market prices |
| Authentication | Supabase Auth | Supabase Cloud | Phone OTP login, JWT session management, RLS enforcement |
| File Storage | Supabase Storage | Supabase Cloud | Crop disease photos, NDVI map images |
| Real-time | Supabase Realtime | Supabase Cloud | Live price alert push to PWA without polling |
| Cache Layer | Upstash Redis (Serverless) | Upstash (global) | API response caching compatible with Vercel Edge |
| Background Jobs | Vercel Cron Jobs | Vercel | Daily market price sync, weekly data refresh |
| Disease Detection | Python FastAPI | Railway | TFLite model inference on uploaded crop photos |
| Satellite NDVI | Python FastAPI | Railway | NDVI computation via Digital Earth Africa STAC API |
| Advisory Engine | Vercel Function + Claude API | Vercel + Anthropic | Contextual farming advice in local languages |

### 2.3 Why These Choices

**Supabase over self-hosted PostgreSQL:**
- PostGIS is available as a first-party Supabase extension — spatial queries work identically
- Built-in authentication replaces custom JWT + bcrypt setup entirely
- Storage bucket replaces an S3/object storage configuration for crop photos
- Row Level Security (RLS) enforces that farmers can only access their own data at the database layer — not just the API layer
- Supabase Realtime pushes price alerts to the PWA without polling
- Managed backups, connection pooling (PgBouncer), and read replicas are included

**Vercel over self-hosted servers:**
- Zero DevOps — no Nginx config, no server management, no Docker in production
- GitHub push → auto-deploy with preview URLs per branch
- Global CDN ensures the PWA loads fast for farmers in Lagos, Kano, and Nairobi
- Vercel Cron Jobs replace the Bull queue / Redis job scheduler for market sync

**Railway for Python microservices:**
- Vercel does not support persistent Python runtimes with large ML model files
- Railway supports Python FastAPI with persistent storage for `.tflite` model files
- Railway containers stay warm — no cold start delay for disease detection requests
- Cost-effective for low-to-medium inference volume

**Upstash Redis over self-hosted Redis:**
- Serverless Redis that works inside Vercel Edge Functions — standard Redis clients do not
- Pay-per-request pricing — no idle server cost
- Global replication matches Vercel's edge regions

### 2.4 Request Data Flow

```
1. Farmer opens PWA
   → Service Worker checks IndexedDB cache
   → Renders cached data instantly (offline-first)
   → Background fetch triggers Vercel API route

2. Vercel Function receives request
   → Checks Upstash Redis for cached response
   → If cache hit: returns immediately (< 200ms)
   → If cache miss: calls external data sources, stores in Redis, returns

3. Supabase Auth validates JWT on every protected request
   → RLS policies enforce farmer-specific data access at DB level

4. Farmer submits crop photo
   → PWA uploads to Supabase Storage bucket (direct from browser)
   → Vercel Function triggers Railway Disease Detection service
   → Result returned to PWA and cached in IndexedDB

5. Market price update (6am daily Vercel Cron)
   → Fetches FAOSTAT + Esoko + Nigeria Farm Data
   → Upserts to Supabase market_prices table
   → Supabase Realtime broadcasts change to subscribed PWA clients
   → PWA updates price display without refresh
```

---

## 3. Frontend Requirements

### 3.1 Technology Stack

| Library / Tool | Version | Purpose |
|---|---|---|
| React | 18.x | Component framework |
| TypeScript | 5.x | Type safety across all components |
| Vite | 5.x | Build tool with `vite-plugin-pwa` for service worker generation |
| Tailwind CSS | 3.x | Utility-first styling — no custom CSS files |
| Workbox | 7.x | Service worker caching strategies and background sync |
| TanStack Query | 5.x | Server state, background refetching, offline mutation queues |
| Zustand | 4.x | Local UI state (selected crop, language preference) |
| Supabase JS Client | 2.x | Auth, database queries, storage uploads, realtime subscriptions |
| React Hook Form | 7.x | Farm registration, crop logging forms |
| Recharts | 2.x | Market price sparklines and trend charts |
| i18next | 23.x | Internationalisation for English, Hausa, Yoruba, Igbo |
| browser-image-compression | 2.x | Compress photos before upload to Supabase Storage |

### 3.2 PWA Requirements

#### 3.2.1 Manifest & Installability

- App must be installable to home screen on: Android Chrome, iOS Safari, iPadOS Safari
- `manifest.json` must define: `name`, `short_name`, `icons` (192px + 512px + maskable), `theme_color: #2D6A4F`, `background_color: #FFFFFF`, `display: standalone`, `start_url: /`
- Install prompt appears after the farmer's second visit
- Splash screen displays the FarmPulse logo and a green background on startup
- Vercel automatically serves `manifest.json` and all PWA assets over HTTPS

#### 3.2.2 Offline Caching Strategy (Workbox)

| Resource Type | Strategy | TTL | Notes |
|---|---|---|---|
| App shell (JS, CSS, fonts) | Cache First | Indefinite | Content-hashed by Vite — safe to cache forever |
| Weather forecast API | Stale While Revalidate | 3 hours | Instant load; Vercel function updates in background |
| Market prices API | Stale While Revalidate | 6 hours | Price sync runs at 6am daily via Vercel Cron |
| Crop advisory responses | Cache First | 72 hours | Works fully offline in the field |
| Soil profile by GPS | Cache First | 30 days | Soil data changes seasonally at most |
| NDVI satellite images | Cache First | 7 days | Satellite revisit cycle is 5–10 days |
| Supabase Auth session | Network First | Token expiry | Always verify session freshness |
| POST mutations (scans, logs) | Background Sync Queue | Retry 3× | Queued in IndexedDB; replayed on reconnect |

#### 3.2.3 Supabase Realtime Integration

```typescript
// src/hooks/usePriceAlerts.ts
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePriceAlerts(crops: string[]) {
  useEffect(() => {
    const channel = supabase
      .channel('market-prices')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'price_alerts',
        filter: `crop=in.(${crops.join(',')})`
      }, (payload) => {
        showPriceAlert(payload.new)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [crops])
}
```

### 3.3 Responsive Layout

> FarmPulse targets mobile and tablet only. No desktop layout is built. All breakpoints defined below must be tested at every Vercel preview deployment before merge to `main`.

| Breakpoint | Screen Range | Layout Pattern |
|---|---|---|
| `xs` | 360px – 413px (small Android) | Single column · Bottom tab bar · Min 48px touch targets |
| `sm` | 414px – 767px (standard phone) | Single column · Bottom tab bar · Increased horizontal padding |
| `md` | 768px – 1023px (large phone / small tablet) | Two-column crop card grid · Bottom tab bar |
| `lg` | 1024px+ (iPad / tablet) | Persistent left sidebar (280px) + main content area · No bottom tab bar |

### 3.4 Screen & Feature Requirements

#### 3.4.1 Core Screens

| Screen | Key Features | Offline Support | Priority |
|---|---|---|---|
| Home / Dashboard | Weather widget, crop health summary, price alert banner, quick actions | Full (cached) | P0 |
| Crop Tracker | Active crop cards with growth stage, NDVI badge, disease scan button | Partial (cached cards) | P0 |
| Farm Advisor | Voice recorder, AI response with TTS playback, advisory history | Full (cached history) | P0 |
| Market Prices | Price table with 7-day sparklines, alerts toggle, buyer directory | Partial (cached prices) | P0 |
| Soil & Fertiliser | Soil profile by GPS, fertiliser recommendation, Naira cost estimate | Full (cached by GPS) | P1 |
| Planting Calendar | Monthly calendar, planting window highlight, NAERLS state notes | Full (cached) | P1 |
| Field Map | NDVI satellite overlay on farm polygon, health colour legend | No (requires network) | P1 |
| Profile & Settings | Farm details, language preference, notification settings | Full | P0 |

#### 3.4.2 Authentication Flow (Supabase Auth)

- Farmers log in with their phone number (OTP via SMS — Supabase Twilio integration)
- No password required — reduces friction for low-literacy users
- Session stored in Supabase client (secure, httpOnly cookie in Next.js / localStorage in Vite SPA — use `localStorage` only in non-sensitive PWA context)
- `supabase.auth.onAuthStateChange()` handles session refresh automatically
- Protected routes redirect unauthenticated users to the OTP login screen

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Login — sends OTP to farmer's phone
export const sendOTP = (phone: string) =>
  supabase.auth.signInWithOtp({ phone })

// Verify OTP
export const verifyOTP = (phone: string, token: string) =>
  supabase.auth.verifyOtp({ phone, token, type: 'sms' })
```

#### 3.4.3 File Upload Flow (Supabase Storage)

```typescript
// src/services/cropPhoto.service.ts
export async function uploadCropPhoto(file: File, farmerId: string) {
  const compressed = await compressImage(file, { maxSizeMB: 0.8 })
  const filename = `${farmerId}/${Date.now()}.jpg`

  const { data, error } = await supabase.storage
    .from('crop-photos')           // Supabase Storage bucket
    .upload(filename, compressed, {
      contentType: 'image/jpeg',
      upsert: false
    })

  if (error) throw error

  // Get a short-lived signed URL for the Railway Disease Service
  const { data: urlData } = await supabase.storage
    .from('crop-photos')
    .createSignedUrl(filename, 3600)  // 1-hour expiry

  return urlData?.signedUrl
}
```

#### 3.4.4 Voice Input Requirements

- Microphone button must be minimum 72×72px — thumb-tappable
- Use `Web Speech API (SpeechRecognition)` with `lang` set from farmer's language preference
- Show live transcript as farmer speaks — reassures low-literacy users the app is listening
- Fallback: if Web Speech API unavailable, record audio blob → upload to Vercel function → transcribe via OpenAI Whisper
- Every AI advisory response must render a **Play** button using `SpeechSynthesis` so farmers can listen without reading

#### 3.4.5 Camera Capture Requirements

- Use `<input type="file" accept="image/*" capture="environment">` — environment (rear) camera default
- Compress to max 800KB using `browser-image-compression` before uploading to Supabase Storage
- Show photo preview before submission — farmer confirms before analysis
- If offline: store image in IndexedDB → queue Supabase Storage upload in Workbox Background Sync → notify farmer: *"Your photo will be analysed when you reconnect"*

---

## 4. Backend Requirements

### 4.1 Vercel Serverless Functions

All API logic runs as Vercel Serverless Functions in `/api/` (or `/app/api/` for App Router). Each function is a stateless Node.js handler. Heavy work (ML inference, satellite computation) is delegated to Railway microservices.

**Key constraints of Vercel's serverless environment:**

- Maximum function execution time: **10 seconds** (Hobby) / **60 seconds** (Pro) — offload long tasks to Railway
- No persistent in-memory state between invocations — use Upstash Redis for shared state
- No long-running background processes — use Vercel Cron for scheduled tasks
- Function bundle size limit: 250MB — do not bundle TFLite models; they live on Railway

### 4.2 API Endpoint Specification

| Method | Endpoint | Description | Auth | Cache (Upstash) |
|---|---|---|---|---|
| `POST` | `/api/auth/otp/send` | Send OTP to farmer's phone | None | — |
| `POST` | `/api/auth/otp/verify` | Verify OTP, return Supabase session | None | — |
| `GET` | `/api/weather?lat&lng` | 7-day forecast + agro alerts | Optional | 3 hr |
| `GET` | `/api/weather/seasonal?state&month` | Seasonal rainfall outlook | Optional | 24 hr |
| `GET` | `/api/soil?lat&lng` | Soil profile + fertiliser advice | Required | 30 days |
| `GET` | `/api/crops` | Farmer's registered crops | Required | None |
| `POST` | `/api/crops` | Register new crop | Required | — |
| `POST` | `/api/disease/detect` | Trigger Railway disease service with Supabase Storage URL | Required | 72 hr |
| `GET` | `/api/market/prices?crop` | Current + 7-day price history | Optional | 6 hr |
| `GET` | `/api/market/buyers?crop&state` | Verified buyers by crop and state | Required | 24 hr |
| `POST` | `/api/advisor/ask` | Submit voice transcript → Claude advisory | Required | — |
| `GET` | `/api/calendar?crop&state` | NAERLS-backed planting calendar | Optional | 7 days |
| `GET` | `/api/satellite/ndvi?lat&lng` | Trigger Railway NDVI service; return image + stats | Required | 7 days |

### 4.3 Vercel Cron Jobs

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/jobs/sync-market-prices",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/jobs/refresh-naerls-cache",
      "schedule": "0 2 * * 1"
    },
    {
      "path": "/api/jobs/sync-chirps-rainfall",
      "schedule": "0 3 1 * *"
    }
  ]
}
```

| Job | Schedule | Responsibility |
|---|---|---|
| `sync-market-prices` | Daily 06:00 | Fetch FAOSTAT + Esoko + Nigeria Farm Data → upsert Supabase `market_prices` |
| `refresh-naerls-cache` | Weekly Monday 02:00 | Reprocess NAERLS PDF datasets → update `naerls_surveys` table |
| `sync-chirps-rainfall` | Monthly 1st 03:00 | Pull CHIRPS rainfall updates → update PostGIS raster table |

### 4.4 Upstash Redis Caching Pattern

```typescript
// src/lib/cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key)
  if (cached) return cached

  const fresh = await fetcher()
  await redis.setex(key, ttlSeconds, fresh)
  return fresh
}

// Usage in a Vercel Function
export default async function handler(req, res) {
  const { lat, lng } = req.query
  const cacheKey = `weather:${Number(lat).toFixed(2)}:${Number(lng).toFixed(2)}`

  const data = await withCache(cacheKey, 10800, () =>
    fetchOpenMeteo(Number(lat), Number(lng))
  )

  res.json(data)
}
```

### 4.5 Database Schema (Supabase)

#### 4.5.1 Supabase Extensions Required

Enable these in the Supabase dashboard under **Database → Extensions**:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;       -- Spatial queries (soil, farm GPS)
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- Encrypting PII fields
CREATE EXTENSION IF NOT EXISTS pg_trgm;       -- Fuzzy search for crop names
```

#### 4.5.2 Core Tables

```sql
-- FARMERS
CREATE TABLE farmers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Supabase Auth link
  full_name       TEXT,
  phone_number    TEXT UNIQUE NOT NULL,       -- Primary identifier
  state           TEXT NOT NULL,             -- Drives NAERLS data queries
  lga             TEXT,                      -- Local Government Area
  lat             DECIMAL(9,6),              -- Farm GPS coordinate
  lng             DECIMAL(9,6),
  language        TEXT DEFAULT 'english'     -- hausa | yoruba | igbo | english
    CHECK (language IN ('hausa','yoruba','igbo','english')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY — farmers see only their own rows
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers access own profile only"
  ON farmers FOR ALL
  USING (auth.uid() = user_id);

-- CROPS (tracked by farmer)
CREATE TABLE crops (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       UUID REFERENCES farmers(id) ON DELETE CASCADE,
  crop_name       TEXT NOT NULL,
  variety         TEXT,                      -- IITA/ICRISAT variety code if known
  planted_date    DATE NOT NULL,
  field_lat       DECIMAL(9,6),
  field_lng       DECIMAL(9,6),
  field_size_ha   DECIMAL(6,2),
  status          TEXT DEFAULT 'active'
    CHECK (status IN ('active','harvested','failed')),
  last_scan_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers access own crops only"
  ON crops FOR ALL
  USING (farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  ));

-- MARKET PRICES
CREATE TABLE market_prices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop            TEXT NOT NULL,
  state           TEXT,                      -- NULL = national average
  price_naira_kg  DECIMAL(10,2) NOT NULL,
  price_usd_tonne DECIMAL(10,2),
  source          TEXT NOT NULL,             -- faostat | esoko | nigeria_farm_data
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (crop, state, source, recorded_at::DATE)
);

-- Public read — prices are not sensitive
CREATE POLICY "Market prices are publicly readable"
  ON market_prices FOR SELECT USING (true);

-- PRICE ALERTS (triggers Supabase Realtime to PWA)
CREATE TABLE price_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop            TEXT NOT NULL,
  change_pct      DECIMAL(5,2) NOT NULL,     -- e.g. +23.5 or -18.2
  direction       TEXT CHECK (direction IN ('up','down')),
  price_naira_kg  DECIMAL(10,2),
  message_en      TEXT,
  message_ha      TEXT,
  message_yo      TEXT,
  message_ig      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- NAERLS SURVEY DATA
CREATE TABLE naerls_surveys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year            SMALLINT NOT NULL,
  season          TEXT CHECK (season IN ('wet','dry')),
  state           TEXT NOT NULL,
  crop            TEXT NOT NULL,
  yield_kg_ha     DECIMAL(8,2),
  plant_start     TEXT,                      -- e.g. 'April week 2'
  plant_end       TEXT,                      -- e.g. 'May week 1'
  disease_notes   TEXT,
  farmgate_price  DECIMAL(10,2),             -- NGN per kg
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (year, season, state, crop)
);

-- SOIL PROPERTIES (PostGIS raster — loaded from SoilGrids WCS + AfSIS)
CREATE TABLE soil_properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geom            raster,
  property_name   TEXT NOT NULL,             -- phh2o | nitrogen | oc | clay | sand
  depth_cm        SMALLINT NOT NULL,         -- 0 | 5 | 15 | 30
  unit            TEXT NOT NULL,
  source          TEXT NOT NULL              -- soilgrids | afsis_nisis
);

CREATE INDEX soil_properties_geom_idx
  ON soil_properties USING GIST (ST_ConvexHull(geom));

-- PostGIS function: get all soil properties at a GPS point
CREATE OR REPLACE FUNCTION get_soil_at_point(p_lat FLOAT, p_lng FLOAT)
RETURNS TABLE (property_name TEXT, value FLOAT, unit TEXT, depth_cm SMALLINT)
LANGUAGE sql AS $$
  SELECT
    sp.property_name,
    ST_Value(sp.geom, ST_SetSRID(ST_Point(p_lng, p_lat), 4326)) AS value,
    sp.unit,
    sp.depth_cm
  FROM soil_properties sp
  WHERE ST_Intersects(
    ST_ConvexHull(sp.geom),
    ST_SetSRID(ST_Point(p_lng, p_lat), 4326)
  );
$$;
```

#### 4.5.3 Supabase Storage Buckets

| Bucket Name | Access | Purpose |
|---|---|---|
| `crop-photos` | Private (signed URLs only) | Uploaded crop disease photos from farmers |
| `ndvi-maps` | Private (signed URLs only) | Pre-computed NDVI PNG images from Railway satellite service |
| `naerls-docs` | Private (admin only) | Raw NAERLS PDF source documents before ETL |

```sql
-- Supabase Storage RLS: farmer can only upload to their own folder
CREATE POLICY "Farmers upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'crop-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Farmers read own photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'crop-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 5. External Data Integration Requirements

> **Universal rule for all external API calls:** implement (1) Upstash Redis caching with appropriate TTL, (2) a 4-second timeout with graceful fallback to last cached value, (3) structured error logging, and (4) circuit breaker after 3 consecutive failures — return the cached response and alert the on-call engineer via Vercel log drain.

### 5.1 Weather Data

| Source | Access | Data Provided | Cache TTL | Fallback |
|---|---|---|---|---|
| Open-Meteo | Free — no key | 7–14 day daily forecast per GPS | 3 hours | Cached forecast |
| NASA POWER | Free — no key | 30+ years monthly climate history | 30 days | Cached history |
| CHIRPS (UCSB) | Free download | Monthly rainfall 1981–2024 (Supabase PostGIS raster) | Static — annual re-ingest | PostGIS raster query |
| NiMET | MOU required (begin now) | Official Nigeria seasonal forecasts by state | 24 hours | Open-Meteo |

### 5.2 Crop & Disease Data

| Source | Access | Data Provided | Integration Method |
|---|---|---|---|
| PlantVillage (Penn State) | Free (CC licence) | 87,000 disease images, 26 classes, 14 crops | Download → augment → train TFLite → deploy on Railway |
| PlantDoc (Kaggle) | Free | Real-field disease photos | Add to training data — closes lab-vs-field accuracy gap |
| IITA (Ibadan) | Open data + partnership | Cassava/yam/cowpea field images, variety data | Download + email iita-data@cgiar.org for fertiliser model API |
| ICRISAT (Harvard Dataverse) | Free download | Sorghum, millet, groundnut varieties — Northern Nigeria | CSV → Supabase `crop_varieties` table |
| NAERLS APS (annual) | Free PDF — request CSV | Yields, planting windows, disease alerts by state | PDF ETL → Supabase `naerls_surveys` table via Vercel Cron |

### 5.3 Soil Data

| Source | Access | Data Provided | Integration Method |
|---|---|---|---|
| SoilGrids / ISRIC | Free (CC-BY 4.0) — REST API paused | pH, N, carbon, clay, sand at 250m | WCS GeoTIFF download → `raster2pgsql` → Supabase PostGIS |
| AfSIS / NiSIS | Free (ODbL) — CSV + GeoPackage | Phosphorus, potassium, iron — 3,000 Nigeria samples | GeoPackage → Supabase PostGIS → proximity query |
| IITA Fertiliser Hub | Free partnership (startups) | AI site-specific fertiliser models for West Africa | Email IITA — integrate recommendation API response |
| Soils4Africa (ISRIC) | Free open data | Organic carbon, texture — sub-Saharan Africa | CSV → merge with NiSIS data in Supabase |

### 5.4 Market Price Data

| Source | Access | Data Provided | Sync Method |
|---|---|---|---|
| FAOSTAT (UN FAO) | Free REST API — no key | Producer prices by crop and year — Nigeria code: 159 | Vercel Cron daily 06:00 |
| Esoko | Freemium partnership | Real-time market prices, 20+ crops, Nigeria + Ghana | Vercel Cron daily 06:00 (API key) |
| Nigeria Farm Data | Free community API key | Farm-level and market prices — Nigeria specific | Vercel Cron daily 06:00 |
| CBN Exchange Rate | Free (`api.cbn.gov.ng`) | USD/NGN rate for price conversion | Vercel Cron hourly |
| AfDB Weekly Bulletin | Free download | Commodity prices, food security indicators | Vercel Cron weekly |

### 5.5 Satellite Data

| Source | Access | Data Provided | Integration Method |
|---|---|---|---|
| Digital Earth Africa | Free + Open Data Cube API | Sentinel-2 NDVI at 10m, Africa-wide | `odc-stac` Python → Railway FastAPI (Port 8002) |
| Sentinel Hub (ESA) | Freemium | Sentinel-1 + Sentinel-2, flood detection | Fallback REST API if Railway NDVI service is down |
| EOS Crop Monitoring | Paid partnership | Crop monitoring for 242,000+ African farmers | Phase 2 — after farmer base is established |

---

## 6. AI / ML Requirements

### 6.1 Crop Disease Detection (Railway Microservice)

| Attribute | Requirement |
|---|---|
| Host | Railway (persistent Python container, Port 8001) |
| Base Model | EfficientNetV2-S — pre-trained ImageNet, fine-tuned on farm data |
| Training Data | PlantVillage (87k images) + PlantDoc (real-field) + IITA Nigeria field images |
| Output Classes | 26 disease classes + 1 "Healthy" — across 14 crops |
| Target Accuracy | ≥88% on real-field validation set (not lab images) |
| Export Format | TensorFlow Lite (quantised INT8) — runs on CPU in <2 seconds |
| Input | Supabase Storage signed URL (1-hour expiry) — Railway downloads the image |
| Output Format | `{ disease, confidence, severity: low\|medium\|high, treatment, localProductsNigeria[] }` |
| Retraining | Quarterly — IITA + farmer-submitted field images |
| Fallback | If confidence <60% → prompt farmer to retake photo → escalate to extension officer |

```python
# Railway disease service — /main.py
from fastapi import FastAPI
import httpx, numpy as np
import tensorflow as tf

app = FastAPI()
model = tf.lite.Interpreter('models/crop_disease_nigeria_v1.tflite')
model.allocate_tensors()

@app.post('/detect')
async def detect(body: dict):
    # Download image from Supabase Storage signed URL
    async with httpx.AsyncClient() as client:
        img_bytes = (await client.get(body['imageUrl'])).content

    img = preprocess(img_bytes)              # resize 224×224, normalise [0,1]
    result = run_inference(model, img)
    return format_result(result)             # disease, confidence, severity, treatment
```

### 6.2 Satellite NDVI Service (Railway Microservice)

```python
# Railway satellite service — /ndvi.py
from fastapi import FastAPI
import odc.stac, planetary_computer

app = FastAPI()

@app.get('/ndvi')
async def get_ndvi(lat: float, lng: float):
    items = search_sentinel2(lat, lng, cloud_cover_max=20)
    ds = odc.stac.load(items, bands=['B04','B08'], resolution=10)

    red = ds['B04'].values.astype(float)
    nir = ds['B08'].values.astype(float)
    ndvi = (nir - red) / (nir + red + 1e-8)

    avg_ndvi = float(ndvi.mean())
    health = 'healthy' if avg_ndvi > 0.5 else 'moderate' if avg_ndvi > 0.3 else 'stressed'

    png_b64 = render_ndvi_png(ndvi)          # colour-coded PNG as base64
    url = upload_to_supabase(png_b64, lat, lng)   # store in Supabase Storage ndvi-maps bucket

    return { 'ndviMapUrl': url, 'averageNdvi': avg_ndvi, 'healthStatus': health }
```

### 6.3 Advisory Engine (Vercel Function + Claude API)

- Model: `claude-sonnet-4-20250514` via Anthropic API
- System prompt includes: farmer profile, active crops, soil profile, current weather, recent NAERLS advisories for their state
- Response must be ≤300 words, plain language (no jargon), with one clear action, a timeframe, and a Naira cost estimate
- Language: auto-detected from farmer's `language` preference field in Supabase
- Every AI response flagged with data sources used — optionally marked *"Verified by extension officer"* when NAERLS data corroborates

```typescript
// /api/advisor/ask.ts — Vercel Serverless Function
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  const { transcript, farmerId } = req.body

  // Load farmer context from Supabase
  const { data: farmer } = await supabaseAdmin
    .from('farmers')
    .select('*, crops(*)')
    .eq('id', farmerId)
    .single()

  const soil   = await getSoilProfile(farmer.lat, farmer.lng)
  const weather = await getWeather(farmer.lat, farmer.lng)
  const naerls  = await getNaearlsData(farmer.state, farmer.crops[0]?.crop_name)

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: buildSystemPrompt(farmer, soil, weather, naerls),
    messages: [{ role: 'user', content: transcript }]
  })

  res.json({ advice: message.content[0].text, language: farmer.language })
}
```

### 6.4 Voice Processing

| Function | Primary Method | Fallback |
|---|---|---|
| Speech to Text | Web Speech API (browser-native) | OpenAI Whisper API (Vercel Function) |
| Text to Speech | Web Speech Synthesis API (browser-native) | Google TTS API — better Hausa/Yoruba/Igbo quality |
| Language Detection | Farmer `language` field from Supabase profile | Auto-detect from transcript if preference not set |
| Supported Languages | English, Hausa, Yoruba, Igbo | Bambara, Twi — Phase 2 (Mali, Ghana) |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target | Measurement |
|---|---|---|
| First Contentful Paint (FCP) | <1.5s on 3G | Vercel Speed Insights + Lighthouse CI |
| Time to Interactive (TTI) | <3.0s on 3G | Lighthouse CI on every PR |
| Largest Contentful Paint (LCP) | <2.5s | Lighthouse CI |
| Cumulative Layout Shift (CLS) | <0.1 | Lighthouse CI |
| PWA Lighthouse Score | ≥90 all categories | Lighthouse CI |
| Disease scan API (Railway) | <2.5s on CPU | k6 load test — 50 concurrent requests |
| Weather API (Upstash cache hit) | <200ms | Vercel Function logs |
| Weather API (cache miss) | <1.5s | Open-Meteo latency + Vercel overhead |
| Supabase query (simple) | <100ms | Supabase dashboard query performance panel |
| Supabase query (PostGIS spatial) | <500ms | Supabase slow query log — optimise with spatial indexes |
| Offline P0 screens | 100% functional | Manual test checklist per release |
| Vercel cold start | <800ms | Vercel dashboard — keep functions warm via Cron |

### 7.2 Security

- All traffic: HTTPS enforced by Vercel (automatic TLS, HTTP → HTTPS redirect)
- Authentication: Supabase Auth manages JWTs — no custom token logic required
- Row Level Security: RLS policies on every Supabase table — data isolation enforced at database layer, not just API layer
- API Keys: stored as Vercel Environment Variables (never in source code)
- Supabase `service_role` key: used only in Vercel serverless functions server-side — never exposed to browser
- Supabase `anon` key: safe for browser use — access controlled entirely by RLS policies
- Crop photos: stored in private Supabase Storage bucket with signed URLs (1-hour expiry)
- Rate limiting: Vercel Edge Middleware — 100 requests/min per authenticated user, 20/min anonymous
- SQL injection: all queries use Supabase JS client (parameterised by default) — no raw string concatenation
- CORS: Vercel functions configured to allow only the production Vercel domain and `localhost:5173`

### 7.3 Accessibility & Localisation

- Minimum touch target: 48×48px on all interactive elements
- Minimum font size: 16px body, 20px headings — critical for older users and poor lighting outdoors
- WCAG AA contrast ratio: ≥4.5:1 for all text — high-contrast green-on-white primary palette
- Screen reader: all buttons and images have descriptive `aria-label` attributes
- All UI strings internationalised via `i18next` — zero hardcoded text in components
- Locale-aware number formatting: `₦1,200` not `1200`; `DD/MM/YYYY` date format
- Icon-first UI: every key action has a recognisable icon — reduces literacy dependency
- Language preference persisted in Supabase `farmers.language` — syncs across devices

### 7.4 Device & Browser Support

| Device / Browser | Min Version | Support Level | Notes |
|---|---|---|---|
| Android Chrome | Chrome 90+ | Full | Primary target — 70%+ of Nigerian smartphone users |
| Android Samsung Internet | 14+ | Full | Common on budget Samsung Galaxy A-series |
| iOS Safari (iPhone) | iOS 15+ | Full | Only browser that allows PWA install on iOS |
| iPadOS Safari | iPadOS 15+ | Full — tablet layout | Triggers sidebar layout at 1024px+ |
| Android Firefox | Latest | Partial | Voice API may not work — fallback to Whisper |
| KaiOS / feature phones | N/A | Not supported | Phase 2 — USSD channel |

---

## 8. Deployment & Infrastructure

### 8.1 Supabase Project Setup

```bash
# 1. Create project at supabase.com
# 2. Note your project URL and keys from Settings → API

# 3. Link local project
npx supabase init
npx supabase link --project-ref YOUR_PROJECT_REF

# 4. Enable required extensions (run in Supabase SQL Editor)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

# 5. Apply migrations
npx supabase db push

# 6. Load soil raster data (run locally — large files)
raster2pgsql -s 4326 -I -C /data/soilgrids/nigeria_ph_0_5cm.tif soil_properties \
  | psql "$SUPABASE_DB_URL"
```

### 8.2 Vercel Project Setup

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Connect to IBM Bob project directory
cd farmPulse
vercel link

# 3. Add all environment variables (or import via Vercel dashboard)
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add ANTHROPIC_API_KEY
vercel env add ESOKO_API_KEY
vercel env add NIGERIA_FARM_DATA_KEY
vercel env add RAILWAY_DISEASE_SERVICE_URL
vercel env add RAILWAY_SATELLITE_SERVICE_URL
vercel env add OPENAI_API_KEY

# 4. Deploy
vercel deploy --prod

# 5. Connect GitHub repo for automatic deploys
# (via Vercel dashboard → Import Project → GitHub)
```

### 8.3 Environment Variables Reference

| Variable | Where to Get | Used In | Sensitive |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API | Frontend (browser) | No |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API | Frontend (browser) | No — RLS protected |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Vercel Functions only | **Yes — server only** |
| `SUPABASE_DB_URL` | Supabase → Settings → Database | Migrations + ETL scripts | **Yes** |
| `UPSTASH_REDIS_REST_URL` | Upstash console | Vercel Functions | **Yes** |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash console | Vercel Functions | **Yes** |
| `ANTHROPIC_API_KEY` | console.anthropic.com | Vercel Functions | **Yes** |
| `ESOKO_API_KEY` | Esoko partnership | Vercel Cron Function | **Yes** |
| `NIGERIA_FARM_DATA_KEY` | farmdata.com.ng | Vercel Cron Function | **Yes** |
| `RAILWAY_DISEASE_SERVICE_URL` | Railway dashboard | Vercel Functions | No |
| `RAILWAY_SATELLITE_SERVICE_URL` | Railway dashboard | Vercel Functions | No |
| `OPENAI_API_KEY` | platform.openai.com | Vercel Functions (Whisper fallback) | **Yes** |
| `WEATHER_PROVIDER` | `openmeteo` or `nimet` | Vercel Functions | No |
| `CBN_API_BASE` | `https://api.cbn.gov.ng` | Vercel Cron | No |

> **IBM Bob note:** In local development, Bob reads all variables from `.env.local`. Never commit `.env.local` to Git. Add `.env.local` to `.gitignore` before the first commit.

### 8.4 Railway Microservice Deployment

```bash
# Railway is used ONLY for Python microservices that Vercel cannot run:
# 1. Disease Detection Service (TFLite model, large files, persistent runtime)
# 2. Satellite NDVI Service (odc-stac, large geospatial dependencies)

# Install Railway CLI
npm install -g @railway/cli

# Deploy disease service
cd services/disease-detector
railway login
railway init
railway up

# Railway reads from: railway.toml or Procfile
# Procfile: web: uvicorn main:app --host 0.0.0.0 --port $PORT

# Environment variables (set in Railway dashboard)
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (to upload NDVI maps back to Storage)
# MODEL_PATH=./models/crop_disease_nigeria_v1.tflite
```

### 8.5 CI/CD Pipeline

```
Developer pushes to feature branch
  ↓
GitHub Actions runs:
  - Vitest unit tests
  - TypeScript type check
  - ESLint
  - Lighthouse CI (performance + PWA score)
  ↓
Vercel creates preview deployment (unique URL per PR)
  ↓
Pull request review + QA on preview URL
  ↓
Merge to main
  ↓
Vercel auto-deploys to production
Railway auto-deploys Python services (if /services/* changed)
  ↓
Supabase migrations run via GitHub Action:
  npx supabase db push --project-ref $PROJECT_REF
```

### 8.6 IBM Bob Build Workflow

1. Open project in IBM Bob. Confirm Supabase project is linked (`npx supabase status`)
2. **Architect mode first** — paste full system architecture prompt. Review plan before Bob writes any code
3. **Code mode** — build in this order: Supabase schema migrations → Vercel API functions → Frontend components → Workbox offline config
4. Use **Plan mode** before any Supabase migration that alters existing tables — review `supabase db diff` output first
5. Test each Vercel function locally with `vercel dev` before pushing
6. Bob generates `vercel.json` for Cron configuration automatically when prompted
7. Use Bob's **Ask mode** to generate Supabase RLS policies — these are security-critical and should be reviewed line by line

---

## 9. Testing Requirements

### 9.1 Testing Levels

| Level | Tool | Coverage Target | When |
|---|---|---|---|
| Unit Tests | Vitest (frontend) + Jest (Vercel functions) | ≥80% statement coverage | Every commit — GitHub Actions |
| Integration Tests | Supabase local emulator + Supertest | All P0 API endpoints | Every PR |
| E2E Tests | Playwright (mobile viewport 390px) | All P0 farmer user flows | Nightly + pre-release |
| Performance | Lighthouse CI + Vercel Speed Insights | See NFR targets §7.1 | Every PR |
| Offline Testing | Manual checklist + Playwright network throttle | All P0 screens | Before every release |
| Device Testing | BrowserStack real devices | All supported browsers §7.4 | Weekly |
| Accessibility | axe-core (automated) + manual | WCAG AA | Every release |
| AI Model Accuracy | Custom validation dataset (1,000 field images) | ≥88% on real-field photos | Quarterly retraining |
| RLS Policy Testing | Supabase local emulator — test as different `auth.uid()` values | 100% of policies | Every Supabase migration |
| Supabase Migration | `supabase db diff` + `supabase db push --dry-run` | Zero destructive operations | Before every migration |

### 9.2 Supabase Local Testing Setup

```bash
# Run Supabase locally for integration tests
npx supabase start

# Outputs:
# API URL:     http://127.0.0.1:54321
# DB URL:      postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Studio URL:  http://127.0.0.1:54323

# Point .env.test.local at local Supabase
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<local anon key from supabase start output>

# Run tests against local Supabase
npx vitest run
```

### 9.3 Key Test Scenarios

**Offline behaviour:**
- `TC-01` — Load Home screen with no network → cached data renders within 1 second
- `TC-02` — Submit crop photo offline → queued in IndexedDB → auto-uploads on reconnect via Workbox Background Sync → disease result delivered
- `TC-03` — View planting calendar offline → NAERLS-backed data renders from Workbox cache

**Supabase RLS:**
- `TC-04` — Farmer A cannot query Farmer B's crops (RLS policy blocks cross-farmer access)
- `TC-05` — Unauthenticated request to `/api/crops` returns 401
- `TC-06` — Farmer can upload only to their own Supabase Storage folder (`{userId}/`)

**Low-end device:**
- `TC-07` — App loads under 3 seconds on Infinix Hot 10 (1GB RAM, Android 10) on 3G
- `TC-08` — Disease detection photo round-trip completes within 10 seconds on same device

**Multilingual:**
- `TC-09` — Switching to Hausa updates all UI labels, button text, and TTS voice
- `TC-10` — Advisory Engine returns advice in Igbo when farmer's `language = 'igbo'`

**Vercel Cron:**
- `TC-11` — `sync-market-prices` cron upserts fresh prices to Supabase and triggers Realtime broadcast
- `TC-12` — If FAOSTAT API is down, cron logs error and returns last known prices — does not overwrite with nulls

---

## 10. Appendices

### Appendix A — Data Source Contact Directory

| Institution | Contact | Purpose |
|---|---|---|
| NAERLS (ABU Zaria) | naerls@abu.edu.ng | APS datasets, planting window data, disease alert CSVs |
| IITA Data Team | iita-data@cgiar.org | Fertiliser Hub API, cassava/yam disease image datasets |
| NiMET (Abuja) | Director General — postal MOU required | Official Nigeria weather feeds, seasonal outlooks |
| ICRISAT Dataverse | dataverse.harvard.edu/dataverse/ICRISAT | Dryland crop variety data for Northern Nigeria |
| Digital Earth Africa | geosupport@digitalearthafrica.org | Sentinel-2 NDVI API access, sandbox account |
| Esoko | partners@esoko.com | Market price API partnership and key issuance |
| Nigeria Farm Data | admin@farmdata.com.ng | Community API key for local market prices |
| ISRIC (SoilGrids) | data@isric.org | WCS raster access for Nigeria soil tile download |

### Appendix B — FAOSTAT Crop Item Codes (Nigeria area code: 159)

| Crop | FAOSTAT Item Code | NAERLS Name |
|---|---|---|
| Maize (Corn) | 56 | Maize |
| Rice (paddy) | 27 | Rice (paddy) |
| Cassava | 125 | Cassava |
| Yam | 116 | Yam |
| Sorghum | 83 | Sorghum |
| Cowpea (dry) | 176 | Cowpea |
| Groundnut (in shell) | 242 | Groundnut |
| Tomato | 388 | Tomato |
| Plantain | 489 | Plantain |
| Cocoa beans | 661 | Cocoa |
| Oil palm fruit | 254 | Oil palm |
| Pearl Millet | 79 | Millet |

### Appendix C — Nigerian States by Geopolitical Zone (for NAERLS queries)

| Zone | States |
|---|---|
| North West | Kano, Kaduna, Katsina, Sokoto, Kebbi, Zamfara, Jigawa |
| North East | Borno, Adamawa, Bauchi, Gombe, Taraba, Yobe |
| North Central | Niger, Benue, Kwara, Nasarawa, Plateau, Kogi, FCT |
| South West | Lagos, Ogun, Oyo, Osun, Ondo, Ekiti |
| South East | Enugu, Anambra, Imo, Abia, Ebonyi |
| South South | Rivers, Bayelsa, Delta, Edo, Akwa Ibom, Cross River |

### Appendix D — Supabase PostGIS: Loading SoilGrids Rasters

```bash
# Step 1: Download Nigeria bounding box from SoilGrids WCS
# Nigeria: lat 4.27–13.89, lng 2.67–14.68

curl "https://maps.isric.org/mapserv?map=/map/phh2o.map\
&SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage\
&COVERAGEID=phh2o_0-5cm_mean&FORMAT=image/tiff\
&SUBSET=X(2670000,14680000)&SUBSET=Y(4270000,13890000)\
&SUBSETTINGCRS=http://www.opengis.net/def/crs/EPSG/0/152160\
&OUTPUTCRS=http://www.opengis.net/def/crs/EPSG/0/152160" \
-o nigeria_ph_0_5cm.tif

# Step 2: Convert to SQL and load into Supabase
raster2pgsql -s 4326 -I -C -M nigeria_ph_0_5cm.tif soil_properties \
  | psql "$SUPABASE_DB_URL"

# Step 3: Tag the row with metadata
UPDATE soil_properties
SET property_name = 'phh2o', depth_cm = 0, unit = 'pH×10', source = 'soilgrids'
WHERE property_name IS NULL;

# Repeat for: nitrogen (nitrogen), organic carbon (oc), clay (clay), sand (sand)
# Also load AfSIS/NiSIS GeoPackage for phosphorus, potassium, iron
ogr2ogr -f PostgreSQL PG:"$SUPABASE_DB_URL" afsis_nigeria.gpkg \
  -nln afsis_nigeria -overwrite
```

### Appendix E — IBM Bob Prompt Templates

**Initial architecture prompt:**
```
I'm building a farming assistant PWA for smallholder farmers in Nigeria.
Stack: React 18 + TypeScript + Vite + Tailwind CSS + Workbox on Vercel.
Database: Supabase (PostgreSQL + PostGIS). Cache: Upstash Redis.
Python microservices (disease detection, NDVI) on Railway.

Design the complete folder structure, Supabase schema migrations,
Vercel function layout, and Railway service layout. Include:
- /src (React PWA)
- /api (Vercel serverless functions)
- /supabase/migrations (SQL migration files)
- /services/disease-detector (Railway Python FastAPI)
- /services/satellite (Railway Python FastAPI)
```

**Supabase RLS policy prompt:**
```
Write Row Level Security policies for the Supabase 'crops' table.
Farmers must only be able to SELECT, INSERT, UPDATE, DELETE their own rows.
The farmer's user_id is in auth.uid(). The crops table has farmer_id
which references farmers.id, and farmers.user_id references auth.users.id.
Write the complete SQL including enabling RLS and all four policies.
```

**Vercel Cron job prompt:**
```
Write a Vercel Serverless Function at /api/jobs/sync-market-prices.ts.
It should run as a Vercel Cron at 06:00 daily. It must:
1. Fetch producer prices from FAOSTAT for Nigeria (area=159) for crops:
   Maize(56), Rice(27), Cassava(125), Yam(116), Cowpea(176), Sorghum(83)
2. Fetch USD/NGN exchange rate from api.cbn.gov.ng
3. Convert all prices to NGN per kilogram
4. Upsert to Supabase market_prices table using supabaseAdmin client
5. If any price changed >20% from yesterday, insert a row into price_alerts table
   (which triggers Supabase Realtime to broadcast to connected PWA clients)
6. If FAOSTAT is unreachable, log the error and abort without touching the DB
Use SUPABASE_SERVICE_ROLE_KEY for the admin client — never the anon key in crons.
```

---

*FarmPulse TRD v1.1 · Confidential · May 2026*
*Next review: post-engineering kickoff · Owner: Product & Engineering Team*
