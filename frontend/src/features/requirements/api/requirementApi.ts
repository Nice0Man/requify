import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  Requirement,
  RequirementFilters,
  RequirementStats,
  CreateRequirementData,
  UpdateRequirementData,
} from "../model/types";

// Query Keys
export const requirementKeys = {
  all: ["requirements"] as const,
  lists: () => [...requirementKeys.all, "list"] as const,
  list: (filters: RequirementFilters) =>
    [...requirementKeys.lists(), filters] as const,
  details: () => [...requirementKeys.all, "detail"] as const,
  detail: (id: string) => [...requirementKeys.details(), id] as const,
  stats: () => [...requirementKeys.all, "stats"] as const,
};

// API Functions
export const requirementApi = {
  getRequirements: async (filters: RequirementFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    const response = await client.get(
      `${API_ENDPOINTS.REQUIREMENTS.LIST}?${params}`
    );
    return response.data;
  },

  getRequirement: async (id: string): Promise<Requirement> => {
    const response = await client.get(API_ENDPOINTS.REQUIREMENTS.GET(id));
    return response.data;
  },

  createRequirement: async (data: CreateRequirementData): Promise<Requirement> => {
    const response = await client.post(API_ENDPOINTS.REQUIREMENTS.CREATE, data);
    return response.data;
  },

  updateRequirement: async (
    id: string,
    data: UpdateRequirementData
  ): Promise<Requirement> => {
    const response = await client.put(API_ENDPOINTS.REQUIREMENTS.UPDATE(id), data);
    return response.data;
  },

  deleteRequirement: async (id: string): Promise<void> => {
    await client.delete(API_ENDPOINTS.REQUIREMENTS.DELETE(id));
  },

  getRequirementStats: async (): Promise<RequirementStats> => {
    const response = await client.get(API_ENDPOINTS.REQUIREMENTS.SEARCH); // Using search endpoint for stats
    return response.data;
  },
};

// Hooks
export const useRequirements = (filters: RequirementFilters = {}) => {
  return useQuery({
    queryKey: requirementKeys.list(filters),
    queryFn: () => requirementApi.getRequirements(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRequirement = (id: string) => {
  return useQuery({
    queryKey: requirementKeys.detail(id),
    queryFn: () => requirementApi.getRequirement(id),
    enabled: !!id,
  });
};

export const useCreateRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requirementApi.createRequirement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.stats() });
    },
  });
};

export const useUpdateRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRequirementData }) =>
      requirementApi.updateRequirement(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.stats() });
    },
  });
};

export const useDeleteRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requirementApi.deleteRequirement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.stats() });
    },
  });
};

export const useRequirementStats = () => {
  return useQuery({
    queryKey: requirementKeys.stats(),
    queryFn: requirementApi.getRequirementStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}; 