import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';
import { DiseaseScanForm } from '../components/disease';
import { DiseaseResult, Language } from '../types';

/**
 * Disease Detection Page
 * Main page for crop disease detection feature
 */
export function DiseaseDetection() {
  const navigate = useNavigate();
  const [language] = useState<Language>('english'); // TODO: Get from user settings

  /**
   * Handle scan completion
   */
  const handleScanComplete = (result: DiseaseResult) => {
    console.log('Scan completed:', result);
    // TODO: Save to database
  };

  /**
   * Handle save result
   */
  const handleSaveResult = (result: DiseaseResult) => {
    console.log('Saving result:', result);
    // TODO: Save to Supabase
    // Show success message
    alert('Result saved successfully!');
  };

  /**
   * Navigate to history
   */
  const handleViewHistory = () => {
    navigate('/disease-detection/history');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  🔍 Disease Detection
                </h1>
                <p className="text-sm text-gray-600">
                  Identify crop diseases with AI
                </p>
              </div>
            </div>

            <button
              onClick={handleViewHistory}
              className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <DiseaseScanForm
          language={language}
          onScanComplete={handleScanComplete}
          onSave={handleSaveResult}
        />
      </main>

      {/* Footer Info */}
      <footer className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Tips for Best Results
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Take photos in good natural lighting</li>
            <li>• Focus on the affected leaves or parts</li>
            <li>• Get close enough to see symptoms clearly</li>
            <li>• Avoid blurry or dark images</li>
            <li>• Include multiple affected areas if possible</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

// Made with Bob