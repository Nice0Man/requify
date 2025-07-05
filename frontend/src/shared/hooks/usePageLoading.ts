import { useState, useEffect, useCallback } from 'react';

interface UsePageLoadingOptions {
  initialLoading?: boolean;
  minLoadingTime?: number; // Minimum time to show loading (in ms)
}

interface UsePageLoadingReturn {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

export const usePageLoading = (
  options: UsePageLoadingOptions = {}
): UsePageLoadingReturn => {
  const { initialLoading = false, minLoadingTime = 500 } = options;
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    if (loading) {
      setLoadingStartTime(Date.now());
      setIsLoading(true);
    } else {
      const currentTime = Date.now();
      const elapsedTime = loadingStartTime ? currentTime - loadingStartTime : 0;
      
      if (elapsedTime < minLoadingTime) {
        // Wait for minimum loading time
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStartTime(null);
        }, minLoadingTime - elapsedTime);
      } else {
        setIsLoading(false);
        setLoadingStartTime(null);
      }
    }
  }, [minLoadingTime, loadingStartTime]);

  const startLoading = useCallback(() => {
    setLoading(true);
  }, [setLoading]);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      try {
        setLoading(true);
        const result = await asyncFn();
        return result;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  return {
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
};

// Hook for managing multiple loading states
export const useMultipleLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingStates[key] || false;
    }
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const withLoading = useCallback(
    async <T>(key: string, asyncFn: () => Promise<T>): Promise<T> => {
      try {
        setLoading(key, true);
        const result = await asyncFn();
        return result;
      } finally {
        setLoading(key, false);
      }
    },
    [setLoading]
  );

  return {
    loadingStates,
    setLoading,
    isLoading,
    withLoading,
  };
};

// Hook for managing loading with error handling
export const useAsyncLoading = <T = any>() => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
  };
}; 