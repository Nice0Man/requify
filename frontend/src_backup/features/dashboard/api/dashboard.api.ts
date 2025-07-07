import { apiClient } from "@/shared/api/client";
import type { Project, ProjectWithStats } from "@/entities/project";
import type { Requirement } from "@/entities/requirement";
import type { Release } from "@/entities/release";
import type { UserProfile } from "@/entities/user";

// =============================================================================
// Dashboard Types
// =============================================================================

export interface DashboardOverview {
  stats: DashboardStats;
  recent_activity: DashboardActivity[];
  my_projects: ProjectWithStats[];
  my_requirements: Requirement[];
  notifications: DashboardNotification[];
  quick_stats: DashboardQuickStats;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_requirements: number;
  completed_requirements: number;
  pending_requirements: number;
  total_releases: number;
  recent_releases: number;
  total_users: number;
  active_users: number;
  test_coverage: number;
  requirements_completion_rate: number;
  project_health_score: number;
}

export interface DashboardActivity {
  id: string;
  type: "project" | "requirement" | "release" | "user" | "test" | "comment";
  action: string;
  title: string;
  description?: string;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  entity_id: number;
  entity_type: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface DashboardNotification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export interface DashboardQuickStats {
  projects_due_soon: number;
  requirements_overdue: number;
  releases_pending: number;
  unread_notifications: number;
  tasks_assigned_to_me: number;
  reviews_pending: number;
}

export interface DashboardProjectStats {
  project_id: number;
  project_name: string;
  total_requirements: number;
  completed_requirements: number;
  progress_percentage: number;
  health_score: number;
  last_activity: string;
}

export interface DashboardRequirementStats {
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_type: Record<string, number>;
  completion_trend: Array<{
    date: string;
    completed: number;
    total: number;
  }>;
}

// =============================================================================
// Dashboard API Class
// =============================================================================

class DashboardApi {
  private baseUrl = "/dashboard";

  /**
   * Get complete dashboard overview
   */
  async getOverview(): Promise<DashboardOverview> {
    return apiClient
      .get<DashboardOverview>(`${this.baseUrl}/`)
      .then((res) => res.data);
  }

  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    return apiClient
      .get<DashboardStats>(`${this.baseUrl}/stats`)
      .then((res) => res.data);
  }

  /**
   * Get recent activity
   */
  async getActivity(limit: number = 20): Promise<DashboardActivity[]> {
    return apiClient
      .get<DashboardActivity[]>(`${this.baseUrl}/activity/recent`, {
        params: { limit },
      })
      .then((res) => res.data);
  }

  /**
   * Get user's projects
   */
  async getMyProjects(limit: number = 10): Promise<ProjectWithStats[]> {
    return apiClient
      .get<ProjectWithStats[]>(`${this.baseUrl}/my-projects`, {
        params: { limit },
      })
      .then((res) => res.data);
  }

  /**
   * Get user's requirements
   */
  async getMyRequirements(limit: number = 10): Promise<Requirement[]> {
    return apiClient
      .get<Requirement[]>(`${this.baseUrl}/my-requirements`, {
        params: { limit },
      })
      .then((res) => res.data);
  }

  /**
   * Get user notifications
   */
  async getNotifications(
    unread_only: boolean = false
  ): Promise<DashboardNotification[]> {
    return apiClient
      .get<DashboardNotification[]>(`${this.baseUrl}/my-notifications`, {
        params: { unread_only },
      })
      .then((res) => res.data);
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    return apiClient
      .patch(`${this.baseUrl}/notifications/${notificationId}/read`)
      .then(() => {});
  }

  /**
   * Get project statistics for dashboard
   */
  async getProjectStats(projectId?: number): Promise<DashboardProjectStats[]> {
    const params = projectId ? { project_id: projectId } : {};
    return apiClient
      .get<DashboardProjectStats[]>(`${this.baseUrl}/projects/stats`, {
        params,
      })
      .then((res) => res.data);
  }

  /**
   * Get requirement statistics
   */
  async getRequirementStats(
    projectId?: number
  ): Promise<DashboardRequirementStats> {
    const params = projectId ? { project_id: projectId } : {};
    return apiClient
      .get<DashboardRequirementStats>(`${this.baseUrl}/requirements/stats`, {
        params,
      })
      .then((res) => res.data);
  }

  /**
   * Get recent projects
   */
  async getRecentProjects(limit: number = 5): Promise<Project[]> {
    return apiClient
      .get<Project[]>(`${this.baseUrl}/projects/recent`, { params: { limit } })
      .then((res) => res.data);
  }

  /**
   * Get recent requirements
   */
  async getRecentRequirements(limit: number = 5): Promise<Requirement[]> {
    return apiClient
      .get<Requirement[]>(`${this.baseUrl}/requirements/recent`, {
        params: { limit },
      })
      .then((res) => res.data);
  }

  /**
   * Search dashboard
   */
  async search(
    query: string,
    filters?: Record<string, any>
  ): Promise<{
    projects: Project[];
    requirements: Requirement[];
    releases: Release[];
    users: UserProfile[];
  }> {
    return apiClient
      .get<{
        projects: Project[];
        requirements: Requirement[];
        releases: Release[];
        users: UserProfile[];
      }>(`${this.baseUrl}/search`, {
        params: {
          q: query,
          ...filters,
        },
      })
      .then((res) => res.data);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Record<string, any>): Promise<void> {
    return apiClient
      .post(`${this.baseUrl}/preferences`, preferences)
      .then(() => {});
  }

  /**
   * Export dashboard stats
   */
  async exportStats(format: "csv" | "excel" | "pdf" = "csv"): Promise<Blob> {
    return apiClient
      .get<Blob>(`${this.baseUrl}/export/stats`, {
        params: { format },
        responseType: "blob",
      })
      .then((res) => res.data);
  }

  /**
   * Export activity log
   */
  async exportActivity(
    format: "csv" | "excel" | "pdf" = "csv",
    dateFrom?: string,
    dateTo?: string
  ): Promise<Blob> {
    return apiClient
      .get<Blob>(`${this.baseUrl}/export/activity`, {
        params: { format, date_from: dateFrom, date_to: dateTo },
        responseType: "blob",
      })
      .then((res) => res.data);
  }
}

export const dashboardApi = new DashboardApi();
