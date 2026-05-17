import { supabase } from '../lib/supabase';

/**
 * Storage Service for Supabase Storage Operations
 * Handles uploads, downloads, and management of disease scan files
 */

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  path: string;
  publicUrl?: string;
  signedUrl?: string;
}

export interface StorageError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  DISEASE_IMAGES: 'disease-images',
  VOICE_NOTES: 'voice-notes',
} as const;

/**
 * Upload an image to the disease-images bucket
 * @param file - Image file to upload
 * @param userId - User ID for organizing files
 * @param onProgress - Optional progress callback
 * @returns Upload result with URLs
 */
export async function uploadDiseaseImage(
  file: File,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${timestamp}.${fileExt}`;

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.DISEASE_IMAGES)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL (bucket is public)
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.DISEASE_IMAGES)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading disease image:', error);
    throw error;
  }
}

/**
 * Upload a voice note to the voice-notes bucket
 * @param audioBlob - Audio blob to upload
 * @param userId - User ID for organizing files
 * @param onProgress - Optional progress callback
 * @returns Upload result with signed URL
 */
export async function uploadVoiceNote(
  audioBlob: Blob,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}.webm`;

    // Convert blob to file
    const file = new File([audioBlob], fileName, { type: 'audio/webm' });

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.VOICE_NOTES)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get signed URL (bucket is private, expires in 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(STORAGE_BUCKETS.VOICE_NOTES)
      .createSignedUrl(data.path, 3600);

    if (signedUrlError) {
      throw new Error(`Failed to create signed URL: ${signedUrlError.message}`);
    }

    return {
      path: data.path,
      signedUrl: signedUrlData.signedUrl,
    };
  } catch (error) {
    console.error('Error uploading voice note:', error);
    throw error;
  }
}

/**
 * Get a signed URL for a voice note
 * @param path - Storage path of the voice note
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getVoiceNoteSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.VOICE_NOTES)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
}

/**
 * Delete an image from storage
 * @param path - Storage path of the image
 */
export async function deleteDiseaseImage(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.DISEASE_IMAGES)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting disease image:', error);
    throw error;
  }
}

/**
 * Delete a voice note from storage
 * @param path - Storage path of the voice note
 */
export async function deleteVoiceNote(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.VOICE_NOTES)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting voice note:', error);
    throw error;
  }
}

/**
 * List all files for a user in a bucket
 * @param bucket - Bucket name
 * @param userId - User ID
 * @returns List of file paths
 */
export async function listUserFiles(
  bucket: keyof typeof STORAGE_BUCKETS,
  userId: string
): Promise<string[]> {
  try {
    const bucketName = STORAGE_BUCKETS[bucket];
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }

    return data.map((file) => `${userId}/${file.name}`);
  } catch (error) {
    console.error('Error listing user files:', error);
    throw error;
  }
}

/**
 * Get storage usage for a user
 * @param userId - User ID
 * @returns Total bytes used
 */
export async function getUserStorageUsage(userId: string): Promise<number> {
  try {
    let totalBytes = 0;

    // Get image files
    const { data: imageFiles, error: imageError } = await supabase.storage
      .from(STORAGE_BUCKETS.DISEASE_IMAGES)
      .list(userId);

    if (!imageError && imageFiles) {
      totalBytes += imageFiles.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
    }

    // Get voice note files
    const { data: voiceFiles, error: voiceError } = await supabase.storage
      .from(STORAGE_BUCKETS.VOICE_NOTES)
      .list(userId);

    if (!voiceError && voiceFiles) {
      totalBytes += voiceFiles.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
    }

    return totalBytes;
  } catch (error) {
    console.error('Error getting storage usage:', error);
    return 0;
  }
}

/**
 * Clean up old files (older than 30 days)
 * @param userId - User ID
 * @returns Number of files deleted
 */
export async function cleanupOldFiles(userId: string): Promise<number> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let deletedCount = 0;

    // Clean up images
    const { data: imageFiles } = await supabase.storage
      .from(STORAGE_BUCKETS.DISEASE_IMAGES)
      .list(userId);

    if (imageFiles) {
      const oldImages = imageFiles.filter(
        (file) => file.created_at && new Date(file.created_at) < thirtyDaysAgo
      );
      
      if (oldImages.length > 0) {
        const paths = oldImages.map((file) => `${userId}/${file.name}`);
        await supabase.storage.from(STORAGE_BUCKETS.DISEASE_IMAGES).remove(paths);
        deletedCount += oldImages.length;
      }
    }

    // Clean up voice notes
    const { data: voiceFiles } = await supabase.storage
      .from(STORAGE_BUCKETS.VOICE_NOTES)
      .list(userId);

    if (voiceFiles) {
      const oldVoiceNotes = voiceFiles.filter(
        (file) => file.created_at && new Date(file.created_at) < thirtyDaysAgo
      );
      
      if (oldVoiceNotes.length > 0) {
        const paths = oldVoiceNotes.map((file) => `${userId}/${file.name}`);
        await supabase.storage.from(STORAGE_BUCKETS.VOICE_NOTES).remove(paths);
        deletedCount += oldVoiceNotes.length;
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up old files:', error);
    return 0;
  }
}

/**
 * Check if storage buckets exist and are accessible
 * @returns Object with bucket availability status
 */
export async function checkStorageHealth(): Promise<{
  diseaseImages: boolean;
  voiceNotes: boolean;
}> {
  try {
    const [imagesResult, voiceResult] = await Promise.allSettled([
      supabase.storage.from(STORAGE_BUCKETS.DISEASE_IMAGES).list('', { limit: 1 }),
      supabase.storage.from(STORAGE_BUCKETS.VOICE_NOTES).list('', { limit: 1 }),
    ]);

    return {
      diseaseImages: imagesResult.status === 'fulfilled' && !imagesResult.value.error,
      voiceNotes: voiceResult.status === 'fulfilled' && !voiceResult.value.error,
    };
  } catch (error) {
    console.error('Error checking storage health:', error);
    return {
      diseaseImages: false,
      voiceNotes: false,
    };
  }
}

// Made with Bob
