import { client } from '../../../shared/api/client';
import type { Requirement, CreateRequirementRequest, UpdateRequirementRequest } from '../../../entities/requirement';

export interface RequirementFilters {
  search?: string;
  status?: string;
  priority?: string;
  projectId?: string;
}

export interface RequirementStats {
  totalRequirements: number;
  draftRequirements: number;
  approvedRequirements: number;
  inProgressRequirements: number;
  completedRequirements: number;
  rejectedRequirements: number;
  changes: {
    totalRequirements: number;
    draftRequirements: number;
    approvedRequirements: number;
    inProgressRequirements: number;
    completedRequirements: number;
    rejectedRequirements: number;
  };
}

export const requirementApi = {
  // Get all requirements with optional filters
  getRequirements: async (filters?: RequirementFilters): Promise<Requirement[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.projectId) params.append('projectId', filters.projectId);

    const response = await client.get(`/requirements?${params}`);
    return response.data;
  },

  // Get single requirement by ID
  getRequirement: async (id: string): Promise<Requirement> => {
    const response = await client.get(`/requirements/${id}`);
    return response.data;
  },

  // Create new requirement
  createRequirement: async (data: CreateRequirementRequest): Promise<Requirement> => {
    const response = await client.post('/requirements', data);
    return response.data;
  },

  // Update existing requirement
  updateRequirement: async (id: string, data: UpdateRequirementRequest): Promise<Requirement> => {
    const response = await client.put(`/requirements/${id}`, data);
    return response.data;
  },

  // Delete requirement
  deleteRequirement: async (id: string): Promise<void> => {
    await client.delete(`/requirements/${id}`);
  },

  // Get requirement statistics
  getRequirementStats: async (): Promise<RequirementStats> => {
    const response = await client.get('/requirements/stats');
    return response.data;
  },
}; 