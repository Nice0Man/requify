export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next?: boolean;
  has_prev?: boolean;
}

export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
  status_code?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ErrorResponse {
  error: string;
  error_description?: string;
  error_details?: Record<string, any>;
  validation_errors?: ValidationError[];
}

// =============================================================================
// Запрос/ответ параметры
// =============================================================================

export interface ListParams {
  skip?: number;
  limit?: number;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
  filters?: Record<string, any>;
}

export interface SearchParams {
  q?: string;
  filters?: Record<string, any>;
  sort?: string;
  page?: number;
  per_page?: number;
}

// =============================================================================
// Auth API типы (точно соответствуют backend/app/schemas/auth.py)
// =============================================================================

export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  user: UserProfile;
  permissions: string[];
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in?: number;
}

export interface TokenValidationRequest {
  token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  expires_at?: string;
  user?: UserProfile;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirm {
  token: string;
}

export interface EmailVerificationResponse {
  message: string;
  verified: boolean;
}

// Профиль пользователя для auth ответов
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  name?: string;
  role: string;
  is_active: boolean;
  is_superuser: boolean;
  email_verified: boolean;
  email_verified_at?: string;
  last_login?: string;
  permissions?: string[];
  avatar?: string;
  first_name?: string;
  last_name?: string;
}

// =============================================================================
// Dashboard API типы (точно соответствуют backend/app/schemas/dashboard.py)
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
  health_score: "good" | "warning" | "critical";
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
  type: "requirement" | "release" | "project" | "user";
  title: string;
  requested_by: string;
  requested_at: string;
  urgency: "low" | "medium" | "high";
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

export interface UserDashboardPreferences {
  show_quick_stats: boolean;
  show_recent_activity: boolean;
  show_my_projects: boolean;
  show_pending_approvals: boolean;
  default_project_filter?: string;
  activity_limit: number;
  refresh_interval: number;
}

export interface MyDashboardResponse {
  my_projects: QuickProject[];
  my_requirements: QuickRequirement[];
  my_activity: ActivityItem[];
  notifications: DashboardNotification[];
  preferences: UserDashboardPreferences;
}

// =============================================================================
// Типы сессий
// =============================================================================

export interface ActiveSession {
  id: number;
  created_at: string;
  last_used_at?: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
  is_current: boolean;
}

export interface SessionListResponse {
  sessions: ActiveSession[];
  total: number;
}

export interface RevokeSessionRequest {
  session_id?: number;
  revoke_all?: boolean;
}

// =============================================================================
// All API types are exported automatically through export interface
// =============================================================================

// =============================================================================
// Comment API Types (shared across features)
// =============================================================================

export interface CommentBase {
  content: string;
}

export interface Comment extends CommentBase {
  id: number;
  requirement_id: number;
  author_id: number;
  created_at: string;
}

export interface CommentCreate extends CommentBase {
  requirement_id: number;
  author_id?: number;
}

export interface CommentCreateForRequirement extends CommentBase {}

export interface CommentUpdate {
  content?: string;
}

export interface CommentWithAuthor extends Comment {
  author_name?: string;
  author_email?: string;
  requirement_title?: string;
}

// =============================================================================
// Specification API Types (shared across features)
// =============================================================================

export interface SpecificationBase {
  name: string;
  description?: string;
  version?: string;
  format?: string;
  language?: string;
}

export interface Specification extends SpecificationBase {
  id: number;
  project_id: number;
  content?: Record<string, any>;
  status?: SpecificationStatus;
  template_id?: number;
  generated_by?: number;
  created_at: string;
  updated_at?: string;
}

export interface SpecificationCreate extends SpecificationBase {
  project_id: number;
  content?: Record<string, any>;
  status?: SpecificationStatus;
  template_id?: number;
  generated_by?: number;
}

export interface SpecificationUpdate {
  name?: string;
  description?: string;
  version?: string;
  content?: Record<string, any>;
  format?: string;
  language?: string;
  status?: SpecificationStatus;
  template_id?: number;
}

export interface SpecificationRequirement {
  id: number;
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
}

export enum SpecificationStatus {
  DRAFT = "draft",
  IN_REVIEW = "in_review",
  APPROVED = "approved",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum DocumentFormat {
  PDF = "pdf",
  HTML = "html",
  DOCX = "docx",
  MARKDOWN = "markdown",
}

export interface GenerateDocumentRequest {
  format: DocumentFormat;
  language?: string;
  template?: string;
  include_requirements?: boolean;
  include_metadata?: boolean;
}

export interface GenerateDocumentResponse {
  document_id: string;
  download_url: string;
  format: DocumentFormat;
  generated_at: string;
  file_size?: number;
}

// =============================================================================
// Relationship API Types (shared across features)
// =============================================================================

export interface RelationshipBase {
  source_requirement_id: number;
  target_requirement_id: number;
  relationship_type_id: number;
  description?: string;
}

export interface Relationship extends RelationshipBase {
  id: number;
  created_at: string;
  created_by?: number;
  validated?: boolean;
  validation_notes?: string;
}

export interface RelationshipCreate extends RelationshipBase {
  created_by?: number;
}

export interface RelationshipUpdate {
  relationship_type_id?: number;
  description?: string;
  validated?: boolean;
  validation_notes?: string;
}

export interface RequirementDependency {
  requirement_id: number;
  title: string;
  level: number;
  dependency_type: string;
  description?: string;
}

export interface TraceMatrixEntry {
  source_id: number;
  target_id: number;
  relationship_type: string;
  path_length: number;
  direct: boolean;
}

export interface TraceMatrix {
  requirement_id: number;
  requirement_title: string;
  forward_traces: TraceMatrixEntry[];
  backward_traces: TraceMatrixEntry[];
  statistics: {
    total_forward: number;
    total_backward: number;
    max_depth: number;
  };
}

// =============================================================================
// Reference Data API Types (shared across features)
// =============================================================================

export interface RequirementType {
  id: number;
  name: string;
  description?: string;
}

export interface RequirementTypeCreate {
  name: string;
  description?: string;
}

export interface RequirementPriority {
  id: number;
  name: string;
  description?: string;
  level?: number;
}

export interface RequirementPriorityCreate {
  name: string;
  description?: string;
  level?: number;
}

export interface RequirementStatus {
  id: number;
  name: string;
  description?: string;
}

export interface RequirementStatusCreate {
  name: string;
  description?: string;
}

export interface RelationshipType {
  id: number;
  name: string;
  description?: string;
}

export interface RelationshipTypeCreate {
  name: string;
  description?: string;
}
