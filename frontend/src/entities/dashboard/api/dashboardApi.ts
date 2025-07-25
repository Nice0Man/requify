import type {
  DashboardStats,
  ActivityFilters,
  SystemHealth,
  MetricsFilters,
  DashboardPreferences,
  ChartData,
  TimelineDataPoint,
  DistributionDataPoint,
  DashboardSystemMetrics,
} from "../model/types";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  BackendDashboardStatsResponse,
  BackendSystemMetrics,
  BackendTimelineDataPoint,
  BackendDistributionDataPoint,
} from "./types";
import { DashboardTransformers } from "./transformers";
import { DashboardDefaults } from "./defaults";
import { client } from "@/app/providers/client";

/**
 * Dashboard Entity API
 * Provides data access methods for dashboard-related functionality using real backend endpoints
 */
export class dashboardApi {
  /**
   * Get dashboard statistics from /api/v1/dashboard/stats
   */
  static async getStats(filters?: MetricsFilters): Promise<DashboardStats> {
    try {
      const params = new URLSearchParams();

      if (filters?.period) {
        // Преобразуем массив ChartData в строку для API
        params.append("period", JSON.stringify(filters.period));
      }

      if (filters?.category?.length) {
        params.append("categories", filters.category.join(","));
      }

      const queryString = params.toString();
      const url = `${API_ENDPOINTS.DASHBOARD.STATS}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await client.get<BackendDashboardStatsResponse>(url);

      if (response?.data) {
        return DashboardTransformers.transformDashboardStats(response.data);
      }

      throw new Error("No dashboard stats data available");
    } catch (error) {
      console.warn("Failed to fetch dashboard stats from API:", error);
      return DashboardDefaults.getDefaultStats();
    }
  }

  /**
   * Get dashboard activity from /api/v1/dashboard/my-activity
   */
  static async getActivity(filters?: ActivityFilters): Promise<any> {
    try {
      const response = await client.get(API_ENDPOINTS.DASHBOARD.MY_ACTIVITY);
      return response.data || [];
    } catch (error) {
      console.warn("Failed to fetch activity:", error);
      return [];
    }
  }

  /**
   * Get system health
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await client.get(API_ENDPOINTS.DASHBOARD.HEALTH);
      return response.data || DashboardDefaults.getDefaultSystemHealth();
    } catch (error) {
      console.warn("Failed to fetch system health:", error);
      return DashboardDefaults.getDefaultSystemHealth();
    }
  }

  /**
   * Get system metrics
   */
  static async getSystemMetrics(): Promise<DashboardSystemMetrics> {
    try {
      const response = await client.get<BackendSystemMetrics>(
        API_ENDPOINTS.DASHBOARD.METRICS
      );

      if (response?.data) {
        return DashboardTransformers.transformSystemMetrics(response.data);
      }

      return DashboardDefaults.getDefaultSystemMetrics();
    } catch (error) {
      console.warn("Failed to fetch system metrics:", error);
      return DashboardDefaults.getDefaultSystemMetrics();
    }
  }

  /**
   * Get user preferences
   */
  static async getPreferences(): Promise<DashboardPreferences> {
    try {
      const response = await client.get(API_ENDPOINTS.DASHBOARD.PREFERENCES);
      if (response.data) {
        localStorage.setItem(
          "dashboard-preferences",
          JSON.stringify(response.data)
        );
        return response.data;
      }
    } catch (error) {
      console.warn("Failed to fetch preferences from server:", error);
    }

    const stored = localStorage.getItem("dashboard-preferences");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parsing fails, fall through to defaults
      }
    }

    return DashboardDefaults.getDefaultPreferences();
  }

  /**
   * Get timeline data
   */
  static async getTimelineData(
    filters?: MetricsFilters
  ): Promise<TimelineDataPoint[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.period) {
        // Преобразуем массив ChartData в строку для API
        params.append("period", JSON.stringify(filters.period));
      }

      const queryString = params.toString();
      const url = `${API_ENDPOINTS.DASHBOARD.CHARTS.TIMELINE}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await client.get<BackendTimelineDataPoint[]>(url);
      return DashboardTransformers.transformTimelineData(response.data || []);
    } catch (error) {
      console.warn("Failed to fetch timeline data:", error);
      return [];
    }
  }

  /**
   * Get distribution data
   */
  static async getDistributionData(
    filters?: MetricsFilters
  ): Promise<DistributionDataPoint[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.period) {
        // Преобразуем массив ChartData в строку для API
        params.append("period", JSON.stringify(filters.period));
      }

      const queryString = params.toString();
      const url = `${API_ENDPOINTS.DASHBOARD.CHARTS.DISTRIBUTION}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await client.get<BackendDistributionDataPoint[]>(url);
      return DashboardTransformers.transformDistributionData(
        response.data || []
      );
    } catch (error) {
      console.warn("Failed to fetch distribution data:", error);
      return [];
    }
  }

  /**
   * Get comprehensive chart data
   */
  static async getChartData(filters?: MetricsFilters): Promise<ChartData> {
    try {
      // ChartData обычно имеет структуру для Chart.js
      return {
        labels: filters?.period ? ["Period Data"] : [],
        datasets: [],
        timeline: [],
      };
    } catch (error) {
      console.warn("Failed to fetch chart data:", error);
      return {
        labels: [],
        datasets: [],
        timeline: [],
      };
    }
  }
}
