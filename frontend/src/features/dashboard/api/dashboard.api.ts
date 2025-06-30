import { apiClient, ApiClient, ApiResponse } from "@/shared/api/client";

// Dashboard Data Interfaces
export interface DashboardStats {
  overview: {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    total_requirements: number;
    pending_requirements: number;
    approved_requirements: number;
    total_users: number;
    active_users: number;
  };

  recent_activity: ActivityItem[];

  project_performance: {
    completion_rate: number;
    on_time_delivery: number;
    quality_score: number;
    team_productivity: number;
  };

  trending_metrics: {
    requirements_this_week: number;
    requirements_last_week: number;
    releases_this_month: number;
    releases_last_month: number;
    active_teams: number;
    avg_project_duration: number;
  };

  quick_access: {
    my_projects: QuickProject[];
    my_requirements: QuickRequirement[];
    pending_approvals: PendingApproval[];
  };
}

export interface ActivityItem {
  id: string;
  type: "project" | "requirement" | "release" | "user" | "testing";
  title: string;
  description: string;
  timestamp: string;
  user_name: string;
  user_avatar?: string;
  project_name?: string;
  status?: string;
  priority?: "low" | "medium" | "high" | "critical";
}

export interface QuickProject {
  id: number;
  name: string;
  code: string;
  status: string;
  completion_percentage: number;
  team_size: number;
  requirements_count: number;
  next_milestone?: string;
  health_score: "good" | "warning" | "critical";
}

export interface QuickRequirement {
  id: number;
  title: string;
  project_name: string;
  status_name: string;
  priority_name: string;
  author_name?: string;
  deadline?: string;
  progress: number;
}

export interface PendingApproval {
  id: number;
  type: "requirement" | "release" | "project" | "user";
  title: string;
  requested_by: string;
  requested_at: string;
  urgency: "low" | "medium" | "high";
}

export interface UserDashboardPreferences {
  show_quick_stats: boolean;
  show_recent_activity: boolean;
  show_my_projects: boolean;
  show_pending_approvals: boolean;
  default_project_filter?: string;
  activity_limit: number;
  refresh_interval: number;
}

export interface DashboardNotification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

export class DashboardApi {
  constructor(private client = apiClient) {}

  // Get comprehensive dashboard data
  async getDashboardData(): Promise<ApiResponse<DashboardStats>> {
    return this.client.get<DashboardStats>("/dashboard/stats");
  }

  // Get recent activity with filtering
  async getRecentActivity(params?: {
    limit?: number;
    types?: string[];
    project_id?: number;
    user_id?: number;
  }): Promise<ApiResponse<ActivityItem[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.types)
      params.types.forEach((type) => queryParams.append("types", type));
    if (params?.project_id)
      queryParams.append("project_id", params.project_id.toString());
    if (params?.user_id)
      queryParams.append("user_id", params.user_id.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/dashboard/activity?${queryString}`
      : "/dashboard/activity";

    return this.client.get<ActivityItem[]>(url);
  }

  // Get user's personalized dashboard
  async getMyDashboard(): Promise<
    ApiResponse<{
      my_projects: QuickProject[];
      my_requirements: QuickRequirement[];
      my_activity: ActivityItem[];
      notifications: DashboardNotification[];
      preferences: UserDashboardPreferences;
    }>
  > {
    return this.client.get<{
      my_projects: QuickProject[];
      my_requirements: QuickRequirement[];
      my_activity: ActivityItem[];
      notifications: DashboardNotification[];
      preferences: UserDashboardPreferences;
    }>("/dashboard/my-dashboard");
  }

  // Update dashboard preferences
  async updatePreferences(
    preferences: Partial<UserDashboardPreferences>
  ): Promise<ApiResponse<UserDashboardPreferences>> {
    return this.client.put<UserDashboardPreferences>(
      "/dashboard/preferences",
      preferences
    );
  }

  // Mark notification as read
  async markNotificationRead(
    notificationId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.client.post<{ success: boolean }>(
      `/dashboard/notifications/${notificationId}/read`,
      {}
    );
  }

  // Get system health status for admin dashboard
  async getSystemHealth(): Promise<
    ApiResponse<{
      overall_status: "healthy" | "warning" | "critical";
      services: {
        database: "up" | "down" | "degraded";
        api: "up" | "down" | "degraded";
        email: "up" | "down" | "degraded";
        storage: "up" | "down" | "degraded";
      };
      performance: {
        response_time: number;
        cpu_usage: number;
        memory_usage: number;
        disk_usage: number;
      };
      uptime: string;
      last_backup: string;
    }>
  > {
    return this.client.get<{
      overall_status: "healthy" | "warning" | "critical";
      services: {
        database: "up" | "down" | "degraded";
        api: "up" | "down" | "degraded";
        email: "up" | "down" | "degraded";
        storage: "up" | "down" | "degraded";
      };
      performance: {
        response_time: number;
        cpu_usage: number;
        memory_usage: number;
        disk_usage: number;
      };
      uptime: string;
      last_backup: string;
    }>("/dashboard/system-health");
  }

  // Get analytics data for charts
  async getAnalytics(
    timeframe: "week" | "month" | "quarter" | "year" = "month"
  ): Promise<
    ApiResponse<{
      requirements_trend: Array<{ date: string; count: number }>;
      projects_progress: Array<{ project_name: string; completion: number }>;
      team_performance: Array<{
        team: string;
        velocity: number;
        quality: number;
      }>;
      release_frequency: Array<{ month: string; releases: number }>;
      user_activity: Array<{ date: string; active_users: number }>;
    }>
  > {
    return this.client.get<{
      requirements_trend: Array<{ date: string; count: number }>;
      projects_progress: Array<{ project_name: string; completion: number }>;
      team_performance: Array<{
        team: string;
        velocity: number;
        quality: number;
      }>;
      release_frequency: Array<{ month: string; releases: number }>;
      user_activity: Array<{ date: string; active_users: number }>;
    }>(`/dashboard/analytics?timeframe=${timeframe}`);
  }

  // Validate API token
  async validateToken(token: string): Promise<ApiResponse<{ valid: boolean }>> {
    return this.client.post<{ valid: boolean }>(`/dashboard/validate-token`, { token });
  }
}

// Export singleton instance
export const dashboardApi = new DashboardApi();
