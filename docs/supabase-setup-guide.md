# FarmFlow Supabase Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the complete Supabase database infrastructure for FarmFlow, including schema creation, RLS policies, storage buckets, and initial data seeding.

---

## Prerequisites

- Supabase account (free tier is sufficient for development)
- Node.js 18+ installed
- PostgreSQL client (psql) for local testing
- Git for version control

---

## Step 1: Create Supabase Project

### 1.1 Create Project via Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: farmflow-dev (or farmflow-prod)
   - **Database Password**: Generate strong password (save securely)
   - **Region**: Choose closest to target users (e.g., Frankfurt for Africa)
   - **Pricing Plan**: Free (for development)

4. Wait for project provisioning (~2 minutes)

### 1.2 Note Your Credentials

After project creation, go to **Settings → API** and note:

```bash
# Project URL
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Anon/Public Key (safe for browser)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (NEVER expose to browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Go to **Settings → Database** and note:

```bash
# Database URL (for migrations)
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

### 1.3 Update Environment Files

Update `.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Feature Flags
VITE_USE_MOCK_DATA=false
VITE_ENABLE_VOICE=true
VITE_ENABLE_OFFLINE=true
```

---

## Step 2: Initialize Supabase CLI

### 2.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 2.2 Initialize Local Project

```bash
# Initialize Supabase in project
npx supabase init

# Link to remote project
npx supabase link --project-ref xxxxxxxxxxxxx
```

This creates a `supabase/` directory with:
```
supabase/
├── config.toml          # Supabase configuration
├── seed.sql             # Seed data
└── migrations/          # Database migrations
```

---

## Step 3: Enable Required Extensions

### 3.1 Via SQL Editor

Go to **SQL Editor** in Supabase Dashboard and run:

```sql
-- Enable PostGIS for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pgcrypto for UUID generation and encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Verify extensions
SELECT * FROM pg_extension WHERE extname IN ('postgis', 'pgcrypto', 'pg_trgm');
```

### 3.2 Via Migration File

Alternatively, create `supabase/migrations/00000000000000_enable_extensions.sql`:

```sql
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## Step 4: Create Database Schema

### 4.1 Migration File Structure

Create migrations in order:

```
supabase/migrations/
├── 00000000000000_enable_extensions.sql
├── 00000000000001_create_farmers_table.sql
├── 00000000000002_create_crops_table.sql
├── 00000000000003_create_disease_tables.sql
├── 00000000000004_create_market_tables.sql
├── 00000000000005_create_farm_management_tables.sql
├── 00000000000006_create_livestock_tables.sql
├── 00000000000007_create_communication_tables.sql
├── 00000000000008_create_reference_tables.sql
├── 00000000000009_create_indexes.sql
├── 00000000000010_create_functions.sql
├── 00000000000011_create_triggers.sql
└── 00000000000012_create_rls_policies.sql
```

### 4.2 Core Tables Migration

**File**: `supabase/migrations/00000000000001_create_farmers_table.sql`

```sql
-- FARMERS TABLE
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT UNIQUE NOT NULL,
  state TEXT NOT NULL,
  lga TEXT,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  language TEXT DEFAULT 'english'
    CHECK (language IN ('hausa','yoruba','igbo','english')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_farmers_user_id ON farmers(user_id);
CREATE INDEX idx_farmers_phone ON farmers(phone_number);
CREATE INDEX idx_farmers_state ON farmers(state);

-- Enable RLS
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Farmers can only access their own profile
CREATE POLICY "Farmers access own profile only"
  ON farmers FOR ALL
  USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE farmers IS 'Primary user profile table for farmers';
COMMENT ON COLUMN farmers.phone_number IS 'Primary identifier for phone-based authentication';
COMMENT ON COLUMN farmers.language IS 'Preferred language for UI and voice responses';
```

**File**: `supabase/migrations/00000000000002_create_crops_table.sql`

```sql
-- CROPS TABLE
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  variety TEXT,
  planted_date DATE NOT NULL,
  field_lat DECIMAL(9,6),
  field_lng DECIMAL(9,6),
  field_size_ha DECIMAL(6,2),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','harvested','failed')),
  last_scan_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_crops_farmer_id ON crops(farmer_id);
CREATE INDEX idx_crops_crop_name ON crops(crop_name);
CREATE INDEX idx_crops_status ON crops(status) WHERE status = 'active';
CREATE INDEX idx_crops_planted_date ON crops(planted_date DESC);

-- Enable RLS
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Farmers can only access their own crops
CREATE POLICY "Farmers access own crops only"
  ON crops FOR ALL
  USING (farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  ));

