import { useState, useCallback } from 'react';
import {
  uploadDiseaseImage,
  uploadVoiceNote,
  UploadResult,
} from '../services/storageService';

/**
 * Upload state interface
 */
export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: UploadResult | null;
}

/**
 * Hook for uploading files to Supabase Storage with progress tracking
 */
export function useFileUpload() {
  const [imageUploadState, setImageUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    result: null,
  });

  const [voiceUploadState, setVoiceUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    result: null,
  });

  /**
   * Upload an image file
   */
  const uploadImage = useCallback(async (file: File, userId: string) => {
    setImageUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      result: null,
    });

    try {
      // Simulate progress (Supabase doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setImageUploadState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      const result = await uploadDiseaseImage(file, userId);

      clearInterval(progressInterval);

      setImageUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        result,
      });

      return result;
    } catch (error) {
      setImageUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
        result: null,
      });
      throw error;
    }
  }, []);

  /**
   * Upload a voice note
   */
  const uploadVoice = useCallback(async (audioBlob: Blob, userId: string) => {
    setVoiceUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      result: null,
    });

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setVoiceUploadState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      const result = await uploadVoiceNote(audioBlob, userId);

      clearInterval(progressInterval);

      setVoiceUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        result,
      });

      return result;
    } catch (error) {
      setVoiceUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
        result: null,
      });
      throw error;
    }
  }, []);

  /**
   * Reset image upload state
   */
  const resetImageUpload = useCallback(() => {
    setImageUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  /**
   * Reset voice upload state
   */
  const resetVoiceUpload = useCallback(() => {
    setVoiceUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  /**
   * Reset all upload states
   */
  const resetAll = useCallback(() => {
    resetImageUpload();
    resetVoiceUpload();
  }, [resetImageUpload, resetVoiceUpload]);

  return {
    // Image upload
    imageUpload: imageUploadState,
    uploadImage,
    resetImageUpload,

    // Voice upload
    voiceUpload: voiceUploadState,
    uploadVoice,
    resetVoiceUpload,

    // Combined
    isUploading: imageUploadState.isUploading || voiceUploadState.isUploading,
    resetAll,
  };
}

/**
 * Hook for batch file uploads
 */
export function useBatchFileUpload() {
  const [uploadStates, setUploadStates] = useState<Map<string, UploadState>>(
    new Map()
  );

  /**
   * Upload multiple files
   */
  const uploadFiles = useCallback(
    async (
      files: Array<{ id: string; file: File; userId: string }>,
      type: 'image' | 'voice'
    ) => {
      const results: Array<{ id: string; result: UploadResult | null; error: string | null }> = [];

      for (const { id, file, userId } of files) {
        // Set uploading state
        setUploadStates((prev) => {
          const newMap = new Map(prev);
          newMap.set(id, {
            isUploading: true,
            progress: 0,
            error: null,
            result: null,
          });
          return newMap;
        });

        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            setUploadStates((prev) => {
              const newMap = new Map(prev);
              const current = newMap.get(id);
              if (current) {
                newMap.set(id, {
                  ...current,
                  progress: Math.min(current.progress + 10, 90),
                });
              }
              return newMap;
            });
          }, 200);

          // Upload based on type
          let result: UploadResult;
          if (type === 'image') {
            result = await uploadDiseaseImage(file, userId);
          } else {
            result = await uploadVoiceNote(file, userId);
          }

          clearInterval(progressInterval);

          // Set success state
          setUploadStates((prev) => {
            const newMap = new Map(prev);
            newMap.set(id, {
              isUploading: false,
              progress: 100,
              error: null,
              result,
            });
            return newMap;
          });

          results.push({ id, result, error: null });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';

          // Set error state
          setUploadStates((prev) => {
            const newMap = new Map(prev);
            newMap.set(id, {
              isUploading: false,
              progress: 0,
              error: errorMessage,
              result: null,
            });
            return newMap;
          });

          results.push({ id, result: null, error: errorMessage });
        }
      }

      return results;
    },
    []
  );

  /**
   * Get upload state for a specific file
   */
  const getUploadState = useCallback(
    (id: string): UploadState => {
      return (
        uploadStates.get(id) || {
          isUploading: false,
          progress: 0,
          error: null,
          result: null,
        }
      );
    },
    [uploadStates]
  );

  /**
   * Reset upload state for a specific file
   */
  const resetUploadState = useCallback((id: string) => {
    setUploadStates((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  /**
   * Reset all upload states
   */
  const resetAll = useCallback(() => {
    setUploadStates(new Map());
  }, []);

  /**
   * Get overall progress (average of all uploads)
   */
  const getOverallProgress = useCallback((): number => {
    if (uploadStates.size === 0) return 0;

    const totalProgress = Array.from(uploadStates.values()).reduce(
      (sum, state) => sum + state.progress,
      0
    );

    return Math.round(totalProgress / uploadStates.size);
  }, [uploadStates]);

  /**
   * Check if any uploads are in progress
   */
  const isUploading = useCallback((): boolean => {
    return Array.from(uploadStates.values()).some((state) => state.isUploading);
  }, [uploadStates]);

  return {
    uploadFiles,
    getUploadState,
    resetUploadState,
    resetAll,
    getOverallProgress,
    isUploading: isUploading(),
    uploadCount: uploadStates.size,
  };
}

// Made with Bob
