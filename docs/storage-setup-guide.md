# Supabase Storage Setup Guide

This guide explains how to set up and configure Supabase Storage for the FarmFlow disease detection feature.

## Overview

The disease detection feature uses two storage buckets:
- **disease-images**: Public bucket for crop disease photos
- **voice-notes**: Private bucket for voice symptom descriptions

## Prerequisites

- Supabase project created
- Supabase CLI installed
- Database migrations applied

## Setup Steps

### 1. Apply Storage Migration

Run the storage bucket migration:

```bash
# Navigate to project root
cd c:/Users/Daug-PA/OneDrive/Documents/FarmFlow

# Apply the migration
supabase db push
```

Or apply manually via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase/migrations/20260517000001_create_storage_buckets.sql`
3. Execute the SQL

### 2. Verify Buckets Created

Check in Supabase Dashboard:
1. Navigate to **Storage** section
2. Verify two buckets exist:
   - `disease-images` (Public)
   - `voice-notes` (Private)

### 3. Configure Bucket Settings

#### disease-images Bucket
- **Public**: Yes (allows public read access)
- **File size limit**: 5MB
- **Allowed MIME types**: 
  - image/jpeg
  - image/jpg
  - image/png
  - image/webp

#### voice-notes Bucket
- **Public**: No (private, authenticated only)
- **File size limit**: 2MB
- **Allowed MIME types**:
  - audio/webm
  - audio/mp4
  - audio/mpeg
  - audio/wav

### 4. Verify RLS Policies

Check that the following policies are active:

#### disease-images Policies
- ✅ Users can upload disease images (INSERT)
- ✅ Users can read their own disease images (SELECT)
- ✅ Public can read disease images (SELECT)
- ✅ Users can delete their own disease images (DELETE)

#### voice-notes Policies
- ✅ Users can upload voice notes (INSERT)
- ✅ Users can read their own voice notes (SELECT)
- ✅ Users can delete their own voice notes (DELETE)

## Usage Examples

### Upload Disease Image

```typescript
import { uploadDiseaseImage } from './services/storageService';

const file = /* File from input */;
const userId = 'user-uuid';

const result = await uploadDiseaseImage(file, userId);
console.log('Image URL:', result.publicUrl);
```

### Upload Voice Note

```typescript
import { uploadVoiceNote } from './services/storageService';

const audioBlob = /* Blob from recorder */;
const userId = 'user-uuid';

const result = await uploadVoiceNote(audioBlob, userId);
console.log('Voice note URL:', result.signedUrl);
```

### Using the Upload Hook

```typescript
import { useFileUpload } from './hooks/useFileUpload';

function MyComponent() {
  const { uploadImage, imageUpload } = useFileUpload();

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadImage(file, userId);
      console.log('Upload complete:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      {imageUpload.isUploading && (
        <div>Uploading... {imageUpload.progress}%</div>
      )}
      {imageUpload.error && (
        <div>Error: {imageUpload.error}</div>
      )}
    </div>
  );
}
```

## Storage Organization

Files are organized by user ID:

```
disease-images/
  ├── user-uuid-1/
  │   ├── 1234567890.jpg
  │   ├── 1234567891.jpg
  │   └── ...
  ├── user-uuid-2/
  │   └── ...
  └── ...

voice-notes/
  ├── user-uuid-1/
  │   ├── 1234567890.webm
  │   ├── 1234567891.webm
  │   └── ...
  └── ...
```

## Automatic Cleanup

Old files (>30 days) are automatically cleaned up:

### Manual Cleanup

```sql
SELECT cleanup_old_storage_files();
```

### Scheduled Cleanup (Recommended)

Set up a cron job using Supabase Edge Functions or pg_cron:

```sql
-- Using pg_cron (if available)
SELECT cron.schedule(
  'cleanup-old-storage',
  '0 2 * * *', -- Run at 2 AM daily
  $$SELECT cleanup_old_storage_files()$$
);
```

## Storage Usage Monitoring

### Check User Storage Usage

```sql
SELECT * FROM get_user_storage_usage('user-uuid');
```

Returns:
- `total_bytes`: Total storage used
- `image_bytes`: Storage used by images
- `voice_bytes`: Storage used by voice notes
- `image_count`: Number of images
- `voice_count`: Number of voice notes

### TypeScript Usage

```typescript
import { getUserStorageUsage } from './services/storageService';

