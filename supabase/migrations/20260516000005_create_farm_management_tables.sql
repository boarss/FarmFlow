-- Create farm management tables
-- Migration: 20260516000005_create_farm_management_tables.sql
-- Description: Tables for farm activities, harvest records, and planting tasks

-- FARM ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS farm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL
    CHECK (activity_type IN ('planting','harvesting','fertilizer','pesticide','irrigation','weeding')),
  date DATE NOT NULL,
  quantity DECIMAL(10,2),
  unit TEXT,
  cost DECIMAL(10,2),
  notes TEXT,
  voice_note_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HARVEST RECORDS TABLE
CREATE TABLE IF NOT EXISTS harvest_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
  quantity_kg DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  quality TEXT CHECK (quality IN ('A','B','C')),
  sold_to TEXT,
  price_per_kg DECIMAL(10,2),
  total_revenue DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLANTING TASKS TABLE
CREATE TABLE IF NOT EXISTS planting_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL
    CHECK (task_type IN ('planting','fertilizing','weeding','harvesting','inspection')),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for farm_activities
CREATE INDEX idx_farm_activities_farmer_id ON farm_activities(farmer_id);
CREATE INDEX idx_farm_activities_crop_id ON farm_activities(crop_id);
CREATE INDEX idx_farm_activities_date ON farm_activities(date DESC);
CREATE INDEX idx_farm_activities_type ON farm_activities(activity_type);
CREATE INDEX idx_farm_activities_created_at ON farm_activities(created_at DESC);

-- Create indexes for harvest_records
CREATE INDEX idx_harvest_records_farmer_id ON harvest_records(farmer_id);
CREATE INDEX idx_harvest_records_crop_id ON harvest_records(crop_id);
CREATE INDEX idx_harvest_records_date ON harvest_records(date DESC);
CREATE INDEX idx_harvest_records_created_at ON harvest_records(created_at DESC);

-- Create indexes for planting_tasks
CREATE INDEX idx_planting_tasks_farmer_id ON planting_tasks(farmer_id);
CREATE INDEX idx_planting_tasks_crop_id ON planting_tasks(crop_id);
CREATE INDEX idx_planting_tasks_due_date ON planting_tasks(due_date);
CREATE INDEX idx_planting_tasks_completed ON planting_tasks(completed) WHERE completed = false;
CREATE INDEX idx_planting_tasks_reminder ON planting_tasks(reminder_sent, due_date) WHERE reminder_sent = false;

-- Enable Row Level Security
ALTER TABLE farm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE planting_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farm_activities
CREATE POLICY "Farmers access own activities only"
  ON farm_activities FOR ALL
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for harvest_records
CREATE POLICY "Farmers access own harvest records only"
  ON harvest_records FOR ALL
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for planting_tasks
CREATE POLICY "Farmers access own tasks only"
  ON planting_tasks FOR ALL
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

-- Comments for documentation
COMMENT ON TABLE farm_activities IS 'Daily farm activity logs';
COMMENT ON COLUMN farm_activities.activity_type IS 'Type of activity: planting, harvesting, fertilizer, pesticide, irrigation, weeding';
COMMENT ON COLUMN farm_activities.voice_note_url IS 'URL to voice recording of activity notes';

COMMENT ON TABLE harvest_records IS 'Harvest tracking records';
COMMENT ON COLUMN harvest_records.quality IS 'Quality grade: A, B, or C';
COMMENT ON COLUMN harvest_records.total_revenue IS 'Total revenue from sale (quantity_kg * price_per_kg)';

COMMENT ON TABLE planting_tasks IS 'Planting calendar tasks and reminders';
COMMENT ON COLUMN planting_tasks.task_type IS 'Type of task: planting, fertilizing, weeding, harvesting, inspection';
COMMENT ON COLUMN planting_tasks.reminder_sent IS 'Whether reminder notification has been sent';

-- Made with Bob
