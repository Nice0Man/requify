import { apiClient } from '@/shared/api/client';
import type { 
  SystemInfo,
  SystemMetrics,
  UserManagement,
  UserCreate,
  UserUpdate,
  AdminStats,
  HealthCheckResponse,
  SystemLog,
  SecurityEvent,
  SystemBackup,
  AdminFilters,
  UserListResponse,
  UserRole,
  LogLevel
} from '@/entities/admin';

export const adminApi = {
  // System health and information
  async getSystemInfo() {
    return apiClient.get<SystemInfo>('/api/v1/admin/system-info');
  },

  async getMetrics() {
    return apiClient.get<SystemMetrics>('/api/v1/admin/metrics');
  },

  async getHealth() {
    return apiClient.get<HealthCheckResponse>('/api/v1/admin/health');
  },

  // User management
  async getUsers(filters?: AdminFilters) {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.user_role?.length) {
      filters.user_role.forEach((role: UserRole) => params.append('user_role', role));
    }
    if (filters?.user_status?.length) {
      filters.user_status.forEach((status: string) => params.append('user_status', status));
    }
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const queryString = params.toString();
    const url = `/api/v1/admin/users${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<UserListResponse>(url);
  },

  async createUser(userData: UserCreate) {
    return apiClient.post<UserManagement>('/api/v1/admin/users', userData);
  },

  async updateUser(userId: number, userData: UserUpdate) {
    return apiClient.put<UserManagement>(`/api/v1/admin/users/${userId}`, userData);
  },

  async deleteUser(userId: number) {
    return apiClient.delete(`/api/v1/admin/users/${userId}`);
  },

  async activateUser(userId: number) {
    return apiClient.post(`/api/v1/users/${userId}/activate`);
  },

  async deactivateUser(userId: number) {
    return apiClient.post(`/api/v1/users/${userId}/deactivate`);
  },

  // Statistics and reports
  async getAdminStats() {
    return apiClient.get<AdminStats>('/api/v1/admin/stats');
  },

  async getUserStats() {
    return apiClient.get('/api/v1/admin/users-stats');
  },

  async getProjectStats() {
    return apiClient.get('/api/v1/admin/projects-stats');
  },

  // Logs and audit
  async getSystemLogs(filters?: AdminFilters) {
    const params = new URLSearchParams();
    
    if (filters?.log_level?.length) {
      filters.log_level.forEach((level: LogLevel) => params.append('log_level', level));
    }
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const queryString = params.toString();
    const url = `/api/v1/admin/logs${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<{ items: SystemLog[]; total: number }>(url);
  },

  async getAuditLog(filters?: AdminFilters) {
    const params = new URLSearchParams();
    
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `/api/v1/admin/audit-log${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<{ items: SecurityEvent[]; total: number }>(url);
  },

  // Backup management
  async getBackups() {
    return apiClient.get<{ items: SystemBackup[]; total: number }>('/api/v1/admin/backups');
  },

  async createBackup(backupData: { description?: string; includes?: any }) {
    return apiClient.post<SystemBackup>('/api/v1/admin/backup', backupData);
  },

  // System settings
  async updateSystemSettings(settings: Record<string, any>) {
    return apiClient.post('/api/v1/admin/system-settings', settings);
  },

  // Bulk operations
  async bulkActivateUsers(userIds: number[]) {
    return Promise.all(userIds.map(id => this.activateUser(id)));
  },

  async bulkDeactivateUsers(userIds: number[]) {
    return Promise.all(userIds.map(id => this.deactivateUser(id)));
  },

  async bulkDeleteUsers(userIds: number[]) {
    return Promise.all(userIds.map(id => this.deleteUser(id)));
  },

  // Real-time monitoring
  async subscribeToSystemMetrics(): Promise<EventSource> {
    return new EventSource('/api/v1/admin/metrics/stream');
  },

  async subscribeToSystemLogs(): Promise<EventSource> {
    return new EventSource('/api/v1/admin/logs/stream');
  }
}; 