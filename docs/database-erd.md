# FarmFlow Database Entity Relationship Diagram

## Overview

This document provides a visual representation of the FarmFlow database schema, showing table relationships and key constraints.

---

## Core Schema Diagram

```mermaid
erDiagram
    auth_users ||--o{ farmers : "has profile"
    farmers ||--o{ crops : "owns"
    farmers ||--o{ disease_scans : "performs"
    farmers ||--o{ listings : "creates"
    farmers ||--o{ offers : "makes"
    farmers ||--o{ farm_activities : "logs"
    farmers ||--o{ harvest_records : "records"
    farmers ||--o{ planting_tasks : "manages"
    farmers ||--o{ livestock : "owns"
    farmers ||--o{ notifications : "receives"
    farmers ||--o{ messages : "sends/receives"
    
    crops ||--o{ disease_scans : "scanned"
    crops ||--o{ farm_activities : "related to"
    crops ||--o{ harvest_records : "harvested"
    crops ||--o{ planting_tasks : "scheduled for"
    crops ||--o{ listings : "listed"
    
    diseases_catalog ||--o{ disease_scans : "identified as"
    
    listings ||--o{ offers : "receives"
    listings ||--o{ messages : "discussed in"
    
    offers ||--o{ messages : "discussed in"
    
    livestock ||--o{ livestock_health_checks : "checked"
    
    farmers {
        uuid id PK
        uuid user_id FK
        text full_name
        text phone_number UK
        text state
        text lga
        decimal lat
        decimal lng
        text language
        timestamptz created_at
    }
    
    crops {
        uuid id PK
        uuid farmer_id FK
        text crop_name
        text variety
        date planted_date
        decimal field_lat
        decimal field_lng
        decimal field_size_ha
        text status
        timestamptz last_scan_at
        timestamptz created_at
    }
    
    disease_scans {
        uuid id PK
        uuid user_id FK
        uuid farmer_id FK
        uuid crop_id FK
        uuid disease_id FK
        text image_url
        text voice_note_url
        text disease_name
        decimal confidence
        text severity
        text treatment_text
        uuid verified_by FK
        timestamptz verified_at
        timestamptz created_at
    }
    
    diseases_catalog {
        uuid id PK
        text disease_name
        text name_hausa
        text name_yoruba
        text name_igbo
        text_array affected_crops
        text symptoms
        jsonb treatment_steps
        text prevention
        text severity_default
        text_array image_urls
        timestamptz created_at
    }
    
    listings {
        uuid id PK
        uuid user_id FK
        uuid farmer_id FK
        uuid crop_id FK
        text crop_name
        decimal quantity_kg
        text quality_grade
        decimal price_per_kg
        text_array images
        text description
        text location
        text status
        integer views_count
        timestamptz created_at
        timestamptz expires_at
        timestamptz updated_at
    }
    
    offers {
        uuid id PK
        uuid listing_id FK
        uuid buyer_id FK
        text buyer_name
        decimal buyer_rating
        decimal price_per_kg
        decimal quantity_kg
        text message
        text status
        timestamptz created_at
        timestamptz responded_at
    }
    
    farm_activities {
        uuid id PK
        uuid farmer_id FK
        uuid crop_id FK
        text activity_type
        date date
        decimal quantity
        text unit
        decimal cost
        text notes
        text voice_note_url
        timestamptz created_at
    }
    
    harvest_records {
        uuid id PK
        uuid farmer_id FK
        uuid crop_id FK
        decimal quantity_kg
        date date
        text quality
        text sold_to
        decimal price_per_kg
        decimal total_revenue
        text notes
        timestamptz created_at
    }
    
    planting_tasks {
        uuid id PK
        uuid farmer_id FK
        uuid crop_id FK
        text task_type
        text title
        text description
        date due_date
        boolean completed
        timestamptz completed_at
        boolean reminder_sent
        timestamptz created_at
    }
    
    livestock {
        uuid id PK
        uuid farmer_id FK
        text animal_type
        integer count
        text health_status
        date last_check_date
        text notes
        timestamptz created_at
        timestamptz updated_at
    }
    
    livestock_health_checks {
        uuid id PK
        uuid livestock_id FK
        uuid farmer_id FK
        text symptoms
        text voice_note_url
        text diagnosis
        text recommendation
        boolean vet_required
        boolean vet_contacted
        timestamptz created_at
    }
    
    notifications {
        uuid id PK
        uuid user_id FK
        text type
        text title
        text message
        jsonb data
        boolean read
        text action_url
        timestamptz created_at
    }
    
    messages {
        uuid id PK
        uuid listing_id FK
        uuid offer_id FK
        uuid sender_id FK
        uuid recipient_id FK
        text message
        text voice_note_url
        boolean read
        timestamptz created_at
    }
```

---

## Market & Reference Data Tables

