// Release types based on backend contracts

export interface Release {
  completion_percentage: number;
  id: number;
  name: string;
  version: string;
  description?: string;
  status: ReleaseStatus;
  type: ReleaseType;
  project_id: number;
  project_name?: string;
  planned_date?: string;
  actual_date?: string;
  requirements: ReleaseRequirement[];
  change_log: ChangeLogEntry[];
  dependencies: ReleaseDependency[];
  artifacts: ReleaseArtifact[];
  approvals: ReleaseApproval[];
  created_by: number;
  created_by_name?: string;
  updated_by: number;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
  custom_fields?: Record<string, any>;
}

export interface ReleaseCreate {
  name: string;
  version: string;
  description?: string;
  type: ReleaseType;
  project_id: number;
  planned_date?: string;
  requirement_ids?: number[];
  custom_fields?: Record<string, any>;
}

export interface ReleaseUpdate {
  name?: string;
  version?: string;
  description?: string;
  status?: ReleaseStatus;
  type?: ReleaseType;
  planned_date?: string;
  actual_date?: string;
  requirement_ids?: number[];
  custom_fields?: Record<string, any>;
}

export enum ReleaseStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  TESTING = 'testing',
  READY = 'ready',
  RELEASED = 'released',
  CANCELLED = 'cancelled',
  ROLLED_BACK = 'rolled_back'
}

export enum ReleaseType {
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch',
  HOTFIX = 'hotfix',
  BETA = 'beta',
  ALPHA = 'alpha',
  FEATURE = "FEATURE"
}

export interface ReleaseRequirement {
  id: number;
  requirement_id: number;
  requirement_title: string;
  requirement_status: string;
  implementation_status: RequirementImplementationStatus;
  test_status: RequirementTestStatus;
  notes?: string;
  added_at: string;
  completed_at?: string;
}

export enum RequirementImplementationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled'
}

export enum RequirementTestStatus {
  NOT_TESTED = 'not_tested',
  TESTING = 'testing',
  PASSED = 'passed',
  FAILED = 'failed',
  BLOCKED = 'blocked'
}

export interface ChangeLogEntry {
  id: number;
  type: ChangeType;
  category: string;
  description: string;
  requirement_id?: number;
  author_id: number;
  author_name?: string;
  created_at: string;
}

export enum ChangeType {
  NEW_FEATURE = 'new_feature',
  IMPROVEMENT = 'improvement',
  BUG_FIX = 'bug_fix',
  BREAKING_CHANGE = 'breaking_change',
  DEPRECATED = 'deprecated',
  REMOVED = 'removed',
  SECURITY = 'security'
}

export interface ReleaseDependency {
  id: number;
  dependency_type: DependencyType;
  name: string;
  version?: string;
  description?: string;
  status: DependencyStatus;
  blocking: boolean;
  resolved_at?: string;
}

export enum DependencyType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  INFRASTRUCTURE = 'infrastructure',
  THIRD_PARTY = 'third_party'
}

export enum DependencyStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled'
}

export interface ReleaseArtifact {
  id: number;
  name: string;
  type: ArtifactType;
  file_path: string;
  file_size: number;
  checksum: string;
  version: string;
  description?: string;
  uploaded_by: number;
  uploaded_by_name?: string;
  uploaded_at: string;
}

export enum ArtifactType {
  BINARY = 'binary',
  INSTALLER = 'installer',
  DOCUMENTATION = 'documentation',
  SOURCE_CODE = 'source_code',
  DATABASE_SCRIPT = 'database_script',
  CONFIGURATION = 'configuration',
  DEPLOYMENT_SCRIPT = 'deployment_script'
}

export interface ReleaseApproval {
  id: number;
  approver_id: number;
  approver_name: string;
  role: ApprovalRole;
  status: ApprovalStatus;
  notes?: string;
  approved_at?: string;
  required: boolean;
}

export enum ApprovalRole {
  TECHNICAL_LEAD = 'technical_lead',
  BUSINESS_ANALYST = 'business_analyst',
  QA_LEAD = 'qa_lead',
  PROJECT_MANAGER = 'project_manager',
  PRODUCT_OWNER = 'product_owner',
  SECURITY_OFFICER = 'security_officer'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export interface ReleaseEnvironment {
  id: number;
  name: string;
  type: EnvironmentType;
  status: EnvironmentStatus;
  url?: string;
  deployment_date?: string;
  deployment_status: DeploymentStatus;
  health_check_url?: string;
  health_status?: HealthStatus;
  version?: string;
  configuration?: Record<string, any>;
}

export enum EnvironmentType {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production',
  UAT = 'uat',
  DEMO = 'demo'
}

export enum EnvironmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  FAILED = 'failed'
}

export enum DeploymentStatus {
  NOT_DEPLOYED = 'not_deployed',
  DEPLOYING = 'deploying',
  DEPLOYED = 'deployed',
  FAILED = 'failed',
  ROLLING_BACK = 'rolling_back',
  ROLLED_BACK = 'rolled_back'
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

export interface ReleaseMetrics {
  deployment_frequency: number;
  lead_time: number;
  mean_time_to_recovery: number;
  change_failure_rate: number;
  requirements_completion_rate: number;
  test_pass_rate: number;
  defect_density: number;
}

export interface ReleaseFilters {
  project_id?: number;
  status?: ReleaseStatus[];
  type?: ReleaseType[];
  planned_from?: string;
  planned_to?: string;
  actual_from?: string;
  actual_to?: string;
  search?: string;
  created_by?: number[];
}

export interface ReleaseListParams {
  skip?: number;
  limit?: number;
  filters?: ReleaseFilters;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ReleaseListResponse {
  items: Release[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ReleaseWithDetails extends Release {
  environments: ReleaseEnvironment[];
  metrics: ReleaseMetrics;
  test_results: {
    total_tests: number;
    passed: number;
    failed: number;
    blocked: number;
    pass_rate: number;
  };
  deployment_history: Array<{
    environment: string;
    status: DeploymentStatus;
    deployed_at: string;
    deployed_by: string;
    duration: number;
  }>;
}

export interface ReleaseStats {
  total_releases: number;
  by_status: Record<ReleaseStatus, number>;
  by_type: Record<ReleaseType, number>;
  avg_lead_time: number;
  deployment_frequency: number;
  success_rate: number;
  upcoming_releases: number;
}

export interface ReleaseState {
  releases: Release[];
  currentRelease: ReleaseWithDetails | null;
  environments: ReleaseEnvironment[];
  stats: ReleaseStats | null;
  isLoading: boolean;
  error: string | null;
  filters: ReleaseFilters;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
} 