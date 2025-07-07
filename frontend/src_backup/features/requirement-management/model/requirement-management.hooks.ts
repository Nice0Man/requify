import { useState, useEffect, useCallback } from 'react';
import { requirementManagementApi } from '../api/requirement-management.api';
import {
  RequirementManagementDashboardState,
  RequirementTraceabilityState,
  RequirementWorkflowState,
  RequirementFilters,
  RequirementAnalytics,
  RequirementActivity,
  TestCoverageData,
  TraceabilityMatrix,
} from './requirement-management.types';

/**
 * Hook для управления дашбордом требований
 */
export function useRequirementManagementDashboard(projectId?: number) {
  const [state, setState] = useState<RequirementManagementDashboardState>({
    requirements: [],
    stats: {
      total: 0,
      by_status: {},
      by_priority: {},
      by_type: {},
      completion_rate: 0,
      test_coverage: 0,
      pending_approvals: 0,
      overdue_count: 0,
    },
    analytics: {
      trends: {
        creation_rate: 0,
        completion_rate: 0,
        approval_rate: 0,
        defect_rate: 0,
        velocity_trend: 'stable',
      },
      quality_metrics: {
        clarity_score: 0,
        completeness_score: 0,
        testability_score: 0,
        traceability_score: 0,
      },
      collaboration: {
        active_reviewers: 0,
        avg_review_time: 0,
        comment_activity: 0,
        stakeholder_engagement: 0,
      },
      forecasting: {
        projected_completion: '',
        estimated_effort: 0,
        risk_factors: [],
        milestone_probability: 0,
      },
    },
    recentActivity: [],
    criticalRequirements: [],
    upcomingDeadlines: [],
    testCoverage: {
      total_requirements: 0,
      tested_requirements: 0,
      coverage_percentage: 0,
      by_requirement_type: {},
      uncovered_requirements: [],
      test_gaps: [],
    },
    loading: false,
    error: null,
  });

  const loadDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await requirementManagementApi.getRequirementDashboardData(projectId);
      setState(prev => ({
        ...prev,
        ...data,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
      }));
    }
  }, [projectId]);

  const refreshStats = useCallback(async () => {
    try {
      const analytics = await requirementManagementApi.getRequirementAnalytics(projectId);
      setState(prev => ({
        ...prev,
        analytics,
      }));
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    }
  }, [projectId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    ...state,
    loadDashboardData,
    refreshStats,
  };
}

/**
 * Hook для управления трассируемостью требований
 */
export function useRequirementTraceability(projectId?: number) {
  const [state, setState] = useState<RequirementTraceabilityState>({
    matrix: {
      requirements: [],
      test_cases: [],
      relationships: [],
      coverage_stats: {
        total_requirements: 0,
        covered_requirements: 0,
        coverage_percentage: 0,
        orphaned_tests: 0,
      },
    },
    orphanedRequirements: [],
    duplicateRequirements: [],
    gaps: [],
    loading: false,
    error: null,
  });

  const loadTraceabilityMatrix = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const matrix = await requirementManagementApi.getTraceabilityMatrix(projectId);
      setState(prev => ({
        ...prev,
        matrix,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load traceability matrix',
      }));
    }
  }, [projectId]);

  const analyzeGaps = useCallback(async () => {
    try {
      // В реальном приложении это был бы отдельный API метод
      const gaps = await requirementManagementApi.getTraceabilityMatrix(projectId);
      setState(prev => ({
        ...prev,
        gaps: gaps.requirements.filter(req => 
          !gaps.relationships.some(rel => rel.requirement_id === req.id)
        ).map(req => ({
          requirement_id: req.id,
          requirement_title: req.title || '',
          gap_type: 'no_test_coverage' as const,
          severity: 'medium' as const,
          description: 'No test coverage found for this requirement',
          recommendations: ['Create test cases', 'Define acceptance criteria'],
        })),
      }));
    } catch (error) {
      console.error('Failed to analyze gaps:', error);
    }
  }, [projectId]);

  useEffect(() => {
    loadTraceabilityMatrix();
  }, [loadTraceabilityMatrix]);

  return {
    ...state,
    loadTraceabilityMatrix,
    analyzeGaps,
  };
}

/**
 * Hook для управления рабочим процессом требований
 */
