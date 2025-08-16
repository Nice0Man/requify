import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  Release,
  ReleaseFilters,
  CreateReleaseData,
  UpdateReleaseData,
  ReleaseStats,
} from "../model/types";

// Экспортируем типы для использования в других частях приложения
export type { Release, ReleaseFilters, CreateReleaseData, UpdateReleaseData, ReleaseStats };

// Query Keys
export const releaseKeys = {
  all: ["releases"] as const,
  lists: () => [...releaseKeys.all, "list"] as const,
  list: (filters: ReleaseFilters) => [...releaseKeys.lists(), filters] as const,
  details: () => [...releaseKeys.all, "detail"] as const,
  detail: (id: string) => [...releaseKeys.details(), id] as const,
  stats: () => [...releaseKeys.all, "stats"] as const,
  projectReleases: (projectId: string) =>
    [...releaseKeys.all, "project", projectId] as const,
};

// API Functions
export const releaseApi = {
  getReleases: async (filters: ReleaseFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    const response = await client.get(
      `${API_ENDPOINTS.RELEASES.LIST}?${params.toString()}`
    );
    return response.data;
  },

  getRelease: async (id: string): Promise<Release> => {
    const response = await client.get(API_ENDPOINTS.RELEASES.GET(id));
    return response.data;
  },

  createRelease: async (data: CreateReleaseData): Promise<Release> => {
    const response = await client.post(API_ENDPOINTS.RELEASES.CREATE, data);
    return response.data;
  },

  updateRelease: async (
    id: string,
    data: UpdateReleaseData
  ): Promise<Release> => {
    const response = await client.put(API_ENDPOINTS.RELEASES.UPDATE(id), data);
    return response.data;
  },

  deleteRelease: async (id: string): Promise<void> => {
    await client.delete(API_ENDPOINTS.RELEASES.DELETE(id));
  },

  getReleaseStats: async (): Promise<ReleaseStats> => {
    const response = await client.get(API_ENDPOINTS.RELEASES.LIST); // Using list endpoint for stats
    return response.data;
  },

  getProjectReleases: async (projectId: string) => {
    const response = await client.get(API_ENDPOINTS.PROJECTS.RELEASES(projectId));
    return response.data;
  },

  publishRelease: async (id: string) => {
    const response = await client.post(API_ENDPOINTS.RELEASES.PUBLISH(id));
    return response.data;
  },

  rollbackRelease: async (id: string) => {
    const response = await client.post(`${API_ENDPOINTS.RELEASES.GET(id)}/rollback`);
    return response.data;
  },

  deployRelease: async (id: string, environment: string) => {
    const response = await client.post(`${API_ENDPOINTS.RELEASES.GET(id)}/deploy`, { environment });
    return response.data;
  },
};

// Hooks
export const useReleases = (filters: ReleaseFilters = {}) => {
  return useQuery({
    queryKey: releaseKeys.list(filters),
    queryFn: () => releaseApi.getReleases(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRelease = (id: string) => {
  return useQuery({
    queryKey: releaseKeys.detail(id),
    queryFn: () => releaseApi.getRelease(id),
    enabled: !!id,
  });
};

export const useCreateRelease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: releaseApi.createRelease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: releaseKeys.stats() });
    },
  });
};

export const useUpdateRelease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReleaseData }) =>
      releaseApi.updateRelease(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: releaseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: releaseKeys.stats() });
    },
  });
};

export const useDeleteRelease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: releaseApi.deleteRelease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: releaseKeys.stats() });
    },
  });
};

export const useReleaseStats = () => {
  return useQuery({
    queryKey: releaseKeys.stats(),
    queryFn: releaseApi.getReleaseStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProjectReleases = (projectId: string) => {
  return useQuery({
    queryKey: releaseKeys.projectReleases(projectId),
    queryFn: () => releaseApi.getProjectReleases(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePublishRelease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: releaseApi.publishRelease,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: releaseKeys.lists() });
    },
  });
};

export const useRollbackRelease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: releaseApi.rollbackRelease,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: releaseKeys.lists() });
    },
  });
};

export const useDeployRelease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, environment }: { id: string; environment: string }) =>
      releaseApi.deployRelease(id, environment),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: releaseKeys.lists() });
    },
  });
};
