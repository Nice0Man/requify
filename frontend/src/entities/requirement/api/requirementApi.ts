import { client } from "../../../shared/api/client";

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
  getRequirements: async (
    filters?: RequirementFilters
  ): Promise<Requirement[]> => {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.priority) {
      params.append("priority", filters.priority);
    }
    if (filters?.type) {
      params.append("type", filters.type);
    }
    if (filters?.projectId) {
      params.append("project_id", filters.projectId);
    }
    if (filters?.authorId) {
      params.append("author_id", filters.authorId);
    }
    if (filters?.isActive !== undefined) {
      params.append("is_active", String(filters.isActive));
    }

    const url = `/requirements${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await client.get<Requirement[]>(url);
    return response.data;
  },

  getRequirement: async (id: string): Promise<Requirement> => {
    const response = await client.get(`/requirements/${id}`);
    return response.data;
  },

  createRequirement: async (
    data: CreateRequirementRequest
  ): Promise<Requirement> => {
    const response = await client.post("/requirements", data);
    return response.data;
  },

  updateRequirement: async (
    id: string,
    data: UpdateRequirementRequest
  ): Promise<Requirement> => {
    const response = await client.put(`/requirements/${id}`, data);
    return response.data;
  },

  deleteRequirement: async (id: string): Promise<void> => {
    await client.delete(`/requirements/${id}`);
  },
};
