import { apiClient } from '@/shared/api/client';
import {
  TestPlan,
  TestPlanCreate,
  TestPlanUpdate,
  TestPlanListParams,
  TestPlanListResponse,
  TestPlanWithDetails,
  TestCase,
  TestCaseCreate,
  TestCaseUpdate,
  TestCaseListParams,
  TestCaseListResponse,
  TestCaseWithDetails,
  TestExecution,
  TestExecutionCreate,
  TestExecutionUpdate,
  TestExecutionListParams,
  TestExecutionListResponse,
  TestExecutionWithDetails,
  TestResult,
  TestResultCreate,
  TestResultListParams,
  TestResultListResponse,
  TestSummaryReport,
  TestCoverageReport,
  AutomationJob,
  AutomationJobCreate,
  TestPlanStats,
  TestAttachment
} from '../types/testing.types';

class TestingApi {
  // Test Plans
  async getTestPlans(params?: TestPlanListParams) {
    return apiClient.get<TestPlanListResponse>('/testing/plans', { params });
  }

  async getTestPlan(id: number) {
    return apiClient.get<TestPlan>(`/testing/plans/${id}`);
  }

  async getTestPlanWithDetails(id: number) {
    return apiClient.get<TestPlanWithDetails>(`/testing/plans/${id}/details`);
  }

  async createTestPlan(data: TestPlanCreate) {
    return apiClient.post<TestPlan>('/testing/plans', data);
  }

  async updateTestPlan(id: number, data: TestPlanUpdate) {
    return apiClient.put<TestPlan>(`/testing/plans/${id}`, data);
  }

  async deleteTestPlan(id: number) {
    return apiClient.delete(`/testing/plans/${id}`);
  }

  async getTestPlanStats(id: number) {
    return apiClient.get<TestPlanStats>(`/testing/plans/${id}/stats`);
  }

  async cloneTestPlan(id: number, data: { name: string; version: string }) {
    return apiClient.post<TestPlan>(`/testing/plans/${id}/clone`, data);
  }

  // Test Cases
  async getTestCases(params?: TestCaseListParams) {
    return apiClient.get<TestCaseListResponse>('/testing/cases', { params });
  }

  async getTestCase(id: number) {
    return apiClient.get<TestCase>(`/testing/cases/${id}`);
  }

  async getTestCaseWithDetails(id: number) {
    return apiClient.get<TestCaseWithDetails>(`/testing/cases/${id}/details`);
  }

  async createTestCase(data: TestCaseCreate) {
    return apiClient.post<TestCase>('/testing/cases', data);
  }

  async updateTestCase(id: number, data: TestCaseUpdate) {
    return apiClient.put<TestCase>(`/testing/cases/${id}`, data);
  }

  async deleteTestCase(id: number) {
    return apiClient.delete(`/testing/cases/${id}`);
  }

  async cloneTestCase(id: number, data: { name: string; test_plan_id?: number }) {
    return apiClient.post<TestCase>(`/testing/cases/${id}/clone`, data);
  }

  async bulkUpdateTestCases(ids: number[], data: Partial<TestCaseUpdate>) {
    return apiClient.put('/testing/cases/bulk', { ids, ...data });
  }

  async getTestCasesByRequirement(requirementId: number) {
    return apiClient.get<TestCase[]>(`/testing/cases/by-requirement/${requirementId}`);
  }

  // Test Executions
  async getTestExecutions(params?: TestExecutionListParams) {
    return apiClient.get<TestExecutionListResponse>('/testing/executions', { params });
  }

  async getTestExecution(id: number) {
    return apiClient.get<TestExecution>(`/testing/executions/${id}`);
  }

  async getTestExecutionWithDetails(id: number) {
    return apiClient.get<TestExecutionWithDetails>(`/testing/executions/${id}/details`);
  }

  async createTestExecution(data: TestExecutionCreate) {
    return apiClient.post<TestExecution>('/testing/executions', data);
  }

  async updateTestExecution(id: number, data: TestExecutionUpdate) {
    return apiClient.put<TestExecution>(`/testing/executions/${id}`, data);
  }

