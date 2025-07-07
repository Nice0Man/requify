import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { releaseApi, ReleaseFilters } from '../api/releaseApi';
import type { Release, CreateReleaseRequest, UpdateReleaseRequest } from '../api/releaseApi';

// Query keys
export const releaseQueryKeys = {
  all: ['releases'] as const,
  lists: () => [...releaseQueryKeys.all, 'list'] as const,
  list: (filters: ReleaseFilters) => [...releaseQueryKeys.lists(), { filters }] as const,
  details: () => [...releaseQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...releaseQueryKeys.details(), id] as const,
  stats: () => [...releaseQueryKeys.all, 'stats'] as const,
};

// Hooks
export const useReleases = (filters?: ReleaseFilters) => {
  return useQuery({
    queryKey: releaseQueryKeys.list(filters || {}),
    queryFn: () => releaseApi.getReleases(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRelease = (id: string) => {
  return useQuery({
    queryKey: releaseQueryKeys.detail(id),
    queryFn: () => releaseApi.getRelease(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useReleaseStats = () => {
  return useQuery({
    queryKey: releaseQueryKeys.stats(),
    queryFn: () => releaseApi.getReleaseStats(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateRelease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReleaseRequest) => releaseApi.createRelease(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.stats() });
    },
  });
};

export const useUpdateRelease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReleaseRequest }) => 
      releaseApi.updateRelease(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.stats() });
    },
  });
};

export const useDeleteRelease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => releaseApi.deleteRelease(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.stats() });
    },
  });
}; 
