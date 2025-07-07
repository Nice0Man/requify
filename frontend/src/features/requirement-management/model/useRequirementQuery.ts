import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requirementApi, RequirementFilters } from '../api/requirementApi';
import type { Requirement, CreateRequirementRequest, UpdateRequirementRequest } from '../../../entities/requirement';

// Query keys
export const requirementKeys = {
  all: ['requirements'] as const,
  lists: () => [...requirementKeys.all, 'list'] as const,
  list: (filters: RequirementFilters) => [...requirementKeys.lists(), { filters }] as const,
  details: () => [...requirementKeys.all, 'detail'] as const,
  detail: (id: string) => [...requirementKeys.details(), id] as const,
  stats: () => [...requirementKeys.all, 'stats'] as const,
};

// Hooks
export const useRequirements = (filters?: RequirementFilters) => {
  return useQuery({
    queryKey: requirementKeys.list(filters || {}),
    queryFn: () => requirementApi.getRequirements(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRequirement = (id: string) => {
  return useQuery({
    queryKey: requirementKeys.detail(id),
    queryFn: () => requirementApi.getRequirement(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useRequirementStats = () => {
  return useQuery({
    queryKey: requirementKeys.stats(),
    queryFn: () => requirementApi.getRequirementStats(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRequirementRequest) => requirementApi.createRequirement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.stats() });
    },
  });
};

export const useUpdateRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRequirementRequest }) => 
      requirementApi.updateRequirement(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requirementKeys.stats() });
    },
  });
};

export const useDeleteRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requirementApi.deleteRequirement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.stats() });
    },
  });
}; 
