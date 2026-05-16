// Core User Types
export interface User {
  id: string;
  phone: string;
  name: string;
  language: Language;
  createdAt: string;
}

export interface Farmer extends User {
  farmerId: string;
  state: string;
  lga?: string;
  location?: {
    lat: number;
    lng: number;
  };
  farmSize?: number; // in hectares
}

// Language Types
export type Language = 'english' | 'hausa' | 'yoruba' | 'igbo';

export interface LocalizedText {
  english: string;
  hausa: string;
  yoruba: string;
  igbo: string;
}

// Crop Types
export interface Crop {
  id: string;
  farmerId: string;
  cropName: string;
  variety?: string;
  plantedDate: string;
  fieldLocation?: {
    lat: number;
    lng: number;
  };
  fieldSize?: number; // in hectares
  status: 'active' | 'harvested' | 'failed';
  lastScanAt?: string;
  createdAt: string;
}

export type CropType = 
  | 'maize'
  | 'rice'
  | 'cassava'
  | 'yam'
  | 'sorghum'
  | 'cowpea'
  | 'groundnut'
  | 'tomato'
  | 'plantain'
  | 'cocoa'
  | 'oil-palm'
  | 'millet';

// Disease Detection Types
export interface DiseaseScan {
  id: string;
  userId: string;
  imageUrl: string;
  voiceNoteUrl?: string;
  diseaseName: string;
  localizedName: LocalizedText;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: Treatment;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface Treatment {
  steps: string[];
  products: Product[];
  timeline: string;
  cost?: number; // in Naira
}

export interface Product {
  name: string;
  dosage: string;
  cost: string;
  availability: string;
}

export interface DiseaseResult {
  disease: string;
  localizedName: LocalizedText;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: Treatment;
  imageUrl?: string;
}

// Market Types
export interface MarketPrice {
  id: string;
  crop: CropType;
  state?: string;
  pricePerKg: number; // in Naira
  priceUsdPerTonne?: number;
  source: 'faostat' | 'esoko' | 'nigeria_farm_data';
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
  recordedAt: string;
}

export interface PriceHistory {
  date: string;
  price: number;
}

export interface Listing {
  id: string;
  userId: string;
  cropId: string;
  crop: CropType;
  quantityKg: number;
  qualityGrade: 'A' | 'B' | 'C';
  pricePerKg: number;
  images: string[];
  description?: string;
  location: string;
  status: 'active' | 'sold' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  buyerRating: number;
  pricePerKg: number;
  quantityKg: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
}

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  rating: number;
  totalPurchases: number;
  verified: boolean;
  location: string;
}

// Planting Calendar Types
export interface PlantingWindow {
  id: string;
  crop: CropType;
  state: string;
  season: 'wet' | 'dry';
  plantingStart: string; // e.g., "April week 2"
  plantingEnd: string;
  harvestStart: string;
  harvestEnd: string;
  notes?: string;
  source: 'naerls' | 'local';
}

export interface PlantingTask {
  id: string;
  farmerId: string;
  cropId: string;
  taskType: 'planting' | 'fertilizing' | 'weeding' | 'harvesting';
  dueDate: string;
  completed: boolean;
  notes?: string;
}

// Farm Records Types
export interface FarmActivity {
  id: string;
  farmId: string;
  farmerId: string;
  activityType: 'planting' | 'harvesting' | 'fertilizer' | 'pesticide' | 'irrigation';
  cropId?: string;
  date: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  notes?: string;
  voiceNote?: string;
  createdAt: string;
}

export interface HarvestRecord {
  id: string;
  farmerId: string;
  cropId: string;
  quantityKg: number;
  date: string;
  quality: 'A' | 'B' | 'C';
  soldTo?: string;
  pricePerKg?: number;
}

// Weather Types
export interface WeatherData {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
}

export interface WeatherForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  precipitationMm: number;
  precipitationProbability: number;
}

export interface WeatherAlert {
  id: string;
  type: 'rain' | 'drought' | 'flood' | 'storm';
  severity: 'low' | 'medium' | 'high';
  message: LocalizedText;
  startDate: string;
  endDate: string;
}

// Livestock Types
export interface Livestock {
  id: string;
  farmerId: string;
  animalType: 'goat' | 'chicken' | 'cow' | 'sheep' | 'pig';
  count: number;
  healthStatus: 'healthy' | 'sick' | 'critical';
  lastCheckDate?: string;
}

export interface LivestockHealthCheck {
  id: string;
  livestockId: string;
  symptoms: string;
  voiceNote?: string;
  diagnosis?: string;
  recommendation: string;
  vetRequired: boolean;
  createdAt: string;
}

// Soil Types
export interface SoilProfile {
  location: {
    lat: number;
    lng: number;
  };
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicCarbon: number;
  texture: 'clay' | 'loam' | 'sand' | 'silt';
  recommendation: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// Voice Types
export interface VoiceRecording {
  blob: Blob;
  url: string;
  duration: number;
  transcript?: string;
}

export interface VoiceSettings {
  enabled: boolean;
  language: Language;
  autoPlay: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'price_alert' | 'weather_alert' | 'disease_alert' | 'task_reminder';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Settings Types
export interface AppSettings {
  language: Language;
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  offlineMode: boolean;
  dataUsage: 'low' | 'medium' | 'high';
  theme: 'light' | 'dark' | 'auto';
}

// Offline Queue Types
export interface QueuedAction {
  id: string;
  type: 'disease_scan' | 'farm_activity' | 'listing' | 'message';
  payload: unknown;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed';
}

// Made with Bob
