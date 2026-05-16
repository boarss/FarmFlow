import imageCompression from 'browser-image-compression';

/**
 * Image compression options for crop disease detection
 * Optimized for low-bandwidth scenarios
 */
export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
  preserveExif?: boolean;
}

/**
 * Default compression options
 * Target: <500KB, 800x600px, quality 0.8
 */
const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 0.5, // 500KB
  maxWidthOrHeight: 800,
  useWebWorker: true,
  quality: 0.8,
  preserveExif: true, // Keep location data if available
};

/**
 * Compress an image file for upload
 * @param file - The image file to compress
 * @param options - Compression options (optional)
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Check if file is already small enough
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB <= (mergedOptions.maxSizeMB || 0.5)) {
      return file;
    }

    // Compress the image
    const compressedFile = await imageCompression(file, mergedOptions);
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to compress image: ${error.message}`
        : 'Failed to compress image'
    );
  }
}

/**
 * Create a preview URL from a file
 * @param file - The image file
 * @returns Object URL for preview
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 * @param url - The object URL to revoke
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Validate image file
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns Validation result
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, or WebP)',
    };
  }

  // Check file size (before compression)
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `Image size must be less than ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Get image dimensions
 * @param file - The image file
 * @returns Promise with width and height
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = createPreviewUrl(file);

    img.onload = () => {
      revokePreviewUrl(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      revokePreviewUrl(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Made with Bob