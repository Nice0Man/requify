import { apiClient } from '@/shared/api/client';
import type { 
  TestCase,
  TestCaseCreate,
  TestCaseUpdate,
  TestCaseWithResults,
  TestPlan,
  TestPlanCreate,
  TestPlanUpdate,
  TestPlanWithStats,
  TestExecution,
  TestExecutionCreate,
  TestExecutionUpdate,
  TestExecutionWithDetails,
  TestResult,
  TestResultCreate,
  TestResultUpdate,
  IntegrationTestJob,
  IntegrationTestStatus,
  TestSummary
} from '../model/types';
import type { PaginatedResponse, ApiResponse } from '@/shared/types/api';

/**
 * Testing API - слой взаимодействия с бэкендом для тестирования
 * В соответствии с принципами FSD, содержит только API функции без бизнес-логики
 */
export class TestingApi {
  private readonly baseUrl = '/api/v1/testing';

  // ===== Test Results =====

  /**
   * Получить результаты тестов
   */
  async getTestResults(params?: {
    skip?: number;
    limit?: number;
    requirement_id?: number;
    test_plan_id?: number;
    status?: string;
    executed_by?: number;
    executed_from?: string;
    executed_to?: string;
  }): Promise<PaginatedResponse<TestResult>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/results?${searchParams}`
      : `${this.baseUrl}/results`;

    return apiClient.get<PaginatedResponse<TestResult>>(url);
  }

  // ===== Test Plans =====

  /**
   * Получить тест-планы
   */
  async getTestPlans(params?: {
    skip?: number;
    limit?: number;
    project_id?: number;
    status?: string;
    assigned_to?: number;
    created_by?: number;
    search?: string;
  }): Promise<PaginatedResponse<TestPlan>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/plans?${searchParams}`
      : `${this.baseUrl}/plans`;

