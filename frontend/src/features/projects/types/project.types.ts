// Project types based on backend contracts

export interface Project {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget?: number;
  manager_id?: number;
  manager_name?: string;
  team_members: number[];
  requirements_count: number;
  releases_count: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

export interface ProjectCreate {
  name: string;
  code: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget?: number;
  manager_id?: number;
  team_members?: number[];
}

export interface ProjectUpdate {
  name?: string;
  code?: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget?: number;
  manager_id?: number;
  team_members?: number[];
}

export interface ProjectWithStats extends Project {
  requirements: {
    total: number;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
  };
  releases: {
    total: number;
    planned: number;
    released: number;
    cancelled: number;
  };
  testing: {
    total_tests: number;
    passed: number;
    failed: number;
    pending: number;
  };
  progress: {
    overall: number;
    requirements: number;
    testing: number;
    documentation: number;
  };
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export interface ProjectFilters {
  status?: ProjectStatus;
  manager_id?: number;
  search?: string;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
}

export interface ProjectListParams {
  skip?: number;
  limit?: number;
  filters?: ProjectFilters;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ProjectMember {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  role: ProjectMemberRole;
  joined_at: string;
  permissions: string[];
}

export enum ProjectMemberRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  DEVELOPER = 'developer',
  ANALYST = 'analyst',
  TESTER = 'tester',
  VIEWER = 'viewer'
}

export interface ProjectTeam {
  project_id: number;
  members: ProjectMember[];
  total_members: number;
}

export interface ProjectActivity {
  id: number;
  project_id: number;
  user_id: number;
  user_name: string;
  action: string;
  description: string;
  entity_type?: string;
  entity_id?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ProjectDashboard {
  project: ProjectWithStats;
  recent_activities: ProjectActivity[];
  recent_requirements: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    updated_at: string;
  }>;
  upcoming_releases: Array<{
    id: number;
    name: string;
    version: string;
    planned_date: string;
    status: string;
  }>;
  team_summary: {
    total_members: number;
    active_members: number;
    roles_distribution: Record<string, number>;
  };
}

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  projectStats: ProjectWithStats | null;
  projectTeam: ProjectTeam | null;
  projectActivities: ProjectActivity[];
  isLoading: boolean;
  error: string | null;
  filters: ProjectFilters;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
} 