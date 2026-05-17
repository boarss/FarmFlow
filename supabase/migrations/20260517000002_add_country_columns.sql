-- add_country_columns.sql
-- Description: Adds 'country' column to necessary tables to support Pan-African expansion

-- 1. Add country column to farmers table
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS country TEXT;

-- 2. Set default country for existing farmers to 'nigeria'
UPDATE farmers SET country = 'nigeria' WHERE country IS NULL;

-- 3. Add country column to market_prices table
ALTER TABLE market_prices ADD COLUMN IF NOT EXISTS country TEXT;

-- 4. Set default country for existing market prices to 'nigeria'
UPDATE market_prices SET country = 'nigeria' WHERE country IS NULL;