    return apiClient.get<PaginatedResponse<TestPlan>>(url);
  }

  /**
   * Создать тест-план
   */
  async createTestPlan(data: TestPlanCreate): Promise<TestPlan> {
    return apiClient.post<TestPlan>(`${this.baseUrl}/plans`, data);
  }

  /**
   * Получить тест-план по ID
   */
  async getTestPlan(id: number): Promise<TestPlanWithStats> {
    return apiClient.get<TestPlanWithStats>(`${this.baseUrl}/plans/${id}`);
  }

  /**
   * Обновить тест-план
   */
  async updateTestPlan(id: number, data: TestPlanUpdate): Promise<TestPlan> {
    return apiClient.put<TestPlan>(`${this.baseUrl}/plans/${id}`, data);
  }

  /**
   * Удалить тест-план
   */
  async deleteTestPlan(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/plans/${id}`);
  }

  // ===== Test Cases =====

  /**
   * Получить тест-кейсы
   */
  async getTestCases(params?: {
    skip?: number;
    limit?: number;
    test_plan_id?: number;
    requirement_id?: number;
    priority?: string;
    type?: string;
    status?: string;
    assigned_to?: number;
    created_by?: number;
    search?: string;
  }): Promise<PaginatedResponse<TestCase>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/cases?${searchParams}`
      : `${this.baseUrl}/cases`;

    return apiClient.get<PaginatedResponse<TestCase>>(url);
  }

  /**
   * Создать тест-кейс
   */
  async createTestCase(data: TestCaseCreate): Promise<TestCase> {
    return apiClient.post<TestCase>(`${this.baseUrl}/cases`, data);
  }

  /**
   * Получить тест-кейс по ID
   */
  async getTestCase(id: number): Promise<TestCaseWithResults> {
    return apiClient.get<TestCaseWithResults>(`${this.baseUrl}/cases/${id}`);
  }

  /**
   * Обновить тест-кейс
   */
  async updateTestCase(id: number, data: TestCaseUpdate): Promise<TestCase> {
    return apiClient.put<TestCase>(`${this.baseUrl}/cases/${id}`, data);
  }

  /**
   * Удалить тест-кейс
   */
  async deleteTestCase(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/cases/${id}`);
  }

  // ===== Test Executions =====

  /**
   * Получить выполнения тестов
   */
  async getTestExecutions(params?: {
    skip?: number;
    limit?: number;
    test_plan_id?: number;
    test_case_id?: number;
    executed_by?: number;
    status?: string;
    execution_date_from?: string;
    execution_date_to?: string;
  }): Promise<PaginatedResponse<TestExecution>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/executions?${searchParams}`
      : `${this.baseUrl}/executions`;

    return apiClient.get<PaginatedResponse<TestExecution>>(url);
  }

  /**
   * Выполнить тест-кейс
   */
  async executeTestCase(data: TestExecutionCreate): Promise<TestExecution> {
    return apiClient.post<TestExecution>(`${this.baseUrl}/executions`, data);
  }

  /**
   * Получить выполнение теста по ID
   */
  async getTestExecution(id: number): Promise<TestExecutionWithDetails> {
    return apiClient.get<TestExecutionWithDetails>(`${this.baseUrl}/executions/${id}`);
  }

  /**
   * Обновить выполнение теста
   */
  async updateTestExecution(id: number, data: TestExecutionUpdate): Promise<TestExecution> {
    return apiClient.put<TestExecution>(`${this.baseUrl}/executions/${id}`, data);
  }

  /**
   * Удалить выполнение теста
   */
  async deleteTestExecution(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/executions/${id}`);
  }

  // ===== Reports =====

  /**
   * Получить сводку по тестированию
   */
  async getTestingSummary(params?: {
    project_id?: number;
    test_plan_id?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<TestSummary> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/reports/summary?${searchParams}`
      : `${this.baseUrl}/reports/summary`;

    return apiClient.get<TestSummary>(url);
  }

  // ===== ASUTS (Automated Status Update Testing System) =====

  /**
   * Запросить статус тестирования требования
   */
  async requestRequirementTestingStatus(data: {
    requirement_id: number;
    test_types?: string[];
    include_manual?: boolean;
    include_automated?: boolean;
  }): Promise<ApiResponse<{
    requirement_id: number;
    overall_status: string;
    test_coverage: number;
    last_tested: string;
    test_results: Array<{
      test_case_id: number;
      status: string;
      executed_at: string;
    }>;
  }>> {
    return apiClient.post<ApiResponse<any>>(`${this.baseUrl}/asuts/requirement-status`, data);
  }

  /**
   * Запросить статус тестирования релиза
   */
  async requestReleaseTestingStatus(data: {
    release_id: number;
    include_regression?: boolean;
    include_integration?: boolean;
    detailed_breakdown?: boolean;
  }): Promise<ApiResponse<{
    release_id: number;
    overall_status: string;
    readiness_percentage: number;
    blocking_issues: number;
    requirements_status: Array<{
      requirement_id: number;
      status: string;
      test_coverage: number;
    }>;
    test_plan_status: Array<{
      test_plan_id: number;
      name: string;
      progress: number;
      status: string;
    }>;
  }>> {
    return apiClient.post<ApiResponse<any>>(`${this.baseUrl}/asuts/release-status`, data);
  }

  // ===== Integration Tests =====

  /**
   * Запустить интеграционные тесты
   */
  async runIntegrationTests(data: {
    test_suite?: string;
    environment?: string;
    parameters?: Record<string, any>;
    notification_channels?: string[];
    timeout_minutes?: number;
  }): Promise<IntegrationTestJob> {
    return apiClient.post<IntegrationTestJob>(`${this.baseUrl}/integration/run`, data);
  }

  /**
   * Получить статус интеграционного теста
   */
  async getIntegrationTestStatus(jobId: string): Promise<IntegrationTestStatus> {
    return apiClient.get<IntegrationTestStatus>(`${this.baseUrl}/integration/status/${jobId}`);
  }

  // ===== Statistics and Analytics =====

  /**
   * Получить статистику тестирования
   */
  async getTestingStats(params?: {
    project_id?: number;
    date_from?: string;
    date_to?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<{
    total_test_cases: number;
    total_executions: number;
    test_cases_by_status: Record<string, number>;
    test_cases_by_priority: Record<string, number>;
    test_cases_by_type: Record<string, number>;
    execution_trends: Array<{
      date: string;
      passed: number;
      failed: number;
      blocked: number;
      skipped: number;
    }>;
    automation_coverage: number;
    defect_detection_rate: number;
    average_execution_time: number;
  }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/stats?${searchParams}`
      : `${this.baseUrl}/stats`;

    return apiClient.get(url);
  }

  // ===== Bulk Operations =====

  /**
   * Массовое выполнение тест-кейсов
   */
  async bulkExecuteTestCases(data: {
    test_case_ids: number[];
    test_plan_id?: number;
    environment?: string;
    build_version?: string;
    notes?: string;
  }): Promise<ApiResponse<{
    executed: number;
    failed: number;
    execution_ids: number[];
    errors: Array<{
      test_case_id: number;
      error: string;
    }>;
  }>> {
    return apiClient.post<ApiResponse<any>>(`${this.baseUrl}/bulk-execute`, data);
  }

  /**
   * Массовое обновление статуса тест-кейсов
   */
  async bulkUpdateTestCaseStatus(data: {
    test_case_ids: number[];
    status: string;
    reason?: string;
  }): Promise<ApiResponse<{
    updated: number;
    failed: number;
    errors: Array<{
      test_case_id: number;
      error: string;
    }>;
  }>> {
    return apiClient.post<ApiResponse<any>>(`${this.baseUrl}/bulk-update-status`, data);
  }

  // ===== Export/Import =====

  /**
   * Экспорт тест-планов и тест-кейсов
   */
  async exportTestData(params?: {
    test_plan_ids?: number[];
    test_case_ids?: number[];
    include_executions?: boolean;
    include_results?: boolean;
    format?: 'excel' | 'csv' | 'xml' | 'json';
  }): Promise<Blob> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/export?${searchParams}`
      : `${this.baseUrl}/export`;

    return apiClient.getBlob(url);
  }

  /**
   * Импорт тест-кейсов
   */
  async importTestCases(file: File, params?: {
    test_plan_id: number;
    update_existing?: boolean;
    validate_references?: boolean;
  }): Promise<{
    total_processed: number;
    successful_imports: number;
    failed_imports: number;
    errors: Array<{
      row: number;
      error: string;
      data?: any;
    }>;
    created_test_cases: number[];
    updated_test_cases: number[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }

    return apiClient.post(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

// Экспортируем экземпляр API для использования в приложении
export const testingApi = new TestingApi(); 