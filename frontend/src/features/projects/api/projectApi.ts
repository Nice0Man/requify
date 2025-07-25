import { client } from "@/app/providers/client";
import { NotificationItem, type SearchResult } from "@/features/header/model/types";
import { API_ENDPOINTS } from "@/shared";

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "active" | "completed" | "on_hold" | "cancelled";
  startDate?: string;
  endDate?: string;
  progress: number;
  teamSize: number;
  requirementsCount: number;
  projectId?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: "active" | "completed" | "on_hold" | "cancelled";
  startDate?: string;
  endDate?: string;
}

export interface ProjectFilters {
  search?: string;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageProgress: number;
  changes: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    averageProgress: number;
  };
}

export const projectApi = {
  // Get all projects with optional filters
  getProjects: async (filters?: ProjectFilters): Promise<Project[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDateFrom)
      params.append("startDateFrom", filters.startDateFrom);
    if (filters?.startDateTo) params.append("startDateTo", filters.startDateTo);

    const response = await client.get(`/projects?${params}`);
    return response.data;
  },

  // Get single project by ID
  getProject: async (id: string): Promise<Project> => {
    const response = await client.get(`/projects/${id}`);
    return response.data;
  },

  // Create new project
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await client.post("/projects", data);
    return response.data;
  },

  // Update existing project
  updateProject: async (
    id: string,
    data: UpdateProjectRequest
  ): Promise<Project> => {
    const response = await client.put(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  deleteProject: async (id: string): Promise<void> => {
    await client.delete(`/projects/${id}`);
  },

  // Get project statistics
  getProjectStats: async (): Promise<ProjectStats> => {
    const response = await client.get("/projects/stats");
    return response.data;
  },

  // Search projects
  search: async (query: string): Promise<SearchResult[]> => {
    const response = await client.get(`/projects/search?query=${query}`);
    return response.data;
  },

  // Get notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await client.get(API_ENDPOINTS.DASHBOARD.MY_NOTIFICATIONS);
    // TODO: change to notifications endpoint on backend need create separate endpoint for notifications for each entity
    return response.data;
  },
};
