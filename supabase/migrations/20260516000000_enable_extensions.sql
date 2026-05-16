-- Enable required PostgreSQL extensions for FarmFlow
-- Migration: 20260516000000_enable_extensions.sql
-- Description: Enable PostGIS for spatial queries, pgcrypto for encryption, and pg_trgm for fuzzy search

-- PostGIS: Spatial queries for farm locations, soil data, and distance calculations
CREATE EXTENSION IF NOT EXISTS postgis;

-- pgcrypto: UUID generation and PII encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- pg_trgm: Fuzzy text search for crop names and disease names
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Verify extensions are enabled
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    RAISE EXCEPTION 'PostGIS extension failed to install';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    RAISE EXCEPTION 'pgcrypto extension failed to install';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    RAISE EXCEPTION 'pg_trgm extension failed to install';
  END IF;
  
  RAISE NOTICE 'All required extensions enabled successfully';
END $$;

-- Made with Bob
