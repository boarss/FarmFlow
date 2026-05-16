import { useState } from 'react';
import { CheckCircle2, Circle, Volume2, VolumeX, ShoppingBag, Clock, DollarSign } from 'lucide-react';
import { Treatment, Product, Language } from '../../types';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

export interface TreatmentDisplayProps {
  treatment: Treatment;
  language?: Language;
  onProductClick?: (product: Product) => void;
  className?: string;
}

/**
 * Treatment Display Component
 * Shows treatment steps, products, timeline, and cost
 * Includes text-to-speech for each section
 */
export function TreatmentDisplay({
  treatment,
  language = 'english',
  onProductClick,
  className = '',
}: TreatmentDisplayProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [speakingSection, setSpeakingSection] = useState<string | null>(null);

  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech({
    language,
    rate: 0.85,
    onEnd: () => setSpeakingSection(null),
  });

  /**
   * Toggle step completion
   */
  const toggleStep = (index: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
  };

  /**
   * Speak section text
   */
  const handleSpeak = (text: string, section: string) => {
    if (isSpeaking && speakingSection === section) {
      stop();
      setSpeakingSection(null);
    } else {
      setSpeakingSection(section);
      speak(text, language);
    }
  };

  /**
   * Format cost in Naira
   */
  const formatCost = (cost: number | string): string => {
    if (typeof cost === 'string') return cost;
    return `₦${cost.toLocaleString()}`;
  };

  return (
    <div className={`treatment-display space-y-6 ${className}`}>
      {/* Treatment Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Treatment Steps
          </h3>
          {isSupported && (
            <button
              onClick={() => handleSpeak(treatment.steps.join('. '), 'steps')}
              className="p-2 text-gray-600 hover:text-green-600 transition-colors"
              title="Read aloud"
            >
              {isSpeaking && speakingSection === 'steps' ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {treatment.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => toggleStep(index)}
            >
              <button className="flex-shrink-0 mt-0.5">
                {completedSteps.has(index) ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    completedSteps.has(index)
                      ? 'text-gray-500 line-through'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium">Step {index + 1}:</span> {step}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-green-600">
              {completedSteps.size} / {treatment.steps.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(completedSteps.size / treatment.steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Products */}
      {treatment.products && treatment.products.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-600" />
              Recommended Products
            </h3>
          </div>

          <div className="space-y-3">
            {treatment.products.map((product, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => onProductClick?.(product)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                  <span className="text-green-600 font-bold">
                    {formatCost(product.cost)}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Dosage:</span> {product.dosage}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Availability:</span>{' '}
                    {product.availability}
                  </p>
                </div>

                {isSupported && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(
                        `${product.name}. Dosage: ${product.dosage}. Cost: ${product.cost}. ${product.availability}`,
                        `product-${index}`
                      );
                    }}
                    className="mt-2 text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    {isSpeaking && speakingSection === `product-${index}` ? (
                      <>
                        <VolumeX className="w-3 h-3" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Read details</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline & Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timeline */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Timeline</h4>
          </div>
          <p className="text-sm text-blue-800">{treatment.timeline}</p>
          {isSupported && (
            <button
              onClick={() => handleSpeak(treatment.timeline, 'timeline')}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {isSpeaking && speakingSection === 'timeline' ? (
                <>
                  <VolumeX className="w-3 h-3" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>Read aloud</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Cost */}
        {treatment.cost !== undefined && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Estimated Cost</h4>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCost(treatment.cost)}
            </p>
            <p className="text-xs text-green-700 mt-1">
              Total for all products and application
            </p>
          </div>
        )}
      </div>

      {/* TTS Not Supported Message */}
      {!isSupported && (
        <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 Text-to-speech is not available on this device
          </p>
        </div>
      )}
    </div>
  );
}

// Made with Bob