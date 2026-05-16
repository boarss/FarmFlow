# FarmFlow Database Schema & Supabase Configuration Plan

## Overview

This document outlines the complete database schema design and Supabase configuration for FarmFlow, a voice-first agricultural web app for smallholder farmers in Africa.

## Architecture Decisions

### Technology Stack
- **Database**: Supabase (PostgreSQL 15+ with PostGIS)
- **Authentication**: Supabase Auth (phone-based OTP)
- **Storage**: Supabase Storage (crop photos, NDVI maps, documents)
- **Real-time**: Supabase Realtime (price alerts, notifications)
- **Security**: Row Level Security (RLS) on all tables

### Key Design Principles
1. **Privacy-First**: RLS policies ensure farmers only access their own data
2. **Offline-First**: Schema supports local-first sync patterns
3. **Localization**: Multi-language support (English, Hausa, Yoruba, Igbo)
4. **Geospatial**: PostGIS for location-based queries and soil data
5. **Scalability**: Indexed for performance with 50K+ users

---

## Database Extensions

Required PostgreSQL extensions to enable in Supabase:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;       -- Spatial queries (GPS, soil data)
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- Encrypting PII fields
CREATE EXTENSION IF NOT EXISTS pg_trgm;       -- Fuzzy search for crop names
```

---

## Schema Design

### 1. Core User & Farm Tables

#### 1.1 farmers
Primary user profile table linked to Supabase Auth.

**Columns:**
- `id` (UUID, PK): Unique farmer identifier
- `user_id` (UUID, FK → auth.users): Link to Supabase Auth
- `full_name` (TEXT): Farmer's full name
- `phone_number` (TEXT, UNIQUE): Primary identifier for login
- `state` (TEXT): Nigerian state (drives NAERLS data queries)
- `lga` (TEXT): Local Government Area
- `lat` (DECIMAL): Farm GPS latitude
- `lng` (DECIMAL): Farm GPS longitude
- `language` (TEXT): Preferred language (hausa|yoruba|igbo|english)
- `created_at` (TIMESTAMPTZ): Account creation timestamp

**Indexes:**
- Primary key on `id`
- Unique index on `phone_number`
- Index on `user_id` for auth lookups
- Spatial index on `(lat, lng)` for location queries

**RLS Policy:**
- Farmers can only view/edit their own profile

#### 1.2 crops
Tracks crops planted by farmers.

**Columns:**
- `id` (UUID, PK): Unique crop record identifier
- `farmer_id` (UUID, FK → farmers): Owner of this crop
- `crop_name` (TEXT): Crop type (maize, rice, cassava, etc.)
- `variety` (TEXT): Specific variety/cultivar
- `planted_date` (DATE): When crop was planted
- `field_lat` (DECIMAL): Field GPS latitude
- `field_lng` (DECIMAL): Field GPS longitude
- `field_size_ha` (DECIMAL): Field size in hectares
- `status` (TEXT): active|harvested|failed
- `last_scan_at` (TIMESTAMPTZ): Last disease scan timestamp
- `created_at` (TIMESTAMPTZ): Record creation timestamp

**Indexes:**
- Primary key on `id`
- Index on `farmer_id` for farmer's crop list
- Index on `crop_name` for crop-specific queries
- Index on `status` for active crop filtering

**RLS Policy:**
- Farmers can only access their own crops

---

### 2. Disease Detection Tables

#### 2.1 disease_scans
Records of crop disease detection scans.

**Columns:**
- `id` (UUID, PK): Unique scan identifier
- `user_id` (UUID, FK → auth.users): User who performed scan
- `farmer_id` (UUID, FK → farmers): Farmer profile
- `crop_id` (UUID, FK → crops): Associated crop (optional)
- `image_url` (TEXT): Supabase Storage URL for crop photo
- `voice_note_url` (TEXT): Supabase Storage URL for voice description
- `disease_id` (UUID, FK → diseases_catalog): Identified disease
- `disease_name` (TEXT): Disease name (denormalized for performance)
- `confidence` (DECIMAL): AI confidence score (0-1)
- `severity` (TEXT): low|medium|high
- `treatment_text` (TEXT): Treatment recommendations
- `verified_by` (UUID, FK → farmers): Extension officer who verified
- `verified_at` (TIMESTAMPTZ): Verification timestamp
- `created_at` (TIMESTAMPTZ): Scan timestamp

**Indexes:**
- Primary key on `id`
- Index on `user_id` for user's scan history
- Index on `farmer_id` for farmer's scans
- Index on `crop_id` for crop-specific scans
- Index on `created_at DESC` for recent scans

**RLS Policy:**
- Users can only view their own scans

#### 2.2 diseases_catalog
Reference table of known crop diseases.

**Columns:**
- `id` (UUID, PK): Unique disease identifier
- `disease_name` (TEXT): English disease name
- `name_hausa` (TEXT): Hausa translation
- `name_yoruba` (TEXT): Yoruba translation
- `name_igbo` (TEXT): Igbo translation
- `affected_crops` (TEXT[]): Array of crop names
- `symptoms` (TEXT): Disease symptoms description
- `treatment_steps` (JSONB): Structured treatment steps
- `prevention` (TEXT): Prevention measures
- `severity_default` (TEXT): Default severity level
- `image_urls` (TEXT[]): Reference images
- `created_at` (TIMESTAMPTZ): Record creation

**Indexes:**
- Primary key on `id`
- GIN index on `affected_crops` for array searches
- Full-text search index on `disease_name`

**RLS Policy:**
- Public read access (reference data)

---

### 3. Market & Trading Tables

#### 3.1 market_prices
Historical and current market prices for crops.

**Columns:**
- `id` (UUID, PK): Unique price record identifier
- `crop` (TEXT): Crop name
- `state` (TEXT): State (NULL = national average)
- `price_naira_kg` (DECIMAL): Price in Naira per kg
- `price_usd_tonne` (DECIMAL): Price in USD per tonne
- `source` (TEXT): Data source (faostat|esoko|nigeria_farm_data)
- `trend` (TEXT): up|down|stable
- `change_percent` (DECIMAL): Percentage change from previous
- `recorded_at` (TIMESTAMPTZ): Price timestamp
- `created_at` (TIMESTAMPTZ): Record creation

**Constraints:**
- UNIQUE (crop, state, source, recorded_at::DATE)

**Indexes:**
- Primary key on `id`
- Composite index on `(crop, state, recorded_at DESC)`
- Index on `recorded_at DESC` for recent prices

**RLS Policy:**
- Public read access (market data is not sensitive)

#### 3.2 price_alerts
Price change alerts for Supabase Realtime.

**Columns:**
- `id` (UUID, PK): Unique alert identifier
- `crop` (TEXT): Crop name
- `change_pct` (DECIMAL): Percentage change
- `direction` (TEXT): up|down
- `price_naira_kg` (DECIMAL): Current price
- `message_en` (TEXT): Alert message in English
- `message_ha` (TEXT): Alert message in Hausa
- `message_yo` (TEXT): Alert message in Yoruba
- `message_ig` (TEXT): Alert message in Igbo
- `created_at` (TIMESTAMPTZ): Alert timestamp

**Indexes:**
- Primary key on `id`
- Index on `crop` for crop-specific alerts
- Index on `created_at DESC` for recent alerts

**RLS Policy:**
- Public read access (alerts are broadcast)

#### 3.3 listings
Farmer produce listings for sale.

**Columns:**
- `id` (UUID, PK): Unique listing identifier
- `user_id` (UUID, FK → auth.users): Listing creator
- `farmer_id` (UUID, FK → farmers): Farmer profile
- `crop_id` (UUID, FK → crops): Associated crop
- `crop_name` (TEXT): Crop name (denormalized)
- `quantity_kg` (DECIMAL): Quantity available in kg
- `quality_grade` (TEXT): A|B|C quality grade
- `price_per_kg` (DECIMAL): Asking price per kg
- `images` (TEXT[]): Array of image URLs
- `description` (TEXT): Listing description
- `location` (TEXT): Pickup location
- `status` (TEXT): active|sold|expired|cancelled
- `views_count` (INTEGER): Number of views
- `created_at` (TIMESTAMPTZ): Listing creation
- `expires_at` (TIMESTAMPTZ): Listing expiration
- `updated_at` (TIMESTAMPTZ): Last update

**Indexes:**
- Primary key on `id`
- Index on `farmer_id` for farmer's listings
- Index on `crop_name` for crop-specific listings
- Index on `status` for active listings
- Index on `created_at DESC` for recent listings

**RLS Policy:**
- Public read for active listings
- Farmers can only edit their own listings

#### 3.4 offers
Buyer offers on listings.

**Columns:**
- `id` (UUID, PK): Unique offer identifier
- `listing_id` (UUID, FK → listings): Target listing
- `buyer_id` (UUID, FK → farmers): Buyer making offer
- `buyer_name` (TEXT): Buyer name (denormalized)
- `buyer_rating` (DECIMAL): Buyer rating (denormalized)
- `price_per_kg` (DECIMAL): Offered price per kg
- `quantity_kg` (DECIMAL): Quantity requested
- `message` (TEXT): Offer message
- `status` (TEXT): pending|accepted|rejected|completed|cancelled
- `created_at` (TIMESTAMPTZ): Offer timestamp
- `responded_at` (TIMESTAMPTZ): Response timestamp

**Indexes:**
- Primary key on `id`
- Index on `listing_id` for listing's offers
- Index on `buyer_id` for buyer's offers
- Index on `status` for pending offers

**RLS Policy:**
- Listing owner can view all offers on their listings
- Buyers can view their own offers

#### 3.5 buyers
Verified buyer profiles.

**Columns:**
- `id` (UUID, PK): Unique buyer identifier
- `user_id` (UUID, FK → auth.users): Link to auth
- `business_name` (TEXT): Business/company name
- `contact_name` (TEXT): Contact person name
- `phone_number` (TEXT): Contact phone
- `location` (TEXT): Business location
- `rating` (DECIMAL): Average rating (0-5)
- `total_purchases` (INTEGER): Number of completed purchases
- `verified` (BOOLEAN): Verification status
- `verified_at` (TIMESTAMPTZ): Verification date
- `created_at` (TIMESTAMPTZ): Account creation

**Indexes:**
- Primary key on `id`
- Index on `user_id` for auth lookups
- Index on `verified` for verified buyers
- Index on `rating DESC` for top-rated buyers

**RLS Policy:**
- Public read for verified buyers
- Buyers can only edit their own profile

---

### 4. Farm Management Tables

#### 4.1 farm_activities
Daily farm activity logs.

**Columns:**
- `id` (UUID, PK): Unique activity identifier
- `farmer_id` (UUID, FK → farmers): Activity owner
- `crop_id` (UUID, FK → crops): Associated crop (optional)
- `activity_type` (TEXT): planting|harvesting|fertilizer|pesticide|irrigation|weeding
- `date` (DATE): Activity date
- `quantity` (DECIMAL): Quantity (kg, liters, etc.)
- `unit` (TEXT): Unit of measurement
- `cost` (DECIMAL): Cost in Naira
- `notes` (TEXT): Activity notes
- `voice_note_url` (TEXT): Voice recording URL
- `created_at` (TIMESTAMPTZ): Record creation

**Indexes:**
- Primary key on `id`
- Index on `farmer_id` for farmer's activities
- Index on `crop_id` for crop-specific activities
- Index on `date DESC` for recent activities
- Index on `activity_type` for activity filtering

**RLS Policy:**
- Farmers can only access their own activities

#### 4.2 harvest_records
Harvest tracking records.

**Columns:**
- `id` (UUID, PK): Unique harvest identifier
- `farmer_id` (UUID, FK → farmers): Farmer who harvested
- `crop_id` (UUID, FK → crops): Harvested crop
- `quantity_kg` (DECIMAL): Quantity harvested in kg
- `date` (DATE): Harvest date
- `quality` (TEXT): A|B|C quality grade
- `sold_to` (TEXT): Buyer name (if sold)
- `price_per_kg` (DECIMAL): Sale price per kg
- `total_revenue` (DECIMAL): Total revenue
- `notes` (TEXT): Harvest notes
- `created_at` (TIMESTAMPTZ): Record creation

**Indexes:**
- Primary key on `id`
- Index on `farmer_id` for farmer's harvests
- Index on `crop_id` for crop harvest history
- Index on `date DESC` for recent harvests

**RLS Policy:**
- Farmers can only access their own harvest records

#### 4.3 planting_tasks
Planting calendar tasks and reminders.

**Columns:**
- `id` (UUID, PK): Unique task identifier
- `farmer_id` (UUID, FK → farmers): Task owner
- `crop_id` (UUID, FK → crops): Associated crop (optional)
- `task_type` (TEXT): planting|fertilizing|weeding|harvesting|inspection
- `title` (TEXT): Task title
- `description` (TEXT): Task description
- `due_date` (DATE): Task due date
- `completed` (BOOLEAN): Completion status
- `completed_at` (TIMESTAMPTZ): Completion timestamp
- `reminder_sent` (BOOLEAN): Reminder notification sent
- `created_at` (TIMESTAMPTZ): Task creation

**Indexes:**
- Primary key on `id`
- Index on `farmer_id` for farmer's tasks
- Index on `due_date` for upcoming tasks
- Index on `completed` for pending tasks

**RLS Policy:**
- Farmers can only access their own tasks

---

### 5. Supporting Data Tables

#### 5.1 naerls_surveys
NAERLS agricultural survey data.

**Columns:**
- `id` (UUID, PK): Unique survey record identifier
- `year` (SMALLINT): Survey year
- `season` (TEXT): wet|dry
- `state` (TEXT): Nigerian state
- `crop` (TEXT): Crop name
- `yield_kg_ha` (DECIMAL): Yield in kg per hectare
- `plant_start` (TEXT): Planting start period (e.g., "April week 2")
- `plant_end` (TEXT): Planting end period
- `disease_notes` (TEXT): Common diseases reported
- `farmgate_price` (DECIMAL): Farmgate price in Naira per kg
- `created_at` (TIMESTAMPTZ): Record creation

**Constraints:**
- UNIQUE (year, season, state, crop)

**Indexes:**
- Primary key on `id`
- Composite index on `(state, crop, year DESC)`
- Index on `crop` for crop-specific data

**RLS Policy:**
- Public read access (reference data)

#### 5.2 soil_properties
PostGIS raster data for soil properties.

**Columns:**
- `id` (UUID, PK): Unique raster identifier
- `geom` (RASTER): PostGIS raster geometry
- `property_name` (TEXT): phh2o|nitrogen|oc|clay|sand
- `depth_cm` (SMALLINT): Depth in cm (0|5|15|30)
- `unit` (TEXT): Unit of measurement
- `source` (TEXT): soilgrids|afsis_nisis
- `created_at` (TIMESTAMPTZ): Record creation

**Indexes:**
- Primary key on `id`
- GIST spatial index on `ST_ConvexHull(geom)`
- Index on `property_name` for property filtering

**RLS Policy:**
- Public read access (reference data)

**Functions:**
```sql
-- Get soil properties at a GPS point
CREATE OR REPLACE FUNCTION get_soil_at_point(p_lat FLOAT, p_lng FLOAT)
RETURNS TABLE (property_name TEXT, value FLOAT, unit TEXT, depth_cm SMALLINT)
```

---

### 6. Livestock Tables

#### 6.1 livestock
Livestock inventory tracking.

**Columns:**
- `id` (UUID, PK): Unique livestock record identifier
- `farmer_id` (UUID, FK → farmers): Livestock owner
- `animal_type` (TEXT): goat|chicken|cow|sheep|pig
- `count` (INTEGER): Number of animals
- `health_status` (TEXT): healthy|sick|critical
- `last_check_date` (DATE): Last health check date
- `notes` (TEXT): General notes
- `created_at` (TIMESTAMPTZ): Record creation
- `updated_at` (TIMESTAMPTZ): Last update

**Indexes:**
- Primary key on `id`
- Index on `farmer_id` for farmer's livestock
- Index on `animal_type` for animal filtering
- Index on `health_status` for health monitoring

**RLS Policy:**
- Farmers can only access their own livestock

#### 6.2 livestock_health_checks
Livestock health check records.

**Columns:**
- `id` (UUID, PK): Unique check identifier
- `livestock_id` (UUID, FK → livestock): Associated livestock
- `farmer_id` (UUID, FK → farmers): Check performer
- `symptoms` (TEXT): Observed symptoms
- `voice_note_url` (TEXT): Voice description URL
- `diagnosis` (TEXT): Diagnosis or triage result
- `recommendation` (TEXT): Treatment recommendation
- `vet_required` (BOOLEAN): Whether vet visit needed
- `vet_contacted` (BOOLEAN): Whether vet was contacted
- `created_at` (TIMESTAMPTZ): Check timestamp

**Indexes:**
- Primary key on `id`
- Index on `livestock_id` for animal health history
- Index on `farmer_id` for farmer's checks
- Index on `created_at DESC` for recent checks

**RLS Policy:**
- Farmers can only access their own health checks

---

### 7. Communication Tables

#### 7.1 notifications
User notifications.

**Columns:**
- `id` (UUID, PK): Unique notification identifier
- `user_id` (UUID, FK → auth.users): Notification recipient
- `type` (TEXT): price_alert|weather_alert|disease_alert|task_reminder|offer_received
- `title` (TEXT): Notification title
- `message` (TEXT): Notification message
- `data` (JSONB): Additional structured data
- `read` (BOOLEAN): Read status
- `action_url` (TEXT): Deep link URL
- `created_at` (TIMESTAMPTZ): Notification timestamp

**Indexes:**
- Primary key on `id`
- Index on `user_id` for user's notifications
- Index on `read` for unread filtering
- Index on `created_at DESC` for recent notifications

**RLS Policy:**
- Users can only view their own notifications

#### 7.2 messages
Direct messages between farmers and buyers.

**Columns:**
- `id` (UUID, PK): Unique message identifier
- `listing_id` (UUID, FK → listings): Related listing (optional)
- `offer_id` (UUID, FK → offers): Related offer (optional)
- `sender_id` (UUID, FK → auth.users): Message sender
- `recipient_id` (UUID, FK → auth.users): Message recipient
- `message` (TEXT): Message content
- `voice_note_url` (TEXT): Voice message URL
- `read` (BOOLEAN): Read status
- `created_at` (TIMESTAMPTZ): Message timestamp

**Indexes:**
- Primary key on `id`
- Index on `listing_id` for listing conversations
- Index on `offer_id` for offer conversations
- Composite index on `(sender_id, recipient_id)` for conversations
- Index on `created_at DESC` for recent messages

**RLS Policy:**
- Users can only view messages they sent or received

---

## Supabase Storage Buckets

### Bucket Configuration

#### 1. crop-photos
**Purpose**: Store crop disease photos uploaded by farmers
**Access**: Private (signed URLs only)
**Max File Size**: 5MB
**Allowed MIME Types**: image/jpeg, image/png, image/webp

**RLS Policies:**
```sql
-- Farmers can upload to their own folder
CREATE POLICY "Farmers upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'crop-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Farmers can read their own photos
CREATE POLICY "Farmers read own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'crop-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### 2. voice-notes
**Purpose**: Store voice recordings from farmers
**Access**: Private (signed URLs only)
**Max File Size**: 10MB
**Allowed MIME Types**: audio/webm, audio/mp4, audio/mpeg

