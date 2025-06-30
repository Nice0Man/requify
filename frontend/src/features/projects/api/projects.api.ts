import { apiClient, ApiResponse } from '@/shared/api/client';

// Import types that match backend schemas exactly
export interface Project {
  id: number;
  code: string; // 1-50 chars, required
  name: string; // 2-100 chars, required
  description?: string; // optional, max 2000 chars
  status: ProjectStatus; // required, predefined values
  owner_id: number;
  created_at: string; // ISO datetime string
}

export interface ProjectWithStats extends Project {
  total_requirements: number;
  requirements_completed: number;
  active_releases: number;
  specs_count: number;
  requirement_groups_count: number;
  // Computed properties (calculated by backend)
  completion_percentage: number;
  is_completed: boolean;
}

export interface ProjectCreate {
  code: string; // 1-50 chars, required
  name: string; // 2-100 chars, required
  description?: string; // optional, max 2000 chars
  status: ProjectStatus; // required, predefined values
  // owner_id is set automatically by backend from current user
}

export interface ProjectUpdate {
  code?: string; // 1-50 chars, optional
  name?: string; // 2-100 chars, optional
  description?: string; // optional, max 2000 chars
  status?: ProjectStatus; // optional, predefined values
}

export interface ProjectListParams {
  skip?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  owner_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Backend-defined valid statuses matching project.py validation
export enum ProjectStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  PLANNING = 'planning',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class ProjectsApi {
  constructor(private client = apiClient) {}

  // 1. Get Projects
  async getProjects(params?: ProjectListParams): Promise<ApiResponse<ProjectListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.owner_id) queryParams.append('owner_id', params.owner_id.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const queryString = queryParams.toString();
    const url = queryString ? `/projects/?${queryString}` : '/projects/';
    
    return this.client.get<ProjectListResponse>(url);
  }

  // 2. Create Project
  async createProject(projectData: ProjectCreate): Promise<ApiResponse<Project>> {
    return this.client.post<Project>('/projects/', projectData);
  }

  // 3. Get Project
  async getProject(projectId: number): Promise<ApiResponse<Project>> {
    return this.client.get<Project>(`/projects/${projectId}`);
  }

  // 4. Update Project
  async updateProject(projectId: number, projectData: ProjectUpdate): Promise<ApiResponse<Project>> {
    return this.client.put<Project>(`/projects/${projectId}`, projectData);
  }

  // 5. Delete Project
  async deleteProject(projectId: number): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/projects/${projectId}`);
  }

  // 6. Get Project Requirements
  async getProjectRequirements(
    projectId: number, 
    params?: { skip?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString 
      ? `/projects/${projectId}/requirements?${queryString}` 
      : `/projects/${projectId}/requirements`;
    
    return this.client.get<any>(url);
  }

  // 7. Sync Project Requirements To Release
  async syncProjectRequirementsToRelease(
    projectId: number,
    syncData: { release_id?: number; requirement_ids?: number[] }
  ): Promise<ApiResponse<any>> {
    return this.client.post<any>(`/projects/${projectId}/sync-to-release`, syncData);
  }

  // 8. Get Project Releases
  async getProjectReleases(
    projectId: number, 
    params?: { skip?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString 
      ? `/projects/${projectId}/releases?${queryString}` 
      : `/projects/${projectId}/releases`;
    
    return this.client.get<any>(url);
  }

  // 9. Get Project Stats
  async getProjectStats(projectId: number): Promise<ApiResponse<ProjectWithStats>> {
    return this.client.get<ProjectWithStats>(`/projects/${projectId}/stats`);
  }
}

// Export singleton instance
export const projectsApi = new ProjectsApi(); 