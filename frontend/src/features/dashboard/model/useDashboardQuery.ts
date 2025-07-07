import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

// Query Keys
export const dashboardQueryKeys = {
  stats: ['dashboard', 'stats'] as const,
  activity: ['dashboard', 'activity'] as const,
  chartData: ['dashboard', 'chartData'] as const,
};

// Queries
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.stats,
    queryFn: dashboardApi.getStats,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 15 * 60 * 1000, // 15 минут
    refetchOnWindowFocus: true,
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.activity,
    queryFn: dashboardApi.getRecentActivity,
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 10 * 60 * 1000, // 10 минут
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
  });
};

export const useChartData = (period: 'week' | 'month' | 'year' = 'week') => {
  return useQuery({
    queryKey: [...dashboardQueryKeys.chartData, period],
    queryFn: () => dashboardApi.getChartData(period),
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 30 * 60 * 1000, // 30 минут
    enabled: !!period,
  });
}; 