```mermaid
erDiagram
    market_prices {
        uuid id PK
        text crop
        text state
        decimal price_naira_kg
        decimal price_usd_tonne
        text source
        text trend
        decimal change_percent
        timestamptz recorded_at
        timestamptz created_at
    }
    
    price_alerts {
        uuid id PK
        text crop
        decimal change_pct
        text direction
        decimal price_naira_kg
        text message_en
        text message_ha
        text message_yo
        text message_ig
        timestamptz created_at
    }
    
    naerls_surveys {
        uuid id PK
        smallint year
        text season
        text state
        text crop
        decimal yield_kg_ha
        text plant_start
        text plant_end
        text disease_notes
        decimal farmgate_price
        timestamptz created_at
    }
    
    soil_properties {
        uuid id PK
        raster geom
        text property_name
        smallint depth_cm
        text unit
        text source
        timestamptz created_at
    }
    
    buyers {
        uuid id PK
        uuid user_id FK
        text business_name
        text contact_name
        text phone_number
        text location
        decimal rating
        integer total_purchases
        boolean verified
        timestamptz verified_at
        timestamptz created_at
    }
```

---

## Table Relationships Summary

### Primary Relationships

| Parent Table | Child Table | Relationship Type | Description |
|--------------|-------------|-------------------|-------------|
| auth.users | farmers | 1:1 | Each auth user has one farmer profile |
| farmers | crops | 1:N | Farmer can have multiple crops |
| farmers | disease_scans | 1:N | Farmer can perform multiple scans |
| farmers | listings | 1:N | Farmer can create multiple listings |
| farmers | farm_activities | 1:N | Farmer logs multiple activities |
| crops | disease_scans | 1:N | Crop can be scanned multiple times |
| crops | harvest_records | 1:N | Crop can be harvested multiple times |
| diseases_catalog | disease_scans | 1:N | Disease can be identified in multiple scans |
| listings | offers | 1:N | Listing can receive multiple offers |
| farmers | livestock | 1:N | Farmer can own multiple livestock groups |
| livestock | livestock_health_checks | 1:N | Livestock can have multiple health checks |

### Cross-Reference Relationships

| Table 1 | Table 2 | Via | Description |
|---------|---------|-----|-------------|
| farmers | farmers | offers | Farmers can be buyers making offers |
| listings | messages | listing_id | Messages can reference listings |
| offers | messages | offer_id | Messages can reference offers |
| farmers | farmers | messages | Farmers message each other |

---

## Key Constraints

### Unique Constraints

```sql
-- Farmers
UNIQUE (phone_number)

-- Market Prices
UNIQUE (crop, state, source, recorded_at::DATE)

-- NAERLS Surveys
UNIQUE (year, season, state, crop)
```

### Check Constraints

```sql
-- Farmers
CHECK (language IN ('hausa','yoruba','igbo','english'))

-- Crops
CHECK (status IN ('active','harvested','failed'))

-- Disease Scans
CHECK (severity IN ('low','medium','high'))
CHECK (confidence >= 0 AND confidence <= 1)

-- Listings
CHECK (quality_grade IN ('A','B','C'))
CHECK (status IN ('active','sold','expired','cancelled'))

-- Offers
CHECK (status IN ('pending','accepted','rejected','completed','cancelled'))

-- Price Alerts
CHECK (direction IN ('up','down'))

-- NAERLS Surveys
CHECK (season IN ('wet','dry'))

-- Livestock
CHECK (animal_type IN ('goat','chicken','cow','sheep','pig'))
CHECK (health_status IN ('healthy','sick','critical'))
```

### Foreign Key Constraints

All foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` depending on business logic:

- **CASCADE**: When parent is deleted, child records are also deleted
  - farmers → crops, disease_scans, listings, etc.
  - crops → disease_scans, harvest_records
  - listings → offers
  
- **SET NULL**: When parent is deleted, foreign key is set to NULL
  - disease_scans.verified_by (extension officer)
  - offers.buyer_id (if buyer account deleted)

---

## Indexes Strategy

### Primary Indexes (Automatic)

All tables have primary key indexes on `id` column.

### Foreign Key Indexes

```sql
-- Automatically created for all FK columns
CREATE INDEX idx_crops_farmer_id ON crops(farmer_id);
CREATE INDEX idx_disease_scans_farmer_id ON disease_scans(farmer_id);
CREATE INDEX idx_listings_farmer_id ON listings(farmer_id);
-- ... etc for all FK columns
```

### Performance Indexes

```sql
-- Frequently queried columns
CREATE INDEX idx_farmers_phone ON farmers(phone_number);
CREATE INDEX idx_farmers_state ON farmers(state);
CREATE INDEX idx_crops_status ON crops(status) WHERE status = 'active';
CREATE INDEX idx_listings_status ON listings(status) WHERE status = 'active';

