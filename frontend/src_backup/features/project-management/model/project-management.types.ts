import type { Project, ProjectCreate } from '@/entities/project';
import type { ProjectMember, ProjectActivity } from '../api/project-management.api';

export interface ProjectManagementState {
  projects: Project[];
  currentProject: Project | null;
  members: ProjectMember[];
  activity: ProjectActivity[];
  isLoading: boolean;
  error: Error | null;
}

export interface ProjectFormData extends ProjectCreate {
  members?: string[];
  template_id?: number;
} 