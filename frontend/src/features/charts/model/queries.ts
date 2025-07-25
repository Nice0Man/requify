/**
 * Charts Data Queries - React Query hooks for dashboard chart data
 *
 * This module provides typed React Query hooks for fetching chart data from various API endpoints.
 * All queries include error handling, caching, and retry logic.
 *
 * Available Endpoints:
 * 1. Projects Distribution: /api/v1/dashboard/projects/stats
 * 2. Requirements Timeline: /api/v1/dashboard/requirements/stats
 * 3. Team Workload: /api/v1/teams/stats/overview
 * 4. Project Progress: /api/v1/dashboard/projects/recent
 *
 * Common Query Parameters:
 * - period: Time period filter ('7d', '30d', '90d', '1y')
 * - status: Entity status filter
 * - team_id: Team filter
 * - user_id/assignee_id/owner_id: User filter
 * - page/limit: Pagination
 * - sort/order: Sorting
 *
 * @author Requify Frontend Team
 * @version 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
// App Layer (провайдеры разрешены в features)
import { client, apiUtils } from "@/app/providers/client";
import type {
  TimelineDataPoint,
  DistributionDataPoint,
} from "@/entities/dashboard/model/types";
import { API_ENDPOINTS } from "@/shared/api/endpoints";

// Типы для данных графиков
export interface ChartDataItem {
  id: string;
  label: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

// Константы для кэширования
const CHARTS_STALE_TIME = 5 * 60 * 1000; // 5 минут
const CHARTS_CACHE_TIME = 10 * 60 * 1000; // 10 минут

export const chartsKeys = {
  all: ["charts"] as const,
  timeline: () => [...chartsKeys.all, "timeline"] as const,
  distribution: () => [...chartsKeys.all, "distribution"] as const,
  trends: () => [...chartsKeys.all, "trends"] as const,
  metrics: () => [...chartsKeys.all, "metrics"] as const,
};

/**
 * Хук для получения данных timeline графика
 */
export const useTimelineData = () => {
  return useQuery({
    queryKey: chartsKeys.timeline(),
    queryFn: async (): Promise<TimelineDataPoint[]> => {
      try {
        // Проверяем нужно ли обновить токен
        if (apiUtils.tokens.shouldRefresh()) {
          console.debug(
            "🔄 Charts: Auto-refreshing token before timeline request"
          );
          // Токен будет автоматически обновлен в interceptors
        }

        const response = await client.get(
          API_ENDPOINTS.DASHBOARD.CHARTS.TIMELINE
        );
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch timeline data:", error);
        throw error;
      }
    },
    enabled: apiUtils.isAuthenticated(),
    staleTime: CHARTS_STALE_TIME,
    gcTime: CHARTS_CACHE_TIME,
    retry: 2,
  });
};

/**
 * Хук для получения данных distribution графика
 */
export const useDistributionData = () => {
  return useQuery({
    queryKey: chartsKeys.distribution(),
    queryFn: async (): Promise<DistributionDataPoint[]> => {
      try {
        // Проверяем нужно ли обновить токен
        if (apiUtils.tokens.shouldRefresh()) {
          console.debug(
            "🔄 Charts: Auto-refreshing token before distribution request"
          );
          // Токен будет автоматически обновлен в interceptors
        }

        const response = await client.get(
          API_ENDPOINTS.DASHBOARD.CHARTS.DISTRIBUTION
        );
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch distribution data:", error);
        throw error;
      }
    },
    enabled: oauth2API.isAuthenticated(),
    staleTime: CHARTS_STALE_TIME,
    gcTime: CHARTS_CACHE_TIME,
    retry: 2,
  });
};

/**
 * Хук для получения данных trends графика
 */
export const useTrendsData = () => {
  return useQuery({
    queryKey: chartsKeys.trends(),
    queryFn: async (): Promise<ChartDataItem[]> => {
      try {
        // Проверяем нужно ли обновить токен
        if (oauth2API.shouldRefreshToken()) {
          console.debug(
            "🔄 Charts: Auto-refreshing token before trends request"
          );
          await oauth2API.autoRefreshToken();
        }

        const response = await client.get(
          API_ENDPOINTS.DASHBOARD.CHARTS.PROJECT_TRENDS
        );
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch trends data:", error);
        throw error;
      }
    },
    enabled: oauth2API.isAuthenticated(),
    staleTime: CHARTS_STALE_TIME,
    gcTime: CHARTS_CACHE_TIME,
    retry: 2,
  });
};

/**
 * Хук для получения метрик
 */
export const useMetricsData = () => {
  return useQuery({
    queryKey: chartsKeys.metrics(),
    queryFn: async (): Promise<ChartDataItem[]> => {
      try {
        // Проверяем нужно ли обновить токен
        if (oauth2API.shouldRefreshToken()) {
          console.debug(
            "🔄 Charts: Auto-refreshing token before metrics request"
          );
          await oauth2API.autoRefreshToken();
        }

        const response = await client.get(
          API_ENDPOINTS.DASHBOARD.METRICS
        );
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch metrics data:", error);
        throw error;
      }
    },
    enabled: oauth2API.isAuthenticated(),
    staleTime: CHARTS_STALE_TIME,
    gcTime: CHARTS_CACHE_TIME,
    retry: 2,
  });
};

