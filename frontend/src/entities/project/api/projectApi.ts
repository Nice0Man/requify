import { client } from "@/shared/api";
import type { Project, ProjectStatus } from "../model/types";

// Временные типы до создания полных типов в model/types
interface ProjectCreateData {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: "low" | "medium" | "high" | "critical";
  startDate?: string;
  endDate?: string;
  teamId?: string;
}

interface ProjectUpdateData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: "low" | "medium" | "high" | "critical";
  startDate?: string;
  endDate?: string;
  teamId?: string;
}

interface ProjectFilters {
  search?: string;
  status?: string;
  priority?: string;
  teamId?: string;
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  requirements: {
    total: number;
    completed: number;
    approved: number;
  };
  testCases: {
    total: number;
    passed: number;
    failed: number;
  };
}

interface ProjectStatusDistribution {
  status: ProjectStatus;
  count: number;
  percentage: number;
}

// API endpoints according to the provided API documentation
export const projectApi = {
  // GET /api/v1/projects/
  getProjects: async (filters?: ProjectFilters): Promise<Project[]> => {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters?.priority && filters.priority !== "all") {
      params.append("priority", filters.priority);
    }

    const url = `/projects/${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await client.get<Project[]>(url);
    return response.data;
  },

  // GET /api/v1/projects/{project_id}
  getProject: async (projectId: string): Promise<Project> => {
    const response = await client.get<Project>(`/projects/${projectId}`);
    return response.data;
  },

  // POST /api/v1/projects/
  createProject: async (data: ProjectCreateData): Promise<Project> => {
    const response = await client.post<Project>("/projects/", data);
    return response.data;
  },

  // PUT /api/v1/projects/{project_id}
  updateProject: async (
    projectId: string,
    data: ProjectUpdateData
  ): Promise<Project> => {
    const response = await client.put<Project>(`/projects/${projectId}`, data);
    return response.data;
  },

  // DELETE /api/v1/projects/{project_id}
  deleteProject: async (projectId: string): Promise<void> => {
    await client.delete(`/projects/${projectId}`);
  },

  // GET /api/v1/projects/{project_id}/stats
  getProjectStats: async (projectId: string): Promise<ProjectStats> => {
    const response = await client.get<ProjectStats>(
      `/projects/${projectId}/stats`
    );
    return response.data;
  },

  // Custom aggregated stats endpoint (might need backend implementation)
  getProjectsStats: async (
    filters?: ProjectFilters
  ): Promise<{
    overview: ProjectStats[];
    statusDistribution: ProjectStatusDistribution[];
    timeline: { period: string; completed: number; created: number }[];
    trends: { period: string; metric: string; value: number }[];
  }> => {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters?.priority && filters.priority !== "all") {
      params.append("priority", filters.priority);
    }

    const url = `/dashboard/projects/stats${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await client.get(url);
    return response.data;
  },

  // GET /api/v1/projects/{project_id}/requirements
  getProjectRequirements: async (projectId: string) => {
    const response = await client.get(`/projects/${projectId}/requirements`);
    return response.data;
  },

  // GET /api/v1/projects/{project_id}/releases
  getProjectReleases: async (projectId: string) => {
    const response = await client.get(`/projects/${projectId}/releases`);
    return response.data;
  },

  // POST /api/v1/projects/{project_id}/sync-to-release
  syncProjectToRelease: async (projectId: string, releaseId: string) => {
    const response = await client.post(
      `/projects/${projectId}/sync-to-release`,
      {
        release_id: releaseId,
      }
    );
    return response.data;
  },
};
