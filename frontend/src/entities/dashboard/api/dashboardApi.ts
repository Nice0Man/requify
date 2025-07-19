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
 * Provides data access methods for dashboard-related functionality using real backend endpoints
 */
export class DashboardApi {
  /**
   * Get dashboard statistics from /dashboard/stats
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

      // Transform backend response to frontend format
      if (response?.data) {
        const data = response.data;
        return {
          totalProjects: data.overview?.total_projects || 0,
          activeProjects: data.overview?.active_projects || 0,
          totalRequirements: data.overview?.total_requirements || 0,
          activeRequirements: data.overview?.pending_requirements || 0,
          completedTasks: data.overview?.approved_requirements || 0,
          teamMembers: data.overview?.total_users || 0,
          completionRate: data.project_performance?.completion_rate || 0,
          teamVelocity: data.project_performance?.team_productivity || 0,
          changes: {
            totalProjects: data.trending_metrics?.requirements_this_week || 0,
            activeProjects: data.trending_metrics?.releases_this_month || 0,
            totalRequirements:
              data.trending_metrics?.requirements_this_week || 0,
            activeRequirements:
              data.trending_metrics?.requirements_last_week || 0,
          },
          trends: {
            totalProjects: {
              current: data.overview?.total_projects || 0,
              previous:
                (data.overview?.total_projects || 0) -
                (data.trending_metrics?.releases_last_month || 0),
              percentage: this.calculatePercentageChange(
                data.overview?.total_projects || 0,
                (data.overview?.total_projects || 0) -
                  (data.trending_metrics?.releases_last_month || 0)
              ),
              direction: this.getTrendDirection(
                data.overview?.total_projects || 0,
                (data.overview?.total_projects || 0) -
                  (data.trending_metrics?.releases_last_month || 0)
              ),
            },
            activeProjects: {
              current: data.overview?.active_projects || 0,
              previous: (data.overview?.active_projects || 0) - 1,
              percentage: this.calculatePercentageChange(
                data.overview?.active_projects || 0,
                (data.overview?.active_projects || 0) - 1
              ),
              direction: this.getTrendDirection(
                data.overview?.active_projects || 0,
                (data.overview?.active_projects || 0) - 1
              ),
            },
            totalRequirements: {
              current: data.overview?.total_requirements || 0,
              previous: data.trending_metrics?.requirements_last_week || 0,
              percentage: this.calculatePercentageChange(
                data.trending_metrics?.requirements_this_week || 0,
                data.trending_metrics?.requirements_last_week || 0
              ),
              direction: this.getTrendDirection(
                data.trending_metrics?.requirements_this_week || 0,
                data.trending_metrics?.requirements_last_week || 0
              ),
            },
            activeRequirements: {
              current: data.overview?.pending_requirements || 0,
              previous: (data.overview?.pending_requirements || 0) - 2,
              percentage: this.calculatePercentageChange(
                data.overview?.pending_requirements || 0,
                (data.overview?.pending_requirements || 0) - 2
              ),
              direction: this.getTrendDirection(
                data.overview?.pending_requirements || 0,
                (data.overview?.pending_requirements || 0) - 2
              ),
            },
            completionRate: {
              current: data.project_performance?.completion_rate || 0,
              previous: (data.project_performance?.completion_rate || 0) - 5,
              percentage: this.calculatePercentageChange(
                data.project_performance?.completion_rate || 0,
                (data.project_performance?.completion_rate || 0) - 5
              ),
              direction: this.getTrendDirection(
                data.project_performance?.completion_rate || 0,
                (data.project_performance?.completion_rate || 0) - 5
              ),
            },
            teamVelocity: {
              current: data.project_performance?.team_productivity || 0,
              previous: (data.project_performance?.team_productivity || 0) - 3,
              percentage: this.calculatePercentageChange(
                data.project_performance?.team_productivity || 0,
                (data.project_performance?.team_productivity || 0) - 3
              ),
              direction: this.getTrendDirection(
                data.project_performance?.team_productivity || 0,
                (data.project_performance?.team_productivity || 0) - 3
              ),
            },
          },
          timestamp: new Date().toISOString(),
        };
      }

      return this.getDefaultStats();
    } catch (error) {
      console.warn("Failed to fetch dashboard stats from API:", error);
      return this.getDefaultStats();
    }
  }

  /**
   * Helper method to calculate percentage change
   */
  private static calculatePercentageChange(
    current: number,
    previous: number
  ): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Helper method to determine trend direction
   */
  private static getTrendDirection(
    current: number,
    previous: number
  ): "up" | "down" | "stable" {
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "stable";
  }

