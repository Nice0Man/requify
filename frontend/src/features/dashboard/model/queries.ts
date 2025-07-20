import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  InfiniteData,
} from "@tanstack/react-query";
import {
  DashboardApi,
  type DashboardStats,
  type ActivityResponse,
  type ActivityItem,
  type ActivityFilters,
  type QuickAction,
  type SystemHealth,
  type MetricsFilters,
  type DashboardPreferences,
  type DashboardLayout,
  type ChartData,
  type TimelineDataPoint,
  type DistributionDataPoint,
  type SystemMetrics,
} from "@/entities/dashboard";

// Query Keys Factory - лучшая практика для типизированных ключей
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: (filters?: MetricsFilters) =>
    ["dashboard", "stats", ...(filters ? [filters] : [])] as const,
  activity: (filters?: ActivityFilters) =>
    ["dashboard", "activity", ...(filters ? [filters] : [])] as const,
  quickActions: () => ["dashboard", "quick-actions"] as const,
  systemHealth: () => ["dashboard", "system-health"] as const,
  preferences: () => ["dashboard", "preferences"] as const,
  layouts: () => ["dashboard", "layouts"] as const,
  overview: (filters?: MetricsFilters) =>
    ["dashboard", "overview", ...(filters ? [filters] : [])] as const,
  // Chart data keys
  chartData: (filters?: MetricsFilters) =>
    ["dashboard", "chart-data", ...(filters ? [filters] : [])] as const,
  timelineData: (filters?: MetricsFilters) =>
    ["dashboard", "timeline", ...(filters ? [filters] : [])] as const,
  distributionData: (filters?: MetricsFilters) =>
    ["dashboard", "distribution", ...(filters ? [filters] : [])] as const,
  systemMetrics: () => ["dashboard", "system-metrics"] as const,
} as const;

// Legacy support
export const dashboardQueryKeys = dashboardKeys;

// Type-safe query options factory
type DashboardStatsQueryOptions = Omit<
  UseQueryOptions<
    DashboardStats,
    Error,
    DashboardStats,
    ReturnType<typeof dashboardKeys.stats>
  >,
  "queryKey" | "queryFn"
>;

type ActivityQueryOptions = Omit<
  UseQueryOptions<
    ActivityItem[],
    Error,
    ActivityItem[],
    ReturnType<typeof dashboardKeys.activity>
  >,
  "queryKey" | "queryFn"
>;

