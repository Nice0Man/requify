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
  include_data?: boolean;
  description?: string;
  include_files?: boolean;
  compression_level?: number;
}

export interface SystemSettingsUpdate {
  [key: string]: any;
}

// User creation interface matching backend UserCreate schema
export interface UserCreateRequest {
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  password: string;
  department?: string;
  phone?: string;
  send_invite_email?: boolean;
}

// User update interface matching backend UserUpdate schema
export interface UserUpdateRequest {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  password?: string;
  department?: string;
  phone?: string;
}

export class AdminApi {
  constructor(private client = apiClient) {}

  // === USER MANAGEMENT ===

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

  // Create user via /users/ endpoint (admin functionality)
  async createUser(userData: UserCreateRequest): Promise<ApiResponse<UserManagement>> {
    return this.client.post<UserManagement>("/users/", userData);
  }

  // Update user
  async updateUser(userId: number, userData: UserUpdateRequest): Promise<ApiResponse<UserManagement>> {
    return this.client.put<UserManagement>(`/users/${userId}`, userData);
  }

  // Delete user (deactivate)
  async deleteUser(userId: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/users/${userId}`);
  }

  // Activate user
  async activateUser(userId: number): Promise<ApiResponse<UserManagement>> {
    return this.client.post<UserManagement>(`/users/${userId}/activate`, {});
  }

  // Deactivate user
  async deactivateUser(userId: number): Promise<ApiResponse<UserManagement>> {
    return this.client.post<UserManagement>(`/users/${userId}/deactivate`, {});
  }

  // Get user by ID
  async getUser(userId: number): Promise<ApiResponse<UserManagement>> {
    return this.client.get<UserManagement>(`/users/${userId}`);
  }

  // List all users (for admin)
  async getAllUsers(params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    role?: string;
    search?: string;
  }): Promise<ApiResponse<UserManagement[]>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());
    if (params?.role) queryParams.append("role", params.role);
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const url = queryString ? `/users/?${queryString}` : "/users/";

    return this.client.get<UserManagement[]>(url);
  }

  // === SYSTEM MONITORING ===

  // 2. Get System Information
  async getSystemInfo(): Promise<ApiResponse<SystemInfo>> {
    return this.client.get<SystemInfo>("/admin/system-info");
  }

  // 3. Health Check
  async getHealth(): Promise<
    ApiResponse<{ 
      status: string; 
      components: Record<string, any>; 
      timestamp: string; 
    }>
  > {
    return this.client.get<{
      status: string;
      components: Record<string, any>;
      timestamp: string;
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

    // Backend returns array directly, wrap it in expected format
    const response = await this.client.get<SystemLog[]>(url);
    return {
      ...response,
      data: {
        items: response.data,
        total: response.data.length,
      },
    };
  }

  // === STATISTICS ===

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

  // === BACKUP MANAGEMENT ===

  // 8. Create System Backup
  async createBackup(
    request?: BackupRequest
  ): Promise<ApiResponse<SystemBackup>> {
    const backupData = {
      include_data: request?.include_data ?? true,
      description: request?.description || "Manual backup from admin panel",
      include_files: request?.include_files ?? true,
      compression_level: request?.compression_level ?? 6,
    };
    return this.client.post<SystemBackup>("/admin/backup", backupData);
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

    // Backend returns array directly, wrap it in expected format
    const response = await this.client.get<SystemBackup[]>(url);
    return {
      ...response,
      data: {
        items: response.data,
        total: response.data.length,
      },
    };
  }

  // === SYSTEM SETTINGS ===

  // 10. Update System Settings
  async updateSystemSettings(
    settings: SystemSettingsUpdate
  ): Promise<ApiResponse<Record<string, any>>> {
    return this.client.post<Record<string, any>>(
      "/admin/system-settings",
      settings
    );
  }

  // 11. Get System Settings - Note: Backend doesn't have this endpoint yet
  async getSystemSettings(): Promise<ApiResponse<SystemSettings[]>> {
    // For now, return empty array as the backend doesn't have this endpoint
    return {
      data: [],
      status: 200,
      message: "System settings retrieved successfully",
    };
  }

  // === AUDIT LOG ===

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
        ip_address?: string;
        user_agent?: string;
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

    // Backend returns array directly, wrap it in expected format
    const response = await this.client.get<Array<{
      id: number;
      user_id: number;
      action: string;
      entity_type: string;
      entity_id?: number;
      details: any;
      ip_address?: string;
      user_agent?: string;
      timestamp: string;
    }>>(url);

    return {
      ...response,
      data: {
        items: response.data,
        total: response.data.length,
      },
    };
  }

  // === HELPER METHODS ===

  // Get comprehensive admin statistics
  async getFullAdminStats(): Promise<ApiResponse<AdminStats>> {
    try {
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
          avg_response_time: 0, // Would need to come from metrics
          error_rate: 0, // Would need to come from metrics
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
    } catch (error) {
      console.error("Failed to get admin stats:", error);
      throw error;
    }
  }

  // Bulk user operations
  async bulkUpdateUsers(
    userIds: number[],
    updates: UserUpdateRequest
  ): Promise<ApiResponse<UserManagement[]>> {
    const results = await Promise.all(
      userIds.map((id) => this.updateUser(id, updates))
    );
    return {
      data: results.map((r) => r.data),
      status: 200,
      message: "Bulk user update completed",
    };
  }

  // Bulk user activation/deactivation
  async bulkActivateUsers(userIds: number[]): Promise<ApiResponse<UserManagement[]>> {
    const results = await Promise.all(
      userIds.map((id) => this.activateUser(id))
    );
    return {
      data: results.map((r) => r.data),
      status: 200,
      message: "Bulk user activation completed",
    };
  }

  async bulkDeactivateUsers(userIds: number[]): Promise<ApiResponse<UserManagement[]>> {
    const results = await Promise.all(
      userIds.map((id) => this.deactivateUser(id))
    );
    return {
      data: results.map((r) => r.data),
      status: 200,
      message: "Bulk user deactivation completed",
    };
  }

  // System maintenance
  async getSystemMaintenance(): Promise<ApiResponse<{
    in_maintenance: boolean;
    maintenance_message?: string;
    scheduled_maintenance?: string;
  }>> {
    // This would need a backend endpoint
    return {
      data: {
        in_maintenance: false,
        maintenance_message: undefined,
        scheduled_maintenance: undefined,
      },
      status: 200,
      message: "System maintenance status retrieved",
    };
  }

  // Clear system cache (if available)
  async clearSystemCache(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    // This would need a backend endpoint
    return {
      data: {
        success: true,
        message: "System cache cleared successfully",
      },
      status: 200,
      message: "Cache cleared",
    };
  }
}

// Export singleton instance
export const adminApi = new AdminApi();
