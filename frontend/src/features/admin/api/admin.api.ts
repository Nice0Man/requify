import { apiClient, ApiClient, ApiResponse } from "@/shared/api/client";
import {
  SystemInfo,
  SystemMetrics,
  UserManagement,
  SystemLog,
  SystemBackup,
  SystemSettings,
  AdminListParams,
  AdminStats,
} from "../types/admin.types";

export interface AdminUserListParams {
  skip?: number;
  limit?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface BackupListParams {
  skip?: number;
  limit?: number;
  status?: string;
  created_by?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface LogListParams {
  skip?: number;
  limit?: number;
  level?: string;
  component?: string;
  start_time?: string;
  end_time?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface AuditLogParams {
  skip?: number;
  limit?: number;
  user_id?: number;
  action?: string;
  entity_type?: string;
  start_time?: string;
  end_time?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface BackupRequest {
  description?: string;
  include_files?: boolean;
  compression_level?: number;
}

export interface SystemSettingsUpdate {
  [key: string]: any;
}

export class AdminApi {
  constructor(private client = apiClient) {}

  // 1. Get Admin Users
  async getAdminUsers(
    params?: AdminUserListParams
  ): Promise<ApiResponse<{ items: UserManagement[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString ? `/admin/users?${queryString}` : "/admin/users";

    return this.client.get<{ items: UserManagement[]; total: number }>(url);
  }

  // 2. Get System Information
  async getSystemInfo(): Promise<ApiResponse<SystemInfo>> {
    return this.client.get<SystemInfo>("/admin/system-info");
  }

  // 3. Health Check
  async getHealth(): Promise<
    ApiResponse<{ status: string; timestamp: string; details: any }>
  > {
    return this.client.get<{
      status: string;
      timestamp: string;
      details: any;
    }>("/admin/health");
  }

  // 4. Get System Metrics
  async getMetrics(): Promise<ApiResponse<SystemMetrics>> {
    return this.client.get<SystemMetrics>("/admin/metrics");
  }

  // 5. Get System Logs
  async getLogs(
    params?: LogListParams
  ): Promise<ApiResponse<{ items: SystemLog[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.level) queryParams.append("level", params.level);
    if (params?.component) queryParams.append("component", params.component);
    if (params?.start_time) queryParams.append("start_time", params.start_time);
    if (params?.end_time) queryParams.append("end_time", params.end_time);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString ? `/admin/logs?${queryString}` : "/admin/logs";

    return this.client.get<{ items: SystemLog[]; total: number }>(url);
  }

  // 6. Get User Statistics
  async getUsersStats(): Promise<
    ApiResponse<{
      total_users: number;
      active_users: number;
      new_users_this_month: number;
      users_by_role: Record<string, number>;
    }>
  > {
    return this.client.get<{
      total_users: number;
      active_users: number;
      new_users_this_month: number;
      users_by_role: Record<string, number>;
    }>("/admin/users-stats");
  }

  // 7. Get Project Statistics
  async getProjectsStats(): Promise<
    ApiResponse<{
      total_projects: number;
      active_projects: number;
      projects_by_status: Record<string, number>;
      requirements_count: number;
      releases_count: number;
    }>
  > {
    return this.client.get<{
      total_projects: number;
      active_projects: number;
      projects_by_status: Record<string, number>;
      requirements_count: number;
      releases_count: number;
    }>("/admin/projects-stats");
  }

  // 8. Create System Backup
  async createBackup(
    request?: BackupRequest
  ): Promise<ApiResponse<SystemBackup>> {
    return this.client.post<SystemBackup>("/admin/backup", request || {});
  }

  // 9. List Backups
  async getBackups(
    params?: BackupListParams
  ): Promise<ApiResponse<{ items: SystemBackup[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.created_by)
      queryParams.append("created_by", params.created_by.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/admin/backups?${queryString}`
      : "/admin/backups";

    return this.client.get<{ items: SystemBackup[]; total: number }>(url);
  }

  // 10. Update System Settings
  async updateSystemSettings(
    settings: SystemSettingsUpdate
  ): Promise<ApiResponse<SystemSettings[]>> {
    return this.client.post<SystemSettings[]>(
      "/admin/system-settings",
      settings
    );
  }

  // 11. Get System Settings
  async getSystemSettings(): Promise<ApiResponse<SystemSettings[]>> {
    return this.client.get<SystemSettings[]>("/admin/system-settings");
  }

  // 12. Get Audit Log
  async getAuditLog(params?: AuditLogParams): Promise<
    ApiResponse<{
      items: Array<{
        id: number;
        user_id: number;
        action: string;
        entity_type: string;
        entity_id?: number;
        details: any;
        ip_address: string;
        user_agent: string;
        timestamp: string;
      }>;
      total: number;
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.user_id)
      queryParams.append("user_id", params.user_id.toString());
    if (params?.action) queryParams.append("action", params.action);
    if (params?.entity_type)
      queryParams.append("entity_type", params.entity_type);
    if (params?.start_time) queryParams.append("start_time", params.start_time);
    if (params?.end_time) queryParams.append("end_time", params.end_time);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/admin/audit-log?${queryString}`
      : "/admin/audit-log";

    return this.client.get<{
      items: Array<{
        id: number;
        user_id: number;
        action: string;
        entity_type: string;
        entity_id?: number;
        details: any;
        ip_address: string;
        user_agent: string;
        timestamp: string;
      }>;
      total: number;
    }>(url);
  }

  // Additional helper methods
  async getFullAdminStats(): Promise<ApiResponse<AdminStats>> {
    const [usersStats, projectsStats, systemInfo] = await Promise.all([
      this.getUsersStats(),
      this.getProjectsStats(),
      this.getSystemInfo(),
    ]);

    const stats: AdminStats = {
      users: {
        total: usersStats.data.total_users,
        active: usersStats.data.active_users,
        by_role: usersStats.data.users_by_role as any,
        new_this_month: usersStats.data.new_users_this_month,
      },
      system: {
        uptime: systemInfo.data.uptime || 0,
        total_requests: 0, // Would need to come from metrics
        avg_response_time: systemInfo.data.api_health?.response_time || 0,
        error_rate: systemInfo.data.api_health?.error_rate || 0,
      },
      security: {
        failed_logins_today: 0, // Would need specific endpoint
        security_events_today: 0, // Would need specific endpoint
        open_security_events: 0, // Would need specific endpoint
        locked_accounts: 0, // Would need specific endpoint
      },
      content: {
        total_projects: projectsStats.data.total_projects,
        total_requirements: projectsStats.data.requirements_count,
        total_test_cases: 0, // Would need from testing API
        total_releases: projectsStats.data.releases_count,
      },
    };

    return {
      data: stats,
      status: 200,
      message: "Admin stats retrieved successfully",
    };
  }
}

// Export singleton instance
export const adminApi = new AdminApi();
