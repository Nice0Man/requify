import { apiClient } from '@/shared/api/client';
import type {
  SystemInfo,
  SystemMetrics,
  SystemSettings,
  SystemBackup,
  SecurityEvent,
  AdminStats,
  HealthCheckResponse,
  AdminListParams,
  UserListResponse,
  LogListResponse,
  SecurityEventListResponse,
} from '../model/types';
import type { PaginatedResponse, ApiResponse } from '@/shared/types/api';

/**
 * Admin API - layer for backend interaction for admin functionality
 * According to FSD principles, contains only API functions without business logic
 */
export class AdminApi {
  private readonly baseUrl = '/api/v1/admin';

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<SystemInfo> {
    return apiClient.get<SystemInfo>(`${this.baseUrl}/system-info`).then(res => res.data);
  }

  /**
   * Get system health check
   */
  async getHealthCheck(): Promise<HealthCheckResponse> {
    return apiClient.get<HealthCheckResponse>(`${this.baseUrl}/health`).then(res => res.data);
  }

  /**
   * Get system metrics
   */
  async getMetrics(): Promise<SystemMetrics> {
    return apiClient.get<SystemMetrics>(`${this.baseUrl}/metrics`).then(res => res.data);
  }

  /**
   * Get admin users list
   */
  async getAdminUsers(params?: AdminListParams): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/users?${searchParams}`
      : `${this.baseUrl}/users`;

    return apiClient.get<UserListResponse>(url).then(res => res.data);
  }

  /**
   * Get system logs
   */
  async getSystemLogs(params?: {
    skip?: number;
    limit?: number;
    level?: string[];
    module?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  }): Promise<LogListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/logs?${searchParams}`
      : `${this.baseUrl}/logs`;

    return apiClient.get<LogListResponse>(url).then(res => res.data);
  }

  /**
   * Get users statistics
   */
  async getUsersStats(params?: {
    date_from?: string;
    date_to?: string;
    group_by?: 'role' | 'status' | 'department';
  }): Promise<{
    total_users: number;
    active_users: number;
    users_by_role: Record<string, number>;
    users_by_status: Record<string, number>;
    new_users_this_month: number;
    login_activity: Array<{
      date: string;
      unique_logins: number;
    }>;
  }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/users-stats?${searchParams}`
      : `${this.baseUrl}/users-stats`;

    return apiClient.get<{
      total_users: number;
      active_users: number;
      users_by_role: Record<string, number>;
      users_by_status: Record<string, number>;
      new_users_this_month: number;
      login_activity: Array<{
        date: string;
        unique_logins: number;
      }>;
    }>(url).then(res => res.data);  
  }

  /**
   * Get projects statistics  
   */
  async getProjectsStats(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<{
    total_projects: number;
    active_projects: number;
    projects_by_status: Record<string, number>;
    requirements_by_project: Array<{
      project_id: number;
      project_name: string;
      requirements_count: number;
    }>;
  }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/projects-stats?${searchParams}`
      : `${this.baseUrl}/projects-stats`;

    return apiClient.get<{
      total_projects: number;
      active_projects: number;
      projects_by_status: Record<string, number>;
      requirements_by_project: Array<{
        project_id: number;
        project_name: string;
        requirements_count: number;
      }>;
    }>(url).then(res => res.data);
  }

  /**
   * Create system backup
   */
  async createBackup(data: {
    name: string;
    type?: 'full' | 'incremental';
    description?: string;
    include_database?: boolean;
    include_uploads?: boolean;
    include_system_config?: boolean;
  }): Promise<SystemBackup> {
    return apiClient.post<SystemBackup>(`${this.baseUrl}/backup`, data).then(res => res.data);
  }

  /**
   * Get system backups list
   */
  async getBackups(params?: {
    skip?: number;
    limit?: number;
    type?: string;
    status?: string;
    created_from?: string;
    created_to?: string;
  }): Promise<PaginatedResponse<SystemBackup>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/backups?${searchParams}`
      : `${this.baseUrl}/backups`;

    return apiClient.get<PaginatedResponse<SystemBackup>>(url).then(res => res.data);
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(settings: Array<{
    category: string;
    key: string;
    value: string;
    data_type?: string;
  }>): Promise<ApiResponse<SystemSettings[]>> {
    return apiClient.post<ApiResponse<SystemSettings[]>>(`${this.baseUrl}/system-settings`, {
      settings
    }).then(res => res.data);
  }

  /**
   * Get audit log
   */
  async getAuditLog(params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
    action_type?: string;
    resource_type?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  }): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/audit-log?${searchParams}`
      : `${this.baseUrl}/audit-log`;

    return apiClient.get<PaginatedResponse<any>>(url).then(res => res.data);
  }

  /**
   * Get security events
   */
  async getSecurityEvents(params?: {
    skip?: number;
    limit?: number;
    event_type?: string[];
    severity?: string[];
    resolved?: boolean;
    date_from?: string;
    date_to?: string;
  }): Promise<SecurityEventListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/security-events?${searchParams}`
      : `${this.baseUrl}/security-events`;

    return apiClient.get<SecurityEventListResponse>(url).then(res => res.data);
  }

  /**
   * Resolve security event
   */
  async resolveSecurityEvent(eventId: number, data: {
    resolution_notes?: string;
  }): Promise<ApiResponse<SecurityEvent>> {
    return apiClient.post<ApiResponse<SecurityEvent>>(`${this.baseUrl}/security-events/${eventId}/resolve`, data).then(res => res.data);
  }

  /**
   * Get admin dashboard stats
   */
  async getAdminStats(): Promise<AdminStats> {
    return apiClient.get<AdminStats>(`${this.baseUrl}/stats`).then(res => res.data);
  }

  /**
   * Export system data
   */
  async exportSystemData(params?: {
    include_users?: boolean;
    include_projects?: boolean;
    include_requirements?: boolean;
    include_logs?: boolean;
    format?: 'json' | 'csv' | 'excel';
  }): Promise<Blob> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/export?${searchParams}`
      : `${this.baseUrl}/export`;

    return apiClient.get<Blob>(url).then(res => res.data);
  }

  /**
   * Clear system cache
   */
  async clearCache(cache_types?: string[]): Promise<ApiResponse<{
    cleared_caches: string[];
    total_keys_cleared: number;
  }>> {
    return apiClient.post<ApiResponse<any>>(`${this.baseUrl}/cache/clear`, {
      cache_types
    }).then(res => res.data);
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(data: {
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    target_users?: number[];
    target_roles?: string[];
    channels?: ('email' | 'push' | 'in_app')[];
  }): Promise<ApiResponse<{
    sent_count: number;
    failed_count: number;
  }>> {
    return apiClient.post<ApiResponse<{
      sent_count: number;
      failed_count: number;
    }>>(`${this.baseUrl}/notifications`, data).then(res => res.data);
  }
}

// Export API instance for use in application
export const adminApi = new AdminApi(); 