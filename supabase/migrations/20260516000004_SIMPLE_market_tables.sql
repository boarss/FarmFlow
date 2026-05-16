-- SIMPLIFIED Migration 4: Market tables (broken into parts for easier debugging)
-- Run this version if the original fails

-- Part 1: MARKET PRICES TABLE
CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  state TEXT,
  price_naira_kg DECIMAL(10,2) NOT NULL,
  price_usd_tonne DECIMAL(10,2),
  source TEXT NOT NULL,
  trend TEXT,
  change_percent DECIMAL(5,2),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Part 2: PRICE ALERTS TABLE
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  change_pct DECIMAL(5,2) NOT NULL,
  direction TEXT,
  price_naira_kg DECIMAL(10,2),
  message_en TEXT,
  message_ha TEXT,
  message_yo TEXT,
  message_ig TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Part 3: BUYERS TABLE
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  contact_name TEXT,
  phone_number TEXT,
  location TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Part 4: LISTINGS TABLE
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
  crop_name TEXT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  quality_grade TEXT,
  price_per_kg DECIMAL(10,2) NOT NULL,
  images TEXT[],
  description TEXT,
  location TEXT,
  status TEXT DEFAULT 'active',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Part 5: OFFERS TABLE
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  buyer_name TEXT,
  buyer_rating DECIMAL(2,1),
  price_per_kg DECIMAL(10,2) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Part 6: Create basic indexes
CREATE INDEX IF NOT EXISTS idx_market_prices_crop ON market_prices(crop);
CREATE INDEX IF NOT EXISTS idx_market_prices_created_at ON market_prices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_alerts_crop ON price_alerts(crop);
CREATE INDEX IF NOT EXISTS idx_buyers_user_id ON buyers(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_farmer_id ON listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON offers(listing_id);

-- Part 7: Enable RLS
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Part 8: Create basic RLS policies
CREATE POLICY "market_prices_select" ON market_prices FOR SELECT USING (true);
CREATE POLICY "price_alerts_select" ON price_alerts FOR SELECT USING (true);
CREATE POLICY "buyers_select" ON buyers FOR SELECT USING (verified = true);
CREATE POLICY "buyers_all" ON buyers FOR ALL USING (user_id = auth.uid());
CREATE POLICY "listings_select" ON listings FOR SELECT USING (status = 'active' OR user_id = auth.uid());
CREATE POLICY "listings_insert" ON listings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "listings_update" ON listings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "listings_delete" ON listings FOR DELETE USING (user_id = auth.uid());

-- Made with Bob
