-- Create disease detection tables
-- Migration: 20260516000003_create_disease_tables.sql
-- Description: Tables for crop disease detection and catalog

-- DISEASES CATALOG TABLE (Reference data)
CREATE TABLE IF NOT EXISTS diseases_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_name TEXT NOT NULL UNIQUE,
  name_hausa TEXT,
  name_yoruba TEXT,
  name_igbo TEXT,
  affected_crops TEXT[] NOT NULL,
  symptoms TEXT,
  treatment_steps JSONB,
  prevention TEXT,
  severity_default TEXT DEFAULT 'medium'
    CHECK (severity_default IN ('low','medium','high')),
  image_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISEASE SCANS TABLE
CREATE TABLE IF NOT EXISTS disease_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
  disease_id UUID REFERENCES diseases_catalog(id) ON DELETE SET NULL,
  image_url TEXT,
  voice_note_url TEXT,
  disease_name TEXT,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  severity TEXT DEFAULT 'medium'
    CHECK (severity IN ('low','medium','high')),
  treatment_text TEXT,
  verified_by UUID REFERENCES farmers(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for diseases_catalog
CREATE INDEX idx_diseases_catalog_name ON diseases_catalog(disease_name);
CREATE INDEX idx_diseases_catalog_affected_crops ON diseases_catalog USING GIN(affected_crops);
CREATE INDEX idx_diseases_catalog_name_trgm ON diseases_catalog USING GIN(disease_name gin_trgm_ops);

-- Create indexes for disease_scans
CREATE INDEX idx_disease_scans_user_id ON disease_scans(user_id);
CREATE INDEX idx_disease_scans_farmer_id ON disease_scans(farmer_id);
CREATE INDEX idx_disease_scans_crop_id ON disease_scans(crop_id);
CREATE INDEX idx_disease_scans_disease_id ON disease_scans(disease_id);
CREATE INDEX idx_disease_scans_created_at ON disease_scans(created_at DESC);
CREATE INDEX idx_disease_scans_verified ON disease_scans(verified_by, verified_at) WHERE verified_by IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE diseases_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_scans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: diseases_catalog is public read (reference data)
CREATE POLICY "Diseases catalog is publicly readable"
  ON diseases_catalog FOR SELECT
  USING (true);

-- RLS Policy: Only admins can modify diseases_catalog
CREATE POLICY "Only admins can modify diseases catalog"
  ON diseases_catalog FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM farmers
      WHERE user_id = auth.uid()
      AND full_name ILIKE '%admin%'
    )
  );

-- RLS Policy: Users can only view their own disease scans
CREATE POLICY "Users access own disease scans only"
  ON disease_scans FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policy: Users can create their own disease scans
CREATE POLICY "Users can create disease scans"
  ON disease_scans FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can update their own disease scans
CREATE POLICY "Users can update own disease scans"
  ON disease_scans FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policy: Extension officers can verify scans
CREATE POLICY "Extension officers can verify scans"
  ON disease_scans FOR UPDATE
  USING (
    verified_by IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

-- Comments for documentation
COMMENT ON TABLE diseases_catalog IS 'Reference table of known crop diseases';
COMMENT ON COLUMN diseases_catalog.disease_name IS 'English disease name';
COMMENT ON COLUMN diseases_catalog.affected_crops IS 'Array of crop names affected by this disease';
COMMENT ON COLUMN diseases_catalog.treatment_steps IS 'Structured treatment steps in JSON format';

COMMENT ON TABLE disease_scans IS 'Records of crop disease detection scans';
COMMENT ON COLUMN disease_scans.confidence IS 'AI confidence score (0-1)';
COMMENT ON COLUMN disease_scans.severity IS 'Disease severity: low, medium, or high';
COMMENT ON COLUMN disease_scans.verified_by IS 'Extension officer who verified the scan';

-- Made with Bob
