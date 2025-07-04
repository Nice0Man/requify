import { useState, useEffect, useCallback, useMemo } from 'react';
import { releaseManagementApi } from '../api/release-management.api';
import type {
  ReleaseManagementDashboardState,
  ReleasePlanningState,
  ReleaseWorkflowState,
  ReleaseManagementFilters,
  ReleaseViewConfig,
  ReleaseCreateFormData,
  ReleaseUpdateFormData,
  BulkReleaseOperationResult,
  ReleaseActivity,
  ReleaseBlocker,
  RELEASE_MANAGEMENT_CONFIG
} from './release-management.types';
import type {
  Release,
  ReleaseExtended,
  ReleaseCreate,
  ReleaseUpdate
} from '@/entities/release';

/**
 * Hook для управления дашбордом релизов
 */
export function useReleaseManagementDashboard(projectId?: number) {
  const [state, setState] = useState<ReleaseManagementDashboardState>({
    releases: [],
    stats: null,
    upcomingReleases: [],
    recentActivity: [],
    summary: {
      totalActive: 0,
      overdue: 0,
      readyToPublish: 0,
      inTesting: 0,
      awaitingApproval: 0,
      riskScore: 'low'
    },
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  const loadDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const dashboardData = await releaseManagementApi.getReleaseDashboardData(projectId);
      
      setState(prev => ({
        ...prev,
        ...dashboardData,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data'
      }));
    }
  }, [projectId]);

  const refreshData = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const updateReleaseStatus = useCallback(async (releaseId: number, status: string) => {
    try {
      setState(prev => ({
        ...prev,
        releases: prev.releases.map(release =>
          release.id === releaseId ? { ...release, status } : release
        )
      }));

      // Добавляем активность
      const activity: ReleaseActivity = {
        id: `${releaseId}-${Date.now()}`,
        type: 'status_changed',
        releaseId,
        releaseName: state.releases.find(r => r.id === releaseId)?.name || 'Unknown',
        description: `Status changed to ${status}`,
        timestamp: new Date().toISOString(),
        userId: 1, // Получить из контекста пользователя
        userName: 'Current User'
      };

      setState(prev => ({
        ...prev,
        recentActivity: [activity, ...prev.recentActivity.slice(0, RELEASE_MANAGEMENT_CONFIG.MAX_RECENT_ACTIVITIES - 1)]
      }));

    } catch (error) {
      // Откатываем изменения при ошибке
      await loadDashboardData();
      throw error;
    }
  }, [state.releases, loadDashboardData]);

  // Автообновление данных
  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(refreshData, RELEASE_MANAGEMENT_CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadDashboardData, refreshData]);

  // Вычисляемые метрики
  const metrics = useMemo(() => {
    const { releases, stats } = state;
    
    return {
      activeReleases: releases.length,
      completionRate: releases.length > 0 
        ? Math.round(releases.reduce((sum, r) => sum + (r.completion_percentage || 0), 0) / releases.length)
        : 0,
      overdueCount: releases.filter(r => 
        r.planned_date && new Date(r.planned_date) < new Date() && r.status !== 'published'
      ).length,
      avgRiskScore: stats?.riskAssessment ? 
        Math.round((stats.riskAssessment.highRisk * 3 + stats.riskAssessment.mediumRisk * 2 + stats.riskAssessment.lowRisk) / releases.length) : 0
    };
  }, [state]);

  return {
    ...state,
    metrics,
    actions: {
      refresh: refreshData,
      updateReleaseStatus
    }
  };
}

/**
 * Hook для планирования релизов
 */
