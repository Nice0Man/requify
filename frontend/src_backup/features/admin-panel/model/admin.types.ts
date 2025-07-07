// Admin Panel Feature Types
// Business-level types that extend entity types with feature-specific logic

import type {
  UserManagement,
  SystemInfo,
  SystemMetrics,
  AdminStats,
  SecurityEvent,
  SystemLog,
  SystemBackup,
  LogLevel,
  SecurityEventType,
  SecuritySeverity,
  UserRole,
} from '@/entities/admin/model/types';

// Re-export entity types for convenience
export type {
  UserManagement,
  SystemInfo,
  SystemMetrics,
  AdminStats,
  SecurityEvent,
  SystemLog,
  SystemBackup,
  LogLevel,
  SecurityEventType,
  SecuritySeverity,
  UserRole,
};

// Feature-specific Dashboard State
export interface AdminDashboardState {
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  
  // Dashboard data
  systemInfo: SystemInfo | null;
  metrics: SystemMetrics | null;
  stats: AdminStats | null;
  recentLogs: SystemLog[];
  securityEvents: SecurityEvent[];
  
  // Health summary
  healthSummary: {
    overall: 'healthy' | 'warning' | 'critical';
    components: Record<string, 'healthy' | 'warning' | 'critical'>;
    uptime: number;
  } | null;
  
  // Security summary
  securitySummary: {
    totalEvents: number;
    criticalEvents: number;
    resolvedToday: number;
    failedLoginsToday: number;
    topThreats: Array<{
      type: string;
      count: number;
      severity: string;
    }>;
  } | null;
}

// User Management State
export interface AdminUserManagementState {
  isLoading: boolean;
  users: UserManagement[];
  total: number;
  currentPage: number;
  totalPages: number;
  filters: AdminUserFilters;
  selectedUsers: number[];
  bulkOperationInProgress: boolean;
  error: string | null;
}

export interface AdminUserFilters {
  search: string;
  role: string[];
  status: string[];
  department: string;
  dateFrom: string;
  dateTo: string;
  limit: number;
}

// System Management State
export interface AdminSystemState {
  isLoading: boolean;
  backups: SystemBackup[];
  systemLogs: SystemLog[];
  securityEvents: SecurityEvent[];
  settings: Record<string, any>;
  maintenanceMode: boolean;
  error: string | null;
  
  // Logs filtering
  logFilters: {
    level: LogLevel[];
    module: string;
    dateFrom: string;
    dateTo: string;
    search: string;
  };
  
  // Security events filtering
  securityFilters: {
    eventType: SecurityEventType[];
    severity: SecuritySeverity[];
    resolved: boolean | null;
    dateFrom: string;
    dateTo: string;
  };
}

// Admin Action Types
export type AdminAction =
  | { type: 'DASHBOARD_LOAD_START' }
  | { type: 'DASHBOARD_LOAD_SUCCESS'; payload: Partial<AdminDashboardState> }
  | { type: 'DASHBOARD_LOAD_ERROR'; payload: string }
  | { type: 'USERS_LOAD_START' }
  | { type: 'USERS_LOAD_SUCCESS'; payload: { users: UserManagement[]; total: number; page: number; totalPages: number } }
  | { type: 'USERS_LOAD_ERROR'; payload: string }
  | { type: 'USERS_SET_FILTERS'; payload: Partial<AdminUserFilters> }
  | { type: 'USERS_SELECT'; payload: number[] }
  | { type: 'USERS_BULK_OPERATION_START' }
  | { type: 'USERS_BULK_OPERATION_SUCCESS' }
  | { type: 'USERS_BULK_OPERATION_ERROR'; payload: string }
  | { type: 'SYSTEM_LOAD_START' }
  | { type: 'SYSTEM_LOAD_SUCCESS'; payload: Partial<AdminSystemState> }
  | { type: 'SYSTEM_LOAD_ERROR'; payload: string }
  | { type: 'SYSTEM_SET_LOG_FILTERS'; payload: Partial<AdminSystemState['logFilters']> }
  | { type: 'SYSTEM_SET_SECURITY_FILTERS'; payload: Partial<AdminSystemState['securityFilters']> }
  | { type: 'SYSTEM_TOGGLE_MAINTENANCE'; payload: boolean };

// Admin Permission Constants
export const ADMIN_PERMISSIONS = {
  READ_USERS: 'admin:users:read',
  WRITE_USERS: 'admin:users:write',
  DELETE_USERS: 'admin:users:delete',
  READ_SYSTEM: 'admin:system:read',
  WRITE_SYSTEM: 'admin:system:write',
  READ_LOGS: 'admin:logs:read',
  CLEAR_LOGS: 'admin:logs:clear',
  READ_SECURITY: 'admin:security:read',
  RESOLVE_SECURITY: 'admin:security:resolve',
  CREATE_BACKUP: 'admin:backup:create',
  RESTORE_BACKUP: 'admin:backup:restore',
  MAINTENANCE_MODE: 'admin:system:maintenance',
} as const;

// Admin UI Configuration
export interface AdminTabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  requiredPermissions: string[];
  badge?: () => Promise<number | string | null>;
}

// Data Export Options
export interface AdminExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeUsers: boolean;
  includeLogs: boolean;
  includeSecurityEvents: boolean;
  includeSystemInfo: boolean;
  dateRange: {
    start: string;
    end: string;
  };
}

// Backup Configuration
export interface AdminBackupConfig {
  name: string;
  type: 'full' | 'incremental';
  description?: string;
  includeDatabase: boolean;
  includeUploads: boolean;
  includeSystemConfig: boolean;
  includeUserData: boolean;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    enabled: boolean;
  };
}

// System Alert Configuration
export interface AdminSystemAlert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'security' | 'custom';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  threshold?: number;
  currentValue?: number;
  timestamp: Date;
  acknowledged: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

// Admin Notification Settings
export interface AdminNotificationSettings {
  emailAlerts: boolean;
  pushNotifications: boolean;
  securityEvents: boolean;
  systemAlerts: boolean;
  userRegistrations: boolean;
  backupStatus: boolean;
  alertThresholds: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    errorRate: number;
  };
} 