// Project management feature типы - расширенная функциональность
// Этот файл содержит дополнительные типы для project management (члены команды, приглашения и тд)

// Импорты из entities слоя (базовые типы проектов)
export type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectWithStats,
  ProjectStatus,
} from '@/entities/project/model/types';

// Импорты из других entities
export type {
  Requirement,
} from '@/entities/requirement/model/types';

export type {
  Release,
} from '@/entities/release/model/types';

// Импорты из shared слоя
export type {
  PaginatedResponse,
  ListParams,
} from '@/shared/types/api';

// =============================================================================
// Extended Project Types (Feature-Specific)
// =============================================================================

export interface ProjectWithDetails extends Project {
  requirements: Requirement[];
  releases: Release[];
  members: ProjectMember[];
  stats: ProjectStats;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: ProjectMemberRole;
  permissions: string[];
  joined_at: string;
  // Relations
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
}

export interface ProjectMemberCreate {
  user_id: number;
  role: ProjectMemberRole;
  permissions?: string[];
}

export interface ProjectMemberUpdate {
  role?: ProjectMemberRole;
  permissions?: string[];
}

export enum ProjectMemberRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  DEVELOPER = 'developer',
  TESTER = 'tester',
  ANALYST = 'analyst',
  VIEWER = 'viewer'
}

export interface ProjectInvitation {
  id: number;
  project_id: number;
  email: string;
  role: ProjectMemberRole;
  invited_by: number;
  invited_at: string;
  expires_at: string;
  accepted_at?: string;
  declined_at?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  // Relations
  project?: {
    id: number;
    name: string;
    code: string;
  };
  invited_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface ProjectInvitationCreate {
  email: string;
  role: ProjectMemberRole;
  message?: string;
}

export interface ProjectStats {
  total_requirements: number;
  requirements_by_status: Record<string, number>;
  requirements_by_priority: Record<string, number>;
  requirements_by_type: Record<string, number>;
  total_releases: number;
  releases_by_status: Record<string, number>;
  completion_rate: number;
  overdue_requirements: number;
  high_risk_requirements: number;
  test_coverage: number;
  active_members: number;
  recent_activity_count: number;
  budget_utilization?: number;
  time_utilization?: number;
  velocity_metrics?: {
    requirements_per_week: number;
    releases_per_month: number;
    average_cycle_time: number;
  };
}

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// UI-Specific Types
// =============================================================================

export interface ProjectFilters {
  search: string;
  status: ProjectStatus[];
  managerId: number | null;
  teamLeadId: number | null;
  clientId: number | null;
  tags: string[];
  isPublic: boolean | null;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

export interface ProjectFormData extends ProjectCreate {
  members?: ProjectMemberCreate[];
  attachments?: File[];
}

export interface ProjectTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  is_public: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  config: {
    default_statuses: string[];
    default_priorities: string[];
    default_types: string[];
    workflows: any[];
    roles: ProjectMemberRole[];
    permissions: Record<string, string[]>;
  };
}

export interface ProjectActivity {
  id: number;
  project_id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
  // Relations
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
}

export interface ProjectExportParams {
  project_id: number;
  include_requirements?: boolean;
  include_releases?: boolean;
  include_members?: boolean;
  include_stats?: boolean;
  format: 'excel' | 'csv' | 'pdf' | 'json';
}

export interface ProjectImportResult {
  total_processed: number;
  successful_imports: number;
  failed_imports: number;
  errors: {
    row: number;
    error: string;
    data?: any;
  }[];
  created_projects: number[];
}

export interface ProjectDashboardData {
  recent_projects: Project[];
  project_stats: {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    my_projects: number;
  };
  recent_activity: ProjectActivity[];
  overdue_requirements: Requirement[];
  upcoming_releases: Release[];
} 