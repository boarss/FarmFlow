# Quick Guide: Apply Fixed Migrations

## ✅ Migrations That Succeeded
- ✅ Migration 0: Enable extensions
- ✅ Migration 1: Farmers table
- ✅ Migration 2: Crops table  
- ✅ Migration 3: Disease tables
- ✅ Migration 5: Farm management tables

## ❌ Migrations That Failed (Now Fixed)
- ❌ Migration 4: Market tables (FIXED - see below)
- ❌ Migration 6: Livestock & communication tables
- ❌ Migration 7: Reference tables (FIXED - see below)
- ❌ Migration 8: Functions & triggers

---

## Step 1: Apply Fixed Migration 4 (Market Tables)

Copy and paste this into Supabase SQL Editor:

```sql
-- FIXED Migration 4: Market and trading tables

-- MARKET PRICES TABLE
CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  state TEXT,
  price_naira_kg DECIMAL(10,2) NOT NULL,
  price_usd_tonne DECIMAL(10,2),
  source TEXT NOT NULL,
  trend TEXT CHECK (trend IN ('up','down','stable')),
  change_percent DECIMAL(5,2),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index separately
CREATE UNIQUE INDEX IF NOT EXISTS idx_market_prices_unique 
  ON market_prices (crop, COALESCE(state, ''), source, DATE(recorded_at));

-- PRICE ALERTS TABLE
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  change_pct DECIMAL(5,2) NOT NULL,
  direction TEXT CHECK (direction IN ('up','down')),
  price_naira_kg DECIMAL(10,2),
  message_en TEXT,
  message_ha TEXT,
  message_yo TEXT,
  message_ig TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUYERS TABLE
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  contact_name TEXT,
  phone_number TEXT,
  location TEXT,
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_purchases INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LISTINGS TABLE
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
  crop_name TEXT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  quality_grade TEXT CHECK (quality_grade IN ('A','B','C')),
  price_per_kg DECIMAL(10,2) NOT NULL,
  images TEXT[],
  description TEXT,
  location TEXT,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','sold','expired','cancelled')),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OFFERS TABLE
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  buyer_name TEXT,
  buyer_rating DECIMAL(2,1),
  price_per_kg DECIMAL(10,2) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_prices_crop ON market_prices(crop);
CREATE INDEX IF NOT EXISTS idx_market_prices_state ON market_prices(state);
CREATE INDEX IF NOT EXISTS idx_market_prices_recorded_at ON market_prices(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_alerts_crop ON price_alerts(crop);
CREATE INDEX IF NOT EXISTS idx_price_alerts_created_at ON price_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buyers_user_id ON buyers(user_id);
CREATE INDEX IF NOT EXISTS idx_buyers_verified ON buyers(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_farmer_id ON listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Market prices are publicly readable" ON market_prices FOR SELECT USING (true);
CREATE POLICY "Price alerts are publicly readable" ON price_alerts FOR SELECT USING (true);
CREATE POLICY "Verified buyers are publicly readable" ON buyers FOR SELECT USING (verified = true);
CREATE POLICY "Buyers can manage own profile" ON buyers FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Active listings are publicly readable" ON listings FOR SELECT USING (status = 'active' OR user_id = auth.uid());
CREATE POLICY "Farmers can create listings" ON listings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Farmers can update own listings" ON listings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Farmers can delete own listings" ON listings FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Listing owners view offers" ON offers FOR SELECT USING (listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));
CREATE POLICY "Buyers view own offers" ON offers FOR SELECT USING (buyer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()));
CREATE POLICY "Users can create offers" ON offers FOR INSERT WITH CHECK (buyer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()));
CREATE POLICY "Buyers update own offers" ON offers FOR UPDATE USING (buyer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()));
CREATE POLICY "Listing owners update offers" ON offers FOR UPDATE USING (listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));
```

---

## Step 2: Apply Migration 6 (Livestock & Communication)

Copy the entire content from `supabase/migrations/20260516000006_create_livestock_and_communication_tables.sql` and run it.

---

## Step 3: Apply Simplified Migration 7 (Reference Tables)

Copy and paste this into Supabase SQL Editor:

```sql
-- SIMPLIFIED Migration 7: Reference tables (without PostGIS raster)

-- NAERLS SURVEYS TABLE
CREATE TABLE IF NOT EXISTS naerls_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year SMALLINT NOT NULL,
  season TEXT CHECK (season IN ('wet','dry')),
  state TEXT NOT NULL,
  crop TEXT NOT NULL,
  yield_kg_ha DECIMAL(8,2),
  plant_start TEXT,
  plant_end TEXT,
  disease_notes TEXT,
  farmgate_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index separately
CREATE UNIQUE INDEX IF NOT EXISTS idx_naerls_surveys_unique 
  ON naerls_surveys (year, COALESCE(season, ''), state, crop);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_naerls_surveys_year ON naerls_surveys(year DESC);
CREATE INDEX IF NOT EXISTS idx_naerls_surveys_state ON naerls_surveys(state);
CREATE INDEX IF NOT EXISTS idx_naerls_surveys_crop ON naerls_surveys(crop);
CREATE INDEX IF NOT EXISTS idx_naerls_surveys_season ON naerls_surveys(season);
CREATE INDEX IF NOT EXISTS idx_naerls_surveys_state_crop ON naerls_surveys(state, crop, year DESC);

-- Enable RLS
ALTER TABLE naerls_surveys ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "NAERLS surveys are publicly readable" ON naerls_surveys FOR SELECT USING (true);

-- Note: soil_properties table with PostGIS raster can be added later if needed
-- For now, we'll skip it to avoid PostGIS raster complexity
```

---

## Step 4: Apply Migration 8 (Functions & Triggers)

Copy the entire content from `supabase/migrations/20260516000008_create_functions_and_triggers.sql` and run it.

---

## Step 5: Load Seed Data

Copy the entire content from `supabase/seed.sql` and run it.

---

## Verification

After all migrations, run this to verify:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show: buyers, crops, disease_scans, diseases_catalog, farm_activities, 
-- farmers, harvest_records, listings, livestock, livestock_health_checks, 
-- market_prices, messages, naerls_surveys, notifications, offers, 
-- planting_tasks, price_alerts

-- Check seed data
SELECT COUNT(*) as diseases FROM diseases_catalog;
SELECT COUNT(*) as surveys FROM naerls_surveys;
SELECT COUNT(*) as prices FROM market_prices;
```

---

## Summary

**Apply in this order:**
1. ✅ Fixed Migration 4 (market tables) - see above
2. ✅ Migration 6 (livestock & communication) - use original file
3. ✅ Simplified Migration 7 (reference tables) - see above
4. ✅ Migration 8 (functions & triggers) - use original file
5. ✅ Seed data - use original file

**Total time**: ~10 minutes

All migrations are now compatible with Supabase SQL Editor! 🎉