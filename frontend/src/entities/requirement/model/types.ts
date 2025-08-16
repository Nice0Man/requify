/**
 * Requirement Entity Types - Типы сущности требований
 * Соответствуют backend API schemas
 */

// =============================================================================
// Основные типы требований (соответствуют backend/app/schemas/requirement.py)
// =============================================================================

export interface RequirementBase {
  title: string;
  description: string;
  project_id: number;
  type: RequirementType;
  priority: RequirementPriority;
  status: RequirementStatus;
  assignee_id?: number;
}

export interface RequirementCreate extends RequirementBase {}

export interface RequirementUpdate {
  title?: string;
  description?: string;
  type?: RequirementType;
  priority?: RequirementPriority;
  status?: RequirementStatus;
  assignee_id?: number;
  tags?: string[];
  progress?: number;
}

export interface Requirement extends RequirementBase {
  id: number;
  author_id: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  progress: number;
  is_active: boolean;
}

// =============================================================================
// Типы и статусы требований (соответствуют backend валидации)
// =============================================================================

export const REQUIREMENT_TYPES = [
  'functional',
  'non_functional',
  'business',
  'user_story',
  'epic',
  'technical',
] as const;

export type RequirementType = typeof REQUIREMENT_TYPES[number];

export const REQUIREMENT_PRIORITIES = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

export type RequirementPriority = typeof REQUIREMENT_PRIORITIES[number];

export const REQUIREMENT_STATUSES = [
  'draft',
  'review',
  'approved',
  'in_development',
  'testing',
  'completed',
  'rejected',
  'blocked',
] as const;

export type RequirementStatus = typeof REQUIREMENT_STATUSES[number];

// =============================================================================
// API Response типы
// =============================================================================

export interface RequirementListResponse {
  requirements: Requirement[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface RequirementDetailResponse {
  requirement: Requirement;
}

export interface RequirementQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  project_id?: number;
  type?: RequirementType;
  priority?: RequirementPriority;
  status?: RequirementStatus;
  assignee_id?: number;
  author_id?: number;
  tags?: string[];
  created_from?: string;
  created_to?: string;
  sort_by?: 'title' | 'created_at' | 'updated_at' | 'priority' | 'status';
  sort_order?: 'asc' | 'desc';
}

// =============================================================================
// Связи между требованиями
// =============================================================================

export interface RequirementRelationship {
  id: number;
  source_requirement_id: number;
  target_requirement_id: number;
  relationship_type: 'depends_on' | 'blocks' | 'relates_to' | 'parent_of' | 'child_of';
  created_at: string;
  created_by: number;
}

export interface RequirementRelationshipCreate {
  source_requirement_id: number;
  target_requirement_id: number;
  relationship_type: RequirementRelationship['relationship_type'];
}

// =============================================================================
// Комментарии к требованиям
// =============================================================================

export interface RequirementComment {
  id: number;
  requirement_id: number;
  author_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  is_internal: boolean;
  author: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface RequirementCommentCreate {
  requirement_id: number;
  content: string;
  is_internal?: boolean;
}

// =============================================================================
// Вложения к требованиям
// =============================================================================

export interface RequirementAttachment {
  id: number;
  requirement_id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  uploaded_at: string;
  download_url: string;
}

export interface RequirementAttachmentCreate {
  requirement_id: number;
  file: File;
  description?: string;
}

// =============================================================================
// История изменений
// =============================================================================

export interface RequirementHistory {
  id: number;
  requirement_id: number;
  changed_by: number;
  change_type: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented';
  changes: Record<string, { old_value: any; new_value: any }>;
  created_at: string;
  user: {
    id: number;
    username: string;
    full_name?: string;
  };
}

// =============================================================================
// Статистика требований
// =============================================================================

export interface RequirementStats {
  total_requirements: number;
  by_status: Record<RequirementStatus, number>;
  by_priority: Record<RequirementPriority, number>;
  by_type: Record<RequirementType, number>;
  completion_rate: number;
  average_completion_time: number;
  overdue_requirements: number;
  recently_updated: number;
}

// =============================================================================
// Спецификации требований
// =============================================================================

export interface RequirementSpec {
  id: number;
  requirement_id: number;
  acceptance_criteria: string[];
  test_scenarios: string[];
  business_rules: string[];
  assumptions: string[];
  constraints: string[];
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Утверждения требований
// =============================================================================

export interface RequirementApproval {
  id: number;
  requirement_id: number;
  approver_id: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approved_at?: string;
  approver: {
    id: number;
    username: string;
    full_name?: string;
  };
}

export interface RequirementApprovalRequest {
  requirement_id: number;
  approver_id: number;
  comments?: string;
}

// =============================================================================
// Уведомления
// =============================================================================

export interface RequirementNotification {
  id: number;
  requirement_id: number;
  user_id: number;
  notification_type: 'assignment' | 'status_change' | 'comment' | 'approval_request';
  message: string;
  is_read: boolean;
  created_at: string;
}

// =============================================================================
// История изменений (расширенная)
// =============================================================================

export interface RequirementChangeHistory {
  id: number;
  requirement_id: number;
  field_name: string;
  old_value: string;
  new_value: string;
  changed_by: number;
  changed_at: string;
  change_reason?: string;
}

// =============================================================================
// Операции с требованиями
// =============================================================================

export interface RequirementBulkOperation {
  operation: 'delete' | 'update_status' | 'assign' | 'add_tags' | 'export';
  requirement_ids: number[];
  parameters?: {
    new_status?: RequirementStatus;
    assignee_id?: number;
    tags?: string[];
    export_format?: 'json' | 'csv' | 'excel';
  };
}

// =============================================================================
// Валидация
// =============================================================================

export interface RequirementValidationResult {
  is_valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// =============================================================================
// Константы для валидации (соответствуют backend)
// =============================================================================

export const REQUIREMENT_VALIDATION = {
  TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
  },
  DESCRIPTION: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 5000,
  },
  TAGS: {
    MAX_COUNT: 10,
    MAX_LENGTH: 50,
  },
  PROGRESS: {
    MIN: 0,
    MAX: 100,
  },
} as const;

// =============================================================================
// Функции-хелперы
// =============================================================================

export const getRequirementStatusColor = (status: RequirementStatus): string => {
  const statusColors: Record<RequirementStatus, string> = {
    draft: '#9e9e9e',
    review: '#ff9800',
    approved: '#4caf50',
    in_development: '#2196f3',
    testing: '#e91e63',
    completed: '#4caf50',
    rejected: '#f44336',
    blocked: '#ff5722',
  };
  return statusColors[status] || '#9e9e9e';
};

export const getRequirementPriorityColor = (priority: RequirementPriority): string => {
  const priorityColors: Record<RequirementPriority, string> = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#ff5722',
    critical: '#f44336',
  };
  return priorityColors[priority] || '#9e9e9e';
};

export const getRequirementProgressStatus = (requirement: Requirement): 'not-started' | 'in-progress' | 'completed' => {
  if (requirement.progress === 0) return 'not-started';
  if (requirement.progress >= 100) return 'completed';
  return 'in-progress';
};
