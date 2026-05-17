import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Country } from '../../types';
import { Loader2, MapPin, User, Sprout, Globe } from 'lucide-react';

interface OnboardingData {
  name: string;
  country: string | '';
  state: string;
  lga: string;
  farmSize: string;
  primaryCrops: string[];
}

import { COUNTRIES, REGIONS } from '../../constants/regions';

const COMMON_CROPS = [
  'Maize', 'Rice', 'Cassava', 'Yam', 'Sorghum', 'Millet',
  'Cowpea', 'Groundnut', 'Tomato', 'Pepper', 'Plantain', 'Cocoa'
];

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<OnboardingData>({
    name: '',
    country: '',
    state: '',
    lga: '',
    farmSize: '',
    primaryCrops: [],
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: keyof OnboardingData, value: string | string[]) => {
    setData({ ...data, [field]: value });
    setError('');
  };

  const toggleCrop = (crop: string) => {
    const crops = data.primaryCrops.includes(crop)
      ? data.primaryCrops.filter(c => c !== crop)
      : [...data.primaryCrops, crop];
    handleChange('primaryCrops', crops);
  };

  const handleNext = () => {
    if (step === 1 && !data.name) {
      setError('Please enter your name');
      return;
    }
    if (step === 2 && !data.country) {
      setError('Please select your country');
      return;
    }
    if (step === 3 && (!data.state || (data.country === 'nigeria' && !data.lga))) {
      setError('Please select your region and location details');
      return;
    }
    if (step === 4 && !data.farmSize) {
      setError('Please enter your farm size');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (data.primaryCrops.length === 0) {
      setError('Please select at least one crop');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('No user found');

      // Create farmer profile
      const { db } = await import('../../lib/supabase');
      const result = await db.createFarmer({
        user_id: user.id,
        phone: user.phone,
        name: data.name,
        country: data.country as Country,
        state: data.state,
        lga: data.lga,
        farm_size: parseFloat(data.farmSize),
        primary_crops: data.primaryCrops,
        language: 'english', // Default to English for multi-country for now
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError('Failed to create profile. Please try again.');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                What's your name?
              </h2>
              <p className="text-gray-600">
                Let's get to know you better
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Where are you based?
              </h2>
              <p className="text-gray-600">
                Select your country
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {COUNTRIES.map(country => (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => {
                    handleChange('country', country.id);
                    handleChange('state', ''); // Reset state when country changes
                  }}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                    data.country === country.id
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {country.name}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                In which region?
              </h2>
              <p className="text-gray-600">
                This helps us provide localized information
              </p>
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                {data.country === 'kenya' ? 'County' : 'State / Region'}
              </label>
              <select
                id="state"
                value={data.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select your {data.country === 'kenya' ? 'county' : 'region'}</option>
                {data.country && REGIONS[data.country]?.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {data.country === 'nigeria' && (
              <div>
                <label htmlFor="lga" className="block text-sm font-medium text-gray-700 mb-2">
                  Local Government Area (LGA)
                </label>
                <input
                  id="lga"
                  type="text"
                  value={data.lga}
                  onChange={(e) => handleChange('lga', e.target.value)}
                  placeholder="Enter your LGA"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Sprout className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Tell us about your farm
              </h2>
              <p className="text-gray-600">
                This helps us provide better recommendations
              </p>
            </div>

            <div>
              <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700 mb-2">
                Farm Size (hectares)
              </label>
              <input
                id="farmSize"
                type="number"
                step="0.1"
                min="0"
                value={data.farmSize}
                onChange={(e) => handleChange('farmSize', e.target.value)}
                placeholder="e.g., 2.5"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-3xl">🌾</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                What do you grow?
              </h2>
              <p className="text-gray-600">
                Select all crops you currently grow
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {COMMON_CROPS.map(crop => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => toggleCrop(crop)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    data.primaryCrops.includes(crop)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {step} of 5
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((step / 5) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStep()}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-4">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}
            {step < 5 ? (
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Creating Profile...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob