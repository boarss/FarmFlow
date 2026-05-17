import { supabase } from '../lib/supabase';
import { DiseaseScan, DiseaseResult } from '../types';

/**
 * Disease Scan Database Service
 * Handles CRUD operations for disease scans in Supabase
 */

export interface CreateScanInput {
  userId: string;
  imageUrl: string;
  voiceNoteUrl?: string;
  diseaseName: string;
  localizedName: {
    english: string;
    hausa: string;
    yoruba: string;
    igbo: string;
  };
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: {
    steps: string[];
    products: Array<{
      name: string;
      dosage: string;
      cost: string;
      availability: string;
    }>;
    timeline: string;
    cost?: number;
  };
  cropType?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface UpdateScanInput {
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface ScanFilters {
  userId?: string;
  severity?: 'low' | 'medium' | 'high';
  verified?: boolean;
  startDate?: string;
  endDate?: string;
  cropType?: string;
  limit?: number;
  offset?: number;
}

/**
 * Create a new disease scan record
 */
export async function createDiseaseScan(
  input: CreateScanInput
): Promise<{ success: boolean; data?: DiseaseScan; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('disease_scans')
      .insert({
        user_id: input.userId,
        image_url: input.imageUrl,
        voice_note_url: input.voiceNoteUrl,
        disease_name: input.diseaseName,
        localized_name: input.localizedName,
        confidence: input.confidence,
        severity: input.severity,
        treatment: input.treatment,
        crop_type: input.cropType,
        location: input.location,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating disease scan:', error);
      return { success: false, error };
    }

    return { success: true, data: mapDbScanToDiseaseScan(data) };
  } catch (error) {
    console.error('Error creating disease scan:', error);
    return { success: false, error };
  }
}

/**
 * Get a single disease scan by ID
 */
export async function getDiseaseScanById(
  scanId: string
): Promise<{ success: boolean; data?: DiseaseScan; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('disease_scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (error) {
      console.error('Error getting disease scan:', error);
      return { success: false, error };
    }

    return { success: true, data: mapDbScanToDiseaseScan(data) };
  } catch (error) {
    console.error('Error getting disease scan:', error);
    return { success: false, error };
  }
}

/**
 * Get all disease scans for a user with optional filters
 */
export async function getUserDiseaseScans(
  filters: ScanFilters = {}
): Promise<{ success: boolean; data?: DiseaseScan[]; error?: any; total?: number }> {
  try {
    let query = supabase
      .from('disease_scans')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters.verified !== undefined) {
      if (filters.verified) {
        query = query.not('verified_by', 'is', null);
      } else {
        query = query.is('verified_by', null);
      }
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters.cropType) {
      query = query.eq('crop_type', filters.cropType);
    }

    // Apply pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by most recent
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error getting disease scans:', error);
      return { success: false, error };
    }

    return {
      success: true,
      data: data.map(mapDbScanToDiseaseScan),
      total: count || 0,
    };
  } catch (error) {
    console.error('Error getting disease scans:', error);
    return { success: false, error };
  }
}

/**
 * Update a disease scan (for verification)
 */
export async function updateDiseaseScan(
  scanId: string,
  updates: UpdateScanInput
): Promise<{ success: boolean; data?: DiseaseScan; error?: any }> {
  try {
    const updateData: any = {};

    if (updates.verifiedBy) {
      updateData.verified_by = updates.verifiedBy;
      updateData.verified_at = updates.verifiedAt || new Date().toISOString();
    }

    if (updates.notes) {
      updateData.notes = updates.notes;
    }

    const { data, error } = await supabase
      .from('disease_scans')
      .update(updateData)
      .eq('id', scanId)
      .select()
      .single();

    if (error) {
      console.error('Error updating disease scan:', error);
      return { success: false, error };
    }

    return { success: true, data: mapDbScanToDiseaseScan(data) };
  } catch (error) {
    console.error('Error updating disease scan:', error);
    return { success: false, error };
  }
}

/**
 * Delete a disease scan
 */
export async function deleteDiseaseScan(
  scanId: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('disease_scans')
      .delete()
      .eq('id', scanId);

    if (error) {
      console.error('Error deleting disease scan:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting disease scan:', error);
    return { success: false, error };
  }
}

/**
 * Get scan statistics for a user
 */
export async function getUserScanStats(
  userId: string
): Promise<{
  success: boolean;
  data?: {
    totalScans: number;
    verifiedScans: number;
    severityBreakdown: {
      low: number;
      medium: number;
      high: number;
    };
    recentScans: DiseaseScan[];
  };
  error?: any;
}> {
  try {
    // Get all scans for user
    const { data: scans, error } = await supabase
      .from('disease_scans')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting scan stats:', error);
      return { success: false, error };
    }

    // Calculate statistics
    const totalScans = scans.length;
    const verifiedScans = scans.filter((s) => s.verified_by).length;
    const severityBreakdown = {
      low: scans.filter((s) => s.severity === 'low').length,
      medium: scans.filter((s) => s.severity === 'medium').length,
      high: scans.filter((s) => s.severity === 'high').length,
    };

    // Get 5 most recent scans
    const recentScans = scans
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(mapDbScanToDiseaseScan);

    return {
      success: true,
      data: {
        totalScans,
        verifiedScans,
        severityBreakdown,
        recentScans,
      },
    };
  } catch (error) {
    console.error('Error getting scan stats:', error);
    return { success: false, error };
  }
}

/**
 * Search disease scans by disease name
 */
export async function searchDiseaseScans(
  userId: string,
  searchTerm: string
): Promise<{ success: boolean; data?: DiseaseScan[]; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('disease_scans')
      .select('*')
      .eq('user_id', userId)
      .ilike('disease_name', `%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error searching disease scans:', error);
      return { success: false, error };
    }

    return { success: true, data: data.map(mapDbScanToDiseaseScan) };
  } catch (error) {
    console.error('Error searching disease scans:', error);
    return { success: false, error };
  }
}

/**
 * Get scans that need verification (for extension officers)
 */
export async function getUnverifiedScans(
  limit: number = 20
): Promise<{ success: boolean; data?: DiseaseScan[]; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('disease_scans')
      .select('*')
      .is('verified_by', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting unverified scans:', error);
      return { success: false, error };
    }

    return { success: true, data: data.map(mapDbScanToDiseaseScan) };
  } catch (error) {
    console.error('Error getting unverified scans:', error);
    return { success: false, error };
  }
}

/**
 * Map database record to DiseaseScan type
 */
function mapDbScanToDiseaseScan(dbScan: any): DiseaseScan {
  return {
    id: dbScan.id,
    userId: dbScan.user_id,
    imageUrl: dbScan.image_url,
    voiceNoteUrl: dbScan.voice_note_url,
    diseaseName: dbScan.disease_name,
    localizedName: dbScan.localized_name,
    confidence: dbScan.confidence,
    severity: dbScan.severity,
    treatment: dbScan.treatment,
    verifiedBy: dbScan.verified_by,
    verifiedAt: dbScan.verified_at,
    createdAt: dbScan.created_at,
  };
}

/**
 * Convert DiseaseResult to CreateScanInput
 */
export function diseaseResultToScanInput(
  result: DiseaseResult,
  userId: string,
  cropType?: string
): CreateScanInput {
  return {
    userId,
    imageUrl: result.imageUrl || '',
    voiceNoteUrl: result.voiceNoteUrl,
    diseaseName: result.disease,
    localizedName: result.localizedName,
    confidence: result.confidence,
    severity: result.severity,
    treatment: result.treatment,
    cropType,
  };
}

// Made with Bob
