import { DiseaseResult } from '../types';
import diseasesData from '../data/mocks/diseases.json';

/**
 * Mock Disease Detection Service
 * Simulates the Railway ML service for development and testing
 * Returns data from diseases.json with simulated network delay
 */

// Type for the diseases data structure
type DiseasesData = Record<string, unknown>;

/**
 * Simulate network delay
 */
const simulateDelay = (min: number = 500, max: number = 1500): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Simulate random errors (5% failure rate)
 */
const shouldSimulateError = (): boolean => {
  return Math.random() < 0.05;
};

/**
 * Get random disease from mock data
 */
const getRandomDisease = (): string => {
  const diseases = Object.keys(diseasesData as DiseasesData);
  // Exclude 'healthy' for more realistic testing
  const diseaseKeys = diseases.filter(key => key !== 'healthy');
  const randomIndex = Math.floor(Math.random() * diseaseKeys.length);
  return diseaseKeys[randomIndex];
};

/**
 * Adjust confidence score slightly for variation
 */
const adjustConfidence = (baseConfidence: number): number => {
  const variation = (Math.random() - 0.5) * 0.1; // ±5%
  const adjusted = baseConfidence + variation;
  return Math.max(0.6, Math.min(0.99, adjusted)); // Keep between 60% and 99%
};

/**
 * Mock disease detection
 * @param imageUrl - URL of the crop image
 * @param voiceNote - Optional voice note URL
 * @returns Promise with disease detection result
 */
export async function detectDisease(
  imageUrl: string
): Promise<DiseaseResult> {
  // Simulate network delay
  await simulateDelay();

  // Simulate occasional errors
  if (shouldSimulateError()) {
    throw new Error('Failed to analyze image. Please try again.');
  }

  // Get random disease from mock data
  const diseaseKey = getRandomDisease();
  const diseaseData = (diseasesData as DiseasesData)[diseaseKey];

  if (!diseaseData) {
    throw new Error('Disease data not found');
  }

  // Adjust confidence for variation
  const confidence = adjustConfidence(diseaseData.confidence);

  // Build result
  const result: DiseaseResult = {
    disease: diseaseData.name,
    localizedName: diseaseData.localizedName,
    confidence,
    severity: diseaseData.severity,
    treatment: diseaseData.treatment,
    imageUrl,
  };

  return result;
}

/**
 * Get disease by ID from catalog
 * @param diseaseId - Disease identifier
 * @returns Promise with disease result
 */
export async function getDiseaseById(diseaseId: string): Promise<DiseaseResult | null> {
  await simulateDelay(200, 500);

  const diseaseData = (diseasesData as DiseasesData)[diseaseId];
  
  if (!diseaseData) {
    return null;
  }

  const result: DiseaseResult = {
    disease: diseaseData.name,
    localizedName: diseaseData.localizedName,
    confidence: diseaseData.confidence,
    severity: diseaseData.severity,
    treatment: diseaseData.treatment,
  };

  return result;
}

/**
 * Get all diseases from catalog
 * @returns Promise with array of disease results
 */
export async function getDiseaseCatalog(): Promise<DiseaseResult[]> {
  await simulateDelay(300, 700);

  const diseases = Object.entries(diseasesData as DiseasesData).map(([, data]) => ({
    disease: data.name,
    localizedName: data.localizedName,
    confidence: data.confidence,
    severity: data.severity,
    treatment: data.treatment,
  }));

  return diseases;
}

/**
 * Analyze image with specific disease (for testing)
 * @param imageUrl - URL of the crop image
 * @param diseaseKey - Specific disease key to return
 * @returns Promise with disease detection result
 */
export async function detectDiseaseWithKey(
  imageUrl: string,
  diseaseKey: string
): Promise<DiseaseResult> {
  await simulateDelay();

  const diseaseData = (diseasesData as DiseasesData)[diseaseKey];

  if (!diseaseData) {
    throw new Error(`Disease '${diseaseKey}' not found in catalog`);
  }

  const confidence = adjustConfidence(diseaseData.confidence);

  const result: DiseaseResult = {
    disease: diseaseData.name,
    localizedName: diseaseData.localizedName,
    confidence,
    severity: diseaseData.severity,
    treatment: diseaseData.treatment,
    imageUrl,
  };

  return result;
}

/**
 * Check if mock service is available
 * @returns Promise that resolves to true
 */
export async function checkServiceHealth(): Promise<boolean> {
  await simulateDelay(100, 300);
  return true;
}

// Made with Bob