-- Comments
COMMENT ON TABLE crops IS 'Tracks crops planted by farmers';
COMMENT ON COLUMN crops.status IS 'Current status: active, harvested, or failed';
```

### 4.3 Apply Migrations

```bash
# Push migrations to remote database
npx supabase db push

# Or apply specific migration
npx supabase migration up
```

---

## Step 5: Configure Storage Buckets

### 5.1 Create Buckets via Dashboard

Go to **Storage** in Supabase Dashboard:

1. **Create bucket: crop-photos**
   - Name: `crop-photos`
   - Public: No (private)
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

2. **Create bucket: voice-notes**
   - Name: `voice-notes`
   - Public: No (private)
   - File size limit: 10MB
   - Allowed MIME types: `audio/webm, audio/mp4, audio/mpeg`

3. **Create bucket: listing-photos**
   - Name: `listing-photos`
   - Public: Yes (public read)
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

4. **Create bucket: ndvi-maps**
   - Name: `ndvi-maps`
   - Public: No (private)
   - File size limit: 20MB
   - Allowed MIME types: `image/png, image/tiff`

### 5.2 Configure Storage RLS Policies

**File**: `supabase/migrations/00000000000013_storage_policies.sql`

```sql
-- CROP PHOTOS BUCKET POLICIES

-- Policy: Farmers can upload to their own folder
CREATE POLICY "Farmers upload to own folder in crop-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'crop-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Farmers can read their own photos
CREATE POLICY "Farmers read own photos in crop-photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'crop-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Farmers can delete their own photos
CREATE POLICY "Farmers delete own photos in crop-photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'crop-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- VOICE NOTES BUCKET POLICIES

CREATE POLICY "Farmers upload to own folder in voice-notes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-notes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Farmers read own voice notes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'voice-notes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- LISTING PHOTOS BUCKET POLICIES

CREATE POLICY "Anyone can read listing photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-photos');

CREATE POLICY "Authenticated users upload listing photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-photos'
    AND auth.role() = 'authenticated'
  );

-- NDVI MAPS BUCKET POLICIES

CREATE POLICY "Farmers read own NDVI maps"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ndvi-maps'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Step 6: Create Database Functions

**File**: `supabase/migrations/00000000000010_create_functions.sql`

```sql
-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Get soil properties at GPS point
CREATE OR REPLACE FUNCTION get_soil_at_point(p_lat FLOAT, p_lng FLOAT)
RETURNS TABLE (
  property_name TEXT,
  value FLOAT,
  unit TEXT,
  depth_cm SMALLINT
) AS $$
BEGIN
  RETURN QUERY
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
END;
$$ LANGUAGE plpgsql;

-- Function: Increment listing views
CREATE OR REPLACE FUNCTION increment_listing_views(listing_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function: Expire old listings
CREATE OR REPLACE FUNCTION expire_old_listings()
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Update buyer rating
CREATE OR REPLACE FUNCTION update_buyer_rating(buyer_uuid UUID)
RETURNS void AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  SELECT AVG(rating) INTO avg_rating
  FROM (
    SELECT 5.0 as rating FROM offers
    WHERE buyer_id = buyer_uuid AND status = 'completed'
    LIMIT 100
  ) ratings;
  
  UPDATE buyers
  SET rating = COALESCE(avg_rating, 0)
  WHERE id = buyer_uuid;
END;
$$ LANGUAGE plpgsql;
```