// Dashboard Stats Query Hook
export const useDashboardStats = (
  filters?: MetricsFilters,
  options?: DashboardStatsQueryOptions
) => {
  return useQuery({
    queryKey: dashboardKeys.stats(filters),
    queryFn: () => DashboardApi.getStats(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 15 * 60 * 1000, // 15 минут (renamed from cacheTime)
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      // Не повторяем при 404 или 401
      if (error?.status === 404 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    throwOnError: false, // Лучшая практика - обрабатывать ошибки в компонентах
    ...options,
  });
};

// Activity Feed with Infinite Scroll
export const useActivityFeed = (
  filters?: ActivityFilters,
  options?: Omit<
    UseInfiniteQueryOptions<
      ActivityResponse,
      Error,
      InfiniteData<ActivityResponse>,
      ReturnType<typeof dashboardKeys.activity>,
      number
    >,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) => {
  return useInfiniteQuery({
    queryKey: dashboardKeys.activity(filters),
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const pageSize = filters?.limit || 10;
        const response = await DashboardApi.getActivity({
          ...filters,
          offset: pageParam * pageSize, // страница * размер страницы
          limit: pageSize,
        });

        // Ensure we have valid response structure
        if (response && typeof response === "object") {
          return response;
        }

        // Fallback if response is invalid
        console.warn(
          "Invalid activity feed response structure, using fallback data"
        );
        return {
          data: [],
          total: 0,
          page: pageParam + 1,
          limit: pageSize,
          hasMore: false,
        };
      } catch (error) {
        console.warn(
          "Failed to fetch activity feed from API, using fallback data:",
          error
        );
        const pageSize = filters?.limit || 10;
        return {
          data: [],
          total: 0,
          page: pageParam + 1,
          limit: pageSize,
          hasMore: false,
        };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      // Безопасная проверка на undefined и null
      if (!lastPage || typeof lastPage !== "object") {
        return undefined;
      }

      // Если нет больше данных, останавливаем пагинацию
      if (!lastPage.hasMore) {
        return undefined;
      }

      // Используем page из lastPage
      if (lastPage.page && typeof lastPage.page === "number") {
        return lastPage.page; // next page number
      }

      // Безопасный fallback: проверяем allPages на существование и тип
      if (allPages && Array.isArray(allPages) && allPages.length > 0) {
        return allPages.length;
      }

      // Last resort: если ничего не доступно, начинаем с первой страницы
      return 1;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 10 * 60 * 1000, // 10 минут
    retry: (failureCount, error: any) => {
      // Не повторяем при 404 или 401
      if (error?.status === 404 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    throwOnError: false, // Лучшая практика - обрабатывать ошибки в компонентах
    ...options,
  });
};

// Recent Activity Query (без пагинации)
export const useRecentActivity = (
  filters?: ActivityFilters,
  options?: ActivityQueryOptions
) => {
  return useQuery({
    queryKey: dashboardKeys.activity(filters),
    queryFn: async (): Promise<ActivityItem[]> => {
      try {
        const response = await DashboardApi.getActivity({
          ...filters,
          limit: filters?.limit || 10,
        });

        // Ensure we have valid response structure with data array
        if (response && Array.isArray(response.data)) {
          return response.data;
        }

        // Fallback if response structure is invalid
        console.warn(
          "Invalid recent activity response structure, using fallback data"
        );
        return [];
      } catch (error) {
        console.warn(
          "Failed to fetch recent activity from API, using fallback data:",
          error
        );
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 10 * 60 * 1000, // 10 минут
    retry: (failureCount, error: any) => {
      // Не повторяем при 404 или 401
      if (error?.status === 404 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    throwOnError: false, // Лучшая практика - обрабатывать ошибки в компонентах
    ...options,
  });
};

// Алиас для обратной совместимости
export const useDashboardActivity = useRecentActivity;

// Quick Actions Query
export const useQuickActions = (
  options?: Omit<
    UseQueryOptions<
      QuickAction[],
      Error,
      QuickAction[],
      ReturnType<typeof dashboardKeys.quickActions>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: dashboardKeys.quickActions(),
    queryFn: DashboardApi.getQuickActions,
    staleTime: 30 * 60 * 1000, // 30 минут
    gcTime: 60 * 60 * 1000, // 1 час
    ...options,
  });
};

// System Health Query
export const useSystemHealth = (
  options?: Omit<
    UseQueryOptions<
      SystemHealth,
      Error,
      SystemHealth,
      ReturnType<typeof dashboardKeys.systemHealth>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: dashboardKeys.systemHealth(),
    queryFn: DashboardApi.getSystemHealth,
    staleTime: 1 * 60 * 1000, // 1 минута
    gcTime: 5 * 60 * 1000, // 5 минут
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
    refetchIntervalInBackground: false, // Не обновляем в фоне
    ...options,
  });
};

// Admin System Info Query
export const useAdminSystemInfo = (
  options?: Omit<
    UseQueryOptions<any, Error, any, ["dashboard", "admin-system-info"]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["dashboard", "admin-system-info"] as const,
    queryFn: DashboardApi.getAdminSystemInfo,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 15 * 60 * 1000, // 15 минут
    retry: (failureCount, error: any) => {
      if (
        error?.status === 404 ||
        error?.status === 401 ||
        error?.status === 403
      ) {
        return false;
      }
      return failureCount < 2;
    },
    throwOnError: false,
    ...options,
  });
};

// Admin Health Query
export const useAdminHealth = (
  options?: Omit<
    UseQueryOptions<any, Error, any, ["dashboard", "admin-health"]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["dashboard", "admin-health"] as const,
    queryFn: DashboardApi.getAdminHealth,
    staleTime: 1 * 60 * 1000, // 1 минута
    gcTime: 5 * 60 * 1000, // 5 минут
    refetchInterval: 60 * 1000, // Обновляем каждую минуту
    refetchIntervalInBackground: false,
    retry: (failureCount, error: any) => {
      if (
        error?.status === 404 ||
        error?.status === 401 ||
        error?.status === 403
      ) {
        return false;
      }
      return failureCount < 2;
    },
    throwOnError: false,
    ...options,
  });
};

