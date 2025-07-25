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
  dashboardApi,
  type DashboardStats,
  type ActivityResponse,
  type ActivityFilters,
  type SystemHealth,
  type MetricsFilters,
  type DashboardPreferences,
  type DashboardLayout,
  type ChartData,
  type TimelineDataPoint,
  type DistributionDataPoint,
  type DashboardSystemMetrics,
} from "@/entities/dashboard";
import type { ActivityItem } from "@/shared/types/activity";
import type { QuickAction } from "@/features/actions";

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
    queryFn: () => dashboardApi.getStats(filters),
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
        const response = await dashboardApi.getActivity({
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
        return lastPage.page; // номер следующей страницы
      }

      // Безопасный fallback: проверяем существование и тип allPages
      if (allPages && Array.isArray(allPages) && allPages.length > 0) {
        return allPages.length;
      }

      // Последний вариант: если ничего не доступно, начинаем с первой страницы
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
        const response = await dashboardApi.getActivity({
          ...filters,
          limit: filters?.limit || 10,
        });

        // Проверяем, что у нас есть валидная структура ответа с массивом data
        if (response && Array.isArray(response.data)) {
          return response.data;
        }

        // Fallback если структура ответа неверная
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
    queryFn: async (): Promise<QuickAction[]> => {
      try {
        // TODO: Реализовать getQuickActions в DashboardApi
        console.warn("getQuickActions not implemented in DashboardApi");
        return [];
      } catch (error) {
        console.warn("Failed to fetch quick actions:", error);
        return [];
      }
    },
    staleTime: 30 * 60 * 1000, // 30 минут
    gcTime: 60 * 60 * 1000, // 1 час
    throwOnError: false,
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
    queryFn: async (): Promise<SystemHealth> => {
      try {
        return await dashboardApi.getSystemHealth();
      } catch (error) {
        console.warn("Failed to fetch system health:", error);
        // Возвращаем fallback объект
        return {
          status: "error",
          uptime: 0,
          responseTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          diskUsage: 0,
          services: [],
          lastCheck: new Date().toISOString(),
          activeUsers: 0,
        } as SystemHealth;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 минута
    gcTime: 5 * 60 * 1000, // 5 минут
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
    refetchIntervalInBackground: false, // Не обновляем в фоне
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
    queryFn: async () => {
      try {
        // TODO: Реализовать getAdminSystemInfo в DashboardApi
        console.warn("getAdminSystemInfo not implemented in DashboardApi");
        return {};
      } catch (error) {
        console.warn("Failed to fetch admin system info:", error);
        return {};
      }
    },
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
    queryFn: async () => {
      try {
        // TODO: Реализовать getAdminHealth в DashboardApi
        console.warn("getAdminHealth not implemented in DashboardApi");
        return {};
      } catch (error) {
        console.warn("Failed to fetch admin health:", error);
        return {};
      }
    },
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
    queryFn: async (): Promise<DashboardPreferences> => {
      try {
        return await dashboardApi.getPreferences();
      } catch (error) {
        console.warn("Failed to fetch dashboard preferences:", error);
        // Возвращаем fallback объект
        return {
          layout: "grid",
          density: "comfortable",
          theme: "light",
          widgets: {
            order: [],
            hidden: [],
            sizes: {},
          },
          autoRefresh: true,
          refreshInterval: 30000,
        } as DashboardPreferences;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 30 * 60 * 1000, // 30 минут
    throwOnError: false,
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
    queryFn: async (): Promise<DashboardLayout[]> => {
      try {
        // TODO: Реализовать getLayouts в DashboardApi
        console.warn("getLayouts not implemented in DashboardApi");
        return [];
      } catch (error) {
        console.warn("Failed to fetch dashboard layouts:", error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 30 * 60 * 1000, // 30 минут
    throwOnError: false,
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
    queryFn: async () => {
      try {
        // TODO: Реализовать getOverview в DashboardApi
        console.warn("getOverview not implemented in DashboardApi");
        return {
          stats: {} as DashboardStats,
          recentActivity: [],
          quickActions: [],
          systemHealth: {} as SystemHealth,
        };
      } catch (error) {
        console.warn("Failed to fetch dashboard overview:", error);
        return {
          stats: {} as DashboardStats,
          recentActivity: [],
          quickActions: [],
          systemHealth: {} as SystemHealth,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 15 * 60 * 1000, // 15 минут
    throwOnError: false,
    ...options,
  });
};

// Mutation Hooks - с оптимистичными обновлениями
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
    mutationFn: async (
      preferences: Partial<DashboardPreferences>
    ): Promise<DashboardPreferences> => {
      try {
        // TODO: Реализовать updatePreferences в DashboardApi
        console.warn("updatePreferences not implemented in DashboardApi");
        return preferences as DashboardPreferences;
      } catch (error) {
        console.error("Failed to update preferences:", error);
        throw error;
      }
    },
    // Оптимистичное обновление
    onMutate: async (
      newPreferences
    ): Promise<{ previousPreferences: DashboardPreferences | undefined }> => {
      // Отменяем исходящие запросы для предпочтений
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
    // Если мутация не удалась, откатываем оптимистичное обновление
    onError: (err, newPreferences, context) => {
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          dashboardKeys.preferences(),
          context.previousPreferences
        );
      }
    },
    // Всегда обновляем данные после мутации
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
    mutationFn: async (
      layout: Omit<DashboardLayout, "id" | "createdAt" | "updatedAt">
    ): Promise<DashboardLayout> => {
      try {
        // TODO: Реализовать saveLayout в DashboardApi
        console.warn("saveLayout not implemented in DashboardApi");
        const savedLayout: DashboardLayout = {
          ...layout,
          id: `layout-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return savedLayout;
      } catch (error) {
        console.error("Failed to save layout:", error);
        throw error;
      }
    },
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
    mutationFn: async ({ layoutId, updates }): Promise<DashboardLayout> => {
      try {
        // TODO: Реализовать updateLayout в DashboardApi
        console.warn("updateLayout not implemented in DashboardApi");
        const updatedLayout: DashboardLayout = {
          id: layoutId,
          name: "Updated Layout",
          description: "Updated layout description",
          widgets: [],
          isDefault: false,
          createdBy: "system",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...updates,
        };
        return updatedLayout;
      } catch (error) {
        console.error("Failed to update layout:", error);
        throw error;
      }
    },
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
    mutationFn: async (layoutId: string): Promise<void> => {
      try {
        // TODO: Реализовать deleteLayout в DashboardApi
        console.warn("deleteLayout not implemented in DashboardApi");
        console.log(`Layout ${layoutId} would be deleted`);
        // Симулируем успешное удаление
        return Promise.resolve();
      } catch (error) {
        console.error("Failed to delete layout:", error);
        throw error;
      }
    },
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
    mutationFn: async (): Promise<void> => {
      // Простая заглушка для обновления - обновляем все dashboard queries
      console.log("Dashboard refresh triggered");
      // Не возвращаем ничего, так как тип void
    },
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
    mutationFn: async (format: "json" | "csv" | "pdf"): Promise<Blob> => {
      try {
        // Простая заглушка для exportData
        console.log("Dashboard export triggered:", format);
        // Возвращаем пустой Blob чтобы соответствовать типу
        return new Blob([""], { type: "text/plain" });
      } catch (error) {
        console.error("Failed to export dashboard data:", error);
        throw error;
      }
    },
    ...options,
  });
};

// Утилитарные хуки для управления кэшем
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
        queryFn: () => dashboardApi.getStats(filters),
        staleTime: 5 * 60 * 1000,
      }),
    prefetchActivity: (filters?: ActivityFilters) =>
      queryClient.prefetchQuery({
        queryKey: dashboardKeys.activity(filters),
        queryFn: async () => {
          const response = await dashboardApi.getActivity({
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
    queryFn: async (): Promise<ChartData> => {
      try {
        return await dashboardApi.getChartData(filters);
      } catch (error) {
        console.warn("Failed to fetch chart data:", error);
        // Возвращаем fallback данные
        return {
          labels: [],
          datasets: [],
        } as ChartData;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 минуты - данные графиков изменяются реже
    gcTime: 10 * 60 * 1000, // 10 минут
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.status === 404 || error?.status === 401) {
        return false;
      }
      return failureCount < 2; // Меньше повторов для данных графиков
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
    queryFn: async (): Promise<TimelineDataPoint[]> => {
      try {
        return await dashboardApi.getTimelineData(filters);
      } catch (error) {
        console.warn("Failed to fetch timeline data:", error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 10 * 60 * 1000, // 10 минут
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
    queryFn: async (): Promise<DistributionDataPoint[]> => {
      try {
        return await dashboardApi.getDistributionData(filters);
      } catch (error) {
        console.warn("Failed to fetch distribution data:", error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 10 * 60 * 1000, // 10 минут
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
      DashboardSystemMetrics,
      Error,
      DashboardSystemMetrics,
      ReturnType<typeof dashboardKeys.systemMetrics>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: dashboardKeys.systemMetrics(),
    queryFn: async (): Promise<DashboardSystemMetrics> => {
      try {
        return await dashboardApi.getSystemMetrics();
      } catch (error) {
        console.warn("Failed to fetch system metrics:", error);
        // Возвращаем fallback данные
        return {
          cpu: { usage: 0, cores: 1 },
          memory: { used: 0, total: 0 },
          disk: { used: 0, total: 0 },
          network: { in: 0, out: 0 },
        } as DashboardSystemMetrics;
      }
    },
    staleTime: 30 * 1000, // 30 секунд - системные метрики изменяются часто
    gcTime: 5 * 60 * 1000, // 5 минут
    refetchInterval: 30 * 1000, // Автообновление каждые 30 секунд
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      // Не повторяем при ошибках авторизации (401/403) или not found (404)
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
      return failureCount < 2; // Уменьшенные повторы для системных метрик
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    throwOnError: false,
    ...options,
  });
};
