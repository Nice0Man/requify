/**
 * Project types based on backend/app/schemas/project.py
 */

// =============================================================================
// Основные типы проекта (соответствуют backend схемам)
// =============================================================================

export interface ProjectBase {
  code: string;
  name: string;
  description?: string;
  status: string;
}

export interface ProjectCreate extends ProjectBase {
  // owner_id will be set automatically by the API
}

export interface ProjectUpdate {
  code?: string;
  name?: string;
  description?: string;
  status?: string;
}

export interface Project extends ProjectBase {
  id: number;
  owner_id: number;
  created_at: string;
  updated_at: string;
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
// Статусы проекта (соответствуют backend валидации)
// =============================================================================

export const PROJECT_STATUSES = [
  'active',
  'inactive', 
  'archived',
  'planning',
  'development',
  'testing',
  'completed',
  'cancelled'
] as const;

export type ProjectStatus = typeof PROJECT_STATUSES[number];

// =============================================================================
// API Response типы
// =============================================================================

export interface ProjectListResponse {
  projects: ProjectWithStats[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProjectDetailResponse {
  project: ProjectWithStats;
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  owner_id?: number;
  code?: string;
  created_from?: string;
  created_to?: string;
  sort_by?: 'name' | 'code' | 'created_at' | 'updated_at' | 'status';
  sort_order?: 'asc' | 'desc';
}

// =============================================================================
// Команда проекта
// =============================================================================

export interface ProjectTeamMember {
  id: number;
  user_id: number;
  project_id: number;
  role: 'owner' | 'manager' | 'developer' | 'tester' | 'analyst' | 'viewer';
  permissions: string[];
  joined_at: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    is_active: boolean;
  };
}

export interface ProjectTeamRequest {
  user_id: number;
  role: ProjectTeamMember['role'];
  permissions?: string[];
}

export interface ProjectTeamResponse {
  members: ProjectTeamMember[];
  total: number;
}

// =============================================================================
// Статистика проекта
// =============================================================================

export interface ProjectStatistics {
  overview: {
    total_requirements: number;
    completed_requirements: number;
    pending_requirements: number;
    in_progress_requirements: number;
    blocked_requirements: number;
  };
  releases: {
    total_releases: number;
    completed_releases: number;
    planned_releases: number;
    active_releases: number;
  };
  testing: {
    total_test_cases: number;
    passed_test_cases: number;
    failed_test_cases: number;
    pending_test_cases: number;
  };
  team: {
    total_members: number;
    active_members: number;
    roles_distribution: Record<string, number>;
  };
  timeline: {
    created_at: string;
    last_activity_at: string;
    estimated_completion?: string;
    actual_completion?: string;
  };
}

// =============================================================================
// Дашборд проекта
// =============================================================================

export interface ProjectDashboard {
  project: ProjectWithStats;
  statistics: ProjectStatistics;
  recent_activities: Array<{
    id: number;
    type: string;
    description: string;
    user_id: number;
    created_at: string;
    metadata?: Record<string, any>;
  }>;
  upcoming_deadlines: Array<{
    id: number;
    type: 'requirement' | 'release' | 'milestone';
    title: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  alerts: Array<{
    id: number;
    type: 'warning' | 'error' | 'info';
    message: string;
    created_at: string;
  }>;
}

// =============================================================================
// Настройки проекта
// =============================================================================

export interface ProjectSettings {
  id: number;
  project_id: number;
  notifications: {
    email_notifications: boolean;
    requirement_updates: boolean;
    release_updates: boolean;
    team_changes: boolean;
    deadline_reminders: boolean;
  };
  workflow: {
    require_approval_for_requirements: boolean;
    auto_assign_requirements: boolean;
    default_requirement_priority: string;
    default_requirement_type: string;
  };
  integrations: {
    git_repository?: string;
    issue_tracker?: string;
    ci_cd_pipeline?: string;
  };
  custom_fields: Array<{
    name: string;
    type: 'text' | 'number' | 'boolean' | 'date' | 'select';
    required: boolean;
    options?: string[];
  }>;
}

// =============================================================================
// Шаблоны проекта
// =============================================================================

export interface ProjectTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  is_public: boolean;
  created_by: number;
  created_at: string;
  template_data: {
    project_settings: Partial<ProjectSettings>;
    default_requirements: Array<{
      title: string;
      description?: string;
      type: string;
      priority: string;
    }>;
    default_releases: Array<{
      name: string;
      version: string;
      description?: string;
    }>;
    team_roles: Array<{
      role: string;
      permissions: string[];
    }>;
  };
  usage_count: number;
}

export interface ProjectTemplateCreate {
  name: string;
  description?: string;
  category: string;
  is_public?: boolean;
  template_data: ProjectTemplate['template_data'];
}

export interface ProjectFromTemplate {
  template_id: number;
  project_data: ProjectCreate;
  customize_requirements?: boolean;
  customize_releases?: boolean;
  invite_team_members?: number[];
}

// =============================================================================
// Операции с проектами
// =============================================================================

export interface ProjectBulkOperation {
  operation: 'delete' | 'archive' | 'activate' | 'change_status' | 'export';
  project_ids: number[];
  parameters?: {
    new_status?: ProjectStatus;
    export_format?: 'json' | 'csv' | 'excel';
    include_requirements?: boolean;
    include_releases?: boolean;
  };
}

export interface ProjectImportData {
  format: 'json' | 'csv' | 'excel';
  data: File | string;
  options: {
    update_existing: boolean;
    create_missing_users: boolean;
    assign_default_owner: boolean;
    default_status: ProjectStatus;
  };
}

export interface ProjectExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  include_requirements: boolean;
  include_releases: boolean;
  include_team: boolean;
  include_statistics: boolean;
  date_range?: {
    from: string;
    to: string;
  };
}

// =============================================================================
// Валидация
// =============================================================================

export interface ProjectValidationResult {
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
// Активность проекта
// =============================================================================

export interface ProjectActivityResponse {
  activities: Array<{
    id: number;
    type: string;
    description: string;
    user_id: number;
    user_name: string;
    created_at: string;
    metadata?: Record<string, any>;
  }>;
  total: number;
  page: number;
  limit: number;
}

// =============================================================================
// Утилитарные типы
// =============================================================================

export interface ProjectListItem extends Project {
  owner_name?: string;
  requirements_count: number;
  releases_count: number;
  team_members_count: number;
  last_activity_at?: string;
}

export interface ProjectOption {
  value: number;
  label: string;
  code: string;
  status: ProjectStatus;
}

// =============================================================================
// Константы для валидации (соответствуют backend)
// =============================================================================

export const PROJECT_VALIDATION = {
  CODE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    PATTERN: /^[A-Z0-9\-_]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    FORBIDDEN_CHARS: ['<', '>', '&', '"', "'", ';', '|', '\n', '\r'],
  },
  DESCRIPTION: {
    MAX_LENGTH: 2000,
  },
} as const;

// =============================================================================
// Функции-хелперы
// =============================================================================

export const validateProjectCode = (code: string): { isValid: boolean; error?: string } => {
  if (!code || !code.trim()) {
    return { isValid: false, error: 'Project code cannot be empty' };
  }

  const trimmedCode = code.trim().toUpperCase();

  if (trimmedCode.length < PROJECT_VALIDATION.CODE.MIN_LENGTH || 
      trimmedCode.length > PROJECT_VALIDATION.CODE.MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `Project code must be between ${PROJECT_VALIDATION.CODE.MIN_LENGTH} and ${PROJECT_VALIDATION.CODE.MAX_LENGTH} characters` 
    };
  }

