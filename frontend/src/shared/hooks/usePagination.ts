import { useState, useMemo, useCallback } from 'react';

interface UsePaginationProps {
  data: any[];
  itemsPerPage?: number;
  initialPage?: number;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function usePagination({
  data,
  itemsPerPage = 10,
  initialPage = 1,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(itemsPerPage);

  const paginationState: PaginationState = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, totalItems);

    return {
      currentPage,
      itemsPerPage: perPage,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }, [data.length, currentPage, perPage]);

  const paginatedData = useMemo(() => {
    return data.slice(paginationState.startIndex, paginationState.endIndex);
  }, [data, paginationState.startIndex, paginationState.endIndex]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.min(Math.max(1, page), paginationState.totalPages);
    setCurrentPage(validPage);
  }, [paginationState.totalPages]);

  const nextPage = useCallback(() => {
    if (paginationState.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationState.hasNextPage]);

  const previousPage = useCallback(() => {
    if (paginationState.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationState.hasPreviousPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(paginationState.totalPages);
  }, [paginationState.totalPages]);

  const setPageSize = useCallback((size: number) => {
    setPerPage(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPerPage(itemsPerPage);
  }, [initialPage, itemsPerPage]);

  // Generate page numbers for pagination component
  const getPageNumbers = useCallback((maxVisible = 5) => {
    const { totalPages } = paginationState;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [paginationState, currentPage]);

  return {
    ...paginationState,
    paginatedData,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
    reset,
    getPageNumbers,
  };
}

// Hook for server-side pagination
interface UseServerPaginationProps {
  fetchData: (page: number, limit: number, params?: any) => Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }>;
  initialPage?: number;
  initialLimit?: number;
  params?: any;
}

export function useServerPagination({
  fetchData,
  initialPage = 1,
  initialLimit = 10,
  params,
}: UseServerPaginationProps) {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null as string | null,
    currentPage: initialPage,
    limit: initialLimit,
    total: 0,
  });

  const load = useCallback(async (page = state.currentPage, limit = state.limit) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await fetchData(page, limit, params);
      setState(prev => ({
        ...prev,
        data: result.data,
        total: result.total,
        currentPage: result.page,
        limit: result.limit,
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch data',
        loading: false,
      }));
    }
  }, [fetchData, params, state.currentPage, state.limit]);

  const goToPage = useCallback((page: number) => {
    load(page, state.limit);
  }, [load, state.limit]);

  const setPageSize = useCallback((limit: number) => {
    load(1, limit);
  }, [load]);

  const refresh = useCallback(() => {
    load(state.currentPage, state.limit);
  }, [load, state.currentPage, state.limit]);

  const totalPages = Math.ceil(state.total / state.limit);

  return {
    ...state,
    totalPages,
    hasNextPage: state.currentPage < totalPages,
    hasPreviousPage: state.currentPage > 1,
    load,
    goToPage,
    setPageSize,
    refresh,
    nextPage: () => goToPage(state.currentPage + 1),
    previousPage: () => goToPage(state.currentPage - 1),
  };
} 