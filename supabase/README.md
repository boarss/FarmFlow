# FarmFlow Supabase Migrations

This directory contains all database migrations and seed data for the FarmFlow application.

## Directory Structure

```
supabase/
├── migrations/           # Database migration files
│   ├── 20260516000000_enable_extensions.sql
│   ├── 20260516000001_create_farmers_table.sql
│   ├── 20260516000002_create_crops_table.sql
│   ├── 20260516000003_create_disease_tables.sql
│   ├── 20260516000004_create_market_tables.sql
│   ├── 20260516000005_create_farm_management_tables.sql
│   ├── 20260516000006_create_livestock_and_communication_tables.sql
│   ├── 20260516000007_create_reference_tables.sql
│   └── 20260516000008_create_functions_and_triggers.sql
├── seed.sql             # Initial seed data
└── README.md            # This file
```

## Migration Files

### 1. Enable Extensions (20260516000000)
- Enables PostGIS for spatial queries
- Enables pgcrypto for encryption and UUID generation
- Enables pg_trgm for fuzzy text search

### 2. Create Farmers Table (20260516000001)
- Core user profile table
- Phone-based authentication
- Location tracking with PostGIS
- Multi-language support (Hausa, Yoruba, Igbo, English)

### 3. Create Crops Table (20260516000002)
- Tracks crops planted by farmers
- Field location and size
- Crop status tracking
- Full-text search on crop names

### 4. Create Disease Tables (20260516000003)
- `diseases_catalog`: Reference data for known diseases
- `disease_scans`: Records of disease detection scans
- Multi-language disease names
- AI confidence scores and verification

### 5. Create Market Tables (20260516000004)
- `market_prices`: Historical and current prices
- `price_alerts`: Real-time price change alerts
- `listings`: Farmer produce listings
- `offers`: Buyer offers on listings
- `buyers`: Verified buyer profiles

### 6. Create Farm Management Tables (20260516000005)
- `farm_activities`: Daily activity logs
- `harvest_records`: Harvest tracking
- `planting_tasks`: Calendar tasks and reminders

### 7. Create Livestock and Communication Tables (20260516000006)
- `livestock`: Animal inventory tracking
- `livestock_health_checks`: Health check records
- `notifications`: User notifications
- `messages`: Direct messaging between users

### 8. Create Reference Tables (20260516000007)
- `naerls_surveys`: Agricultural survey data
- `soil_properties`: PostGIS raster data for soil
- Includes `get_soil_at_point()` function

### 9. Create Functions and Triggers (20260516000008)
- Auto-update `updated_at` timestamps
- Calculate harvest revenue automatically
- Create notifications for offers and messages
- Update crop scan timestamps
- Expire old listings

## Applying Migrations

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order
4. Execute each migration

### Option 2: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase (if not already done)
npx supabase init

# Link to your remote project
npx supabase link --project-ref ypsbadsdoiznwdguzswo

# Push all migrations to remote database
npx supabase db push

# Or apply migrations one by one
npx supabase migration up
```

### Option 3: Using psql

```bash
# Set your database URL
export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@db.ypsbadsdoiznwdguzswo.supabase.co:5432/postgres"

# Apply migrations in order
psql $SUPABASE_DB_URL -f migrations/20260516000000_enable_extensions.sql
psql $SUPABASE_DB_URL -f migrations/20260516000001_create_farmers_table.sql
# ... continue for all migrations
```

## Loading Seed Data

After applying all migrations, load the seed data:

```bash
# Using Supabase CLI
npx supabase db seed

# Or using psql
psql $SUPABASE_DB_URL -f seed.sql
```

## Verification

After applying migrations, verify everything is set up correctly:

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

-- Check extensions
SELECT * FROM pg_extension
WHERE extname IN ('postgis', 'pgcrypto', 'pg_trgm');

-- Check seed data
SELECT COUNT(*) FROM diseases_catalog;
SELECT COUNT(*) FROM naerls_surveys;
SELECT COUNT(*) FROM market_prices;
```

## Storage Buckets

After applying migrations, create storage buckets via Supabase Dashboard:

1. Go to **Storage** in Supabase Dashboard
2. Create the following buckets:

### crop-photos
- **Public**: No (private)
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/png, image/webp

### voice-notes
- **Public**: No (private)
- **File size limit**: 10MB
- **Allowed MIME types**: audio/webm, audio/mp4, audio/mpeg

### listing-photos
- **Public**: Yes (public read)
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/png, image/webp

### ndvi-maps
- **Public**: No (private)
- **File size limit**: 20MB
- **Allowed MIME types**: image/png, image/tiff

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Farmers**: Can only access their own profile
- **Crops**: Can only access their own crops
- **Disease Scans**: Can only view their own scans
- **Listings**: Public read for active listings, owners can edit
- **Offers**: Listing owners and offer creators can view
- **Activities**: Farmers can only access their own
- **Notifications**: Users can only view their own
- **Messages**: Users can only view messages they sent/received
- **Reference Data**: Public read (diseases_catalog, market_prices, naerls_surveys)

## Database Functions

### get_soil_at_point(lat, lng)
Get soil properties at a GPS coordinate.

```sql
SELECT * FROM get_soil_at_point(9.0820, 8.6753);
```

### increment_listing_views(listing_id)
Increment view count for a listing.

```sql
SELECT increment_listing_views('uuid-here');
```

### expire_old_listings()
Mark expired listings as expired (run via cron).

```sql
SELECT expire_old_listings();
```

### update_buyer_rating(buyer_id)
Recalculate buyer rating.

```sql
SELECT update_buyer_rating('uuid-here');
```

## Triggers

The following triggers are automatically applied:

- **update_updated_at**: Auto-update timestamps on farmers, crops, listings, livestock, buyers, diseases_catalog
- **calculate_harvest_revenue**: Auto-calculate revenue on harvest_records
- **update_crop_last_scan**: Update crop.last_scan_at when disease scan is created
- **notify_new_offer**: Create notification when new offer is received
- **notify_new_message**: Create notification when new message is received

## Troubleshooting

### Migration fails with "relation already exists"
The migrations use `IF NOT EXISTS` clauses, so they should be idempotent. If you still get errors, you may need to drop the existing tables first (⚠️ this will delete all data):

```sql
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
-- ... drop all tables in reverse order
```

### RLS blocks all queries
Make sure you're authenticated and the user has a corresponding farmer profile:

```sql
-- Check current user
SELECT auth.uid();

-- Check if farmer profile exists
SELECT * FROM farmers WHERE user_id = auth.uid();
```

### PostGIS functions not working
Verify PostGIS is installed:

```sql
SELECT PostGIS_Version();
```

## Next Steps

1. ✅ Apply all migrations
2. ✅ Load seed data
3. ✅ Create storage buckets
4. ✅ Verify RLS policies
5. ✅ Test CRUD operations
6. 🔄 Configure authentication (phone OTP)
7. 🔄 Set up realtime subscriptions
8. 🔄 Load production data

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [FarmFlow Database Schema Plan](../docs/database-schema-plan.md)
- [FarmFlow Setup Guide](../docs/supabase-setup-guide.md)

## Support

For issues or questions:
- Check [docs/supabase-setup-guide.md](../docs/supabase-setup-guide.md)
- Review [docs/database-erd.md](../docs/database-erd.md)
- Contact: tech@farmflow.com

---

**Last Updated**: 2026-05-16
**Database Version**: 1.0.0
**Status**: Ready for Deployment