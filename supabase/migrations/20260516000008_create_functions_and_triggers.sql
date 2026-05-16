-- Create database functions and triggers
-- Migration: 20260516000008_create_functions_and_triggers.sql
-- Description: Utility functions and automated triggers

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Increment listing views
CREATE OR REPLACE FUNCTION increment_listing_views(listing_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Expire old listings
CREATE OR REPLACE FUNCTION expire_old_listings()
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update buyer rating
CREATE OR REPLACE FUNCTION update_buyer_rating(buyer_uuid UUID)
RETURNS void AS $$
DECLARE
  avg_rating DECIMAL;
  purchase_count INTEGER;
BEGIN
  -- Calculate average rating from completed offers
  SELECT 
    COUNT(*),
    AVG(5.0) -- Placeholder: In production, this would come from actual ratings
  INTO purchase_count, avg_rating
  FROM offers
  WHERE buyer_id = buyer_uuid 
    AND status = 'completed';
  
  -- Update buyer profile
  UPDATE buyers
  SET 
    rating = COALESCE(avg_rating, 0),
    total_purchases = purchase_count
  WHERE id = buyer_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Calculate harvest revenue
CREATE OR REPLACE FUNCTION calculate_harvest_revenue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity_kg IS NOT NULL AND NEW.price_per_kg IS NOT NULL THEN
    NEW.total_revenue = NEW.quantity_kg * NEW.price_per_kg;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update crop last_scan_at
CREATE OR REPLACE FUNCTION update_crop_last_scan()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.crop_id IS NOT NULL THEN
    UPDATE crops
    SET last_scan_at = NEW.created_at
    WHERE id = NEW.crop_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Create notification for new offer
CREATE OR REPLACE FUNCTION notify_new_offer()
RETURNS TRIGGER AS $$
DECLARE
  listing_owner_id UUID;
BEGIN
  -- Get the listing owner's user_id
  SELECT user_id INTO listing_owner_id
  FROM listings
  WHERE id = NEW.listing_id;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    listing_owner_id,
    'offer_received',
    'New Offer Received',
    'You have received a new offer on your listing',
    jsonb_build_object(
      'offer_id', NEW.id,
      'listing_id', NEW.listing_id,
      'price_per_kg', NEW.price_per_kg,
      'quantity_kg', NEW.quantity_kg
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create notification for new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for recipient
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.recipient_id,
    'message_received',
    'New Message',
    'You have received a new message',
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'listing_id', NEW.listing_id,
      'offer_id', NEW.offer_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update updated_at on farmers table
CREATE TRIGGER update_farmers_updated_at
  BEFORE UPDATE ON farmers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on crops table
CREATE TRIGGER update_crops_updated_at
  BEFORE UPDATE ON crops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on listings table
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on livestock table
CREATE TRIGGER update_livestock_updated_at
  BEFORE UPDATE ON livestock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on buyers table
CREATE TRIGGER update_buyers_updated_at
  BEFORE UPDATE ON buyers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on diseases_catalog table
CREATE TRIGGER update_diseases_catalog_updated_at
  BEFORE UPDATE ON diseases_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Calculate harvest revenue automatically
CREATE TRIGGER calculate_harvest_revenue_trigger
  BEFORE INSERT OR UPDATE ON harvest_records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_harvest_revenue();

-- Trigger: Update crop last_scan_at when disease scan is created
CREATE TRIGGER update_crop_last_scan_trigger
  AFTER INSERT ON disease_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_crop_last_scan();

-- Trigger: Notify farmer when new offer is received
CREATE TRIGGER notify_new_offer_trigger
  AFTER INSERT ON offers
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_offer();

-- Trigger: Notify user when new message is received
CREATE TRIGGER notify_new_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Comments for documentation
COMMENT ON FUNCTION update_updated_at_column IS 'Automatically update updated_at timestamp';
COMMENT ON FUNCTION increment_listing_views IS 'Increment view count for a listing';
COMMENT ON FUNCTION expire_old_listings IS 'Mark expired listings as expired (run via cron)';
COMMENT ON FUNCTION update_buyer_rating IS 'Recalculate buyer rating based on completed offers';
COMMENT ON FUNCTION calculate_harvest_revenue IS 'Calculate total revenue from quantity and price';
COMMENT ON FUNCTION update_crop_last_scan IS 'Update crop last_scan_at when disease scan is created';
COMMENT ON FUNCTION notify_new_offer IS 'Create notification when new offer is received';
COMMENT ON FUNCTION notify_new_message IS 'Create notification when new message is received';

-- Made with Bob