export function useReleasePlanning(projectId: number) {
  const [state, setState] = useState<ReleasePlanningState>({
    timeline: [],
    suggestions: {
      optimalDates: {},
      resourceConflicts: [],
      recommendations: []
    },
    selectedReleaseIds: [],
    plannerView: 'timeline',
    conflicts: [],
    isLoading: false,
    error: null
  });

  const loadPlannerData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const plannerData = await releaseManagementApi.getReleasePlanner(projectId);
      
      setState(prev => ({
        ...prev,
        timeline: plannerData.timeline,
        suggestions: plannerData.suggestions,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load planner data'
      }));
    }
  }, [projectId]);

  const setPlannerView = useCallback((view: ReleasePlanningState['plannerView']) => {
    setState(prev => ({ ...prev, plannerView: view }));
  }, []);

  const selectReleases = useCallback((releaseIds: number[]) => {
    setState(prev => ({ ...prev, selectedReleaseIds: releaseIds }));
  }, []);

  const bulkUpdateStatus = useCallback(async (status: string, reason?: string): Promise<BulkReleaseOperationResult> => {
    const { selectedReleaseIds } = state;
    
    if (selectedReleaseIds.length === 0) {
      throw new Error('No releases selected');
    }

    const result = await releaseManagementApi.bulkUpdateReleaseStatus(selectedReleaseIds, status, reason);
    
    if (result.success > 0) {
      await loadPlannerData(); // Перезагружаем данные
    }

    return result;
  }, [state.selectedReleaseIds, loadPlannerData]);

  useEffect(() => {
    loadPlannerData();
  }, [loadPlannerData]);

  return {
    ...state,
    actions: {
      refresh: loadPlannerData,
      setPlannerView,
      selectReleases,
      bulkUpdateStatus
    }
  };
}

/**
 * Hook для управления жизненным циклом релиза
 */
export function useReleaseWorkflow(releaseId?: number) {
  const [state, setState] = useState<ReleaseWorkflowState>({
    currentRelease: null,
    workflowSteps: [],
    approvals: [],
    blockers: [],
    progression: {
      currentPhase: { id: '', name: '', order: 0, status: 'pending' },
      phases: [],
      overallProgress: 0,
      blockedBy: [],
      canProceed: false
    },
    isLoading: false,
    error: null
  });

  const loadWorkflowData = useCallback(async () => {
    if (!releaseId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // В реальном проекте это были бы отдельные API методы
      const [release] = await Promise.all([
        releaseManagementApi.getActiveReleases().then(releases => 
          releases.find(r => r.id === releaseId) || null
        )
      ]);

      if (release) {
        // Генерируем mock данные для workflow
        const workflowSteps = RELEASE_MANAGEMENT_CONFIG.PHASES.map(phase => ({
          id: phase.id,
          name: phase.name,
          status: 'pending' as const,
          requiredApprovals: [],
          completionCriteria: [],
          estimatedDuration: 5,
          dependencies: []
        }));

        setState(prev => ({
          ...prev,
          currentRelease: release,
          workflowSteps,
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load workflow data'
      }));
    }
  }, [releaseId]);

  const addBlocker = useCallback((blocker: Omit<ReleaseBlocker, 'id' | 'reportedAt'>) => {
    const newBlocker: ReleaseBlocker = {
      ...blocker,
      id: `blocker-${Date.now()}`,
      reportedAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      blockers: [...prev.blockers, newBlocker]
    }));
  }, []);

  const resolveBlocker = useCallback((blockerId: string, resolution: string) => {
    setState(prev => ({
      ...prev,
      blockers: prev.blockers.map(blocker =>
        blocker.id === blockerId
          ? {
              ...blocker,
              status: 'resolved' as const,
              resolution,
              resolvedAt: new Date().toISOString()
            }
          : blocker
      )
    }));
  }, []);

  const updateStepStatus = useCallback((stepId: string, status: ReleaseWorkflowState['workflowSteps'][0]['status']) => {
    setState(prev => ({
      ...prev,
      workflowSteps: prev.workflowSteps.map(step =>
        step.id === stepId
          ? {
              ...step,
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : step.completedAt
            }
          : step
      )
    }));
  }, []);

  useEffect(() => {
    loadWorkflowData();
  }, [loadWorkflowData]);

  // Вычисляем прогресс
  const progress = useMemo(() => {
    const { workflowSteps } = state;
    const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
    const totalSteps = workflowSteps.length;
    
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  }, [state.workflowSteps]);

  return {
    ...state,
    progress,
    actions: {
      refresh: loadWorkflowData,
      addBlocker,
      resolveBlocker,
      updateStepStatus
    }
  };
}

/**
 * Hook для создания релиза с валидацией
 */