export function useRequirementWorkflow(requirementId?: number) {
  const [state, setState] = useState<RequirementWorkflowState>({
    requirement: null,
    workflowSteps: [],
    currentStep: null,
    availableActions: [],
    blockers: [],
    approvals: [],
    history: [],
    loading: false,
    error: null,
  });

  const loadWorkflow = useCallback(async () => {
    if (!requirementId) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // В реальном приложении это были бы отдельные API методы
      const [requirement] = await Promise.all([
        requirementManagementApi.getActiveRequirements({ requirement_id: requirementId }),
      ]);

      const req = requirement[0];
      if (req) {
        setState(prev => ({
          ...prev,
          requirement: req,
          workflowSteps: [
            {
              id: 'draft',
              name: 'Draft',
              description: 'Initial requirement creation',
              status: req.status === 'draft' ? 'current' : req.status === 'approved' || req.status === 'implemented' ? 'completed' : 'pending',
              assignee_id: req.assignee_id,
              due_date: null,
              completed_at: req.status !== 'draft' ? req.updated_at : null,
            },
            {
              id: 'review',
              name: 'Review',
              description: 'Stakeholder review and feedback',
              status: req.status === 'review' ? 'current' : req.status === 'approved' || req.status === 'implemented' ? 'completed' : 'pending',
              assignee_id: null,
              due_date: null,
              completed_at: req.status === 'approved' || req.status === 'implemented' ? req.updated_at : null,
            },
            {
              id: 'approved',
              name: 'Approved',
              description: 'Requirement approved for implementation',
              status: req.status === 'approved' ? 'current' : req.status === 'implemented' ? 'completed' : 'pending',
              assignee_id: null,
              due_date: null,
              completed_at: req.status === 'implemented' ? req.updated_at : null,
            },
          ],
          availableActions: getAvailableActions(req.status),
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load workflow',
      }));
    }
  }, [requirementId]);

  const executeAction = useCallback(async (action: string, data?: any) => {
    if (!requirementId) return;
    
    try {
      await requirementManagementApi.bulkUpdateRequirementStatus([requirementId], action, data?.reason);
      await loadWorkflow(); // Перезагружаем после действия
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to execute action',
      }));
    }
  }, [requirementId, loadWorkflow]);

  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  return {
    ...state,
    loadWorkflow,
    executeAction,
  };
}

/**
 * Hook для фильтрации и поиска требований
 */
export function useRequirementFiltering(projectId?: number) {
  const [filters, setFilters] = useState<RequirementFilters>({
    status: [],
    priority: [],
    type: [],
    assignee: [],
    project: projectId ? [projectId] : [],
    date_range: {
      start_date: null,
      end_date: null,
    },
    search_query: '',
    tags: [],
    custom_fields: {},
  });

  const [results, setResults] = useState({
    requirements: [] as any[],
    total: 0,
    loading: false,
    error: null as string | null,
  });

  const applyFilters = useCallback(async () => {
    setResults(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const requirements = await requirementManagementApi.getActiveRequirements(filters);
      setResults({
        requirements,
        total: requirements.length,
        loading: false,
        error: null,
      });
    } catch (error) {
      setResults(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to apply filters',
      }));
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<RequirementFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: [],
      priority: [],
      type: [],
      assignee: [],
      project: projectId ? [projectId] : [],
      date_range: {
        start_date: null,
        end_date: null,
      },
      search_query: '',
      tags: [],
      custom_fields: {},
    });
  }, [projectId]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    filters,
    results,
    updateFilters,
    clearFilters,
    applyFilters,
  };
}

/**
 * Главный hook для управления требованиями
 */
export function useRequirementManagement(projectId?: number) {
  const dashboard = useRequirementManagementDashboard(projectId);
  const traceability = useRequirementTraceability(projectId);
  const filtering = useRequirementFiltering(projectId);

  const createRequirement = useCallback(async (data: any) => {
    try {
      const result = await requirementManagementApi.createRequirementWithValidation(data);
      // Обновляем дашборд после создания
      await dashboard.loadDashboardData();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dashboard]);

  const bulkUpdateStatus = useCallback(async (
    requirementIds: number[],
    status: string,
    reason?: string
  ) => {
    try {
      const result = await requirementManagementApi.bulkUpdateRequirementStatus(
        requirementIds,
        status,
        reason
      );
      // Обновляем дашборд после массового обновления
      await dashboard.loadDashboardData();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dashboard]);

  return {
    dashboard,
    traceability,
    filtering,
    createRequirement,
    bulkUpdateStatus,
  };
}

// Вспомогательные функции
function getAvailableActions(status: string): Array<{
  id: string;
  name: string;
  description: string;
  requires_reason: boolean;
  confirmation_required: boolean;
}> {
  const baseActions = [
    {
      id: 'edit',
      name: 'Edit',
      description: 'Edit requirement details',
      requires_reason: false,
      confirmation_required: false,
    },
    {
      id: 'comment',
      name: 'Add Comment',
      description: 'Add a comment or note',
      requires_reason: false,
      confirmation_required: false,
    },
  ];

  switch (status) {
    case 'draft':
      return [
        ...baseActions,
        {
          id: 'submit_for_review',
          name: 'Submit for Review',
          description: 'Submit requirement for stakeholder review',
          requires_reason: false,
          confirmation_required: true,
        },
        {
          id: 'delete',
          name: 'Delete',
          description: 'Delete this requirement',
          requires_reason: true,
          confirmation_required: true,
        },
      ];
    case 'review':
      return [
        ...baseActions,
        {
          id: 'approve',
          name: 'Approve',
          description: 'Approve requirement for implementation',
          requires_reason: false,
          confirmation_required: true,
        },
        {
          id: 'request_changes',
          name: 'Request Changes',
          description: 'Request changes to the requirement',
          requires_reason: true,
          confirmation_required: false,
        },
        {
          id: 'reject',
          name: 'Reject',
          description: 'Reject this requirement',
          requires_reason: true,
          confirmation_required: true,
        },
      ];
    case 'approved':
      return [
        ...baseActions,
        {
          id: 'start_implementation',
          name: 'Start Implementation',
          description: 'Begin implementing this requirement',
          requires_reason: false,
          confirmation_required: true,
        },
        {
          id: 'revise',
          name: 'Revise',
          description: 'Send back for revision',
          requires_reason: true,
          confirmation_required: true,
        },
      ];
    default:
      return baseActions;
  }
} 