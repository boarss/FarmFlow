-- Create market and trading tables
-- Migration: 20260516000004_create_market_tables.sql
-- Description: Tables for market prices, listings, offers, and buyers

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

-- Create unique index separately to avoid syntax issues
CREATE UNIQUE INDEX idx_market_prices_unique
  ON market_prices (crop, state, source, (recorded_at::DATE));

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

-- Create indexes for market_prices
CREATE INDEX idx_market_prices_crop ON market_prices(crop);
CREATE INDEX idx_market_prices_state ON market_prices(state);
CREATE INDEX idx_market_prices_recorded_at ON market_prices(recorded_at DESC);
CREATE INDEX idx_market_prices_crop_state ON market_prices(crop, state, recorded_at DESC);

-- Create indexes for price_alerts
CREATE INDEX idx_price_alerts_crop ON price_alerts(crop);
CREATE INDEX idx_price_alerts_created_at ON price_alerts(created_at DESC);

-- Create indexes for buyers
CREATE INDEX idx_buyers_user_id ON buyers(user_id);
CREATE INDEX idx_buyers_verified ON buyers(verified) WHERE verified = true;
CREATE INDEX idx_buyers_rating ON buyers(rating DESC);

-- Create indexes for listings
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_farmer_id ON listings(farmer_id);
CREATE INDEX idx_listings_crop_id ON listings(crop_id);
CREATE INDEX idx_listings_crop_name ON listings(crop_name);
CREATE INDEX idx_listings_status ON listings(status) WHERE status = 'active';
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_expires_at ON listings(expires_at) WHERE status = 'active';

-- Create indexes for offers
CREATE INDEX idx_offers_listing_id ON offers(listing_id);
CREATE INDEX idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX idx_offers_status ON offers(status) WHERE status = 'pending';
CREATE INDEX idx_offers_created_at ON offers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for market_prices (public read)
CREATE POLICY "Market prices are publicly readable"
  ON market_prices FOR SELECT
  USING (true);

-- RLS Policies for price_alerts (public read)
CREATE POLICY "Price alerts are publicly readable"
  ON price_alerts FOR SELECT
  USING (true);

-- RLS Policies for buyers
CREATE POLICY "Verified buyers are publicly readable"
  ON buyers FOR SELECT
  USING (verified = true);

CREATE POLICY "Buyers can manage own profile"
  ON buyers FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for listings
CREATE POLICY "Active listings are publicly readable"
  ON listings FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Farmers can create listings"
  ON listings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Farmers can update own listings"
  ON listings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Farmers can delete own listings"
  ON listings FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for offers
CREATE POLICY "Listing owners can view all offers on their listings"
  ON offers FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can view their own offers"
  ON offers FOR SELECT
  USING (
    buyer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create offers"
  ON offers FOR INSERT
  WITH CHECK (
    buyer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can update their own offers"
  ON offers FOR UPDATE
  USING (
    buyer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Listing owners can update offers on their listings"
  ON offers FOR UPDATE
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE user_id = auth.uid()
    )
  );

-- Comments for documentation
COMMENT ON TABLE market_prices IS 'Historical and current market prices for crops';
COMMENT ON TABLE price_alerts IS 'Price change alerts for Supabase Realtime';
COMMENT ON TABLE buyers IS 'Verified buyer profiles';
COMMENT ON TABLE listings IS 'Farmer produce listings for sale';
COMMENT ON TABLE offers IS 'Buyer offers on listings';

COMMENT ON COLUMN market_prices.source IS 'Data source: faostat, esoko, or nigeria_farm_data';
COMMENT ON COLUMN listings.expires_at IS 'Listing expiration date (default 30 days)';
COMMENT ON COLUMN offers.status IS 'Offer status: pending, accepted, rejected, completed, or cancelled';

-- Made with Bob