---

## Step 7: Create Triggers

**File**: `supabase/migrations/00000000000011_create_triggers.sql`

```sql
-- Trigger: Update updated_at on farmers table
CREATE TRIGGER update_farmers_updated_at
  BEFORE UPDATE ON farmers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on crops table
CREATE TRIGGER update_crops_updated_at
  BEFORE UPDATE ON crops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on listings table
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on livestock table
CREATE TRIGGER update_livestock_updated_at
  BEFORE UPDATE ON livestock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Step 8: Seed Reference Data

**File**: `supabase/seed.sql`

```sql
-- Seed diseases catalog
INSERT INTO diseases_catalog (disease_name, name_hausa, name_yoruba, name_igbo, affected_crops, symptoms, treatment_steps, prevention, severity_default) VALUES
('Maize Streak Virus', 'Cutar Masara', 'Arun Agbado', 'Oria Oka', ARRAY['maize'], 'Yellow streaks on leaves, stunted growth', '{"steps": ["Remove infected plants", "Control leafhopper vectors", "Plant resistant varieties"]}', 'Use certified seeds, control vectors', 'high'),
('Cassava Mosaic Disease', 'Cutar Rogo', 'Arun Gbegiri', 'Oria Akpu', ARRAY['cassava'], 'Mosaic pattern on leaves, leaf distortion', '{"steps": ["Remove infected plants", "Use clean planting material", "Control whitefly vectors"]}', 'Use disease-free cuttings', 'high'),
('Rice Blast', 'Cutar Shinkafa', 'Arun Iresi', 'Oria Osikapa', ARRAY['rice'], 'Diamond-shaped lesions on leaves', '{"steps": ["Apply fungicide", "Improve drainage", "Use resistant varieties"]}', 'Proper spacing, balanced fertilization', 'medium');

-- Seed Nigerian states
INSERT INTO naerls_surveys (year, season, state, crop, yield_kg_ha, plant_start, plant_end, farmgate_price) VALUES
(2025, 'wet', 'Kaduna', 'maize', 2500, 'April week 2', 'May week 2', 180),
(2025, 'wet', 'Oyo', 'cassava', 15000, 'March week 1', 'April week 4', 120),
(2025, 'wet', 'Kano', 'rice', 3200, 'June week 1', 'July week 2', 250);

-- Seed initial market prices
INSERT INTO market_prices (crop, state, price_naira_kg, source, recorded_at) VALUES
('maize', 'Kaduna', 180, 'nigeria_farm_data', NOW()),
('rice', 'Kano', 250, 'nigeria_farm_data', NOW()),
('cassava', 'Oyo', 120, 'nigeria_farm_data', NOW()),
('tomato', 'Lagos', 350, 'esoko', NOW());
```

Apply seed data:

```bash
npx supabase db seed
```

---

## Step 9: Configure Authentication

### 9.1 Enable Phone Authentication

Go to **Authentication → Providers** in Supabase Dashboard:

1. Enable **Phone** provider
2. Configure SMS provider (Twilio recommended for Africa):
   - Twilio Account SID
   - Twilio Auth Token
   - Twilio Phone Number

### 9.2 Configure Auth Settings

Go to **Authentication → Settings**:

- **Site URL**: `http://localhost:5173` (development) or your production URL
- **Redirect URLs**: Add your app URLs
- **JWT Expiry**: 3600 (1 hour)
- **Refresh Token Rotation**: Enabled
- **Reuse Interval**: 10 seconds

### 9.3 Test Authentication

```typescript
// Test phone auth
import { supabase } from './lib/supabase';

// Send OTP
const { data, error } = await supabase.auth.signInWithOtp({
  phone: '+2348012345678'
});

// Verify OTP
const { data, error } = await supabase.auth.verifyOtp({
  phone: '+2348012345678',
  token: '123456',
  type: 'sms'
});
```

---

