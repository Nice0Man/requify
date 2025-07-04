import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { apiClient, type ApiResponse } from "@/shared/api/client";

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

export const useApi = <T = any>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<ApiResponse<T>>, options?: UseApiOptions) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiCall();
        const data = response.data;
        setState({ data, loading: false, error: null });

        if (options?.showSuccessToast && options?.successMessage) {
          toast.success(options.successMessage);
        }

        if (options?.onSuccess) {
          options.onSuccess(data);
        }

        return data;
      } catch (error: any) {
        const errorMessage = error?.message || "Произошла ошибка";
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));

        if (options?.showErrorToast !== false) {
          toast.error(errorMessage);
        }

        if (options?.onError) {
          options.onError(error);
        }

        throw error;
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
};

// Specialized hook for CRUD operations using ApiClient
export function useCrudApi<T = any>(baseUrl: string) {
  const createApi = useApi<T>();
  const updateApi = useApi<T>();
  const deleteApi = useApi<void>();
  const fetchApi = useApi<T>();
  const listApi = useApi<T[]>();

  const create = useCallback(
    (data: Partial<T>, options?: UseApiOptions) => {
      return createApi.execute(() => apiClient.post<T>(baseUrl, data), {
        showSuccessToast: true,
        successMessage: "Created successfully",
        ...options,
      });
    },
    [baseUrl, createApi]
  );

  const update = useCallback(
    (id: string | number, data: Partial<T>, options?: UseApiOptions) => {
      return updateApi.execute(
        () => apiClient.put<T>(`${baseUrl}/${id}`, data),
        {
          showSuccessToast: true,
          successMessage: "Updated successfully",
          ...options,
        }
      );
    },
    [baseUrl, updateApi]
  );

  const remove = useCallback(
    (id: string | number, options?: UseApiOptions) => {
      return deleteApi.execute(
        () => apiClient.delete<void>(`${baseUrl}/${id}`),
        {
          showSuccessToast: true,
          successMessage: "Deleted successfully",
          ...options,
        }
      );
    },
    [baseUrl, deleteApi]
  );

  const fetchById = useCallback(
    (id: string | number, options?: UseApiOptions) => {
      return fetchApi.execute(
        () => apiClient.get<T>(`${baseUrl}/${id}`),
        options
      );
    },
    [baseUrl, fetchApi]
  );

  const fetchAll = useCallback(
    (params?: Record<string, any>, options?: UseApiOptions) => {
      return listApi.execute(
        () => apiClient.get<T[]>(baseUrl, { params }),
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
