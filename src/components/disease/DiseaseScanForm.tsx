import { useState } from 'react';
import { Camera, Mic, Loader2, AlertCircle } from 'lucide-react';
import { CameraCapture } from './CameraCapture';
import { VoiceRecorder } from './VoiceRecorder';
import { DiseaseResults } from './DiseaseResults';
import { Language, DiseaseResult, CropType } from '../../types';
import { detectDisease } from '../../services/mockDiseaseService';

export interface DiseaseScanFormProps {
  language?: Language;
  onScanComplete?: (result: DiseaseResult) => void;
  onSave?: (result: DiseaseResult) => void;
  className?: string;
}

type ScanStep = 'input-method' | 'camera' | 'voice' | 'processing' | 'results';

/**
 * Disease Scan Form Component
 * Main form that orchestrates the disease detection flow
 * Integrates camera capture, voice recording, and results display
 */
export function DiseaseScanForm({
  language = 'english',
  onScanComplete,
  onSave,
  className = '',
}: DiseaseScanFormProps) {
  const [step, setStep] = useState<ScanStep>('input-method');
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState<Blob | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number>(0);
  const [cropType, setCropType] = useState<CropType | ''>('');
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle image capture
   */
  const handleImageCapture = (file: File, preview: string) => {
    setCapturedImage(file);
    setImagePreview(preview);
    setError(null);
    // Move to voice step or directly to processing
    setStep('voice');
  };

  /**
   * Handle voice recording
   */
  const handleVoiceRecording = (blob: Blob, duration: number) => {
    setVoiceNote(blob);
    setVoiceDuration(duration);
    setError(null);
  };

  /**
   * Skip voice recording
   */
  const handleSkipVoice = () => {
    setVoiceNote(null);
    handleSubmit();
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!capturedImage || !imagePreview) {
      setError('Please capture an image first');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setError(null);

    try {
      // Call disease detection service
      const detectionResult = await detectDisease(
        imagePreview,
        voiceNote ? URL.createObjectURL(voiceNote) : undefined
      );

      setResult(detectionResult);
      setStep('results');
      onScanComplete?.(detectionResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(errorMessage);
      setStep('input-method');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle retake
   */
  const handleRetake = () => {
    setCapturedImage(null);
    setImagePreview(null);
    setVoiceNote(null);
    setVoiceDuration(0);
    setResult(null);
    setError(null);
    setStep('input-method');
  };

  /**
   * Handle save result
   */
  const handleSaveResult = () => {
    if (result) {
      onSave?.(result);
    }
  };

  /**
   * Handle camera error
   */
  const handleCameraError = (err: Error) => {
    setError(err.message);
  };

  /**
   * Handle voice error
   */
  const handleVoiceError = (err: Error) => {
    setError(err.message);
  };

  return (
    <div className={`disease-scan-form ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Step 1: Input Method Selection */}
      {step === 'input-method' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Crop Disease Detection
            </h2>
            <p className="text-gray-600">
              Take a photo of your crop to identify diseases and get treatment recommendations
            </p>
          </div>

          {/* Optional: Crop Type Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Type (Optional)
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value as CropType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select crop type...</option>
              <option value="maize">Maize</option>
              <option value="rice">Rice</option>
              <option value="cassava">Cassava</option>
              <option value="yam">Yam</option>
              <option value="tomato">Tomato</option>
              <option value="sorghum">Sorghum</option>
              <option value="cowpea">Cowpea</option>
              <option value="groundnut">Groundnut</option>
              <option value="plantain">Plantain</option>
              <option value="cocoa">Cocoa</option>
            </select>
          </div>

          {/* Camera Capture */}
          <CameraCapture
            onCapture={handleImageCapture}
            onError={handleCameraError}
            maxSizeKB={500}
            quality={0.8}
          />
        </div>
      )}

      {/* Step 2: Camera Capture (handled by CameraCapture component) */}
      {step === 'camera' && (
        <CameraCapture
          onCapture={handleImageCapture}
          onError={handleCameraError}
          maxSizeKB={500}
          quality={0.8}
        />
      )}

      {/* Step 3: Voice Recording (Optional) */}
      {step === 'voice' && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Add Voice Note (Optional)
            </h3>
            <p className="text-sm text-gray-600">
              Describe the symptoms you're seeing for better analysis
            </p>
          </div>

          {/* Show captured image preview */}
          {imagePreview && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Captured Image:</p>
              <img
                src={imagePreview}
                alt="Captured crop"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            onError={handleVoiceError}
            maxDuration={60}
            language={language}
          />

          <div className="flex gap-3">
            <button
              onClick={handleSkipVoice}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Skip Voice Note
            </button>
            <button
              onClick={handleSubmit}
              disabled={!voiceNote}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Continue with Voice
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Processing */}
      {step === 'processing' && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Analyzing Your Crop...
          </h3>
          <p className="text-gray-600 mb-4">
            Our AI is examining the image to identify any diseases
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      )}

      {/* Step 5: Results */}
      {step === 'results' && result && (
        <DiseaseResults
          result={result}
          language={language}
          onRetake={handleRetake}
          onSave={handleSaveResult}
          loading={isProcessing}
        />
      )}

      {/* Debug Info (Development Only) */}
      {import.meta.env.DEV && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
          <p><strong>Debug:</strong> Step: {step}</p>
          <p>Image: {capturedImage ? '✓' : '✗'}</p>
          <p>Voice: {voiceNote ? `✓ (${voiceDuration}s)` : '✗'}</p>
          <p>Crop: {cropType || 'Not selected'}</p>
        </div>
      )}
    </div>
  );
}

// Made with Bob