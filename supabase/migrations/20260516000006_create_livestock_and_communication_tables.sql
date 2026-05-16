-- Create livestock and communication tables
-- Migration: 20260516000006_create_livestock_and_communication_tables.sql
-- Description: Tables for livestock tracking, notifications, and messaging

-- LIVESTOCK TABLE
CREATE TABLE IF NOT EXISTS livestock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  animal_type TEXT NOT NULL
    CHECK (animal_type IN ('goat','chicken','cow','sheep','pig')),
  count INTEGER NOT NULL DEFAULT 0,
  health_status TEXT DEFAULT 'healthy'
    CHECK (health_status IN ('healthy','sick','critical')),
  last_check_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LIVESTOCK HEALTH CHECKS TABLE
CREATE TABLE IF NOT EXISTS livestock_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestock_id UUID REFERENCES livestock(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  symptoms TEXT,
  voice_note_url TEXT,
  diagnosis TEXT,
  recommendation TEXT,
  vet_required BOOLEAN DEFAULT false,
  vet_contacted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL
    CHECK (type IN ('price_alert','weather_alert','disease_alert','task_reminder','offer_received','message_received')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  voice_note_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for livestock
CREATE INDEX idx_livestock_farmer_id ON livestock(farmer_id);
CREATE INDEX idx_livestock_animal_type ON livestock(animal_type);
CREATE INDEX idx_livestock_health_status ON livestock(health_status);
CREATE INDEX idx_livestock_created_at ON livestock(created_at DESC);

-- Create indexes for livestock_health_checks
CREATE INDEX idx_livestock_health_checks_livestock_id ON livestock_health_checks(livestock_id);
CREATE INDEX idx_livestock_health_checks_farmer_id ON livestock_health_checks(farmer_id);
CREATE INDEX idx_livestock_health_checks_created_at ON livestock_health_checks(created_at DESC);
CREATE INDEX idx_livestock_health_checks_vet_required ON livestock_health_checks(vet_required) WHERE vet_required = true;

-- Create indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read, created_at DESC) WHERE read = false;

-- Create indexes for messages
CREATE INDEX idx_messages_listing_id ON messages(listing_id);
CREATE INDEX idx_messages_offer_id ON messages(offer_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_read ON messages(read) WHERE read = false;
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_conversation ON messages(sender_id, recipient_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for livestock
CREATE POLICY "Farmers access own livestock only"
  ON livestock FOR ALL
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for livestock_health_checks
CREATE POLICY "Farmers access own health checks only"
  ON livestock_health_checks FOR ALL
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users access own notifications only"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- RLS Policies for messages
CREATE POLICY "Users access own messages only"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE
  USING (recipient_id = auth.uid());

-- Comments for documentation
COMMENT ON TABLE livestock IS 'Livestock inventory tracking';
COMMENT ON COLUMN livestock.animal_type IS 'Type of animal: goat, chicken, cow, sheep, pig';
COMMENT ON COLUMN livestock.health_status IS 'Overall health status: healthy, sick, critical';

COMMENT ON TABLE livestock_health_checks IS 'Livestock health check records';
COMMENT ON COLUMN livestock_health_checks.vet_required IS 'Whether veterinary visit is needed';
COMMENT ON COLUMN livestock_health_checks.vet_contacted IS 'Whether veterinarian has been contacted';

COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON COLUMN notifications.type IS 'Notification type: price_alert, weather_alert, disease_alert, task_reminder, offer_received, message_received';
COMMENT ON COLUMN notifications.data IS 'Additional structured data in JSON format';

COMMENT ON TABLE messages IS 'Direct messages between farmers and buyers';
COMMENT ON COLUMN messages.listing_id IS 'Related listing (optional)';
COMMENT ON COLUMN messages.offer_id IS 'Related offer (optional)';

-- Made with Bob
