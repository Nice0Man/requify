import { ApiClient, ApiResponse } from '@/shared/api/client';

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  created_by: number;
  team_members: number[];
  requirements_count: number;
  releases_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  team_members?: number[];
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  team_members?: number[];
}

export interface ProjectListParams {
  skip?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  created_by?: number;
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

export interface ProjectStats {
  total_requirements: number;
  approved_requirements: number;
  pending_requirements: number;
  rejected_requirements: number;
  total_releases: number;
  active_releases: number;
  completed_releases: number;
  team_size: number;
  completion_percentage: number;
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class ProjectsApi {
  constructor(private client: ApiClient) {}

  // 1. Get Projects
  async getProjects(params?: ProjectListParams): Promise<ApiResponse<ProjectListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.created_by) queryParams.append('created_by', params.created_by.toString());
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
  async getProjectRequirements(projectId: number, params?: { skip?: number; limit?: number }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/projects/${projectId}/requirements?${queryString}` : `/projects/${projectId}/requirements`;
    
    return this.client.get<any>(url);
  }

  // 7. Get Project Releases
  async getProjectReleases(projectId: number, params?: { skip?: number; limit?: number }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/projects/${projectId}/releases?${queryString}` : `/projects/${projectId}/releases`;
    
    return this.client.get<any>(url);
  }

  // 8. Get Project Stats
  async getProjectStats(projectId: number): Promise<ApiResponse<ProjectStats>> {
    return this.client.get<ProjectStats>(`/projects/${projectId}/stats`);
  }
}

// Export singleton instance
export const projectsApi = new ProjectsApi(new ApiClient()); 