export function useReleaseCreation() {
  const [isCreating, setIsCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const createRelease = useCallback(async (data: ReleaseCreateFormData) => {
    setIsCreating(true);
    setValidationErrors({});

    try {
      const result = await releaseManagementApi.createReleaseWithValidation(data);
      
      if (result.warnings.length > 0) {
        // Можно показать предупреждения пользователю
        console.warn('Release creation warnings:', result.warnings);
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        setValidationErrors({ general: error.message });
      }
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const validateField = useCallback((field: string, value: any) => {
    const errors: Record<string, string> = {};

    switch (field) {
      case 'name':
        if (!value || value.trim().length < 3) {
          errors.name = 'Release name must be at least 3 characters';
        }
        break;
      case 'version':
        if (!value || !/^\d+\.\d+\.\d+/.test(value)) {
          errors.version = 'Version must follow semantic versioning (e.g., 1.0.0)';
        }
        break;
      case 'planned_date':
        if (value && new Date(value) < new Date()) {
          errors.planned_date = 'Planned date cannot be in the past';
        }
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      ...errors,
      [field]: errors[field] || undefined
    }));

    return Object.keys(errors).length === 0;
  }, []);

  return {
    createRelease,
    validateField,
    isCreating,
    validationErrors
  };
}

/**
 * Hook для фильтрации и сортировки релизов
 */
export function useReleaseFiltering(releases: ReleaseExtended[]) {
  const [filters, setFilters] = useState<ReleaseManagementFilters>({});
  const [viewConfig, setViewConfig] = useState<ReleaseViewConfig>({
    layout: 'grid',
    groupBy: 'status',
    sortBy: 'created_at',
    sortOrder: 'desc',
    showCompleted: false,
    showArchived: false,
    filters: {}
  });

  const filteredReleases = useMemo(() => {
    let filtered = [...releases];

    // Применяем фильтры
    if (filters.project_id) {
      filtered = filtered.filter(r => r.project_id === filters.project_id);
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(r => filters.status!.includes(r.status));
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower) ||
        r.version.toLowerCase().includes(searchLower)
      );
    }

    if (filters.planned_from) {
      filtered = filtered.filter(r =>
        r.planned_date && new Date(r.planned_date) >= new Date(filters.planned_from!)
      );
    }

    if (filters.planned_to) {
      filtered = filtered.filter(r =>
        r.planned_date && new Date(r.planned_date) <= new Date(filters.planned_to!)
      );
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: any = a[viewConfig.sortBy as keyof ReleaseExtended];
      let bValue: any = b[viewConfig.sortBy as keyof ReleaseExtended];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return viewConfig.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return viewConfig.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [releases, filters, viewConfig]);

  const groupedReleases = useMemo(() => {
    const groups: Record<string, ReleaseExtended[]> = {};

    filteredReleases.forEach(release => {
      let groupKey: string;

      switch (viewConfig.groupBy) {
        case 'status':
          groupKey = release.status;
          break;
        case 'project':
          groupKey = release.project_name || `Project ${release.project_id}`;
          break;
        case 'due_date':
          if (release.planned_date) {
            const date = new Date(release.planned_date);
            const now = new Date();
            const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) groupKey = 'Overdue';
            else if (diffDays <= 7) groupKey = 'This Week';
            else if (diffDays <= 30) groupKey = 'This Month';
            else groupKey = 'Later';
          } else {
            groupKey = 'No Date';
          }
          break;
        default:
          groupKey = 'All';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(release);
    });

    return groups;
  }, [filteredReleases, viewConfig.groupBy]);

  return {
    filteredReleases,
    groupedReleases,
    filters,
    viewConfig,
    actions: {
      setFilters,
      setViewConfig,
      clearFilters: () => setFilters({}),
      resetView: () => setViewConfig({
        layout: 'grid',
        groupBy: 'status',
        sortBy: 'created_at',
        sortOrder: 'desc',
        showCompleted: false,
        showArchived: false,
        filters: {}
      })
    }
  };
}

/**
 * Объединенный hook для всех функций управления релизами
 */
export function useReleaseManagement(projectId?: number, releaseId?: number) {
  const dashboard = useReleaseManagementDashboard(projectId);
  const planning = useReleasePlanning(projectId || 0);
  const workflow = useReleaseWorkflow(releaseId);
  const creation = useReleaseCreation();
  const filtering = useReleaseFiltering(dashboard.releases);

  const isLoading = dashboard.isLoading || planning.isLoading || workflow.isLoading;
  const hasError = dashboard.error || planning.error || workflow.error;

  return {
    dashboard,
    planning,
    workflow,
    creation,
    filtering,
    isLoading,
    hasError,
    actions: {
      refreshAll: () => {
        dashboard.actions.refresh();
        planning.actions.refresh();
        workflow.actions.refresh();
      }
    }
  };
} 