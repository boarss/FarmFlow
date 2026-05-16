-- Create crops table
-- Migration: 20260516000002_create_crops_table.sql
-- Description: Tracks crops planted by farmers

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

-- Create indexes for performance
CREATE INDEX idx_crops_farmer_id ON crops(farmer_id);
CREATE INDEX idx_crops_crop_name ON crops(crop_name);
CREATE INDEX idx_crops_status ON crops(status) WHERE status = 'active';
CREATE INDEX idx_crops_planted_date ON crops(planted_date DESC);
CREATE INDEX idx_crops_created_at ON crops(created_at DESC);

-- Create spatial index for field location
CREATE INDEX idx_crops_field_location ON crops USING GIST(
  ST_MakePoint(field_lng, field_lat)
) WHERE field_lat IS NOT NULL AND field_lng IS NOT NULL;

-- Create full-text search index for crop names
CREATE INDEX idx_crops_name_trgm ON crops USING GIN(crop_name gin_trgm_ops);

-- Enable Row Level Security
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Farmers can only access their own crops
CREATE POLICY "Farmers access own crops only"
  ON crops FOR ALL
  USING (farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  ));

-- RLS Policy: Allow insert for authenticated users
CREATE POLICY "Allow farmers to create crops"
  ON crops FOR INSERT
  WITH CHECK (farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  ));

-- Comments for documentation
COMMENT ON TABLE crops IS 'Tracks crops planted by farmers';
COMMENT ON COLUMN crops.id IS 'Unique crop record identifier';
COMMENT ON COLUMN crops.farmer_id IS 'Owner of this crop';
COMMENT ON COLUMN crops.crop_name IS 'Crop type (maize, rice, cassava, etc.)';
COMMENT ON COLUMN crops.variety IS 'Specific variety/cultivar';
COMMENT ON COLUMN crops.planted_date IS 'When crop was planted';
COMMENT ON COLUMN crops.field_lat IS 'Field GPS latitude';
COMMENT ON COLUMN crops.field_lng IS 'Field GPS longitude';
COMMENT ON COLUMN crops.field_size_ha IS 'Field size in hectares';
COMMENT ON COLUMN crops.status IS 'Current status: active, harvested, or failed';
COMMENT ON COLUMN crops.last_scan_at IS 'Last disease scan timestamp';

-- Made with Bob
