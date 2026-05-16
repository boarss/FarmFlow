import { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Save,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DiseaseResult, Language } from '../../types';
import { TreatmentDisplay } from './TreatmentDisplay';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

export interface DiseaseResultsProps {
  result: DiseaseResult;
  language?: Language;
  onPlayAudio?: () => void;
  onRetake?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * Disease Results Display Component
 * Shows disease identification results with confidence, severity, and treatment
 */
export function DiseaseResults({
  result,
  language = 'english',
  onPlayAudio,
  onRetake,
  onSave,
  onShare,
  loading = false,
  className = '',
}: DiseaseResultsProps) {
  const [showTreatment, setShowTreatment] = useState(true);
  const [isSpeakingDisease, setIsSpeakingDisease] = useState(false);

  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech({
    language,
    rate: 0.85,
    onEnd: () => setIsSpeakingDisease(false),
  });

  /**
   * Get severity color
   */
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  /**
   * Get severity icon
   */
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <CheckCircle className="w-6 h-6" />;
      case 'medium':
        return <Info className="w-6 h-6" />;
      case 'high':
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  /**
   * Get confidence color
   */
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-600';
    if (confidence >= 0.6) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  /**
   * Speak disease name and details
   */
  const handleSpeakDisease = () => {
    if (isSpeaking && isSpeakingDisease) {
      stop();
      setIsSpeakingDisease(false);
    } else {
      const text = `Disease detected: ${result.localizedName[language]}. Confidence: ${Math.round(result.confidence * 100)} percent. Severity: ${result.severity}.`;
      setIsSpeakingDisease(true);
      speak(text, language);
    }
  };

  if (loading) {
    return (
      <div className={`disease-results ${className}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing crop image...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`disease-results space-y-4 ${className}`}>
      {/* Disease Identification Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Image Preview */}
        {result.imageUrl && (
          <div className="relative h-48 bg-gray-100">
            <img
              src={result.imageUrl}
              alt="Crop scan"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Disease Info */}
        <div className="p-4 space-y-4">
          {/* Disease Name */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {result.localizedName[language]}
                </h2>
                {language !== 'english' && (
                  <p className="text-sm text-gray-500">{result.disease}</p>
                )}
              </div>
              {isSupported && (
                <button
                  onClick={handleSpeakDisease}
                  className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                  title="Read aloud"
                >
                  {isSpeaking && isSpeakingDisease ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Confidence Score */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Confidence</span>
              <span className="font-bold text-gray-900">
                {Math.round(result.confidence * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getConfidenceColor(
                  result.confidence
                )}`}
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {result.confidence >= 0.8
                ? 'High confidence - reliable identification'
                : result.confidence >= 0.6
                ? 'Medium confidence - consider expert verification'
                : 'Low confidence - please retake photo or consult expert'}
            </p>
          </div>

          {/* Severity Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium ${getSeverityColor(
              result.severity
            )}`}
          >
            {getSeverityIcon(result.severity)}
            <span className="capitalize">{result.severity} Severity</span>
          </div>
        </div>
      </div>

      {/* Treatment Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowTreatment(!showTreatment)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            Treatment Recommendations
          </h3>
          {showTreatment ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {showTreatment && (
          <div className="p-4 pt-0">
            <TreatmentDisplay treatment={result.treatment} language={language} />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {onRetake && (
          <button
            onClick={onRetake}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Scan Again</span>
          </button>
        )}

        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            <span>Save Result</span>
          </button>
        )}
      </div>

      {onShare && (
        <button
          onClick={onShare}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
        >
          <Share2 className="w-4 h-4" />
          <span>Share with Extension Officer</span>
        </button>
      )}

      {/* Low Confidence Warning */}
      {result.confidence < 0.6 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">
                Low Confidence Detection
              </h4>
              <p className="text-sm text-amber-800">
                The AI is not very confident about this identification. We recommend:
              </p>
              <ul className="text-sm text-amber-800 mt-2 space-y-1 list-disc list-inside">
                <li>Retake the photo with better lighting</li>
                <li>Get closer to the affected area</li>
                <li>Consult with an agricultural extension officer</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is an AI-powered diagnosis. For severe cases or
              if symptoms persist after treatment, please consult an agricultural expert
              or extension officer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob