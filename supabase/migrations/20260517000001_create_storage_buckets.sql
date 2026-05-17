-- =====================================================
-- Storage Buckets for Disease Detection Feature
-- =====================================================
-- Description: Creates storage buckets for disease images and voice notes
-- with appropriate RLS policies and automatic cleanup
-- Created: 2026-05-17
-- =====================================================

-- Create disease-images bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'disease-images',
  'disease-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create voice-notes bucket (private, authenticated only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-notes',
  'voice-notes',
  false,
  2097152, -- 2MB limit
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- RLS Policies for disease-images bucket
-- =====================================================

-- Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload disease images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'disease-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own images
CREATE POLICY "Users can read their own disease images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'disease-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all disease images (for sharing)
CREATE POLICY "Public can read disease images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'disease-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own disease images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'disease-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- RLS Policies for voice-notes bucket
-- =====================================================

-- Allow authenticated users to upload voice notes to their own folder
CREATE POLICY "Users can upload voice notes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-notes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own voice notes
CREATE POLICY "Users can read their own voice notes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-notes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own voice notes
CREATE POLICY "Users can delete their own voice notes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'voice-notes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- Function to clean up old storage files
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_storage_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cutoff_date TIMESTAMP;
  deleted_count INTEGER := 0;
BEGIN
  -- Set cutoff date to 30 days ago
  cutoff_date := NOW() - INTERVAL '30 days';
  
  -- Delete old disease images
  DELETE FROM storage.objects
  WHERE bucket_id = 'disease-images'
    AND created_at < cutoff_date;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % old disease images', deleted_count;
  
  -- Delete old voice notes
  DELETE FROM storage.objects
  WHERE bucket_id = 'voice-notes'
    AND created_at < cutoff_date;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % old voice notes', deleted_count;
END;
$$;

-- =====================================================
-- Function to get user storage usage
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_storage_usage(user_id UUID)
RETURNS TABLE (
  total_bytes BIGINT,
  image_bytes BIGINT,
  voice_bytes BIGINT,
  image_count INTEGER,
  voice_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN bucket_id = 'disease-images' THEN metadata->>'size'::BIGINT ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN bucket_id = 'voice-notes' THEN metadata->>'size'::BIGINT ELSE 0 END), 0) AS total_bytes,
    COALESCE(SUM(CASE WHEN bucket_id = 'disease-images' THEN metadata->>'size'::BIGINT ELSE 0 END), 0) AS image_bytes,
    COALESCE(SUM(CASE WHEN bucket_id = 'voice-notes' THEN metadata->>'size'::BIGINT ELSE 0 END), 0) AS voice_bytes,
    COUNT(CASE WHEN bucket_id = 'disease-images' THEN 1 END)::INTEGER AS image_count,
    COUNT(CASE WHEN bucket_id = 'voice-notes' THEN 1 END)::INTEGER AS voice_count
  FROM storage.objects
  WHERE (storage.foldername(name))[1] = user_id::text;
END;
$$;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON FUNCTION cleanup_old_storage_files() IS 
'Deletes storage files older than 30 days from disease-images and voice-notes buckets. Should be run periodically via cron job.';

COMMENT ON FUNCTION get_user_storage_usage(UUID) IS 
'Returns storage usage statistics for a specific user including total bytes, image bytes, voice bytes, and file counts.';

-- =====================================================
-- Grant permissions
-- =====================================================

-- Grant execute permission on cleanup function to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_old_storage_files() TO authenticated;

-- Grant execute permission on storage usage function to authenticated users
GRANT EXECUTE ON FUNCTION get_user_storage_usage(UUID) TO authenticated;

-- Made with Bob