**RLS Policies:**
```sql
-- Similar to crop-photos with audio MIME types
```

#### 3. ndvi-maps
**Purpose**: Store pre-computed NDVI satellite imagery
**Access**: Private (signed URLs only)
**Max File Size**: 20MB
**Allowed MIME Types**: image/png, image/tiff

#### 4. listing-photos
**Purpose**: Store produce listing photos
**Access**: Public read, authenticated write
**Max File Size**: 5MB
**Allowed MIME Types**: image/jpeg, image/png, image/webp

---

## Database Functions & Triggers

### 1. Update Timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at column
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Calculate Listing Views
```sql
CREATE OR REPLACE FUNCTION increment_listing_views(listing_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql;
```

### 3. Update Buyer Rating
```sql
CREATE OR REPLACE FUNCTION update_buyer_rating(buyer_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE buyers
  SET rating = (
    SELECT AVG(rating)
    FROM buyer_ratings
    WHERE buyer_id = buyer_uuid
  )
  WHERE id = buyer_uuid;
END;
$$ LANGUAGE plpgsql;
```

### 4. Expire Old Listings
```sql
CREATE OR REPLACE FUNCTION expire_old_listings()
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## Performance Indexes

### Critical Indexes for Scale

```sql
-- Farmers table
CREATE INDEX idx_farmers_phone ON farmers(phone_number);
CREATE INDEX idx_farmers_state ON farmers(state);
CREATE INDEX idx_farmers_location ON farmers USING GIST(ST_MakePoint(lng, lat));