-- Time-based queries
CREATE INDEX idx_disease_scans_created ON disease_scans(created_at DESC);
CREATE INDEX idx_farm_activities_date ON farm_activities(date DESC);
CREATE INDEX idx_market_prices_recorded ON market_prices(recorded_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_market_prices_crop_state ON market_prices(crop, state, recorded_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;
```

### Spatial Indexes (PostGIS)

```sql
-- Location-based queries
CREATE INDEX idx_farmers_location ON farmers USING GIST(ST_MakePoint(lng, lat));
CREATE INDEX idx_soil_properties_geom ON soil_properties USING GIST(ST_ConvexHull(geom));
```

### Full-Text Search Indexes

```sql
-- Text search on disease names
CREATE INDEX idx_diseases_name_trgm ON diseases_catalog USING GIN(disease_name gin_trgm_ops);

-- Text search on crop names
CREATE INDEX idx_crops_name_trgm ON crops USING GIN(crop_name gin_trgm_ops);
```

---

## Row Level Security (RLS) Policies

### Policy Summary

| Table | Policy Name | Operation | Rule |
|-------|-------------|-----------|------|
| farmers | Farmers access own profile | ALL | auth.uid() = user_id |
| crops | Farmers access own crops | ALL | farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()) |
| disease_scans | Users access own scans | ALL | user_id = auth.uid() |
| listings | Public read active listings | SELECT | status = 'active' |
| listings | Farmers edit own listings | UPDATE/DELETE | farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()) |
| offers | Listing owner views offers | SELECT | listing_id IN (SELECT id FROM listings WHERE farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid())) |
| offers | Buyers view own offers | SELECT | buyer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()) |
| farm_activities | Farmers access own activities | ALL | farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()) |
| notifications | Users access own notifications | ALL | user_id = auth.uid() |
| messages | Users access own messages | ALL | sender_id = auth.uid() OR recipient_id = auth.uid() |
| market_prices | Public read | SELECT | true |
| price_alerts | Public read | SELECT | true |
| diseases_catalog | Public read | SELECT | true |
| naerls_surveys | Public read | SELECT | true |
| buyers | Public read verified | SELECT | verified = true |

---

## Storage Buckets Structure

### Bucket: crop-photos

```
crop-photos/
├── {user_id}/
│   ├── {timestamp}_1.jpg
│   ├── {timestamp}_2.jpg
│   └── ...
```

**RLS**: Users can only upload/read from their own folder

### Bucket: voice-notes

```
voice-notes/
├── {user_id}/
│   ├── {timestamp}_disease.webm
│   ├── {timestamp}_activity.webm
│   └── ...
```

**RLS**: Users can only upload/read from their own folder

### Bucket: listing-photos

```
listing-photos/
├── {user_id}/
│   ├── {listing_id}_1.jpg
│   ├── {listing_id}_2.jpg
│   └── ...
```

**RLS**: Public read, authenticated write to own folder

### Bucket: ndvi-maps

```
ndvi-maps/
├── {farm_id}/
│   ├── {date}_ndvi.png
│   └── ...
```

**RLS**: Farmers can only read their own farm's maps

---

## Database Functions

### Utility Functions

```sql
-- Get soil properties at GPS coordinates
get_soil_at_point(lat FLOAT, lng FLOAT)
  RETURNS TABLE (property_name TEXT, value FLOAT, unit TEXT, depth_cm SMALLINT)

-- Update listing view count
increment_listing_views(listing_uuid UUID)
  RETURNS void

-- Calculate buyer rating
update_buyer_rating(buyer_uuid UUID)
  RETURNS void

-- Expire old listings
expire_old_listings()
  RETURNS void

-- Update timestamp trigger
update_updated_at_column()
  RETURNS TRIGGER
```

---

## Data Flow Examples

### Example 1: Disease Scan Flow

```
1. Farmer uploads photo → crop-photos bucket
2. Frontend calls disease detection API
3. API returns disease_id and confidence
4. Insert into disease_scans table
5. Trigger notification to farmer
6. Extension officer can verify scan
```

### Example 2: Market Listing Flow

```
1. Farmer creates listing → listings table
2. Upload photos → listing-photos bucket
3. System matches with buyers
4. Buyers make offers → offers table
5. Farmer receives notification
6. Messages exchanged → messages table
7. Offer accepted → update listing status
```

### Example 3: Farm Activity Logging

```
1. Farmer logs activity (voice or text)
2. Voice note uploaded → voice-notes bucket
3. Insert into farm_activities table
4. Link to crop_id if applicable
5. Update crop.last_scan_at if relevant
6. Generate planting_task if needed
```

---

## Migration Order

### Phase 1: Foundation
1. Enable extensions (postgis, pgcrypto, pg_trgm)
2. Create farmers table
3. Create crops table
4. Set up RLS policies

### Phase 2: Core Features
1. Create disease_scans, diseases_catalog
2. Create market_prices, price_alerts
3. Create listings, offers, buyers
4. Set up storage buckets

### Phase 3: Farm Management
1. Create farm_activities
2. Create harvest_records
3. Create planting_tasks
4. Create livestock tables

### Phase 4: Communication
1. Create notifications
2. Create messages
3. Set up realtime subscriptions

### Phase 5: Reference Data
1. Create naerls_surveys
2. Create soil_properties
3. Load seed data

### Phase 6: Optimization
1. Create all indexes
2. Create functions and triggers
3. Performance testing
4. Query optimization

---

## Monitoring Queries

### Check Table Sizes

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Index Usage

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Check Slow Queries

```sql
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

---

**Document Version**: 1.0
**Last Updated**: 2026-05-16
**Status**: Ready for Implementation