// Dashboard Preferences Query
export const useDashboardPreferences = (
  options?: Omit<
    UseQueryOptions<
      DashboardPreferences,
      Error,
      DashboardPreferences,
      ReturnType<typeof dashboardKeys.preferences>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: dashboardKeys.preferences(),
    queryFn: DashboardApi.getPreferences,
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 30 * 60 * 1000, // 30 минут
    ...options,
  });
};

// Dashboard Layouts Query
export const useDashboardLayouts = (
  options?: Omit<
    UseQueryOptions<
      DashboardLayout[],
      Error,
      DashboardLayout[],
      ReturnType<typeof dashboardKeys.layouts>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: dashboardKeys.layouts(),
    queryFn: DashboardApi.getLayouts,
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 30 * 60 * 1000, // 30 минут
    ...options,
  });
};

// Dashboard Overview Query (комбинированный запрос)
export const useDashboardOverview = (
  filters?: MetricsFilters,
  options?: Omit<
    UseQueryOptions<
      {
        stats: DashboardStats;
        recentActivity: ActivityItem[];
        quickActions: QuickAction[];
        systemHealth: SystemHealth;
      },
      Error,
      {
        stats: DashboardStats;
        recentActivity: ActivityItem[];
        quickActions: QuickAction[];
        systemHealth: SystemHealth;
      },
      ReturnType<typeof dashboardKeys.overview>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: dashboardKeys.overview(filters),
    queryFn: () => DashboardApi.getOverview(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 15 * 60 * 1000, // 15 минут
    ...options,
  });
};

// Mutation Hooks - с optimistic updates
export const useUpdatePreferences = (
  options?: UseMutationOptions<
    DashboardPreferences,
    Error,
    Partial<DashboardPreferences>,
    { previousPreferences: DashboardPreferences | undefined }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DashboardApi.updatePreferences,
    // Optimistic update
    onMutate: async (
      newPreferences
    ): Promise<{ previousPreferences: DashboardPreferences | undefined }> => {
      // Отменяем исходящие запросы для preferences
      await queryClient.cancelQueries({
        queryKey: dashboardKeys.preferences(),
      });

      // Сохраняем предыдущее значение
      const previousPreferences =
        queryClient.getQueryData<DashboardPreferences>(
          dashboardKeys.preferences()
        );

      // Оптимистично обновляем кэш
      if (previousPreferences) {
        queryClient.setQueryData(dashboardKeys.preferences(), {
          ...previousPreferences,
          ...newPreferences,
        });
      }

      return { previousPreferences };
    },
    // Если мутация провалилась, откатываем оптимистичное обновление
    onError: (err, newPreferences, context) => {
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          dashboardKeys.preferences(),
          context.previousPreferences
        );
      }
    },
    // Всегда рефетчим данные после мутации
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.preferences() });
    },
    ...options,
  });
};

export const useSaveLayout = (
  options?: UseMutationOptions<
    DashboardLayout,
    Error,
    Omit<DashboardLayout, "id" | "createdAt" | "updatedAt">
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DashboardApi.saveLayout,
    onSuccess: (data) => {
      // Обновляем кэш layouts
      queryClient.setQueryData<DashboardLayout[]>(
        dashboardKeys.layouts(),
        (old) => (old ? [...old, data] : [data])
      );
    },
    ...options,
  });
};

export const useUpdateLayout = (
  options?: UseMutationOptions<
    DashboardLayout,
    Error,
    {
      layoutId: string;
      updates: Partial<Omit<DashboardLayout, "id" | "createdAt" | "updatedAt">>;
    }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ layoutId, updates }) =>
      DashboardApi.updateLayout(layoutId, updates),
    onSuccess: (data, variables) => {
      // Обновляем кэш layouts
      queryClient.setQueryData<DashboardLayout[]>(
        dashboardKeys.layouts(),
        (old) =>
          old?.map((layout) =>
            layout.id === variables.layoutId ? data : layout
          ) ?? [data]
      );
    },
    ...options,
  });
};

export const useDeleteLayout = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DashboardApi.deleteLayout,
    onSuccess: (_, deletedLayoutId) => {
      // Удаляем из кэша layouts
      queryClient.setQueryData<DashboardLayout[]>(
        dashboardKeys.layouts(),
        (old) => old?.filter((layout) => layout.id !== deletedLayoutId) ?? []
      );
    },
    ...options,
  });
};

