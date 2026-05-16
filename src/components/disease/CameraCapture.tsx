import { useState, useEffect } from 'react';
import { Camera, Upload, RotateCcw, SwitchCamera, X, Loader2 } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';
import {
  compressImage,
  createPreviewUrl,
  revokePreviewUrl,
  validateImageFile,
  formatFileSize,
} from '../../utils/imageCompression';

export interface CameraCaptureProps {
  onCapture: (file: File, preview: string) => void;
  onError?: (error: Error) => void;
  maxSizeKB?: number;
  quality?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Camera Capture Component
 * Allows users to capture photos using device camera or upload from gallery
 * Automatically compresses images for optimal upload
 */
export function CameraCapture({
  onCapture,
  onError,
  maxSizeKB = 500,
  quality = 0.8,
  disabled = false,
  className = '',
}: CameraCaptureProps) {
  const [mode, setMode] = useState<'select' | 'camera' | 'preview'>('select');
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<string>('');

  const {
    videoRef,
    canvasRef,
    isStreaming,
    isCameraSupported,
    error: cameraError,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
  } = useCamera({
    facingMode: 'environment',
    onError,
  });

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        revokePreviewUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * Handle camera mode activation
   */
  const handleCameraMode = async () => {
    setMode('camera');
    await startCamera();
  };

  /**
   * Handle photo capture from camera
   */
  const handleCapture = async () => {
    try {
      const blob = await capturePhoto();
      if (!blob) {
        throw new Error('Failed to capture photo');
      }

      // Convert blob to file
      const file = new File([blob], `crop-photo-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      await processImage(file);
      stopCamera();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Capture failed');
      onError?.(err);
    }
  };

  /**
   * Handle file upload from gallery
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file, maxSizeKB / 1024);
    if (!validation.valid) {
      onError?.(new Error(validation.error));
      return;
    }

    await processImage(file);
  };

  /**
   * Process and compress image
   */
  const processImage = async (file: File) => {
    try {
      setIsCompressing(true);
      setCompressionProgress(`Original size: ${formatFileSize(file.size)}`);

      // Compress image
      const compressedFile = await compressImage(file, {
        maxSizeMB: maxSizeKB / 1024,
        quality,
      });

      setCompressionProgress(
        `Compressed to: ${formatFileSize(compressedFile.size)}`
      );

      // Create preview
      const preview = createPreviewUrl(compressedFile);
      
      // Clean up old preview
      if (previewUrl) {
        revokePreviewUrl(previewUrl);
      }

      setCapturedImage(compressedFile);
      setPreviewUrl(preview);
      setMode('preview');
      setIsCompressing(false);
    } catch (error) {
      setIsCompressing(false);
      const err = error instanceof Error ? error : new Error('Processing failed');
      onError?.(err);
    }
  };

  /**
   * Handle retake
   */
  const handleRetake = () => {
    if (previewUrl) {
      revokePreviewUrl(previewUrl);
    }
    setCapturedImage(null);
    setPreviewUrl(null);
    setMode('select');
  };

  /**
   * Handle confirm and submit
   */
  const handleConfirm = () => {
    if (capturedImage && previewUrl) {
      onCapture(capturedImage, previewUrl);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    stopCamera();
    handleRetake();
  };

  return (
    <div className={`camera-capture ${className}`}>
      {/* Selection Mode */}
      {mode === 'select' && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Camera className="w-16 h-16 mx-auto text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Capture Crop Photo
            </h3>
            <p className="text-sm text-gray-600">
              Take a clear photo of the affected crop leaves or upload from gallery
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Camera Button */}
            {isCameraSupported && (
              <button
                onClick={handleCameraMode}
                disabled={disabled}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span className="font-medium">Take Photo</span>
              </button>
            )}

            {/* Upload Button */}
            <label className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
              <Upload className="w-5 h-5" />
              <span className="font-medium">Upload from Gallery</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileUpload}
                disabled={disabled}
                className="hidden"
              />
            </label>
          </div>

          {!isCameraSupported && (
            <p className="text-sm text-amber-600 text-center mt-4">
              ⚠️ Camera not supported on this device. Please upload a photo.
            </p>
          )}
        </div>
      )}

      {/* Camera Mode */}
      {mode === 'camera' && (
        <div className="relative">
          {/* Video Stream */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
              style={{ maxHeight: '60vh' }}
            />
            
            {/* Camera overlay guide */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-4 border-2 border-white/50 rounded-lg" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-white text-center bg-black/50 px-4 py-2 rounded-lg">
                  <p className="text-sm">Position crop leaves in frame</p>
                </div>
              </div>
            </div>

            {/* Loading indicator */}
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex items-center justify-between mt-4 gap-3">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              onClick={switchCamera}
              disabled={!isStreaming}
              className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Switch camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            <button
              onClick={handleCapture}
              disabled={!isStreaming}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Camera className="w-5 h-5" />
              <span>Capture</span>
            </button>
          </div>

          {/* Error Display */}
          {cameraError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{cameraError.message}</p>
            </div>
          )}

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Preview Mode */}
      {mode === 'preview' && previewUrl && (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Captured crop"
              className="w-full h-auto"
              style={{ maxHeight: '60vh' }}
            />
          </div>

          {/* Compression Info */}
          {compressionProgress && (
            <div className="text-center text-sm text-gray-600">
              <p>{compressionProgress}</p>
            </div>
          )}

          {/* Preview Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleRetake}
              disabled={isCompressing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake</span>
            </button>

            <button
              onClick={handleConfirm}
              disabled={isCompressing}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>Use This Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob