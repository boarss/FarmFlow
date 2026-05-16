-- Seed data for FarmFlow database
-- This file contains initial reference data for development and testing

-- Seed diseases catalog
INSERT INTO diseases_catalog (disease_name, name_hausa, name_yoruba, name_igbo, affected_crops, symptoms, treatment_steps, prevention, severity_default, image_urls) VALUES
('Maize Streak Virus', 'Cutar Masara', 'Arun Agbado', 'Oria Oka', ARRAY['maize'], 
 'Yellow streaks on leaves, stunted growth, reduced yield', 
 '{"steps": ["Remove and destroy infected plants immediately", "Control leafhopper vectors with approved insecticides", "Plant resistant maize varieties", "Maintain proper field sanitation"]}',
 'Use certified disease-free seeds, plant resistant varieties, control leafhopper populations early',
 'high', ARRAY[]::TEXT[]),

('Cassava Mosaic Disease', 'Cutar Rogo', 'Arun Gbegiri', 'Oria Akpu', ARRAY['cassava'], 
 'Mosaic pattern on leaves, leaf distortion, stunted growth, reduced tuber size', 
 '{"steps": ["Remove and destroy infected plants", "Use clean, disease-free planting material", "Control whitefly vectors", "Plant resistant cassava varieties"]}',
 'Use disease-free stem cuttings, plant resistant varieties, control whitefly populations',
 'high', ARRAY[]::TEXT[]),

('Rice Blast', 'Cutar Shinkafa', 'Arun Iresi', 'Oria Osikapa', ARRAY['rice'], 
 'Diamond-shaped lesions on leaves, brown spots, leaf death', 
 '{"steps": ["Apply approved fungicides (e.g., Tricyclazole)", "Improve field drainage", "Use resistant rice varieties", "Apply balanced fertilization"]}',
 'Proper spacing between plants, balanced fertilization, use resistant varieties',
 'medium', ARRAY[]::TEXT[]),

('Tomato Late Blight', 'Cutar Tumatir', 'Arun Tomato', 'Oria Tomato', ARRAY['tomato'], 
 'Dark brown spots on leaves and fruits, white mold on undersides, rapid plant death', 
 '{"steps": ["Apply copper-based fungicides", "Remove infected plants", "Improve air circulation", "Avoid overhead watering"]}',
 'Plant resistant varieties, ensure good drainage, avoid planting in humid conditions',
 'high', ARRAY[]::TEXT[]),

('Yam Anthracnose', 'Cutar Doya', 'Arun Isu', 'Oria Ji', ARRAY['yam'], 
 'Brown spots on leaves, stem rot, tuber rot', 
 '{"steps": ["Apply fungicides", "Remove infected plant parts", "Improve drainage", "Use disease-free seed yams"]}',
 'Use certified seed yams, practice crop rotation, ensure proper storage',
 'medium', ARRAY[]::TEXT[]),

('Cocoa Black Pod', 'Cutar Koko', 'Arun Koko', 'Oria Koko', ARRAY['cocoa'], 
 'Black or brown spots on pods, pod rot, premature pod drop', 
 '{"steps": ["Remove and destroy infected pods", "Apply copper fungicides", "Improve drainage", "Prune trees for better air circulation"]}',
 'Regular harvesting, proper spacing, good drainage, fungicide application during rainy season',
 'high', ARRAY[]::TEXT[]);

-- Seed NAERLS survey data (sample data for major crops and states)
INSERT INTO naerls_surveys (year, season, state, crop, yield_kg_ha, plant_start, plant_end, farmgate_price) VALUES
-- Maize
(2025, 'wet', 'Kaduna', 'maize', 2500, 'April week 2', 'May week 2', 180),
(2025, 'wet', 'Kano', 'maize', 2300, 'April week 3', 'May week 3', 175),
(2025, 'wet', 'Oyo', 'maize', 2200, 'April week 1', 'May week 1', 185),
(2025, 'dry', 'Kaduna', 'maize', 2000, 'November week 1', 'December week 1', 200),

-- Rice
(2025, 'wet', 'Kano', 'rice', 3200, 'June week 1', 'July week 2', 250),
(2025, 'wet', 'Kebbi', 'rice', 3500, 'June week 2', 'July week 3', 245),
(2025, 'wet', 'Niger', 'rice', 3000, 'June week 1', 'July week 1', 255),
(2025, 'dry', 'Kano', 'rice', 2800, 'December week 1', 'January week 2', 280),

-- Cassava
(2025, 'wet', 'Oyo', 'cassava', 15000, 'March week 1', 'April week 4', 120),
(2025, 'wet', 'Benue', 'cassava', 16000, 'March week 2', 'May week 1', 115),
(2025, 'wet', 'Cross River', 'cassava', 14500, 'March week 1', 'April week 3', 125),
(2025, 'wet', 'Enugu', 'cassava', 15500, 'March week 2', 'April week 4', 118),

