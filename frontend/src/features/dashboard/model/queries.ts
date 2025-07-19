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
      try {
        // Enhanced safety checks for TanStack Query edge cases
        if (!lastPage || typeof lastPage !== "object" || !lastPage.hasMore) {
          return undefined;
        }

        // Ensure allPages is a valid array with comprehensive checks
        if (
          !allPages ||
          typeof allPages !== "object" ||
          !Array.isArray(allPages) ||
          typeof allPages.length !== "number"
        ) {
          console.warn(
            "getNextPageParam: allPages is not a valid array, returning 0",
            { allPages: typeof allPages, isArray: Array.isArray(allPages) }
          );
          return 0;
        }

        const pagesLength = allPages.length;
        if (pagesLength === 0) {
          console.warn("getNextPageParam: allPages is empty, returning 0");
          return 0;
        }

        return pagesLength;
      } catch (error) {
        console.error("getNextPageParam error:", error, {
          lastPage: typeof lastPage,
          allPages: typeof allPages,
          isArrayAllPages: Array.isArray(allPages),
        });
        return undefined;
      }
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

// System Metrics Query - for detailed system performance data
export const useSystemMetrics = (
  options?: Omit<
    UseQueryOptions<
      {
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
        networkLatency: number;
        uptime: number;
        activeUsers: number;
        responseTime: number;
        errorRate: number;
        throughput: number;
        availability: number;
      },
      Error,
      {
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
        networkLatency: number;
        uptime: number;
        activeUsers: number;
        responseTime: number;
        errorRate: number;
        throughput: number;
        availability: number;
      },
      ["dashboard", "system-metrics"]
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["dashboard", "system-metrics"] as const,
    queryFn: DashboardApi.getSystemMetrics,
    staleTime: 30 * 1000, // 30 секунд
    gcTime: 2 * 60 * 1000, // 2 минуты
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
    refetchIntervalInBackground: false, // Не обновляем в фоне
    retry: (failureCount, error: any) => {
      // Не повторяем при 404 или 401 (возможно нет доступа к admin endpoints)
      if (
        error?.status === 404 ||
        error?.status === 401 ||
        error?.status === 403
      ) {
        return false;
      }
      return failureCount < 2; // Меньше попыток для системных метрик
    },
    throwOnError: false,
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
