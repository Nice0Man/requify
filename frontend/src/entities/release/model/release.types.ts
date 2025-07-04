// Release types based on backend contracts - matching /backend/app/schemas/release.py

export interface Release {
  id: number;
  name: string;
  version: string;
  description?: string;
  project_id: number;
  status: string; // Backend uses string, not enum
  planned_date?: string;
  release_date?: string;
  created_at: string;
  updated_at: string;
}

// Base release interface for forms and basic operations
export interface ReleaseBase {
  name: string;
  version: string;
  description?: string;
  project_id: number;
  status?: string;
  planned_date?: string;
}

export interface ReleaseWithDetails extends Release {
  project_name?: string;
}

// Alias for compatibility - this should refer to ReleaseStats
export type ReleaseWithStats = ReleaseStats;

export interface ReleaseCreate {
  name: string;
  version: string;
  description?: string;
  project_id: number;
  status?: string;
  planned_date?: string;
  release_date?: string;
}

// Extended interface for UI forms with additional fields (legacy support)
export interface ReleaseCreateExtended extends ReleaseCreate {
  type?: ReleaseTypeValue;
  requirement_ids?: number[];
  custom_fields?: Record<string, any>;
}

// Create release from requirements
export interface ReleaseCreateFromRequirements {
  name: string;
  version: string;
  description?: string;
  project_id: number;
  requirement_ids: number[];
  planned_date?: string;
  auto_sync?: boolean;
}

// Release specification for documentation generation
export interface ReleaseSpecification {
  id: number;
  release_id: number;
  title: string;
  content: string;
  format: "markdown" | "html" | "pdf";
  template_id?: number;
  generated_at: string;
  generated_by: number;
  version: string;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
  }>;
}

// Release changelog structure
export interface ReleaseChangelog {
  release_id: number;
  version: string;
  release_date: string;
  entries: ChangeLogEntry[];
  summary: {
    new_features: number;
    improvements: number;
    bug_fixes: number;
    breaking_changes: number;
  };
  migration_notes?: string;
  known_issues?: string[];
}

export interface ReleaseUpdate {
  name?: string;
  version?: string;
  description?: string;
  status?: string;
  planned_date?: string;
  release_date?: string;
}

// Release status constants (matching backend string values)
export const ReleaseStatus = {
  DRAFT: "draft",
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  TESTING: "testing",
  READY: "ready",
  PUBLISHED: "published",
  RELEASED: "released",
  CANCELLED: "cancelled",
  PLANNING: "planning",
} as const;

// Export the statuses for compatibility
export const RELEASE_STATUSES = ReleaseStatus;

export type ReleaseStatusType =
  (typeof ReleaseStatus)[keyof typeof ReleaseStatus];

// Modern release type constants with const assertion
export const ReleaseType = {
  MAJOR: "major",
  MINOR: "minor",
  PATCH: "patch",
  HOTFIX: "hotfix",
  BETA: "beta",
  ALPHA: "alpha",
  FEATURE: "feature", // Унифицировано к lowercase
} as const;

// Type inference for modern TypeScript usage
export type ReleaseTypeValue = (typeof ReleaseType)[keyof typeof ReleaseType];

// Legacy enum export for backward compatibility
export enum ReleaseTypeEnum {
  MAJOR = "major",
  MINOR = "minor",
  PATCH = "patch",
  HOTFIX = "hotfix",
  BETA = "beta",
  ALPHA = "alpha",
  FEATURE = "feature",
}

// Legacy interfaces for UI compatibility
export interface ReleaseRequirement {
  priority: string;
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
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  BLOCKED = "blocked",
  CANCELLED = "cancelled",
}

export enum RequirementTestStatus {
  NOT_TESTED = "not_tested",
  TESTING = "testing",
  PASSED = "passed",
  FAILED = "failed",
  BLOCKED = "blocked",
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
  NEW_FEATURE = "new_feature",
  IMPROVEMENT = "improvement",
  BUG_FIX = "bug_fix",
  BREAKING_CHANGE = "breaking_change",
  DEPRECATED = "deprecated",
  REMOVED = "removed",
  SECURITY = "security",
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
  INTERNAL = "internal",
  EXTERNAL = "external",
  INFRASTRUCTURE = "infrastructure",
  THIRD_PARTY = "third_party",
}

export enum DependencyStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  BLOCKED = "blocked",
  CANCELLED = "cancelled",
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
  BINARY = "binary",
  INSTALLER = "installer",
  DOCUMENTATION = "documentation",
  SOURCE_CODE = "source_code",
  DATABASE_SCRIPT = "database_script",
  CONFIGURATION = "configuration",
  DEPLOYMENT_SCRIPT = "deployment_script",
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
  TECHNICAL_LEAD = "technical_lead",
  BUSINESS_ANALYST = "business_analyst",
  QA_LEAD = "qa_lead",
  PROJECT_MANAGER = "project_manager",
  PRODUCT_OWNER = "product_owner",
  SECURITY_OFFICER = "security_officer",
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
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
  DEVELOPMENT = "development",
  TESTING = "testing",
  STAGING = "staging",
  PRODUCTION = "production",
  UAT = "uat",
  DEMO = "demo",
}

export enum EnvironmentStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
  FAILED = "failed",
}

export enum DeploymentStatus {
  NOT_DEPLOYED = "not_deployed",
  DEPLOYING = "deploying",
  DEPLOYED = "deployed",
  FAILED = "failed",
  ROLLING_BACK = "rolling_back",
  ROLLED_BACK = "rolled_back",
}