  async deleteTestExecution(id: number) {
    return apiClient.delete(`/testing/executions/${id}`);
  }

  async executeTestCase(testCaseId: number, data: Omit<TestExecutionCreate, 'test_case_id'>) {
    return apiClient.post<TestExecution>(`/testing/cases/${testCaseId}/execute`, data);
  }

  async bulkExecuteTestCases(testCaseIds: number[], data: Omit<TestExecutionCreate, 'test_case_id'>) {
    return apiClient.post<TestExecution[]>('/testing/cases/bulk-execute', {
      test_case_ids: testCaseIds,
      ...data
    });
  }

  async executeTestPlan(testPlanId: number, data: { environment?: string; build_version?: string; notes?: string }) {
    return apiClient.post<TestExecution[]>(`/testing/plans/${testPlanId}/execute`, data);
  }

  // Test Results (for requirement coverage)
  async getTestResults(params?: TestResultListParams) {
    return apiClient.get<TestResultListResponse>('/testing/results', { params });
  }

  async getTestResult(id: number) {
    return apiClient.get<TestResult>(`/testing/results/${id}`);
  }

  async createTestResult(data: TestResultCreate) {
    return apiClient.post<TestResult>('/testing/results', data);
  }

  async updateTestResult(id: number, data: Partial<TestResultCreate>) {
    return apiClient.put<TestResult>(`/testing/results/${id}`, data);
  }

  async deleteTestResult(id: number) {
    return apiClient.delete(`/testing/results/${id}`);
  }

  // File attachments
  async uploadTestAttachment(testCaseId: number, file: File, description?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);

