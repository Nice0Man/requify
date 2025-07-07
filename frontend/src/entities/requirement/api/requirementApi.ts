import { client } from '../../../shared/api/client';

export interface Requirement {
  id: string;
  title: string;
  description?: string;
  type: 'functional' | 'non-functional' | 'business' | 'technical';
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  authorId: string;
  projectId?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}

export interface CreateRequirementRequest {
  title: string;
  description?: string;
  type: 'functional' | 'non-functional' | 'business' | 'technical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  tags?: string[];
}

export interface UpdateRequirementRequest {
  title?: string;
  description?: string;
  type?: 'functional' | 'non-functional' | 'business' | 'technical';
  status?: 'draft' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  tags?: string[];
  progress?: number;
}

export const requirementApi = {
  getRequirements: async (): Promise<Requirement[]> => {
    const response = await client.get('/requirements');
    return response.data;
  },

  getRequirement: async (id: string): Promise<Requirement> => {
    const response = await client.get(`/requirements/${id}`);
    return response.data;
  },

  createRequirement: async (data: CreateRequirementRequest): Promise<Requirement> => {
    const response = await client.post('/requirements', data);
    return response.data;
  },

  updateRequirement: async (id: string, data: UpdateRequirementRequest): Promise<Requirement> => {
    const response = await client.put(`/requirements/${id}`, data);
    return response.data;
  },

  deleteRequirement: async (id: string): Promise<void> => {
    await client.delete(`/requirements/${id}`);
  },
}; 