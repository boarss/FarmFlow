import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseCameraOptions {
  facingMode?: 'user' | 'environment';
  onError?: (error: Error) => void;
}

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isStreaming: boolean;
  isCameraSupported: boolean;
  error: Error | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => Promise<Blob | null>;
  switchCamera: () => Promise<void>;
}

/**
 * Custom hook for camera functionality
 * Handles camera stream, photo capture, and camera switching
 */
export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { facingMode = 'environment', onError } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [currentFacingMode, setCurrentFacingMode] = useState(facingMode);
  const [error, setError] = useState<Error | null>(null);

  // Check if camera is supported
  const isCameraSupported = !!(
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  );

  /**
   * Start the camera stream
   */
  const startCamera = useCallback(async () => {
    if (!isCameraSupported) {
      const err = new Error('Camera is not supported on this device');
      setError(err);
      onError?.(err);
      return;
    }

    try {
      setError(null);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request camera access
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      const error = err instanceof Error 
        ? err 
        : new Error('Failed to access camera');
      
      setError(error);
      setIsStreaming(false);
      onError?.(error);

      // Provide user-friendly error messages
      if (error.name === 'NotAllowedError') {
        const permissionError = new Error(
          'Camera permission denied. Please allow camera access in your browser settings.'
        );
        setError(permissionError);
        onError?.(permissionError);
      } else if (error.name === 'NotFoundError') {
        const notFoundError = new Error(
          'No camera found on this device.'
        );
        setError(notFoundError);
        onError?.(notFoundError);
      }
    }
  }, [isCameraSupported, currentFacingMode, onError]);

  /**
   * Stop the camera stream
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
  }, []);

  /**
   * Capture a photo from the video stream
   */
  const capturePhoto = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      return null;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to capture photo'));
            }
          },
          'image/jpeg',
          0.95
        );
      });
    } catch (err) {
      const error = err instanceof Error 
        ? err 
        : new Error('Failed to capture photo');
      setError(error);
      onError?.(error);
      return null;
    }
  }, [isStreaming, onError]);

  /**
   * Switch between front and back camera
   */
  const switchCamera = useCallback(async () => {
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    setCurrentFacingMode(newFacingMode);
    
    if (isStreaming) {
      stopCamera();
      // Small delay to ensure camera is released
      await new Promise(resolve => setTimeout(resolve, 100));
      await startCamera();
    }
  }, [currentFacingMode, isStreaming, stopCamera, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    isCameraSupported,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
  };
}

// Made with Bob