// Admin types based on backend contracts

export interface SystemInfo {
  version: string;
  environment: string;
  uptime: number;
  database: DatabaseInfo;
  cache: CacheInfo;
  storage: StorageInfo;
  api_health: ApiHealthInfo;
}

export interface DatabaseInfo {
  status: 'healthy' | 'degraded' | 'down';
  connection_count: number;
  max_connections: number;
  query_performance: {
    avg_query_time: number;
    slow_queries_count: number;
  };
  size: number;
  last_backup: string;
}

export interface CacheInfo {
  status: 'healthy' | 'degraded' | 'down';
  hit_rate: number;
  memory_usage: number;
  max_memory: number;
  connected_clients: number;
}

export interface StorageInfo {
  status: 'healthy' | 'degraded' | 'down';
  used_space: number;
  total_space: number;
  available_space: number;
  uploads_count: number;
}

export interface ApiHealthInfo {
  status: 'healthy' | 'degraded' | 'down';
  response_time: number;
  error_rate: number;
  requests_per_minute: number;
  active_sessions: number;
}

export interface SystemMetrics {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: {
    bytes_in: number;
    bytes_out: number;
  };
  api_metrics: {
    total_requests: number;
    successful_requests: number;
    error_rate: number;
    avg_response_time: number;
  };
  user_metrics: {
    active_users: number;
    new_registrations: number;
    login_attempts: number;
    failed_logins: number;
  };
}

export interface UserManagement {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_active: boolean;
  is_superuser: boolean;
  last_login?: string;
  login_count: number;
  failed_login_attempts: number;
  account_locked_until?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  permissions: string[];
  projects_count: number;
  requirements_count: number;
}

export interface UserCreate {
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  password: string;
  send_invite_email?: boolean;
  permissions?: string[];
}

export interface UserUpdate {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_active?: boolean;
  permissions?: string[];
}

export enum UserRole {
  ADMIN = 'admin',
  PRODUCT_MANAGER = 'product_manager',
  MANAGER = 'manager',
  SENIOR_DEVELOPER = 'senior_developer',
  DEVELOPER = 'developer',
  ANALYST = 'analyst',
  TESTER = 'tester',
  VIEWER = 'viewer'
}

export interface UserActivity {
  id: number;
  user_id: number;
  user_email: string;
  action: string;
  entity_type?: string;
  entity_id?: number;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface SystemSettings {
  id: number;
  category: SettingCategory;
  key: string;
  value: string;
  data_type: SettingDataType;
  description?: string;
  is_public: boolean;
  updated_by: number;
  updated_at: string;
}

export enum SettingCategory {
  GENERAL = 'general',
  SECURITY = 'security',
  EMAIL = 'email',
  NOTIFICATIONS = 'notifications',
  INTEGRATIONS = 'integrations',
  APPEARANCE = 'appearance',
  BACKUP = 'backup'
}

export enum SettingDataType {
  STRING = 'string',
  INTEGER = 'integer',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  JSON = 'json',
  PASSWORD = 'password'
}

export interface SystemBackup {
  id: number;
  name: string;
  type: BackupType;
  status: BackupStatus;
  file_path?: string;
  file_size?: number;
  includes: BackupIncludes;
  started_at: string;
  completed_at?: string;
  created_by: number;
  created_by_name?: string;
  error_message?: string;
}

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential'
}

export enum BackupStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface BackupIncludes {
  database: boolean;
  uploads: boolean;
  system_config: boolean;
  user_data: boolean;
}

export interface SystemLog {
  id: number;
  level: LogLevel;
  message: string;
  module: string;
  function_name?: string;
  user_id?: number;
  user_email?: string;
  ip_address?: string;
  request_id?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface SecurityEvent {
  id: number;
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  user_id?: number;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  resolved: boolean;
  resolved_by?: number;
  resolved_at?: string;
  timestamp: string;
}

export enum SecurityEventType {
  FAILED_LOGIN = 'failed_login',
  ACCOUNT_LOCKED = 'account_locked',
  PERMISSION_DENIED = 'permission_denied',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  MALICIOUS_REQUEST = 'malicious_request',
  UNAUTHORIZED_ACCESS = 'unauthorized_access'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Integration {
  id: number;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  configuration: Record<string, any>;
  last_sync?: string;
  sync_frequency?: number;
  error_message?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export enum IntegrationType {
  PROJECT_MANAGEMENT = 'project_management',
  VERSION_CONTROL = 'version_control',
  CI_CD = 'ci_cd',
  TESTING_TOOLS = 'testing_tools',
  NOTIFICATION = 'notification',
  SSO = 'sso',
  DATABASE = 'database',
  FILE_STORAGE = 'file_storage'
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING = 'pending'
}

export interface AdminFilters {
  user_role?: UserRole[];
  user_status?: ('active' | 'inactive')[];
  date_from?: string;
  date_to?: string;
  search?: string;
  log_level?: LogLevel[];
  event_type?: SecurityEventType[];
  resolved?: boolean;
}

export interface AdminListParams {
  skip?: number;
  limit?: number;
  filters?: AdminFilters;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UserListResponse {
  items: UserManagement[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ActivityListResponse {
  items: UserActivity[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface LogListResponse {
  items: SystemLog[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface SecurityEventListResponse {
  items: SecurityEvent[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    by_role: Record<UserRole, number>;
    new_this_month: number;
  };
  system: {
    uptime: number;
    total_requests: number;
    avg_response_time: number;
    error_rate: number;
  };
  security: {
    failed_logins_today: number;
    security_events_today: number;
    open_security_events: number;
    locked_accounts: number;
  };
  content: {
    total_projects: number;
    total_requirements: number;
    total_test_cases: number;
    total_releases: number;
  };
}

export interface AdminState {
  systemInfo: SystemInfo | null;
  systemMetrics: SystemMetrics[];
  users: UserManagement[];
  currentUser: UserManagement | null;
  activities: UserActivity[];
  systemLogs: SystemLog[];
  securityEvents: SecurityEvent[];
  systemSettings: SystemSettings[];
  backups: SystemBackup[];
  integrations: Integration[];
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
  filters: AdminFilters;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
} 