const usage = await getUserStorageUsage(userId);
console.log(`Total: ${usage} bytes`);
```

## Security Considerations

### Row Level Security (RLS)

All storage operations are protected by RLS policies:

1. **User Isolation**: Users can only access their own files
2. **Folder-based Security**: Files are organized by user ID in folders
3. **Public Read**: Disease images are publicly readable (for sharing)
4. **Private Voice Notes**: Voice notes are private and require authentication

### File Validation

Client-side validation:
- File size limits enforced
- MIME type validation
- Image compression before upload

Server-side validation:
- Bucket-level size limits
- Allowed MIME types enforced
- RLS policies prevent unauthorized access

## Troubleshooting

### Upload Fails with "Permission Denied"

**Cause**: RLS policies not applied or user not authenticated

**Solution**:
1. Verify user is authenticated
2. Check RLS policies are active
3. Ensure user ID matches folder name

### Cannot Read Files

**Cause**: Incorrect bucket configuration or missing policies

**Solution**:
1. Verify bucket is public (for disease-images)
2. Check SELECT policies are active
3. For voice-notes, ensure signed URLs are used

### Storage Quota Exceeded

**Cause**: Too many files or large files

**Solution**:
1. Run cleanup function: `SELECT cleanup_old_storage_files()`
2. Check user storage usage
3. Implement client-side file size limits

### CORS Errors

**Cause**: CORS not configured for storage buckets

**Solution**:
1. Go to Supabase Dashboard > Storage > Settings
2. Add allowed origins:
   - `http://localhost:5173` (development)
   - Your production domain

## Performance Optimization

### Image Compression

Always compress images before upload:

```typescript
import { compressImage } from './utils/imageCompression';

const compressed = await compressImage(file, {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 800,
});
```

### Caching

Use CDN caching for public images:
- Public URLs are CDN-cached automatically
- Set appropriate cache headers

### Lazy Loading

Load images lazily in lists:

```typescript
<img 
  src={imageUrl} 
  loading="lazy"
  alt="Disease scan"
/>
```

## Monitoring

### Storage Metrics

Monitor in Supabase Dashboard:
1. Go to **Storage** section
2. View usage statistics
3. Check bandwidth usage

### Custom Monitoring

```typescript
import { checkStorageHealth } from './services/storageService';

const health = await checkStorageHealth();
console.log('Disease images bucket:', health.diseaseImages);
console.log('Voice notes bucket:', health.voiceNotes);
```

## Backup Strategy

### Manual Backup

Download all files for a user:

```typescript
import { listUserFiles } from './services/storageService';

const imagePaths = await listUserFiles('DISEASE_IMAGES', userId);
// Download each file using the paths
```

### Automated Backup

Set up automated backups using Supabase CLI:

```bash
# Export storage bucket
supabase storage export disease-images ./backups/images
supabase storage export voice-notes ./backups/voice
```

## Cost Optimization

### Storage Costs

Supabase Storage pricing (as of 2026):
- First 1GB: Free
- Additional storage: $0.021/GB/month
- Bandwidth: $0.09/GB

### Optimization Tips

1. **Compress images** before upload (target <500KB)
2. **Clean up old files** regularly (>30 days)
3. **Use appropriate formats**:
   - JPEG for photos (smaller)
   - WebP for better compression
   - WebM for audio (smaller than MP3)
4. **Monitor usage** and set alerts

## Next Steps

After setting up storage:

1. ✅ Apply storage migration
2. ✅ Verify buckets created
3. ✅ Test upload functionality
4. ⏭️ Implement database operations (Task 12)
5. ⏭️ Create scan history component (Task 13)

## Support

For issues or questions:
- Check [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- Review migration file: `supabase/migrations/20260517000001_create_storage_buckets.sql`
- Check service implementation: `src/services/storageService.ts`