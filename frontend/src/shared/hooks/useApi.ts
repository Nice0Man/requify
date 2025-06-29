import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (
      apiCall: () => Promise<T>,
      options: UseApiOptions = {}
    ): Promise<T | null> => {
      const {
        showSuccessToast = false,
        showErrorToast = true,
        successMessage,
        onSuccess,
        onError,
      } = options;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiCall();
        setState({ data: result, loading: false, error: null });
        
        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        
        if (showErrorToast) {
          toast.error(errorMessage);
        }
        
        if (onError) {
          onError(error);
        }
        
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specialized hook for CRUD operations
export function useCrudApi<T = any>(baseUrl: string) {
  const createApi = useApi<T>();
  const updateApi = useApi<T>();
  const deleteApi = useApi<void>();
  const fetchApi = useApi<T>();
  const listApi = useApi<T[]>();

  const create = useCallback(
    (data: Partial<T>, options?: UseApiOptions) => {
      return createApi.execute(
        () => fetch(`${baseUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(res => res.json()),
        { showSuccessToast: true, successMessage: 'Created successfully', ...options }
      );
    },
    [baseUrl, createApi]
  );

  const update = useCallback(
    (id: string | number, data: Partial<T>, options?: UseApiOptions) => {
      return updateApi.execute(
        () => fetch(`${baseUrl}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(res => res.json()),
        { showSuccessToast: true, successMessage: 'Updated successfully', ...options }
      );
    },
    [baseUrl, updateApi]
  );

  const remove = useCallback(
    (id: string | number, options?: UseApiOptions) => {
      return deleteApi.execute(
        () => fetch(`${baseUrl}/${id}`, { method: 'DELETE' }).then(res => res.json()),
        { showSuccessToast: true, successMessage: 'Deleted successfully', ...options }
      );
    },
    [baseUrl, deleteApi]
  );

  const fetchById = useCallback(
    (id: string | number, options?: UseApiOptions) => {
      return fetchApi.execute(
        () => fetch(`${baseUrl}/${id}`).then(res => res.json()),
        options
      );
    },
    [baseUrl, fetchApi]
  );

  const fetchAll = useCallback(
    (params?: Record<string, any>, options?: UseApiOptions) => {
      const queryString = params ? new URLSearchParams(params).toString() : '';
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      
      return listApi.execute(
        () => fetch(url).then(res => res.json()),
        options
      );
    },
    [baseUrl, listApi]
  );

  return {
    create: { ...createApi, execute: create },
    update: { ...updateApi, execute: update },
    delete: { ...deleteApi, execute: remove },
    fetch: { ...fetchApi, execute: fetchById },
    list: { ...listApi, execute: fetchAll },
  };
} 