// Project entity types - используют контракты из shared/api
// В соответствии с принципами FSD, entities используют типы из shared

import type {
  Project as ProjectSchema,
  ProjectCreate as ProjectCreateSchema,
  ProjectUpdate as ProjectUpdateSchema,
  ProjectWithStats as ProjectWithStatsSchema,
  ProjectBase as ProjectBaseSchema,
} from '@/shared/api/types';

// =============================================================================
// Re-export API types for entity usage
// =============================================================================

export type ProjectBase = ProjectBaseSchema;
export type Project = ProjectSchema;
export type ProjectCreate = ProjectCreateSchema;
export type ProjectUpdate = ProjectUpdateSchema;
export type ProjectWithStats = ProjectWithStatsSchema;

// =============================================================================
// Project Status Types (UI specific)
// =============================================================================

export type ProjectStatus = 
  | 'active'
  | 'inactive' 
  | 'archived'
  | 'planning'
  | 'development'
  | 'testing'
  | 'completed'
  | 'cancelled';

export const PROJECT_STATUSES: Record<ProjectStatus, string> = {
  active: 'Активный',
  inactive: 'Неактивный',
  archived: 'Архивированный', 
  planning: 'Планирование',
  development: 'Разработка',
  testing: 'Тестирование',
  completed: 'Завершен',
  cancelled: 'Отменен',
};

// =============================================================================
// Extended UI Types (не в API, только для UI)
// =============================================================================

export interface ProjectManager {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}

export interface ProjectTeamLead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}

export interface ProjectClient {
  id: number;
  name: string;
  email?: string;
  company?: string;
}

export interface ProjectWithDetails extends ProjectWithStats {
  manager?: ProjectManager;
  team_lead?: ProjectTeamLead;
  client?: ProjectClient;
  owner_name?: string;
}

// =============================================================================
// UI State Types
// =============================================================================

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  per_page: number;
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus[];
  manager_id?: number;
  team_lead_id?: number;
  client_id?: number;
  created_from?: string;
  created_to?: string;
  tags?: string[];
}

// =============================================================================
// Project for Dashboard/Quick Access (re-export from API)
// =============================================================================

export type { QuickProject } from '@/shared/api/types';

// =============================================================================
// Project Metrics (UI specific)
// =============================================================================

export interface ProjectMetrics {
  total_requirements: number;
  completed_requirements: number;
  in_progress_requirements: number;
  pending_requirements: number;
  total_releases: number;
  active_releases: number;
  completed_releases: number;
  team_members: number;
  completion_rate: number;
  on_time_delivery: number;
  quality_score: number;
}

// =============================================================================
// Computed Properties (UI helpers)
// =============================================================================

export const getProjectCompletionPercentage = (project: ProjectWithStats): number => {
  if (project.total_requirements === 0) return 0;
  return Math.round((project.requirements_completed / project.total_requirements) * 100);
};

export const isProjectCompleted = (project: ProjectWithStats): boolean => {
  return (
    project.status === 'completed' &&
    project.total_requirements > 0 &&
    project.requirements_completed === project.total_requirements
  );
};

export const getProjectHealthScore = (project: ProjectWithStats): 'good' | 'warning' | 'critical' => {
  const completionRate = getProjectCompletionPercentage(project);
  
  if (completionRate >= 80) return 'good';
  if (completionRate >= 50) return 'warning';
  return 'critical';
}; 