## Step 10: Configure Realtime

### 10.1 Enable Realtime for Tables

Go to **Database → Replication** in Supabase Dashboard:

Enable realtime for:
- `price_alerts`
- `notifications`
- `messages`
- `offers`

### 10.2 Test Realtime Subscription

```typescript
// Subscribe to price alerts
const channel = supabase
  .channel('price-alerts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'price_alerts',
      filter: 'crop=eq.maize'
    },
    (payload) => {
      console.log('New price alert:', payload);
    }
  )
  .subscribe();
```

---

## Step 11: Verify Setup

### 11.1 Run Verification Queries

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Check extensions
SELECT * FROM pg_extension;
```

### 11.2 Test CRUD Operations

```typescript
// Test farmer creation
const { data: farmer, error } = await supabase
  .from('farmers')
  .insert({
    full_name: 'Test Farmer',
    phone_number: '+2348012345678',
    state: 'Kaduna',
    language: 'hausa'
  })
  .select()
  .single();

// Test crop creation
const { data: crop, error } = await supabase
  .from('crops')
  .insert({
    farmer_id: farmer.id,
    crop_name: 'maize',
    planted_date: '2026-04-15',
    status: 'active'
  })
  .select()
  .single();

// Test file upload
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const { data, error } = await supabase.storage
  .from('crop-photos')
  .upload(`${farmer.user_id}/test.jpg`, file);
```

---

## Step 12: Performance Optimization

### 12.1 Enable Connection Pooling

For production, use connection pooling:

```bash
# Use pooler connection string for serverless functions
postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:6543/postgres
```

### 12.2 Configure Statement Timeout

```sql
-- Set statement timeout to prevent long-running queries
ALTER DATABASE postgres SET statement_timeout = '30s';
```

### 12.3 Analyze Tables

```sql
-- Analyze all tables for query planner
ANALYZE;

-- Vacuum to reclaim storage
VACUUM ANALYZE;
```

---

## Step 13: Backup & Recovery

### 13.1 Enable Point-in-Time Recovery

Go to **Settings → Database** and enable:
- **Point-in-time Recovery (PITR)**: Enabled
- **Backup Schedule**: Daily at 2 AM UTC

### 13.2 Manual Backup

```bash
# Backup database
pg_dump "$SUPABASE_DB_URL" > backup_$(date +%Y%m%d).sql

# Restore database
psql "$SUPABASE_DB_URL" < backup_20260516.sql
```

---

## Step 14: Monitoring Setup

### 14.1 Enable Logging

Go to **Logs** in Supabase Dashboard and monitor:
- Database logs
- API logs
- Auth logs
- Storage logs

### 14.2 Set Up Alerts

Configure alerts for:
- High CPU usage (>80%)
- High memory usage (>80%)
- Slow queries (>5s)
- Failed auth attempts (>10/min)

---

## Troubleshooting

### Common Issues

**Issue**: Migration fails with "relation already exists"
```sql
-- Solution: Use IF NOT EXISTS
CREATE TABLE IF NOT EXISTS farmers (...);
```

**Issue**: RLS blocks all queries
```sql
-- Solution: Check policies and ensure user is authenticated
SELECT * FROM farmers WHERE auth.uid() = user_id;
```

**Issue**: Storage upload fails
```bash
# Solution: Check bucket policies and MIME types
# Verify bucket exists and user has permission
```

**Issue**: Realtime not working
```bash
# Solution: Enable replication for table
# Check subscription filter matches data
```

---

## Next Steps

1. ✅ Complete database setup
2. ✅ Test all CRUD operations
3. ✅ Verify RLS policies
4. ✅ Test storage uploads
5. ✅ Test realtime subscriptions
6. 🔄 Load production seed data
7. 🔄 Set up monitoring
8. 🔄 Configure backups
9. 🔄 Performance testing
10. 🔄 Security audit

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

**Document Version**: 1.0
**Last Updated**: 2026-05-16
**Status**: Ready for Implementation