  if (!PROJECT_VALIDATION.CODE.PATTERN.test(trimmedCode)) {
    return { 
      isValid: false, 
      error: 'Project code can only contain letters, numbers, hyphens and underscores' 
    };
  }

  if (trimmedCode.startsWith('-') || trimmedCode.startsWith('_') || 
      trimmedCode.endsWith('-') || trimmedCode.endsWith('_')) {
    return { 
      isValid: false, 
      error: 'Project code cannot start or end with hyphen or underscore' 
    };
  }

  return { isValid: true };
};

export const validateProjectName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Project name cannot be empty' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < PROJECT_VALIDATION.NAME.MIN_LENGTH || 
      trimmedName.length > PROJECT_VALIDATION.NAME.MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `Project name must be between ${PROJECT_VALIDATION.NAME.MIN_LENGTH} and ${PROJECT_VALIDATION.NAME.MAX_LENGTH} characters` 
    };
  }

  const hasForbiddenChars = PROJECT_VALIDATION.NAME.FORBIDDEN_CHARS.some(char => trimmedName.includes(char));
  if (hasForbiddenChars) {
    return { 
      isValid: false, 
      error: `Project name contains forbidden characters: ${PROJECT_VALIDATION.NAME.FORBIDDEN_CHARS.join(', ')}` 
    };
  }

  return { isValid: true };
};

export const getProjectStatusColor = (status: ProjectStatus): string => {
  const statusColors: Record<ProjectStatus, string> = {
    active: '#4caf50',
    inactive: '#9e9e9e',
    archived: '#795548',
    planning: '#2196f3',
    development: '#ff9800',
    testing: '#e91e63',
    completed: '#4caf50',
    cancelled: '#f44336',
  };
  return statusColors[status] || '#9e9e9e';
};

export const getProjectCompletionStatus = (project: ProjectWithStats): 'not-started' | 'in-progress' | 'completed' => {
  if (project.total_requirements === 0) return 'not-started';
  if (project.requirements_completed === project.total_requirements) return 'completed';
  return 'in-progress';
}; 