import { useState, useEffect, useCallback } from 'react';
import { testManagementApi } from '../api/test-management.api';
import {
  TestManagementDashboardState,
  TestExecutionState,
  TestPlanningState,
  TestManagementFilters,
  TestCaseFilters,
  BatchExecution,
} from './test-management.types';

/**
 * Hook для управления дашбордом тестирования
 */
export function useTestManagementDashboard(projectId?: number) {
  const [state, setState] = useState<TestManagementDashboardState>({
    testPlans: [],
    testCases: [],
    executions: [],
    analytics: {
      coverage: 0,
      automationRate: 0,
      passRate: 0,
      trends: {
        passRateTrend: 'stable',
        coverageTrend: 'stable',
        velocityTrend: 'stable',
        automationTrend: 'stable',
      },
      distribution: {
        byStatus: {},
        byPriority: {},
        byType: {},
        byAutomation: { automated: 0, manual: 0 },
      },
      quality: {
        defectDensity: 0,
        regressionRate: 0,
        testEffectiveness: 0,
        bugLeakage: 0,
      },
      performance: {
        avgExecutionTime: 0,
        testVelocity: 0,
        resourceUtilization: 0,
        parallelExecutionRate: 0,
      },
      riskAssessment: {
        highRiskAreas: [],
        recommendations: [],
        criticalGaps: [],
      },
    },
    summary: {
      totalPlans: 0,
      totalCases: 0,
      passRate: 0,
      coverage: 0,
      automationRate: 0,
      activePlans: 0,
      pendingCases: 0,
      failedCases: 0,
    },
    recentActivity: [],
    criticalIssues: [],
    upcomingRuns: [],
    loading: false,
    error: null,
  });

  const loadDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await testManagementApi.getTestDashboardData(projectId);
      setState(prev => ({
        ...prev,
        ...data,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load test dashboard',
      }));
    }
  }, [projectId]);

  const refreshAnalytics = useCallback(async () => {
    try {
      const analytics = await testManagementApi.getTestAnalytics(projectId);
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
    refreshAnalytics,
  };
}

/**
 * Hook для управления выполнением тестов
 */
export function useTestExecution(projectId?: number) {
  const [state, setState] = useState<TestExecutionState>({
    currentExecution: null,
    executionHistory: [],
    batchExecution: null,
    realTimeResults: [],
    environments: [],
    executionQueue: [],
    loading: false,
    error: null,
  });

  const loadExecutionData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [executions, environments] = await Promise.all([
        testManagementApi.getRecentExecutions(projectId),
        // В реальном приложении был бы отдельный метод для сред
        Promise.resolve([
          {
            id: 1,
            name: 'Development',
            type: 'development' as const,
            status: 'available' as const,
            configuration: {},
            lastUsed: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'Staging',
            type: 'staging' as const,
            status: 'available' as const,
            configuration: {},
            lastUsed: new Date().toISOString(),
          },
        ]),
      ]);

      setState(prev => ({
        ...prev,
        executionHistory: executions,
        environments,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load execution data',
      }));
    }
  }, [projectId]);

  const executeTests = useCallback(async (
    testCaseIds: number[],
    executionData: {
      executor_id: number;
      environment?: string;
      notes?: string;
    }
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await testManagementApi.bulkExecuteTests(testCaseIds, executionData);
      
      // Создаем объект batch execution для отслеживания
      const batchExecution: BatchExecution = {
        id: `batch-${Date.now()}`,
        name: `Batch Execution ${new Date().toLocaleString()}`,
        testCaseIds,
        environment: executionData.environment || 'default',
        executor_id: executionData.executor_id,
        status: 'running',
        startedAt: new Date().toISOString(),
        completedAt: null,
        results: [],
        progress: {
          total: testCaseIds.length,
          completed: result.success,
          passed: 0,
          failed: result.failed,
          skipped: 0,
        },
      };

      setState(prev => ({
        ...prev,
        batchExecution,
        executionHistory: [...result.results, ...prev.executionHistory],
        loading: false,
      }));

      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to execute tests',
      }));
      throw error;
    }
  }, []);

  const cancelBatchExecution = useCallback(() => {
    setState(prev => ({
      ...prev,
      batchExecution: prev.batchExecution ? {
        ...prev.batchExecution,
        status: 'cancelled',
        completedAt: new Date().toISOString(),
      } : null,
    }));
  }, []);

  useEffect(() => {
    loadExecutionData();
  }, [loadExecutionData]);

  return {
    ...state,
    loadExecutionData,
    executeTests,
    cancelBatchExecution,
  };
}

/**
 * Hook для планирования тестов
 */