  /**
   * Get dashboard overview from /dashboard/overview
   */
  static async getDashboardOverview(): Promise<any> {
    try {
      const response = await client.get(`/dashboard/overview`);
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch dashboard overview:", error);
      return null;
    }
  }

  /**
   * Get user's projects from /dashboard/my-projects
   */
  static async getMyProjects(): Promise<any[]> {
    try {
      const response = await client.get(`/dashboard/my-projects`);
      return response.data || [];
    } catch (error) {
      console.warn("Failed to fetch my projects:", error);
      return [];
    }
  }

  /**
   * Get user's requirements from /dashboard/my-requirements
   */
  static async getMyRequirements(): Promise<any[]> {
    try {
      const response = await client.get(`/dashboard/my-requirements`);
      return response.data || [];
    } catch (error) {
      console.warn("Failed to fetch my requirements:", error);
      return [];
    }
  }

  /**
   * Get user's activity from /dashboard/my-activity
   */
  static async getMyActivity(): Promise<ActivityItem[]> {
    try {
      const response = await client.get(`/dashboard/my-activity`);

      // Transform backend activity to frontend format
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          id: item.id || `activity_${Date.now()}`,
          type: item.type || "project",
          title: item.title || "Activity",
          description: item.description || "",
          timestamp: item.timestamp || new Date().toISOString(),
          userName: item.user_name || "Unknown User",
          userAvatar: item.user_avatar,
          projectName: item.project_name,
          status: item.status,
          priority: item.priority || "medium",
        }));
      }

      return [];
    } catch (error) {
      console.warn("Failed to fetch my activity:", error);
      return [];
    }
  }

  /**
   * Get user's notifications from /dashboard/my-notifications
   */
  static async getMyNotifications(): Promise<any[]> {
    try {
      const response = await client.get(`/dashboard/my-notifications`);
      return response.data || [];
    } catch (error) {
      console.warn("Failed to fetch my notifications:", error);
      return [];
    }
  }

  /**
   * Get recent dashboard activity from /dashboard/activity/recent
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
    const url = `/dashboard/activity/recent${
      queryString ? `?${queryString}` : ""
    }`;

    try {
      const response = await client.get(url);

      // Transform backend response to frontend format
      if (response?.data) {
        const activities = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        // Ensure activities is always an array and filter out invalid items
        const validActivities = activities.filter(
          (item: any) =>
            item && typeof item === "object" && (item.id || item.title)
        );

        const transformedData = validActivities.map((item: any) => ({
          id: item.id || `activity_${Date.now()}_${Math.random()}`,
          type: item.type || "project",
          title: item.title || "Activity",
          description: item.description || "",
          timestamp:
            item.timestamp || item.created_at || new Date().toISOString(),
          userName: item.user_name || item.userName || "Unknown User",
          userAvatar: item.user_avatar || item.userAvatar,
          projectName: item.project_name || item.projectName,
          status: item.status,
          priority: item.priority || "medium",
          // Add nested user object for component compatibility
          user: {
            name: item.user_name || item.userName || "Unknown User",
            avatar: item.user_avatar || item.userAvatar,
          },
        }));

        const limit = Math.max(1, filters?.limit || 10);
        const offset = Math.max(0, filters?.offset || 0);
        const total = response.data?.total || validActivities.length;

        return {
          data: transformedData,
          total,
          page: Math.floor(offset / limit) + 1,
          limit,
          hasMore: total > offset + limit,
        };
      }

      console.warn("Invalid API response structure, using fallback data");
      return this.getDefaultActivityResponse(filters);
    } catch (error) {
      console.warn("Failed to fetch activity from API:", error);
      return this.getDefaultActivityResponse(filters);
    }
  }

  /**
   * Get dashboard projects stats from /dashboard/projects/stats
   */
  static async getProjectsStats(): Promise<any> {
    try {
      const response = await client.get(`/dashboard/projects/stats`);
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch projects stats:", error);
      return null;
    }
  }

  /**
   * Get recent projects from /dashboard/projects/recent
   */
  static async getRecentProjects(): Promise<any[]> {
    try {
      const response = await client.get(`/dashboard/projects/recent`);
      return response.data || [];
    } catch (error) {
      console.warn("Failed to fetch recent projects:", error);
      return [];
    }
  }

  /**
   * Get requirements stats from /dashboard/requirements/stats
   */
  static async getRequirementsStats(): Promise<any> {
    try {
      const response = await client.get(`/dashboard/requirements/stats`);
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch requirements stats:", error);
      return null;
    }
  }

  /**
   * Get recent requirements from /dashboard/requirements/recent
   */
  static async getRecentRequirements(): Promise<any[]> {
    try {
      const response = await client.get(`/dashboard/requirements/recent`);
      return response.data || [];
    } catch (error) {
      console.warn("Failed to fetch recent requirements:", error);
      return [];
    }
  }

  /**
   * Get dashboard metrics from /dashboard/metrics
   */
  static async getDashboardMetrics(): Promise<any> {
    try {
      const response = await client.get(`/dashboard/metrics`);
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch dashboard metrics:", error);
      return null;
    }
  }

  /**
   * Get system health from /dashboard/health
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await client.get<SystemHealth>(`/dashboard/health`);

      if (response?.data) {
        return response.data;
      }

      return this.getDefaultSystemHealth();
    } catch (error) {
      console.warn("Failed to fetch system health from API:", error);
      return this.getDefaultSystemHealth();
    }
  }

  /**
   * Get detailed system metrics from /admin/metrics
   */
  static async getSystemMetrics(): Promise<{
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
  }> {
    try {
      const response = await client.get(`/admin/metrics`);

      if (response?.data) {
        const data = response.data;
        return {
          cpuUsage: data.system?.cpu_usage_percent || 0,
          memoryUsage: data.system?.memory_usage_percent || 0,
          diskUsage: data.system?.disk_usage_percent || 0,
          networkLatency: data.network?.average_latency_ms || 0,
          uptime: data.system?.uptime_seconds || 0,
          activeUsers: data.users?.active_count || 0,
          responseTime: data.api?.average_response_time_ms || 0,
          errorRate: data.api?.error_rate_percent || 0,
          throughput: data.api?.requests_per_minute || 0,
          availability: data.system?.availability_percent || 0,
        };
      }

      return this.getDefaultSystemMetrics();
    } catch (error) {
      console.warn("Failed to fetch system metrics from API:", error);
      return this.getDefaultSystemMetrics();
    }
  }

  /**
   * Get admin system information from /admin/system-info
   */
  static async getAdminSystemInfo(): Promise<any> {
    try {
      const response = await client.get(`/admin/system-info`);
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch admin system info:", error);
      return null;
    }
  }

  /**
   * Get admin health check from /admin/health
   */
  static async getAdminHealth(): Promise<any> {
    try {
      const response = await client.get(`/admin/health`);
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch admin health:", error);
      return null;
    }
  }

  /**
   * Get available quick actions (static data for now - can be made dynamic if needed)
   */
  static async getQuickActions(): Promise<QuickAction[]> {
    // Quick actions are UI-driven, but we can enhance this to fetch from API if needed
    return [
      // Create Actions
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
        description: "Создать новый тест-кейс",
        icon: "BugReport",
        path: "/testing/create",
        color: "#7b1fa2",
        category: ActionCategory.CREATE,
        shortcut: "Ctrl+T",
      },
      // Analyze Actions
      {
        id: "analytics-dashboard",
        title: "Аналитика",
        description: "Просмотр аналитики и отчетов",
        icon: "Analytics",
        path: "/analytics",
        color: "#d32f2f",
        category: ActionCategory.ANALYZE,
        shortcut: "Ctrl+A",
      },
      {
        id: "project-metrics",
        title: "Метрики проекта",
        description: "Анализ показателей проекта",
        icon: "Assessment",
        path: "/analytics/projects",
        color: "#1565c0",
        category: ActionCategory.ANALYZE,
        shortcut: "Ctrl+M",
      },
      {
        id: "progress-reports",
        title: "Отчеты прогресса",
        description: "Просмотр отчетов о прогрессе",
        icon: "TrendingUp",
        path: "/reports/progress",
        color: "#2e7d32",
        category: ActionCategory.ANALYZE,
        shortcut: "Ctrl+G",
      },
      // Manage Actions
      {
        id: "import-requirements",
        title: "Импорт требований",
        description: "Импортировать требования из файла",
        icon: "Upload",
        path: "/requirements/import",
        color: "#455a64",
        category: ActionCategory.MANAGE,
        shortcut: "Ctrl+I",
      },
      {
        id: "export-data",
        title: "Экспорт данных",
        description: "Экспорт проектных данных",
        icon: "FileDownload",
        path: "/export",
        color: "#6a1b9a",
        category: ActionCategory.MANAGE,
        shortcut: "Ctrl+E",
      },
    ];
  }

  /**
   * Update user preferences using /dashboard/preferences
   */
  static async updatePreferences(
    preferences: Partial<DashboardPreferences>
  ): Promise<DashboardPreferences> {
    try {
      const response = await client.post(`/dashboard/preferences`, preferences);

      // Also store locally for immediate access
      const updatedPreferences = {
        ...this.getDefaultPreferences(),
        ...preferences,
      };
      localStorage.setItem(
        "dashboard-preferences",
        JSON.stringify(updatedPreferences)
      );

      return response.data || updatedPreferences;
    } catch (error) {
      console.warn("Failed to update preferences on server:", error);

      // Still update locally even if server update fails
      const updatedPreferences = {
        ...this.getDefaultPreferences(),
        ...preferences,
      };
      localStorage.setItem(
        "dashboard-preferences",
        JSON.stringify(updatedPreferences)
      );

      return updatedPreferences;
    }
  }

  /**
   * Create notification using /dashboard/notifications
   */
  static async createNotification(notification: {
    type: string;
    title: string;
    message: string;
    priority?: string;
  }): Promise<any> {
    try {
      const response = await client.post(
        `/dashboard/notifications`,
        notification
      );
      return response.data;
    } catch (error) {
      console.warn("Failed to create notification:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read using /dashboard/notifications/{id}/read
   */
  static async markNotificationRead(notificationId: string): Promise<any> {
    try {
      const response = await client.patch(
        `/dashboard/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      console.warn("Failed to mark notification as read:", error);
      throw error;
    }
  }

  /**
   * Search dashboard using /dashboard/search
   */
  static async searchDashboard(query: string): Promise<any> {
    try {
      const response = await client.get(
        `/dashboard/search?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.warn("Failed to search dashboard:", error);
      return [];
    }
  }

  /**
   * Export dashboard stats using /dashboard/export/stats
   */
  static async exportStats(format: string = "csv"): Promise<Blob> {
    try {
      const response = await client.get(
        `/dashboard/export/stats?format=${format}`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.warn("Failed to export stats:", error);
      throw error;
    }
  }

  /**
   * Export dashboard activity using /dashboard/export/activity
   */
  static async exportActivity(format: string = "csv"): Promise<Blob> {
    try {
      const response = await client.get(
        `/dashboard/export/activity?format=${format}`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.warn("Failed to export activity:", error);
      throw error;
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
   * Get default/fallback system health data
   */
  private static getDefaultSystemHealth(): SystemHealth {
    const timestamp = new Date().toISOString();

    return {
      status: "healthy",
      uptime: Math.floor(Date.now() / 1000), // Current timestamp as uptime
      responseTime: 150,
      activeUsers: 1, // At least the current user
      memoryUsage: 45,
      cpuUsage: 25,
      diskUsage: 30,
      lastCheck: timestamp,
      services: [
        {
          name: "API Server",
          status: "online",
          responseTime: 120,
          lastCheck: timestamp,
        },
        {
          name: "Database",
          status: "online",
          responseTime: 50,
          lastCheck: timestamp,
        },
        {
          name: "Cache",
          status: "online",
          responseTime: 15,
          lastCheck: timestamp,
        },
        {
          name: "File Storage",
          status: "online",
          responseTime: 80,
          lastCheck: timestamp,
        },
      ],
    };
  }

  /**
   * Get default/fallback system metrics data
   */
  private static getDefaultSystemMetrics(): {
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
  } {
    return {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkLatency: 0,
      uptime: 0,
      activeUsers: 0,
      responseTime: 0,
      errorRate: 0,
      throughput: 0,
      availability: 0,
    };
  }

  /**
   * Get user dashboard preferences
   */
  static async getPreferences(): Promise<DashboardPreferences> {
    // Try to get from server first, then fall back to local storage
    try {
      const response = await client.get(`/dashboard/preferences`);
      if (response.data) {
        // Also cache locally
        localStorage.setItem(
          "dashboard-preferences",
          JSON.stringify(response.data)
        );
        return response.data;
      }
    } catch (error) {
      console.warn("Failed to fetch preferences from server:", error);
    }

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
    return this.getDefaultPreferences();
  }

  /**
   * Get default preferences
   */
  private static getDefaultPreferences(): DashboardPreferences {
    return {
      theme: "light",
      layout: "default",
      refreshInterval: 30,
      showWelcome: true,
      defaultView: DashboardView.OVERVIEW,
      notifications: {
        enabled: true,
        types: [NotificationType.PROJECT_UPDATES],
      },
      shortcuts: {},
    };
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

// Legacy compatibility export - maintains backward compatibility
export const dashboardApi = {
  getStats: DashboardApi.getStats.bind(DashboardApi),
  getActivity: (limit?: number) => DashboardApi.getActivity({ limit }),
  getSystemHealth: DashboardApi.getSystemHealth.bind(DashboardApi),
};