    return apiClient.post<TestAttachment>(
      `/testing/cases/${testCaseId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  async uploadExecutionAttachment(executionId: number, file: File, description?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);

    return apiClient.post<TestAttachment>(
      `/testing/executions/${executionId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  async deleteTestAttachment(attachmentId: number) {
    return apiClient.delete(`/testing/attachments/${attachmentId}`);
  }

  async downloadTestAttachment(attachmentId: number) {
    return apiClient.get(`/testing/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
  }

  // Automation
  async getAutomationJobs(params?: { status?: string; test_plan_id?: number; limit?: number; skip?: number }) {
    return apiClient.get<AutomationJob[]>('/testing/automation/jobs', { params });
  }

  async getAutomationJob(jobId: string) {
    return apiClient.get<AutomationJob>(`/testing/automation/jobs/${jobId}`);
  }

  async createAutomationJob(data: AutomationJobCreate) {
    return apiClient.post<AutomationJob>('/testing/automation/jobs', data);
  }

  async cancelAutomationJob(jobId: string) {
    return apiClient.post(`/testing/automation/jobs/${jobId}/cancel`);
  }

  async getAutomationJobLogs(jobId: string) {
    return apiClient.get<string[]>(`/testing/automation/jobs/${jobId}/logs`);
  }

  // Reports and Analytics
  async getTestSummaryReport(projectId: number, params?: {
    start_date?: string;
    end_date?: string;
    test_plan_ids?: number[];
  }) {
    return apiClient.get<TestSummaryReport>(`/testing/reports/summary/${projectId}`, { params });
  }

  async getTestCoverageReport(projectId: number, params?: {
    requirement_ids?: number[];
    include_untested?: boolean;
  }) {
    return apiClient.get<TestCoverageReport[]>(`/testing/reports/coverage/${projectId}`, { params });
  }

  async getExecutionTrends(projectId: number, params?: {
    start_date?: string;
    end_date?: string;
    granularity?: 'day' | 'week' | 'month';
  }) {
    return apiClient.get(`/testing/reports/trends/${projectId}`, { params });
  }

  async getDefectMetrics(projectId: number, params?: {
    start_date?: string;
    end_date?: string;
    test_plan_ids?: number[];
  }) {
    return apiClient.get(`/testing/reports/defects/${projectId}`, { params });
  }

  async getAutomationMetrics(projectId: number) {
    return apiClient.get(`/testing/reports/automation/${projectId}`);
  }

  // Export functionality
  async exportTestPlan(testPlanId: number, format: 'excel' | 'pdf' | 'csv') {
    return apiClient.get(`/testing/plans/${testPlanId}/export`, {
      params: { format },
      responseType: 'blob',
    });
  }

  async exportTestCases(params: {
    test_plan_id?: number;
    requirement_id?: number;
    format: 'excel' | 'pdf' | 'csv';
    include_steps?: boolean;
    include_executions?: boolean;
  }) {
    return apiClient.get('/testing/cases/export', {
      params,
      responseType: 'blob',
    });
  }

  async exportTestResults(params: {
    test_plan_id?: number;
    requirement_id?: number;
    start_date?: string;
    end_date?: string;
    format: 'excel' | 'pdf' | 'csv';
  }) {
    return apiClient.get('/testing/results/export', {
      params,
      responseType: 'blob',
    });
  }

  // Import functionality
  async importTestCases(testPlanId: number, file: File, options?: {
    skip_header?: boolean;
    update_existing?: boolean;
    create_requirements?: boolean;
  }) {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
    }

    return apiClient.post(
      `/testing/plans/${testPlanId}/import-cases`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  async importTestResults(file: File, options?: {
    skip_header?: boolean;
    test_plan_id?: number;
    environment?: string;
  }) {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
    }

    return apiClient.post('/testing/results/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Search and advanced queries
  async searchTestCases(query: string, params?: {
    project_id?: number;
    test_plan_id?: number;
    limit?: number;
    include_steps?: boolean;
  }) {
    return apiClient.get<TestCase[]>('/testing/cases/search', {
      params: { q: query, ...params }
    });
  }

  async getTestCaseDependencies(testCaseId: number) {
    return apiClient.get(`/testing/cases/${testCaseId}/dependencies`);
  }

  async getRequirementTestCoverage(requirementId: number) {
    return apiClient.get(`/testing/requirements/${requirementId}/coverage`);
  }

  async getTestExecutionHistory(testCaseId: number, params?: { limit?: number; skip?: number }) {
    return apiClient.get(`/testing/cases/${testCaseId}/execution-history`, { params });
  }

  // Test environments and configurations
  async getTestEnvironments() {
    return apiClient.get<string[]>('/testing/environments');
  }

  async createTestEnvironment(data: { name: string; description?: string; configuration?: Record<string, any> }) {
    return apiClient.post('/testing/environments', data);
  }

  async updateTestEnvironment(name: string, data: { description?: string; configuration?: Record<string, any> }) {
    return apiClient.put(`/testing/environments/${name}`, data);
  }

  async deleteTestEnvironment(name: string) {
    return apiClient.delete(`/testing/environments/${name}`);
  }

  // Test data management
  async getTestData(testCaseId: number) {
    return apiClient.get(`/testing/cases/${testCaseId}/test-data`);
  }

  async createTestData(testCaseId: number, data: { name: string; data: Record<string, any>; description?: string }) {
    return apiClient.post(`/testing/cases/${testCaseId}/test-data`, data);
  }

  async updateTestData(testDataId: number, data: { name?: string; data?: Record<string, any>; description?: string }) {
    return apiClient.put(`/testing/test-data/${testDataId}`, data);
  }

  async deleteTestData(testDataId: number) {
    return apiClient.delete(`/testing/test-data/${testDataId}`);
  }

  // Integration endpoints
  async syncWithJira(params: {
    jira_project_key: string;
    test_plan_id?: number;
    sync_executions?: boolean;
    sync_defects?: boolean;
  }) {
    return apiClient.post('/testing/integrations/jira/sync', params);
  }

  async syncWithTestRail(params: {
    testrail_project_id: number;
    test_plan_id?: number;
    sync_results?: boolean;
  }) {
    return apiClient.post('/testing/integrations/testrail/sync', params);
  }

  async triggerCIPipeline(testPlanId: number, params: {
    branch?: string;
    environment?: string;
    build_parameters?: Record<string, any>;
  }) {
    return apiClient.post(`/testing/plans/${testPlanId}/ci-trigger`, params);
  }
}

export const testingApi = new TestingApi(); 