export enum HealthStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  UNHEALTHY = "unhealthy",
  UNKNOWN = "unknown",
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
  status?: string[];
  type?: ReleaseTypeValue[];
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
  sort_order?: "asc" | "desc";
}

export interface ReleaseListResponse {
  items: Release[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Legacy extended release interface for UI compatibility
export interface ReleaseExtended extends Release {
  type?: ReleaseTypeValue;
  requirements: ReleaseRequirement[];
  change_log: ChangeLogEntry[];
  dependencies: ReleaseDependency[];
  artifacts: ReleaseArtifact[];
  approvals: ReleaseApproval[];
  completion_percentage?: number;
  project_name?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

export interface ReleaseWithDetailsExtended extends ReleaseWithDetails {
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
  by_status: Record<string, number>;
  by_type: Record<ReleaseTypeValue, number>;
  avg_lead_time: number;
  deployment_frequency: number;
  success_rate: number;
  upcoming_releases: number;
  active_releases: number;
  completed_releases: number;
  cancelled_releases: number;
}

export interface ReleaseState {
  releases: Release[];
  currentRelease: ReleaseWithDetailsExtended | null;
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

// Error handling types
export interface ApiError {
  detail:
    | string
    | Array<{
        loc: (string | number)[];
        msg: string;
        type: string;
        input?: any;
      }>;
  error?: string;
  error_description?: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationError {
  [field: string]: string;
}

// Helper functions
export const getReleaseProgress = (release: Release): number => {
  if (!release) return 0;

  switch (release.status) {
    case ReleaseStatus.DRAFT:
    case ReleaseStatus.PLANNING:
      return 10;
    case ReleaseStatus.PLANNED:
      return 25;
    case ReleaseStatus.IN_PROGRESS:
      return 50;
    case ReleaseStatus.TESTING:
      return 75;
    case ReleaseStatus.READY:
      return 90;
    case ReleaseStatus.PUBLISHED:
    case ReleaseStatus.RELEASED:
      return 100;
    case ReleaseStatus.CANCELLED:
      return 0;
    default:
      return 0;
  }
};

export const isReleaseOverdue = (release: Release): boolean => {
  if (!release.planned_date) return false;

  const plannedDate = new Date(release.planned_date);
  const today = new Date();

  return (
    plannedDate < today &&
    release.status !== ReleaseStatus.RELEASED &&
    release.status !== ReleaseStatus.PUBLISHED &&
    release.status !== ReleaseStatus.CANCELLED
  );
};

export const getReleaseStatusColor = (status: string): string => {
  switch (status) {
    case ReleaseStatus.DRAFT:
    case ReleaseStatus.PLANNING:
      return "#gray";
    case ReleaseStatus.PLANNED:
      return "#blue";
    case ReleaseStatus.IN_PROGRESS:
      return "#orange";
    case ReleaseStatus.TESTING:
      return "#purple";
    case ReleaseStatus.READY:
      return "#green";
    case ReleaseStatus.PUBLISHED:
    case ReleaseStatus.RELEASED:
      return "#green";
    case ReleaseStatus.CANCELLED:
      return "#red";
    default:
      return "#gray";
  }
};

export const formatReleaseDate = (dateString?: string): string => {
  if (!dateString) return "Not set";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getReleaseHealthScore = (
  release: ReleaseExtended | ReleaseWithDetailsExtended
): number => {
  if (!release) return 0;

  let score = 100;

  // Penalize for overdue releases
  if (isReleaseOverdue(release)) {
    score -= 30;
  }

  // Consider requirements completion
  if (
    "requirements" in release &&
    release.requirements &&
    release.requirements.length > 0
  ) {
    const completedRequirements = release.requirements.filter(
      (req) =>
        req.implementation_status === RequirementImplementationStatus.COMPLETED
    ).length;
    const completionRate = completedRequirements / release.requirements.length;
    score = score * completionRate;
  }

  // Consider test results (only available on ReleaseWithDetailsExtended)
  if ("test_results" in release && release.test_results) {
    score = score * (release.test_results.pass_rate / 100);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const canPublishRelease = (release: ReleaseExtended): boolean => {
  if (!release) return false;

  // Must be in READY status
  if (release.status !== ReleaseStatus.READY) return false;

  // All requirements must be completed
  if (release.requirements && release.requirements.length > 0) {
    const allCompleted = release.requirements.every(
      (req) =>
        req.implementation_status === RequirementImplementationStatus.COMPLETED
    );
    if (!allCompleted) return false;
  }

  // All required approvals must be approved
  if (release.approvals && release.approvals.length > 0) {
    const requiredApprovals = release.approvals.filter(
      (approval) => approval.required
    );
    const allApproved = requiredApprovals.every(
      (approval) => approval.status === ApprovalStatus.APPROVED
    );
    if (!allApproved) return false;
  }

  return true;
};

export const getReleaseVersionSuggestion = (
  lastVersion: string,
  changeType: "major" | "minor" | "patch" = "minor"
): string => {
  if (!lastVersion) return "1.0.0";

  const versionRegex = /^(\d+)\.(\d+)\.(\d+)$/;
  const match = lastVersion.match(versionRegex);

  if (!match) return "1.0.0";

  let [, major, minor, patch] = match.map(Number);

  switch (changeType) {
    case "major":
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case "minor":
      minor += 1;
      patch = 0;
      break;
    case "patch":
      patch += 1;
      break;
  }

  return `${major}.${minor}.${patch}`;
};
