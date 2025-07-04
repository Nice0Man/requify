// Requirement management feature типы - импортируем базовые типы из entities
// Этот файл содержит только типы, специфичные для requirement management фичи

// Импорты из entities слоя (бизнес-сущности)
export type {
  Requirement,
  RequirementCreate,
  RequirementUpdate,
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  RequirementRelationship,
  RequirementRelationshipCreate,
  RequirementWithDetails,
  RequirementWithStats,
} from '@/entities/requirement/model/types';

// Импорты из shared слоя (API типы)
export type {
  PaginatedResponse,
  ListParams,
  SearchParams,
} from '@/shared/types/api';

// Расширение ListParams для requirement-specific параметров
export interface RequirementListParams extends ListParams {
  project_id?: number;
  status_id?: number;
  priority_id?: number;
  type_id?: number;
  assignee_id?: number;
  author_id?: number;
}

// =============================================================================
// Feature-Specific Types (UI, формы, состояние)
// =============================================================================

export interface RequirementFilters {
  search: string;
  projectId: number | null;
  statusIds: number[];
  priorityIds: number[];
  typeIds: number[];
  assigneeIds: number[];
  authorIds: number[];
  hasParent: boolean | null;
  isOverdue: boolean | null;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

export interface RequirementFormData extends RequirementCreate {
  // Additional UI-specific fields if needed
}

export interface RequirementValidationError {
  [field: string]: string;
}

export interface RequirementApiError {
  detail:
    | string
    | Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
    input?: any;
  }>;
  error_description?: string;
}

export interface RequirementStats {
  total: number;
  completed: number;
  in_progress: number;
  pending: number;
}

export interface RequirementStatusChange {
  status_id: number;
  reason?: string;
}

// Комментарии к требованиям
export interface RequirementComment {
  id: number;
  requirement_id: number;
  content: string;
  author_id: number;
  author_name: string;
  created_at: string;
  updated_at: string;
}

// UI состояние для requirement management фичи
export interface RequirementManagementState {
  requirements: RequirementWithDetails[];
  currentRequirement: RequirementWithDetails | null;
  isLoading: boolean;
  error: string | null;
  filters: RequirementFilters;
  stats: RequirementStats | null;
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}
