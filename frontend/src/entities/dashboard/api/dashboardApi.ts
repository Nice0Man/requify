import { client } from "@/shared/api/client";
import {
  type DashboardStats,
  type DashboardStatsResponse,
  type ActivityItem,
  type ActivityResponse,
  type ActivityFilters,
  type QuickAction,
  type SystemHealth,
  type MetricsFilters,
  type DashboardPreferences,
  type DashboardLayout,
  ActionCategory,
  NotificationType,
  DashboardView,
} from "../model/types";

/**
 * Dashboard Entity API
 * Provides data access methods for dashboard-related functionality
 */
export class DashboardApi {
  /**
   * Get dashboard statistics with optional filters
   */
  static async getStats(filters?: MetricsFilters): Promise<DashboardStats> {
    const params = new URLSearchParams();

    if (filters?.period) {
      params.append("period", filters.period);
    }

    if (filters?.category?.length) {
      params.append("categories", filters.category.join(","));
    }

    if (filters?.includeComparisons !== undefined) {
      params.append("include_comparisons", String(filters.includeComparisons));
    }

    const queryString = params.toString();
    const url = `/dashboard/stats${queryString ? `?${queryString}` : ""}`;

    try {
      const response = await client.get<DashboardStatsResponse>(url);

      // Ensure we have valid data structure
      if (response?.data?.data) {
        return response.data.data;
      }

      // Fallback if response structure is incorrect
      console.warn(
        "Invalid dashboard stats response structure, using fallback data"
      );
      return this.getDefaultStats();
    } catch (error) {
      console.warn(
        "Failed to fetch dashboard stats from API, using fallback data:",
        error
      );
      return this.getDefaultStats();
    }
  }

  /**
   * Get default/fallback dashboard statistics
   */
  private static getDefaultStats(): DashboardStats {
    const timestamp = new Date().toISOString();

    return {
      totalProjects: 0,
      activeProjects: 0,
      totalRequirements: 0,
      activeRequirements: 0,
      completedTasks: 0,
      teamMembers: 0,
      completionRate: 0,
      teamVelocity: 0,
      changes: {},
      trends: {
        totalProjects: {
          current: 0,
          previous: 0,
          percentage: 0,
          direction: "stable",
        },
        activeProjects: {
          current: 0,
          previous: 0,
          percentage: 0,
          direction: "stable",
        },
        totalRequirements: {
          current: 0,
          previous: 0,
          percentage: 0,
          direction: "stable",
        },
        activeRequirements: {
          current: 0,
          previous: 0,
          percentage: 0,
          direction: "stable",
        },
        completionRate: {
          current: 0,
          previous: 0,
          percentage: 0,
          direction: "stable",
        },
        teamVelocity: {
          current: 0,
          previous: 0,
          percentage: 0,
          direction: "stable",
        },
      },
      timestamp,
    };
  }

  /**
   * Get recent activity with pagination and filtering
   */
  static async getActivity(
    filters?: ActivityFilters
  ): Promise<ActivityResponse> {
    const params = new URLSearchParams();

    if (filters?.type?.length) {
      params.append("types", filters.type.join(","));
    }

    if (filters?.status?.length) {
      params.append("statuses", filters.status.join(","));
    }

    if (filters?.priority?.length) {
      params.append("priorities", filters.priority.join(","));
    }

    if (filters?.userId) {
      params.append("user_id", filters.userId);
    }

    if (filters?.dateFrom) {
      params.append("date_from", filters.dateFrom);
    }

    if (filters?.dateTo) {
      params.append("date_to", filters.dateTo);
    }

    if (filters?.limit) {
      params.append("limit", String(filters.limit));
    }

    if (filters?.offset) {
      params.append("offset", String(filters.offset));
    }

    const queryString = params.toString();
    const url = `/dashboard/activity${queryString ? `?${queryString}` : ""}`;

    try {
      const response = await client.get<ActivityResponse>(url);

      // Ensure we have valid response structure
      if (response?.data) {
        return response.data;
      }

      // Fallback if response structure is incorrect
      console.warn("Invalid activity response structure, using fallback data");
      return this.getDefaultActivityResponse(filters);
    } catch (error) {
      console.warn(
        "Failed to fetch activity from API, using fallback data:",
        error
      );
      return this.getDefaultActivityResponse(filters);
    }
  }