export const useRefreshDashboard = (
  options?: UseMutationOptions<void, Error, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DashboardApi.refresh,
    onSuccess: () => {
      // Инвалидируем все dashboard кэши
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    ...options,
  });
};

export const useExportDashboardData = (
  options?: UseMutationOptions<Blob, Error, "json" | "csv" | "pdf">
) => {
  return useMutation({
    mutationFn: DashboardApi.exportData,
    ...options,
  });
};

// Utility hooks для работы с кэшем
export const useInvalidateDashboard = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
    invalidateStats: (filters?: MetricsFilters) =>
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats(filters) }),
    invalidateActivity: (filters?: ActivityFilters) =>
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.activity(filters),
      }),
    invalidateQuickActions: () =>
      queryClient.invalidateQueries({ queryKey: dashboardKeys.quickActions() }),
    invalidateSystemHealth: () =>
      queryClient.invalidateQueries({ queryKey: dashboardKeys.systemHealth() }),
  };
};

// Prefetch helpers для улучшения UX
export const usePrefetchDashboard = () => {
  const queryClient = useQueryClient();

  return {
    prefetchStats: (filters?: MetricsFilters) =>
      queryClient.prefetchQuery({
        queryKey: dashboardKeys.stats(filters),
        queryFn: () => DashboardApi.getStats(filters),
        staleTime: 5 * 60 * 1000,
      }),
    prefetchActivity: (filters?: ActivityFilters) =>
      queryClient.prefetchQuery({
        queryKey: dashboardKeys.activity(filters),
        queryFn: async () => {
          const response = await DashboardApi.getActivity({
            ...filters,
            limit: 10,
          });
          return response.data;
        },
        staleTime: 2 * 60 * 1000,
      }),
  };
};

// Типизированные хуки с переменными (для обратной совместимости)
export const useDashboardStatsWithFilters = (filters?: MetricsFilters) =>
  useDashboardStats(filters);

export const useActivityWithFilters = (filters?: ActivityFilters) =>
  useRecentActivity(filters);

export const useActivityFeedWithFilters = (filters?: ActivityFilters) =>
  useActivityFeed(filters);

export const useDashboardOverviewWithFilters = (filters?: MetricsFilters) =>
  useDashboardOverview(filters);

// Chart Data Hooks with TanStack Query best practices
export const useChartData = (
  filters?: MetricsFilters,
  options?: Omit<
    UseQueryOptions<
      ChartData,
      Error,
      ChartData,
      ReturnType<typeof dashboardKeys.chartData>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: dashboardKeys.chartData(filters),
    queryFn: () => DashboardApi.getChartData(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - chart data changes less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.status === 404 || error?.status === 401) {
        return false;
      }
      return failureCount < 2; // Less retries for chart data
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
    throwOnError: false,
    ...options,
  });
};

export const useTimelineData = (
  filters?: MetricsFilters,
  options?: Omit<
    UseQueryOptions<
      TimelineDataPoint[],
      Error,
      TimelineDataPoint[],
      ReturnType<typeof dashboardKeys.timelineData>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: dashboardKeys.timelineData(filters),
    queryFn: () => DashboardApi.getTimelineData(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
    throwOnError: false,
    ...options,
  });
};

export const useDistributionData = (
  filters?: MetricsFilters,
  options?: Omit<
    UseQueryOptions<
      DistributionDataPoint[],
      Error,
      DistributionDataPoint[],
      ReturnType<typeof dashboardKeys.distributionData>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: dashboardKeys.distributionData(filters),
    queryFn: () => DashboardApi.getDistributionData(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
    throwOnError: false,
    ...options,
  });
};

export const useSystemMetrics = (
  options?: Omit<
    UseQueryOptions<
      SystemMetrics,
      Error,
      SystemMetrics,
      ReturnType<typeof dashboardKeys.systemMetrics>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: dashboardKeys.systemMetrics(),
    queryFn: () => DashboardApi.getSystemMetrics(),
    staleTime: 30 * 1000, // 30 seconds - system metrics change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors (401/403) or not found (404)
      if (
        error?.status === 404 ||
        error?.response?.status === 404 ||
        error?.status === 401 ||
        error?.response?.status === 401 ||
        error?.status === 403 ||
        error?.response?.status === 403
      ) {
        return false;
      }
      return failureCount < 2; // Reduced retries for system metrics
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    throwOnError: false,
    ...options,
  });
};
