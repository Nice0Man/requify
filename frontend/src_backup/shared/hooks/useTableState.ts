import React, { useState, useCallback, useMemo } from 'react';

export interface TableState {
  page: number;
  pageSize: number;
  sortModel: Array<{ field: string; sort: 'asc' | 'desc' }>;
  search: string;
  showFilters: boolean;
}

export interface TableFilters {
  [key: string]: any;
}

export interface UseTableStateOptions<T extends TableFilters> {
  initialFilters?: T;
  initialPageSize?: number;
  onStateChange?: (state: TableState & { filters: T }) => void;
}

export interface UseTableStateReturn<T extends TableFilters> {
  // State
  page: number;
  pageSize: number;
  sortModel: Array<{ field: string; sort: 'asc' | 'desc' }>;
  search: string;
  showFilters: boolean;
  filters: T;
  
  // Actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSortModel: (sortModel: Array<{ field: string; sort: 'asc' | 'desc' }>) => void;
  setSearch: (search: string) => void;
  setShowFilters: (show: boolean) => void;
  setFilter: (key: keyof T, value: any) => void;
  setFilters: (filters: Partial<T>) => void;
  clearFilters: () => void;
  
  // Computed
  activeFiltersCount: number;
  hasActiveFilters: boolean;
}

export function useTableState<T extends TableFilters = TableFilters>({
  initialFilters,
  initialPageSize = 25,
  onStateChange,
}: UseTableStateOptions<T> = {}): UseTableStateReturn<T> {
  
  const [page, setPageState] = useState(0);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [sortModel, setSortModelState] = useState<Array<{ field: string; sort: 'asc' | 'desc' }>>([
    { field: 'created_at', sort: 'desc' }
  ]);
  const [search, setSearchState] = useState('');
  const [showFilters, setShowFiltersState] = useState(false);
  const [filters, setFiltersState] = useState<T>(initialFilters || {} as T);

  // Actions with callbacks
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setPageSize = useCallback((newPageSize: number) => {
    setPageSizeState(newPageSize);
    setPageState(0); // Reset to first page when changing page size
  }, []);

  const setSortModel = useCallback((newSortModel: Array<{ field: string; sort: 'asc' | 'desc' }>) => {
    setSortModelState(newSortModel);
    setPageState(0); // Reset to first page when changing sort
  }, []);

  const setSearch = useCallback((newSearch: string) => {
    setSearchState(newSearch);
    setPageState(0); // Reset to first page when searching
  }, []);

  const setShowFilters = useCallback((show: boolean) => {
    setShowFiltersState(show);
  }, []);

  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
    setPageState(0); // Reset to first page when filtering
  }, []);

  const setFilters = useCallback((newFilters: Partial<T>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPageState(0); // Reset to first page when filtering
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters || {} as T);
    setSearchState('');
    setPageState(0);
  }, [initialFilters]);

  // Computed values
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    
    Object.entries(filters).forEach(([_, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) count++;
        else if (!Array.isArray(value)) count++;
      }
    });
    
    return count;
  }, [search, filters]);

  const hasActiveFilters = useMemo(() => {
    return activeFiltersCount > 0;
  }, [activeFiltersCount]);

  // Call onChange callback when state changes
  const currentState = useMemo(() => ({
    page,
    pageSize,
    sortModel,
    search,
    showFilters,
    filters,
  }), [page, pageSize, sortModel, search, showFilters, filters]);

  // Effect to call onStateChange
  React.useEffect(() => {
    if (onStateChange) {
      onStateChange(currentState);
    }
  }, [currentState, onStateChange]);

  return {
    // State
    page,
    pageSize,
    sortModel,
    search,
    showFilters,
    filters,
    
    // Actions
    setPage,
    setPageSize,
    setSortModel,
    setSearch,
    setShowFilters,
    setFilter,
    setFilters,
    clearFilters,
    
    // Computed
    activeFiltersCount,
    hasActiveFilters,
  };
} 