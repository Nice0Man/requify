import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Утилиты для работы с кэшем React Query
 */
export const useQueryUtils = () => {
  const queryClient = useQueryClient();

  /**
   * Инвалидация запросов по ключу
   */
  const invalidateQueries = useCallback((queryKey: string[]) => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient]);

  /**
   * Предварительная загрузка данных
   */
  const prefetchQuery = useCallback((queryKey: string[], queryFn: () => Promise<any>) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 5 * 60 * 1000, // 5 минут
    });
  }, [queryClient]);

  /**
   * Установка данных в кэш
   */
  const setQueryData = useCallback((queryKey: string[], data: any) => {
    return queryClient.setQueryData(queryKey, data);
  }, [queryClient]);

  /**
   * Получение данных из кэша
   */
  const getQueryData = useCallback(<T>(queryKey: string[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  }, [queryClient]);

  /**
   * Удаление запроса из кэша
   */
  const removeQuery = useCallback((queryKey: string[]) => {
    return queryClient.removeQueries({ queryKey });
  }, [queryClient]);

  /**
   * Очистка всего кэша
   */
  const clearCache = useCallback(() => {
    return queryClient.clear();
  }, [queryClient]);

  /**
   * Обновление данных в кэше с оптимистическим обновлением
   */
  const updateQueryData = useCallback(<T>(
    queryKey: string[],
    updater: (oldData: T | undefined) => T
  ) => {
    return queryClient.setQueryData<T>(queryKey, updater);
  }, [queryClient]);

  /**
   * Инвалидация всех запросов, связанных с определенным префиксом
   */
  const invalidateQueriesByPrefix = useCallback((prefix: string) => {
    return queryClient.invalidateQueries({ 
      predicate: (query) => query.queryKey[0] === prefix 
    });
  }, [queryClient]);

  return {
    invalidateQueries,
    prefetchQuery,
    setQueryData,
    getQueryData,
    removeQuery,
    clearCache,
    updateQueryData,
    invalidateQueriesByPrefix,
  };
};

/**
 * Хук для оптимистических обновлений
 */
export const useOptimisticUpdate = () => {
  const { updateQueryData, invalidateQueries } = useQueryUtils();

  const performOptimisticUpdate = useCallback(<T>(
    queryKey: string[],
    optimisticData: T,
    onError?: () => void
  ) => {
    // Сохраняем предыдущие данные
    const previousData = updateQueryData<T>(queryKey, () => optimisticData);

    // Возвращаем функцию для отката изменений
    return {
      rollback: () => {
        if (previousData !== undefined) {
          updateQueryData<T>(queryKey, () => previousData);
        }
      },
      invalidate: () => {
        invalidateQueries(queryKey);
      },
    };
  }, [updateQueryData, invalidateQueries]);

  return { performOptimisticUpdate };
};

/**
 * Хук для работы с пагинацией
 */
export const usePaginatedQuery = () => {
  const { prefetchQuery } = useQueryUtils();

  const prefetchNextPage = useCallback((
    baseQueryKey: string[],
    currentPage: number,
    queryFn: (page: number) => Promise<any>
  ) => {
    const nextPage = currentPage + 1;
    const nextPageQueryKey = [...baseQueryKey, nextPage];
    
    return prefetchQuery(nextPageQueryKey, () => queryFn(nextPage));
  }, [prefetchQuery]);

  return { prefetchNextPage };
};

/**
 * Хук для синхронизации данных в реальном времени
 */
export const useRealTimeSync = () => {
  const { invalidateQueries } = useQueryUtils();

  const syncData = useCallback((queryKeys: string[][]) => {
    return Promise.all(
      queryKeys.map(queryKey => invalidateQueries(queryKey))
    );
  }, [invalidateQueries]);

  return { syncData };
}; 
