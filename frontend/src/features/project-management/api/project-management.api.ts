import { apiClient } from '@/shared/api/client';
import { projectsApi } from '@/entities/project';
import type { Project, ProjectCreate, ProjectUpdate, ProjectWithStats } from '@/entities/project';

// =============================================================================
// Project Management Extensions
// =============================================================================

export interface ProjectMember {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
  permissions: string[];
}

export interface ProjectInvitation {
  id: string;
  project_id: number;
  email: string;
  role: string;
  invited_by: number;
  invited_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface ProjectActivity {
  id: string;
  project_id: number;
  user_id: number;
  user_name: string;
  action: string;
  details: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ProjectArchive {
  id: number;
  original_project_id: number;
  archived_at: string;
  archived_by: number;
  reason?: string;
  project_data: Project;
}

// =============================================================================
// Project Management API Class
// =============================================================================

class ProjectManagementApi {
  private baseUrl = '/api/v1/projects';

  // Extend basic project API
  async getProjects(filters?: Record<string, any>) {
    return projectsApi.getProjects(filters);
  }

  async getProject(id: number) {
    return projectsApi.getProject(id);
  }

  async createProject(data: ProjectCreate) {
    return projectsApi.createProject(data);
  }

  async updateProject(id: number, data: ProjectUpdate) {
    return projectsApi.updateProject(id, data);
  }

  async deleteProject(id: number) {
    return projectsApi.deleteProject(id);
  }

  // =============================================================================
  // Member Management
  // =============================================================================

  /**
   * Get project members
   */
  async getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    const response = await apiClient.get<ProjectMember[]>(`${this.baseUrl}/${projectId}/members`);
    return response.data;
  }

  /**
   * Add member to project
   */
  async addProjectMember(
    projectId: number, 
    userId: number, 
    role: string = 'member'
  ): Promise<ProjectMember> {
    const response = await apiClient.post<ProjectMember>(
      `${this.baseUrl}/${projectId}/members`, 
      { user_id: userId, role }
    );
    return response.data;
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    projectId: number, 
    userId: number, 
    role: string
  ): Promise<ProjectMember> {
    const response = await apiClient.put<ProjectMember>(
      `${this.baseUrl}/${projectId}/members/${userId}`, 
      { role }
    );
    return response.data;
  }

  /**
   * Remove member from project
   */
  async removeMember(projectId: number, userId: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${projectId}/members/${userId}`);
  }

  // =============================================================================
  // Invitation Management
  // =============================================================================

  /**
   * Invite user to project
   */
  async inviteToProject(
    projectId: number, 
    email: string, 
    role: string = 'member'
  ): Promise<ProjectInvitation> {
    const response = await apiClient.post<ProjectInvitation>(
      `${this.baseUrl}/${projectId}/invitations`, 
      { email, role }
    );
    return response.data;
  }

  /**
   * Get project invitations
   */
  async getProjectInvitations(projectId: number): Promise<ProjectInvitation[]> {
    const response = await apiClient.get<ProjectInvitation[]>(`${this.baseUrl}/${projectId}/invitations`);
    return response.data;
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(projectId: number, invitationId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${projectId}/invitations/${invitationId}`);
  }

  // =============================================================================
  // Project Activity
  // =============================================================================

  /**
   * Get project activity
   */
  async getProjectActivity(projectId: number, limit: number = 50): Promise<ProjectActivity[]> {
    const response = await apiClient.get<ProjectActivity[]>(
      `${this.baseUrl}/${projectId}/activity`,
      { params: { limit } }
    );
    return response.data;
  }

  // =============================================================================
  // Project Archive
  // =============================================================================

  /**
   * Archive project
   */
  async archiveProject(projectId: number, reason?: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${projectId}/archive`, { reason });
  }

  /**
   * Restore project from archive
   */
  async restoreProject(projectId: number): Promise<Project> {
    const response = await apiClient.post<Project>(`${this.baseUrl}/${projectId}/restore`);
    return response.data;
  }

  /**
   * Get archived projects
   */
  async getArchivedProjects(): Promise<ProjectArchive[]> {
    const response = await apiClient.get<ProjectArchive[]>(`${this.baseUrl}/archived`);
    return response.data;
  }

  // =============================================================================
  // Project Templates
  // =============================================================================

  /**
   * Create project from template
   */
  async createFromTemplate(templateId: number, projectData: ProjectCreate): Promise<Project> {
    const response = await apiClient.post<Project>(
      `${this.baseUrl}/from-template/${templateId}`, 
      projectData
    );
    return response.data;
  }

  /**
   * Save project as template
   */
  async saveAsTemplate(projectId: number, templateName: string): Promise<any> {
    const response = await apiClient.post(
      `${this.baseUrl}/${projectId}/save-as-template`, 
      { name: templateName }
    );
    return response.data;
  }

  // =============================================================================
  // Project Duplication
  // =============================================================================

  /**
   * Duplicate project
   */
  async duplicateProject(
    projectId: number, 
    newName: string, 
    includeData: {
      requirements?: boolean;
      releases?: boolean;
      members?: boolean;
    } = {}
  ): Promise<Project> {
    const response = await apiClient.post<Project>(
      `${this.baseUrl}/${projectId}/duplicate`, 
      { name: newName, include: includeData }
    );
    return response.data;
  }

  // =============================================================================
  // Project Settings
  // =============================================================================

  /**
   * Update project settings
   */
  async updateProjectSettings(
    projectId: number, 
    settings: Record<string, any>
  ): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${projectId}/settings`, settings);
  }

  /**
   * Get project settings
   */
  async getProjectSettings(projectId: number): Promise<Record<string, any>> {
    const response = await apiClient.get(`${this.baseUrl}/${projectId}/settings`);
    return response.data;
  }
}

export const projectManagementApi = new ProjectManagementApi(); 