-- Crops table
CREATE INDEX idx_crops_farmer ON crops(farmer_id);
CREATE INDEX idx_crops_status ON crops(status) WHERE status = 'active';
CREATE INDEX idx_crops_name ON crops(crop_name);

-- Disease scans
CREATE INDEX idx_disease_scans_user ON disease_scans(user_id);
CREATE INDEX idx_disease_scans_created ON disease_scans(created_at DESC);
CREATE INDEX idx_disease_scans_crop ON disease_scans(crop_id);

-- Market prices
CREATE INDEX idx_market_prices_crop_state ON market_prices(crop, state, recorded_at DESC);
CREATE INDEX idx_market_prices_recorded ON market_prices(recorded_at DESC);

-- Listings
CREATE INDEX idx_listings_farmer ON listings(farmer_id);
CREATE INDEX idx_listings_status ON listings(status) WHERE status = 'active';
CREATE INDEX idx_listings_crop ON listings(crop_name);
CREATE INDEX idx_listings_created ON listings(created_at DESC);

-- Offers
CREATE INDEX idx_offers_listing ON offers(listing_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_id);
CREATE INDEX idx_offers_status ON offers(status) WHERE status = 'pending';

-- Farm activities
CREATE INDEX idx_activities_farmer ON farm_activities(farmer_id);
CREATE INDEX idx_activities_date ON farm_activities(date DESC);
CREATE INDEX idx_activities_type ON farm_activities(activity_type);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

