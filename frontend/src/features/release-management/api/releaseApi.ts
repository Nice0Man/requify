import { client } from '../../../shared/api/client';

export interface Release {
  id: string;
  name: string;
  version: string;
  description?: string;
  status: 'draft' | 'planned' | 'in_progress' | 'released' | 'cancelled';
  projectId: string;
  releaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReleaseRequest {
  name: string;
  version: string;
  description?: string;
  projectId: string;
  releaseDate?: string;
}

export interface UpdateReleaseRequest {
  name?: string;
  version?: string;
  description?: string;
  status?: 'draft' | 'planned' | 'in_progress' | 'released' | 'cancelled';
  releaseDate?: string;
}

export interface ReleaseFilters {
  projectId?: string;
  status?: string;
  search?: string;
}

export interface ReleaseStats {
  totalReleases: number;
  draftReleases: number;
  plannedReleases: number;
  inProgressReleases: number;
  releasedReleases: number;
  cancelledReleases: number;
}

export const releaseApi = {
  // Get all releases with optional filters
  async getReleases(filters?: ReleaseFilters): Promise<Release[]> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await client.get(`/releases?${params.toString()}`);
    return response.data;
  },

  // Get a single release by ID
  async getRelease(id: string): Promise<Release> {
    const response = await client.get(`/releases/${id}`);
    return response.data;
  },

  // Create a new release
  async createRelease(data: CreateReleaseRequest): Promise<Release> {
    const response = await client.post('/releases', data);
    return response.data;
  },

  // Update an existing release
  async updateRelease(id: string, data: UpdateReleaseRequest): Promise<Release> {
    const response = await client.put(`/releases/${id}`, data);
    return response.data;
  },

  // Delete a release
  async deleteRelease(id: string): Promise<void> {
    await client.delete(`/releases/${id}`);
  },

  // Get release statistics
  async getReleaseStats(): Promise<ReleaseStats> {
    const response = await client.get('/releases/stats');
    return response.data;
  },

  // Get releases for a specific project
  async getProjectReleases(projectId: string): Promise<Release[]> {
    const response = await client.get(`/projects/${projectId}/releases`);
    return response.data;
  },

  // Publish a release
  async publishRelease(id: string): Promise<Release> {
    const response = await client.post(`/releases/${id}/publish`);
    return response.data;
  },

  // Rollback a release
  async rollbackRelease(id: string): Promise<Release> {
    const response = await client.post(`/releases/${id}/rollback`);
    return response.data;
  },

  // Deploy a release to environment
  async deployRelease(id: string, environment: string): Promise<Release> {
    const response = await client.post(`/releases/${id}/deploy`, { environment });
    return response.data;
  },
};