  /**
   * Get default/fallback activity response
   */
  private static getDefaultActivityResponse(
    filters?: ActivityFilters
  ): ActivityResponse {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: filters?.limit || 10,
      hasMore: false,
    };
  }

  /**
   * Get available quick actions for current user
   * Note: Quick actions are static UI elements, no backend API needed
   */
  static async getQuickActions(): Promise<QuickAction[]> {
    // Return static quick actions based on common dashboard operations
    return [
      {
        id: "create-project",
        title: "Создать проект",
        description: "Создать новый проект",
        icon: "Add",
        path: "/projects/create",
        color: "#1976d2",
        category: ActionCategory.CREATE,
        shortcut: "Ctrl+P",
      },
      {
        id: "create-requirement",
        title: "Создать требование",
        description: "Добавить новое требование",
        icon: "Assignment",
        path: "/requirements/create",
        color: "#388e3c",
        category: ActionCategory.CREATE,
        shortcut: "Ctrl+R",
      },
      {
        id: "create-release",
        title: "Создать релиз",
        description: "Создать новый релиз",
        icon: "RocketLaunch",
        path: "/releases/create",
        color: "#f57c00",
        category: ActionCategory.CREATE,
        shortcut: "Ctrl+L",
      },
      {
        id: "create-test-case",
        title: "Создать тест-кейс",
        description: "Добавить новый тест-кейс",
        icon: "BugReport",
        path: "/testing/cases/create",
        color: "#7b1fa2",
        category: ActionCategory.CREATE,
        shortcut: "Ctrl+T",
      },
      {
        id: "view-analytics",
        title: "Аналитика",
        description: "Просмотр аналитики и отчетов",
        icon: "Analytics",
        path: "/analytics",
        color: "#d32f2f",
        category: ActionCategory.ANALYZE,
      },
      {
        id: "import-requirements",
        title: "Импорт требований",
        description: "Импортировать требования из файла",
        icon: "FileUpload",
        path: "/requirements/import",
        color: "#455a64",
        category: ActionCategory.MANAGE,
      },
    ];
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await client.get<SystemHealth>("/dashboard/health");

      // Ensure we have valid response data
      if (response?.data) {
        return response.data;
      }

      // Fallback if response structure is incorrect
      console.warn(
        "Invalid system health response structure, using fallback data"
      );
      return this.getDefaultSystemHealth();
    } catch (error) {
      console.warn(
        "Failed to fetch system health from API, using fallback data:",
        error
      );
      return this.getDefaultSystemHealth();
    }
  }

  /**
   * Get default/fallback system health data
   */
  private static getDefaultSystemHealth(): SystemHealth {
    const timestamp = new Date().toISOString();

    return {
      status: "warning",
      uptime: 0,
      responseTime: 0,
      activeUsers: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      diskUsage: 0,
      lastCheck: timestamp,
      services: [
        {
          name: "API Server",
          status: "offline",
          responseTime: 0,
          lastCheck: timestamp,
        },
        {
          name: "Database",
          status: "offline",
          responseTime: 0,
          lastCheck: timestamp,
        },
        {
          name: "Cache",
          status: "offline",
          responseTime: 0,
          lastCheck: timestamp,
        },
      ],
    };
  }

  /**
   * Get user dashboard preferences
   * Note: Preferences are stored locally and synced to server
   */
  static async getPreferences(): Promise<DashboardPreferences> {
    // Get preferences from localStorage with fallback to defaults
    const stored = localStorage.getItem("dashboard-preferences");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parsing fails, fall through to defaults
      }
    }

    // Return default preferences
    const defaultPreferences: DashboardPreferences = {
      theme: "light",
      layout: "default",
      refreshInterval: 30000,
      notifications: {
        enabled: true,
        types: [
          NotificationType.PROJECT_UPDATES,
          NotificationType.REQUIREMENT_CHANGES,
          NotificationType.SYSTEM_ALERTS,
          NotificationType.TEAM_ACTIVITIES,
          NotificationType.DEADLINE_REMINDERS,
        ],
      },
      shortcuts: {},
      defaultView: DashboardView.OVERVIEW,
      showWelcome: true,
    };

    // Store defaults in localStorage
    localStorage.setItem(
      "dashboard-preferences",
      JSON.stringify(defaultPreferences)
    );
    return defaultPreferences;
  }

  /**
   * Update user dashboard preferences
   * Uses available POST endpoint and stores locally
   */
  static async updatePreferences(
    preferences: Partial<DashboardPreferences>
  ): Promise<DashboardPreferences> {
    // Get current preferences
    const current = await this.getPreferences();

    // Merge with updates
    const updated = { ...current, ...preferences };

    // Store locally first
    localStorage.setItem("dashboard-preferences", JSON.stringify(updated));

    // Sync to server using available POST endpoint
    try {
      const response = await client.post<DashboardPreferences>(
        "/dashboard/preferences",
        updated
      );
      return response.data;
    } catch (error) {
      // If server sync fails, still return the locally updated preferences
      console.warn("Failed to sync preferences to server:", error);
      return updated;
    }
  }

  /**
   * Get user dashboard layouts
   * Note: Layouts are stored locally since no backend endpoint is available
   */
  static async getLayouts(): Promise<DashboardLayout[]> {
    const stored = localStorage.getItem("dashboard-layouts");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parsing fails, return default layout
      }
    }

    // Return default layout
    const defaultLayout: DashboardLayout = {
      id: "default",
      name: "Default Layout",
      isDefault: true,
      widgets: [],
      columns: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const layouts = [defaultLayout];
    localStorage.setItem("dashboard-layouts", JSON.stringify(layouts));
    return layouts;
  }

  /**
   * Save dashboard layout locally
   */
  static async saveLayout(
    layout: Omit<DashboardLayout, "id" | "createdAt" | "updatedAt">
  ): Promise<DashboardLayout> {
    const layouts = await this.getLayouts();

    const newLayout: DashboardLayout = {
      ...layout,
      id: `layout-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    layouts.push(newLayout);
    localStorage.setItem("dashboard-layouts", JSON.stringify(layouts));

    return newLayout;
  }

  /**
   * Update dashboard layout locally
   */
  static async updateLayout(
    layoutId: string,
    updates: Partial<Omit<DashboardLayout, "id" | "createdAt" | "updatedAt">>
  ): Promise<DashboardLayout> {
    const layouts = await this.getLayouts();
    const layoutIndex = layouts.findIndex((l) => l.id === layoutId);

    if (layoutIndex === -1) {
      throw new Error(`Layout with id ${layoutId} not found`);
    }

    const updatedLayout = {
      ...layouts[layoutIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    layouts[layoutIndex] = updatedLayout;
    localStorage.setItem("dashboard-layouts", JSON.stringify(layouts));

    return updatedLayout;
  }

  /**
   * Delete dashboard layout locally
   */
  static async deleteLayout(layoutId: string): Promise<void> {
    const layouts = await this.getLayouts();
    const filteredLayouts = layouts.filter((l) => l.id !== layoutId);
    localStorage.setItem("dashboard-layouts", JSON.stringify(filteredLayouts));
  }

  /**
   * Get dashboard overview - combines multiple data sources
   */
  static async getOverview(filters?: MetricsFilters): Promise<{
    stats: DashboardStats;
    recentActivity: ActivityItem[];
    quickActions: QuickAction[];
    systemHealth: SystemHealth;
  }> {
    const [stats, activity, quickActions, systemHealth] = await Promise.all([
      this.getStats(filters),
      this.getActivity({ limit: 10 }),
      this.getQuickActions(),
      this.getSystemHealth(),
    ]);

    return {
      stats,
      recentActivity: activity.data,
      quickActions,
      systemHealth,
    };
  }

  /**
   * Refresh dashboard data - invalidates cache
   * Note: Cache invalidation is handled by TanStack Query, no backend endpoint needed
   */
  static async refresh(): Promise<void> {
    // No-op: Cache invalidation is handled by the query client
    // This method exists for backward compatibility
    return Promise.resolve();
  }

  /**
   * Export dashboard data
   * Uses available backend endpoints for stats and activity export
   */
  static async exportData(
    format: "json" | "csv" | "pdf" = "json",
    type: "stats" | "activity" = "stats"
  ): Promise<Blob> {
    const endpoint =
      type === "stats"
        ? `/dashboard/export/stats?format=${format}`
        : `/dashboard/export/activity?format=${format}`;

    const response = await client.get(endpoint, {
      responseType: "blob",
    });
    return response.data;
  }
}

// Legacy compatibility - можно удалить после полной миграции
export const dashboardApi = {
  getStats: DashboardApi.getStats,
  getActivity: (limit?: number) => DashboardApi.getActivity({ limit }),
  getSystemHealth: DashboardApi.getSystemHealth,
};