## Migration Strategy

### Phase 1: Core Tables (Week 1)
1. Enable extensions
2. Create farmers, crops tables
3. Create disease_scans, diseases_catalog
4. Set up RLS policies
5. Create storage buckets

### Phase 2: Market Tables (Week 1)
1. Create market_prices, price_alerts
2. Create listings, offers, buyers
3. Set up RLS policies
4. Create indexes

### Phase 3: Farm Management (Week 2)
1. Create farm_activities, harvest_records
2. Create planting_tasks
3. Set up RLS policies
4. Create indexes

### Phase 4: Supporting Tables (Week 2)
1. Create naerls_surveys
2. Create soil_properties with PostGIS
3. Create livestock tables
4. Create communication tables

### Phase 5: Functions & Triggers (Week 3)
1. Create utility functions
2. Create triggers
3. Create performance indexes
4. Load seed data

---

## Seed Data Requirements

### Reference Data to Load

1. **diseases_catalog**: ~50 common crop diseases
2. **naerls_surveys**: Historical planting data (2020-2025)
3. **market_prices**: Initial price data from FAOSTAT
4. **Nigerian states**: Reference data for state/LGA

---

## Environment Configuration

### Required Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_DB_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres

# Feature Flags
VITE_USE_MOCK_DATA=false
VITE_ENABLE_VOICE=true
VITE_ENABLE_OFFLINE=true
```

---

## Testing Strategy

### Database Tests

1. **RLS Policy Tests**: Verify users can only access their own data
2. **Function Tests**: Test all custom functions
3. **Trigger Tests**: Verify triggers fire correctly
4. **Performance Tests**: Query performance with 50K+ records
5. **Spatial Tests**: PostGIS queries for soil data

### Integration Tests

1. Auth flow with phone OTP
2. File upload to storage buckets
3. Realtime subscriptions for price alerts
4. Offline sync patterns

---

## Monitoring & Maintenance

### Key Metrics to Monitor

1. **Query Performance**: p95 response times
2. **Storage Usage**: Bucket sizes
3. **RLS Policy Violations**: Failed access attempts
4. **Connection Pool**: Active connections
5. **Replication Lag**: For read replicas

### Maintenance Tasks

1. **Weekly**: Vacuum analyze on large tables
2. **Monthly**: Review and optimize slow queries
3. **Quarterly**: Archive old data (>2 years)
4. **As Needed**: Reindex fragmented indexes

---

## Security Considerations

### Data Protection

1. **PII Encryption**: Phone numbers encrypted at rest
2. **RLS Enforcement**: All tables have RLS enabled
3. **Signed URLs**: Storage access via time-limited URLs
4. **Rate Limiting**: API rate limits via Upstash Redis
5. **Audit Logging**: Track sensitive operations

### Compliance

1. **GDPR**: Right to deletion, data export
2. **Data Residency**: EU region for European users
3. **Backup Strategy**: Daily automated backups
4. **Disaster Recovery**: Point-in-time recovery enabled

---

## Next Steps

1. Review and approve this schema design
2. Create Supabase project and configure extensions
3. Implement migrations in phases
4. Update TypeScript types to match schema
5. Create seed data scripts
6. Set up monitoring and alerts
7. Document API patterns for frontend team

---

**Document Version**: 1.0
**Last Updated**: 2026-05-16
**Status**: Ready for Review