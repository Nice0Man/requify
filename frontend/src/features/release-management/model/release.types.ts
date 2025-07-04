// Release management feature типы - импортируем базовые типы из entities
// Этот файл содержит только типы, специфичные для release management фичи

// Импорты из entities слоя (бизнес-сущности)
export type {
  Release,
  ReleaseCreate,
  ReleaseUpdate,
  ReleaseWithDetails,
  ReleaseWithStats,
  ReleaseStatus,
} from '@/entities/release/model/types';

// Импорты из shared слоя (API типы)
export type {
  PaginatedResponse,
  ListParams,
  ApiError,
} from '@/shared/types/api';

// =============================================================================
// Feature-Specific Types (UI, формы, состояние)
// =============================================================================

// Legacy support для обратной совместимости
export interface ReleaseCreateExtended extends ReleaseCreate {
  type?: ReleaseType;
  requirement_ids?: number[];
  custom_fields?: Record<string, any>;
}

// Типы для UI управления релизами
export enum ReleaseType {
  MAJOR = "major",
  MINOR = "minor",
  PATCH = "patch",
  HOTFIX = "hotfix",
  BETA = "beta",
  ALPHA = "alpha",
  FEATURE = "FEATURE",
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

export interface ReleaseFilters {
  project_id?: number;
  status?: string[];
  type?: ReleaseType[];
  planned_from?: string;
  planned_to?: string;
  actual_from?: string;
  actual_to?: string;
  search?: string;
  created_by?: number[];
}

export interface ReleaseExtended extends Release {
  type?: ReleaseType;
  requirements: ReleaseRequirement[];
  change_log: ChangeLogEntry[];
  dependencies: ReleaseDependency[];
  completion_percentage?: number;
  project_name?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

export interface ReleaseStats {
  total_releases: number;
  by_status: Record<string, number>;
  by_type: Record<ReleaseType, number>;
  avg_lead_time: number;
  deployment_frequency: number;
  success_rate: number;
  upcoming_releases: number;
}

export interface ReleaseState {
  releases: Release[];
  currentRelease: ReleaseExtended | null;
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

export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationError {
  [field: string]: string;
}