-- Yam
(2025, 'wet', 'Benue', 'yam', 12000, 'March week 1', 'April week 2', 200),
(2025, 'wet', 'Taraba', 'yam', 11500, 'March week 2', 'April week 3', 195),
(2025, 'wet', 'Nasarawa', 'yam', 11800, 'March week 1', 'April week 2', 205),

-- Sorghum
(2025, 'wet', 'Kano', 'sorghum', 1800, 'May week 1', 'June week 2', 150),
(2025, 'wet', 'Kaduna', 'sorghum', 1750, 'May week 2', 'June week 3', 155),
(2025, 'wet', 'Borno', 'sorghum', 1600, 'May week 1', 'June week 1', 160),

-- Tomato
(2025, 'dry', 'Kano', 'tomato', 25000, 'November week 1', 'December week 1', 350),
(2025, 'dry', 'Kaduna', 'tomato', 24000, 'November week 2', 'December week 2', 360),
(2025, 'wet', 'Plateau', 'tomato', 22000, 'April week 1', 'May week 1', 400),

-- Cocoa
(2025, 'wet', 'Cross River', 'cocoa', 800, 'March week 1', 'April week 4', 1200),
(2025, 'wet', 'Ondo', 'cocoa', 850, 'March week 2', 'May week 1', 1180),
(2025, 'wet', 'Osun', 'cocoa', 820, 'March week 1', 'April week 3', 1190);

-- Seed initial market prices
INSERT INTO market_prices (crop, state, price_naira_kg, price_usd_tonne, source, trend, change_percent, recorded_at) VALUES
-- Current prices
('maize', 'Kaduna', 180, 400, 'nigeria_farm_data', 'stable', 0, NOW()),
('maize', 'Kano', 175, 390, 'nigeria_farm_data', 'down', -2.5, NOW()),
('maize', NULL, 178, 395, 'faostat', 'stable', 0, NOW()),

('rice', 'Kano', 250, 555, 'nigeria_farm_data', 'up', 3.2, NOW()),
('rice', 'Kebbi', 245, 544, 'nigeria_farm_data', 'stable', 0, NOW()),
('rice', NULL, 248, 550, 'faostat', 'up', 2.1, NOW()),

('cassava', 'Oyo', 120, 267, 'nigeria_farm_data', 'stable', 0, NOW()),
('cassava', 'Benue', 115, 256, 'nigeria_farm_data', 'down', -1.5, NOW()),
('cassava', NULL, 118, 262, 'faostat', 'stable', 0, NOW()),

('tomato', 'Kano', 350, 778, 'esoko', 'up', 5.5, NOW()),
('tomato', 'Lagos', 380, 844, 'esoko', 'up', 4.2, NOW()),
('tomato', NULL, 365, 811, 'esoko', 'up', 4.8, NOW()),

('yam', 'Benue', 200, 444, 'nigeria_farm_data', 'stable', 0, NOW()),
('yam', NULL, 198, 440, 'faostat', 'stable', 0, NOW()),

('sorghum', 'Kano', 150, 333, 'nigeria_farm_data', 'stable', 0, NOW()),
('sorghum', NULL, 152, 338, 'faostat', 'stable', 0, NOW()),

('cocoa', 'Cross River', 1200, 2667, 'nigeria_farm_data', 'up', 2.0, NOW()),
('cocoa', 'Ondo', 1180, 2622, 'nigeria_farm_data', 'up', 1.8, NOW()),
('cocoa', NULL, 1190, 2644, 'faostat', 'up', 1.9, NOW());

-- Historical prices (last 7 days)
INSERT INTO market_prices (crop, state, price_naira_kg, source, recorded_at) VALUES
('maize', NULL, 178, 'faostat', NOW() - INTERVAL '1 day'),
('maize', NULL, 177, 'faostat', NOW() - INTERVAL '2 days'),
('maize', NULL, 176, 'faostat', NOW() - INTERVAL '3 days'),
('maize', NULL, 178, 'faostat', NOW() - INTERVAL '4 days'),
('maize', NULL, 179, 'faostat', NOW() - INTERVAL '5 days'),
('maize', NULL, 180, 'faostat', NOW() - INTERVAL '6 days'),
('maize', NULL, 178, 'faostat', NOW() - INTERVAL '7 days');

-- Note: Soil properties data would be loaded separately using raster2pgsql
-- See docs/supabase-setup-guide.md for instructions on loading soil raster data

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Seed data loaded successfully!';
  RAISE NOTICE 'Loaded: % diseases, % NAERLS surveys, % market prices',
    (SELECT COUNT(*) FROM diseases_catalog),
    (SELECT COUNT(*) FROM naerls_surveys),
    (SELECT COUNT(*) FROM market_prices);
END $$;

-- Made with Bob
