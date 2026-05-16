-- Create reference data tables
-- Migration: 20260516000007_create_reference_tables.sql
-- Description: Tables for NAERLS surveys and soil properties

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (year, season, state, crop)
);

-- SOIL PROPERTIES TABLE (PostGIS raster data)
CREATE TABLE IF NOT EXISTS soil_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geom RASTER,
  property_name TEXT NOT NULL,
  depth_cm SMALLINT NOT NULL,
  unit TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for naerls_surveys
CREATE INDEX idx_naerls_surveys_year ON naerls_surveys(year DESC);
CREATE INDEX idx_naerls_surveys_state ON naerls_surveys(state);
CREATE INDEX idx_naerls_surveys_crop ON naerls_surveys(crop);
CREATE INDEX idx_naerls_surveys_season ON naerls_surveys(season);
CREATE INDEX idx_naerls_surveys_state_crop ON naerls_surveys(state, crop, year DESC);

-- Create indexes for soil_properties
CREATE INDEX idx_soil_properties_geom ON soil_properties USING GIST(ST_ConvexHull(geom));
CREATE INDEX idx_soil_properties_property_name ON soil_properties(property_name);
CREATE INDEX idx_soil_properties_depth ON soil_properties(depth_cm);

-- Enable Row Level Security
ALTER TABLE naerls_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies for naerls_surveys (public read - reference data)
CREATE POLICY "NAERLS surveys are publicly readable"
  ON naerls_surveys FOR SELECT
  USING (true);

-- RLS Policies for soil_properties (public read - reference data)
CREATE POLICY "Soil properties are publicly readable"
  ON soil_properties FOR SELECT
  USING (true);

-- Create function to get soil properties at a GPS point
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

-- Comments for documentation
COMMENT ON TABLE naerls_surveys IS 'NAERLS agricultural survey data for planting calendars';
COMMENT ON COLUMN naerls_surveys.year IS 'Survey year';
COMMENT ON COLUMN naerls_surveys.season IS 'Growing season: wet or dry';
COMMENT ON COLUMN naerls_surveys.plant_start IS 'Planting start period (e.g., "April week 2")';
COMMENT ON COLUMN naerls_surveys.plant_end IS 'Planting end period';
COMMENT ON COLUMN naerls_surveys.yield_kg_ha IS 'Average yield in kg per hectare';
COMMENT ON COLUMN naerls_surveys.farmgate_price IS 'Farmgate price in Naira per kg';

COMMENT ON TABLE soil_properties IS 'PostGIS raster data for soil properties from SoilGrids and AfSIS';
COMMENT ON COLUMN soil_properties.geom IS 'PostGIS raster geometry';
COMMENT ON COLUMN soil_properties.property_name IS 'Soil property: phh2o, nitrogen, oc, clay, sand';
COMMENT ON COLUMN soil_properties.depth_cm IS 'Soil depth in cm: 0, 5, 15, 30';
COMMENT ON COLUMN soil_properties.source IS 'Data source: soilgrids or afsis_nisis';

COMMENT ON FUNCTION get_soil_at_point IS 'Get all soil properties at a GPS coordinate';

-- Made with Bob