/**
 * Утилиты для работы с данными графиков
 */
export const chartUtils = {
  /**
   * Форматирует данные для временных графиков
   */
  formatTimelineData: (data: any[]): ChartDataItem[] => {
    return data.map((item) => ({
      id: item.id || item.date,
      label: item.label || item.date,
      value: Number(item.value || item.count || 0),
      category: item.category || "default",
      metadata: item.metadata || {},
    }));
  },

  /**
   * Форматирует данные для распределения
   */
  formatDistributionData: (data: any[]): ChartDataItem[] => {
    return data.map((item) => ({
      id: item.id || item.name,
      label: item.label || item.name,
      value: Number(item.value || item.percentage || 0),
      category: item.category || item.type || "default",
      metadata: item.metadata || {},
    }));
  },

  /**
   * Трансформирует данные распределения проектов для графиков
   */
  transformProjectsDistributionToChartData: (data: any[]): ChartDataItem[] => {
    if (!Array.isArray(data)) {
      console.warn("transformProjectsDistributionToChartData: data is not an array:", data);
      return [];
    }
    
    return data.map((item) => ({
      id: item.status || item.id,
      label: item.status_label || item.label || item.status,
      value: Number(item.count || item.value || 0),
      category: "project_status",
      metadata: {
        status: item.status,
        percentage: item.percentage,
        ...item
      },
    }));
  },

  /**
   * Трансформирует данные временной линии требований для графиков
   */
  transformRequirementsTimelineToChartData: (data: any[]): ChartDataItem[] => {
    if (!Array.isArray(data)) {
      console.warn("transformRequirementsTimelineToChartData: data is not an array:", data);
      return [];
    }
    
    return data.map((item) => ({
      id: item.date || item.id,
      label: item.date_label || item.label || item.date,
      value: Number(item.count || item.value || 0),
      category: "requirements_timeline",
      metadata: {
        date: item.date,
        type: item.type,
        ...item
      },
    }));
  },

  /**
   * Трансформирует данные нагрузки команды для графиков
   */
  transformTeamWorkloadToChartData: (data: any[]): ChartDataItem[] => {
    if (!Array.isArray(data)) {
      console.warn("transformTeamWorkloadToChartData: data is not an array:", data);
      return [];
    }
    
    return data.map((item) => ({
      id: item.team_id || item.id,
      label: item.team_name || item.label || item.name,
      value: Number(item.workload || item.value || 0),
      category: "team_workload",
      metadata: {
        teamId: item.team_id,
        memberCount: item.member_count,
        ...item
      },
    }));
  },

  /**
   * Трансформирует данные прогресса проектов для графиков
   */
  transformProjectProgressToChartData: (data: any[]): ChartDataItem[] => {
    if (!Array.isArray(data)) {
      console.warn("transformProjectProgressToChartData: data is not an array:", data);
      return [];
    }
    
    return data.map((item) => ({
      id: item.project_id || item.id,
      label: item.project_name || item.label || item.name,
      value: Number(item.progress || item.value || 0),
      category: "project_progress",
      metadata: {
        projectId: item.project_id,
        status: item.status,
        completion: item.completion,
        ...item
      },
    }));
  },

  /**
   * Агрегирует данные по категориям
   */
  aggregateByCategory: (data: ChartDataItem[]): ChartDataItem[] => {
    const aggregated = data.reduce((acc, item) => {
      const category = item.category || "default";

      if (!acc[category]) {
        acc[category] = {
          id: category,
          label: category,
          value: 0,
          category,
          metadata: {},
        };
      }

      acc[category].value += item.value;
      return acc;
    }, {} as Record<string, ChartDataItem>);

    return Object.values(aggregated);
  },

  /**
   * Сортирует данные по значению
   */
  sortByValue: (data: ChartDataItem[], desc = true): ChartDataItem[] => {
    return [...data].sort((a, b) =>
      desc ? b.value - a.value : a.value - b.value
    );
  },
};

// Алиасы для обратной совместимости
export const transformProjectsDistributionToChartData = chartUtils.transformProjectsDistributionToChartData;
export const transformRequirementsTimelineToChartData = chartUtils.transformRequirementsTimelineToChartData;
export const transformTeamWorkloadToChartData = chartUtils.transformTeamWorkloadToChartData;
export const transformProjectProgressToChartData = chartUtils.transformProjectProgressToChartData;

// Алиасы хуков для обратной совместимости
export const useProjectsDistribution = useDistributionData;
export const useRequirementsTimeline = useTimelineData;
export const useTeamWorkload = useTrendsData;
export const useProjectProgress = useMetricsData;
