/**
 * Unified API types that match backend Pydantic schemas exactly
 * These types ensure frontend-backend compatibility
 */

// =============================================================================
// Base Types
// =============================================================================

export interface BaseModel {
  id: number;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// User Types (matching backend/app/schemas/user.py)
// =============================================================================

export interface User extends BaseModel {
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  last_login?: string;
  login_count: number;
  failed_login_attempts: number;
  account_locked_until?: string;
  email_verified: boolean;
  phone?: string;
  department?: string;
  position?: string;
  avatar?: string;
  timezone?: string;
  language?: string;
  notification_preferences?: Record<string, any>;
  custom_fields?: Record<string, any>;
}

export interface UserCreate {
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  password: string;
  role?: string;
  phone?: string;
  department?: string;
  position?: string;
  timezone?: string;
  language?: string;
  custom_fields?: Record<string, any>;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
  phone?: string;
  department?: string;
  position?: string;
  timezone?: string;
  language?: string;
  notification_preferences?: Record<string, any>;
  custom_fields?: Record<string, any>;
}

export interface UserWithStats extends User {
  projects_count: number;
  requirements_count: number;
  releases_count: number;
  comments_count: number;
  last_activity?: string;
}

// =============================================================================
// Project Types (matching backend/app/schemas/project.py)
// =============================================================================

export interface Project extends BaseModel {
  name: string;
  code: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency?: string;
  manager_id?: number;
  team_lead_id?: number;
  client_id?: number;
  tags?: string[];
  custom_fields?: Record<string, any>;
  is_public: boolean;
  created_by: number;
  updated_by: number;
  // Relations (populated when needed)
  manager?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  team_lead?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  client?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface ProjectCreate {
  name: string;
  code: string;
  description?: string;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency?: string;
  manager_id?: number;
  team_lead_id?: number;
  client_id?: number;
  tags?: string[];
  custom_fields?: Record<string, any>;
  is_public?: boolean;
}

export interface ProjectUpdate {
  name?: string;
  code?: string;
  description?: string;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency?: string;
  manager_id?: number;
  team_lead_id?: number;
  client_id?: number;
  tags?: string[];
  custom_fields?: Record<string, any>;
  is_public?: boolean;
}

export interface ProjectWithStats extends Project {
  total_requirements: number;
  requirements_completed: number;
  active_releases: number;
  specs_count: number;
  requirement_groups_count: number;
  completion_percentage: number;
  is_completed: boolean;
}

// =============================================================================
// Requirement Types (matching backend/app/schemas/requirement.py)
// =============================================================================

export interface Requirement extends BaseModel {
  title: string;
  description?: string;
  deadline?: string;
  type_id: number;
  priority_id: number;
  status_id: number;
  project_id: number;
  author_id: number;
  last_modified_by: number;
  release_id?: number;
  spec_id?: number;
  tags?: string[];
  acceptance_criteria?: string;
  business_value?: string;
  technical_notes?: string;
  estimated_effort?: number;
  actual_effort?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  complexity?: 'low' | 'medium' | 'high';
  source?: string;
  external_id?: string;
  custom_fields?: Record<string, any>;
}

export interface RequirementCreate {
  title: string;
  description?: string;
  deadline?: string;
  type_id: number;
  priority_id: number;
  status_id: number;
  project_id: number;
  release_id?: number;
  spec_id?: number;
  tags?: string[];
  acceptance_criteria?: string;
  business_value?: string;
  technical_notes?: string;
  estimated_effort?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  complexity?: 'low' | 'medium' | 'high';
  source?: string;
  external_id?: string;
  custom_fields?: Record<string, any>;
}

export interface RequirementUpdate {
  title?: string;
  description?: string;
  deadline?: string;
  type_id?: number;
  priority_id?: number;
  status_id?: number;
  release_id?: number;
  spec_id?: number;
  tags?: string[];
  acceptance_criteria?: string;
  business_value?: string;
  technical_notes?: string;
  estimated_effort?: number;
  actual_effort?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  complexity?: 'low' | 'medium' | 'high';
  source?: string;
  external_id?: string;
  custom_fields?: Record<string, any>;
}

export interface RequirementWithDetails extends Requirement {
  type_name?: string;
  priority_name?: string;
  status_name?: string;
  project_name?: string;
  author_name?: string;
  last_modifier_name?: string;
  release_version?: string;
  spec_name?: string;
}

// =============================================================================
// Release Types (matching backend/app/schemas/release.py)
// =============================================================================

export interface Release extends BaseModel {
  name: string;
  version: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'testing' | 'ready' | 'released' | 'cancelled';
  project_id: number;
  planned_date?: string;
  release_date?: string;
  created_by: number;
  updated_by: number;
  tags?: string[];
  custom_fields?: Record<string, any>;
  // Relations (populated when needed)
  project_name?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

export interface ReleaseCreate {
  name: string;
  version: string;
  description?: string;
  project_id: number;
  status?: 'planned' | 'in_progress' | 'testing' | 'ready' | 'released' | 'cancelled';
  planned_date?: string;
  release_date?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface ReleaseUpdate {
  name?: string;
  version?: string;
  description?: string;
  status?: 'planned' | 'in_progress' | 'testing' | 'ready' | 'released' | 'cancelled';
  planned_date?: string;
  release_date?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface ReleaseWithRequirements extends Release {
  total_requirements: number;
  completed_requirements: number;
  requirements_in_testing: number;
  completion_percentage: number;
  testing_percentage: number;
}

// =============================================================================
// Dashboard Types (matching backend/app/schemas/dashboard.py)
// =============================================================================

export interface DashboardOverviewStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_requirements: number;
  pending_requirements: number;
  approved_requirements: number;
  total_users: number;
  active_users: number;
}

export interface ProjectPerformanceStats {
  completion_rate: number;
  on_time_delivery: number;
  quality_score: number;
  team_productivity: number;
}

export interface TrendingMetricsData {
  requirements_this_week: number;
  requirements_last_week: number;
  releases_this_month: number;
  releases_last_month: number;
  active_teams: number;
  avg_project_duration: number;
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
  health_score: 'good' | 'warning' | 'critical';
}

export interface QuickRequirement {
  id: number;
  title: string;
  project_name: string;
  status: string;
  priority: string;
  assigned_to?: string;
  due_date?: string;
  progress: number;
}

export interface PendingApproval {
  id: number;
  type: 'requirement' | 'release' | 'project' | 'user';
  title: string;
  requested_by: string;
  requested_at: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface ActivityItem {
  id: string;
  type: 'project' | 'requirement' | 'release' | 'user' | 'testing';
  title: string;
  description: string;
  timestamp: string;
  user_name: string;
  user_avatar?: string;
  project_name?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface QuickAccess {
  my_projects: QuickProject[];
  my_requirements: QuickRequirement[];
  pending_approvals: PendingApproval[];
}

export interface DashboardStats {
  overview: DashboardOverviewStats;
  recent_activity: ActivityItem[];
  project_performance: ProjectPerformanceStats;
  trending_metrics: TrendingMetricsData;
  quick_access: QuickAccess;
}

// =============================================================================
// Reference Data Types
// =============================================================================

export interface RequirementType extends BaseModel {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
}

export interface RequirementPriority extends BaseModel {
  name: string;
  description?: string;
  color?: string;
  level: number;
  is_active: boolean;
  sort_order: number;
}

export interface RequirementStatus extends BaseModel {
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  is_final: boolean;
  sort_order: number;
}

export interface RelationshipType extends BaseModel {
  name: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

// =============================================================================
// Testing Types
// =============================================================================

export interface TestResult extends BaseModel {
  test_name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  result_data?: Record<string, any>;
  error_message?: string;
  execution_time?: number;
  requirement_id?: number;
  executed_by: number;
  executed_at: string;
}

export interface TestCase extends BaseModel {
  name: string;
  description?: string;
  test_data?: Record<string, any>;
  expected_result?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_automated: boolean;
  created_by: number;
}

export interface TestPlan extends BaseModel {
  name: string;
  description?: string;
  project_id: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_by: number;
}

// =============================================================================
// Admin Types
// =============================================================================

export interface SystemInfo {
  version: string;
  environment: string;
  database_status: 'healthy' | 'warning' | 'error';
  redis_status?: 'healthy' | 'warning' | 'error';
  uptime: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
}

export interface SystemMetrics {
  api_requests_per_minute: number;
  active_users: number;
  database_connections: number;
  cache_hit_rate: number;
  average_response_time: number;
  error_rate: number;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_projects: number;
  active_projects: number;
  total_requirements: number;
  pending_requirements: number;
  total_releases: number;
  active_releases: number;
  system_health: 'healthy' | 'warning' | 'critical';
}

export interface SystemLog {
  id: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  module?: string;
  user_id?: number;
  ip_address?: string;
  request_id?: string;
  additional_data?: Record<string, any>;
}

export interface SystemBackup {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  size_bytes?: number;
  file_path?: string;
  created_by: number;
  error_message?: string;
}

export interface SystemSettings {
  key: string;
  value: string | number | boolean | object;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  is_sensitive: boolean;
  category: string;
  updated_by: number;
  updated_at: string;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ListParams {
  skip?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}

// =============================================================================
// Auth Types
// =============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  permissions: string[];
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// =============================================================================
// Error Types
// =============================================================================

export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
} 