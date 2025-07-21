import { client } from "../../../shared/api/client";
import { API_ENDPOINTS } from "../../../shared/api/endpoints";

export interface Requirement {
  id: string;
  title: string;
  description?: string;
  type: "functional" | "non-functional" | "business" | "technical";
  status: "draft" | "approved" | "in_progress" | "completed" | "rejected";
  priority: "low" | "medium" | "high" | "critical";
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
  type: "functional" | "non-functional" | "business" | "technical";
  priority: "low" | "medium" | "high" | "critical";
  projectId?: string;
  tags?: string[];
}

export interface UpdateRequirementRequest {
  title?: string;
  description?: string;
  type?: "functional" | "non-functional" | "business" | "technical";
  status?: "draft" | "approved" | "in_progress" | "completed" | "rejected";
  priority?: "low" | "medium" | "high" | "critical";
  projectId?: string;
  tags?: string[];
  progress?: number;
}

export interface RequirementFilters {
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  projectId?: string;
  authorId?: string;
  isActive?: boolean;
}

export const requirementApi = {
  /**
   * Получить список требований
   */
  getRequirements: async (
    filters?: RequirementFilters
  ): Promise<Requirement[]> => {
    const params = new URLSearchParams();
    if (filters?.projectId) {
      params.append("projectId", filters.projectId);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.type) {
      params.append("type", filters.type);
    }
    if (filters?.priority) {
      params.append("priority", filters.priority);
    }
    if (filters?.authorId) {
      params.append("authorId", filters.authorId);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const url = `${API_ENDPOINTS.REQUIREMENTS.LIST}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await client.get(url);
    return response.data;
  },

  /**
   * Получить требование по ID
   */
  getRequirement: async (id: string): Promise<Requirement> => {
    const response = await client.get(API_ENDPOINTS.REQUIREMENTS.GET(id));
    return response.data;
  },

  createRequirement: async (
    data: CreateRequirementRequest
  ): Promise<Requirement> => {
    const response = await client.post(API_ENDPOINTS.REQUIREMENTS.CREATE, data);
    return response.data;
  },

  updateRequirement: async (
    id: string,
    data: UpdateRequirementRequest
  ): Promise<Requirement> => {
    const response = await client.put(API_ENDPOINTS.REQUIREMENTS.UPDATE(id), data);
    return response.data;
  },

  deleteRequirement: async (id: string): Promise<void> => {
    await client.delete(API_ENDPOINTS.REQUIREMENTS.DELETE(id));
  },
};