export function useTestPlanning(projectId?: number) {
  const [state, setState] = useState<TestPlanningState>({
    currentPlan: null,
    availableTestCases: [],
    selectedTestCases: [],
    planTemplates: [],
    dependencies: [],
    resources: [],
    timeline: {
      startDate: '',
      endDate: '',
      milestones: [],
      phases: [],
      criticalPath: [],
    },
    loading: false,
    error: null,
  });

  const loadPlanningData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [testCases, templates] = await Promise.all([
        testManagementApi.getTestCases(projectId),
        // В реальном приложении был бы отдельный метод для шаблонов
        Promise.resolve([
          {
            id: 1,
            name: 'Smoke Test Template',
            description: 'Basic functionality verification',
            testCaseIds: [],
            estimatedDuration: 120,
            requiredResources: ['QA Environment'],
            isDefault: true,
          },
        ]),
      ]);

      setState(prev => ({
        ...prev,
        availableTestCases: testCases,
        planTemplates: templates,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load planning data',
      }));
    }
  }, [projectId]);

  const createTestPlan = useCallback(async (planData: {
    name: string;
    description?: string;
    project_id: number;
    test_case_ids?: number[];
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      const result = await testManagementApi.createTestPlanWithValidation(planData);
      setState(prev => ({
        ...prev,
        currentPlan: result.testPlan,
      }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create test plan',
      }));
      throw error;
    }
  }, []);

  const selectTestCases = useCallback((testCaseIds: number[]) => {
    setState(prev => ({
      ...prev,
      selectedTestCases: testCaseIds,
    }));
  }, []);

  const addTestCaseToSelection = useCallback((testCaseId: number) => {
    setState(prev => ({
      ...prev,
      selectedTestCases: [...prev.selectedTestCases, testCaseId],
    }));
  }, []);

  const removeTestCaseFromSelection = useCallback((testCaseId: number) => {
    setState(prev => ({
      ...prev,
      selectedTestCases: prev.selectedTestCases.filter(id => id !== testCaseId),
    }));
  }, []);

  useEffect(() => {
    loadPlanningData();
  }, [loadPlanningData]);

  return {
    ...state,
    loadPlanningData,
    createTestPlan,
    selectTestCases,
    addTestCaseToSelection,
    removeTestCaseFromSelection,
  };
}

/**
 * Hook для фильтрации тест-кейсов
 */
export function useTestCaseFiltering(projectId?: number) {
  const [filters, setFilters] = useState<TestCaseFilters>({
    status: [],
    priority: [],
    type: [],
    automated: null,
    suiteId: null,
    assignee: [],
    tags: [],
    searchQuery: '',
    dateCreated: {
      startDate: null,
      endDate: null,
    },
    lastExecuted: {
      startDate: null,
      endDate: null,
    },
  });

  const [results, setResults] = useState({
    testCases: [] as any[],
    total: 0,
    loading: false,
    error: null as string | null,
  });

  const applyFilters = useCallback(async () => {
    setResults(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const testCases = await testManagementApi.getTestCases(projectId, {
        status: filters.status,
        priority: filters.priority,
        automated: filters.automated,
        suite_id: filters.suiteId,
      });
      
      // Дополнительная фильтрация на клиенте
      let filteredCases = testCases;
      
      if (filters.searchQuery) {
        filteredCases = filteredCases.filter(tc => 
          tc.title?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          tc.description?.toLowerCase().includes(filters.searchQuery.toLowerCase())
        );
      }

      setResults({
        testCases: filteredCases,
        total: filteredCases.length,
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
  }, [projectId, filters]);

  const updateFilters = useCallback((newFilters: Partial<TestCaseFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: [],
      priority: [],
      type: [],
      automated: null,
      suiteId: null,
      assignee: [],
      tags: [],
      searchQuery: '',
      dateCreated: {
        startDate: null,
        endDate: null,
      },
      lastExecuted: {
        startDate: null,
        endDate: null,
      },
    });
  }, []);

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
 * Главный hook для управления тестированием
 */
export function useTestManagement(projectId?: number) {
  const dashboard = useTestManagementDashboard(projectId);
  const execution = useTestExecution(projectId);
  const planning = useTestPlanning(projectId);
  const filtering = useTestCaseFiltering(projectId);

  const getCoverageReport = useCallback(async () => {
    if (!projectId) throw new Error('Project ID is required');
    return await testManagementApi.getCoverageReport(projectId);
  }, [projectId]);

  const getTestSuites = useCallback(async () => {
    return await testManagementApi.getTestSuites(projectId);
  }, [projectId]);

  return {
    dashboard,
    execution,
    planning,
    filtering,
    getCoverageReport,
    getTestSuites,
  };
} 