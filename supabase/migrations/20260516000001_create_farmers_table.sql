-- Create farmers table
-- Migration: 20260516000001_create_farmers_table.sql
-- Description: Core user profile table for farmers with phone-based authentication

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

-- Create indexes for performance
CREATE INDEX idx_farmers_user_id ON farmers(user_id);
CREATE INDEX idx_farmers_phone ON farmers(phone_number);
CREATE INDEX idx_farmers_state ON farmers(state);
CREATE INDEX idx_farmers_created_at ON farmers(created_at DESC);

-- Create spatial index for location-based queries
CREATE INDEX idx_farmers_location ON farmers USING GIST(
  ST_MakePoint(lng, lat)
) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Farmers can only access their own profile
CREATE POLICY "Farmers access own profile only"
  ON farmers FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policy: Allow insert for authenticated users (during signup)
CREATE POLICY "Allow authenticated users to create profile"
  ON farmers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE farmers IS 'Primary user profile table for farmers';
COMMENT ON COLUMN farmers.id IS 'Unique farmer identifier';
COMMENT ON COLUMN farmers.user_id IS 'Link to Supabase Auth user';
COMMENT ON COLUMN farmers.phone_number IS 'Primary identifier for phone-based authentication';
COMMENT ON COLUMN farmers.state IS 'Nigerian state - drives NAERLS data queries';
COMMENT ON COLUMN farmers.lga IS 'Local Government Area';
COMMENT ON COLUMN farmers.lat IS 'Farm GPS latitude';
COMMENT ON COLUMN farmers.lng IS 'Farm GPS longitude';
COMMENT ON COLUMN farmers.language IS 'Preferred language for UI and voice responses';

-- Made with Bob
