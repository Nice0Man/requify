import { useState, useCallback } from 'react';
import { requirementsApi } from '../api/requirements.api';
import { useToast } from '@/shared/ui/toast';

/**
 * Hook for managing requirement progress
 */
export const useRequirementProgress = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  const updateProgress = useCallback(async (requirementId: number, progress: number) => {
    setIsUpdating(true);
    try {
      await requirementsApi.updateRequirementProgress(requirementId, progress);
      toast.success(`Прогресс обновлен до ${progress}%`);
      return true;
    } catch (error) {
      console.error('Error updating requirement progress:', error);
      toast.error('Ошибка при обновлении прогресса');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [toast]);

  return {
    updateProgress,
    isUpdating,
  };
};

/**
 * Hook for calculating progress statistics
 */
export const useProgressStats = (requirements: Array<{ progress?: number }>) => {
  const stats = {
    averageProgress: 0,
    completedCount: 0,
    inProgressCount: 0,
    notStartedCount: 0,
    totalCount: requirements.length,
  };

  if (requirements.length === 0) return stats;

  let totalProgress = 0;
  
  requirements.forEach(req => {
    const progress = req.progress || 0;
    totalProgress += progress;
    
    if (progress >= 100) {
      stats.completedCount++;
    } else if (progress > 0) {
      stats.inProgressCount++;
    } else {
      stats.notStartedCount++;
    }
  });

  stats.averageProgress = Math.round(totalProgress / requirements.length);

  return stats;
}; 