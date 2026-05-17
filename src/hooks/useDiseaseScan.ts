import { useState, useCallback } from 'react';
import {
  createDiseaseScan,
  getUserDiseaseScans,
  getDiseaseScanById,
  updateDiseaseScan,
  deleteDiseaseScan,
  getUserScanStats,
  searchDiseaseScans,
  CreateScanInput,
  UpdateScanInput,
  ScanFilters,
} from '../services/diseaseDbService';
import { DiseaseScan } from '../types';

/**
 * Hook for managing disease scan operations
 */
export function useDiseaseScan() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scans, setScans] = useState<DiseaseScan[]>([]);
  const [currentScan, setCurrentScan] = useState<DiseaseScan | null>(null);
  const [total, setTotal] = useState(0);

  /**
   * Create a new disease scan
   */
  const createScan = useCallback(async (input: CreateScanInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createDiseaseScan(input);

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to create scan');
      }

      setCurrentScan(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create scan';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get a single scan by ID
   */
  const getScan = useCallback(async (scanId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getDiseaseScanById(scanId);

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to get scan');
      }

      setCurrentScan(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get scan';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get user's scans with filters
   */
  const getScans = useCallback(async (filters: ScanFilters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserDiseaseScans(filters);

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to get scans');
      }

      setScans(result.data);
      setTotal(result.total || 0);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get scans';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update a scan (for verification)
   */
  const updateScan = useCallback(async (scanId: string, updates: UpdateScanInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateDiseaseScan(scanId, updates);

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to update scan');
      }

      setCurrentScan(result.data);
      
      // Update in scans list if present
      setScans((prev) =>
        prev.map((scan) => (scan.id === scanId ? result.data! : scan))
      );

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update scan';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a scan
   */
  const deleteScan = useCallback(async (scanId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteDiseaseScan(scanId);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete scan');
      }

      // Remove from scans list
      setScans((prev) => prev.filter((scan) => scan.id !== scanId));
      
      // Clear current scan if it was deleted
      if (currentScan?.id === scanId) {
        setCurrentScan(null);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete scan';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentScan]);

  /**
   * Search scans by disease name
   */
  const searchScans = useCallback(async (userId: string, searchTerm: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await searchDiseaseScans(userId, searchTerm);

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to search scans');
      }

      setScans(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search scans';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get user statistics
   */
  const getStats = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserScanStats(userId);

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to get stats');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get stats';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setScans([]);
    setCurrentScan(null);
    setTotal(0);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    // State
    isLoading,
    error,
    scans,
    currentScan,
    total,

    // Actions
    createScan,
    getScan,
    getScans,
    updateScan,
    deleteScan,
    searchScans,
    getStats,
    clearError,
    reset,
  };
}

/**
 * Hook for paginated scan list
 */
export function usePaginatedScans(userId: string, pageSize: number = 20) {
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { scans, total, isLoading, error, getScans } = useDiseaseScan();

  /**
   * Load scans for current page
   */
  const loadPage = useCallback(
    async (filters: Omit<ScanFilters, 'limit' | 'offset'> = {}) => {
      const offset = page * pageSize;
      const result = await getScans({
        ...filters,
        userId,
        limit: pageSize,
        offset,
      });

      setHasMore(offset + pageSize < total);
      return result;
    },
    [page, pageSize, userId, total, getScans]
  );

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore]);

  /**
   * Go to previous page
   */
  const previousPage = useCallback(() => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((pageNumber: number) => {
    setPage(pageNumber);
  }, []);

  /**
   * Reset to first page
   */
  const resetPagination = useCallback(() => {
    setPage(0);
    setHasMore(true);
  }, []);

  return {
    // State
    scans,
    isLoading,
    error,
    page,
    pageSize,
    total,
    hasMore,
    totalPages: Math.ceil(total / pageSize),

    // Actions
    loadPage,
    nextPage,
    previousPage,
    goToPage,
    resetPagination,
  };
}

// Made with Bob
