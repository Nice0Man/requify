/**
 * Test Plan Data Access Object (DAO)
 * Основано на схемах из backend/app/schemas/test_plan.py, test_case.py, test_result.py
 */

import { client } from "@/app/providers/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type {
  TestPlan,
  TestPlanCreate,
  TestPlanUpdate,
  TestCase,
  TestCaseCreate,
  TestCaseUpdate,
  TestExecution,
  TestExecutionCreate,
  TestExecutionUpdate,
  TestPlanListResponse,
  TestPlanDetailResponse,
  TestCaseListResponse,
  TestExecutionListResponse,
  TestPlanQueryParams,
  TestCaseQueryParams,
  TestExecutionQueryParams,
  TestPlanBulkOperation,
  TestCaseBulkOperation,
  TestExecutionBulkOperation,
  TestingSummary,
  TestRunConfig,
  TestRunResult,
  TestReport,
} from "../model/types";

/**
 * TestPlanDAO - класс для работы с API тестовых планов
 */
export class TestPlanDAO {
  private static instance: TestPlanDAO;

  private constructor() {}

  /**
   * Получить singleton instance
   */
  public static getInstance(): TestPlanDAO {
    if (!TestPlanDAO.instance) {
      TestPlanDAO.instance = new TestPlanDAO();
    }
    return TestPlanDAO.instance;
  }

  // === CRUD операции с тестовыми планами ===

  /**
   * Получить список тестовых планов
   */
  async getTestPlans(params?: TestPlanQueryParams): Promise<TestPlanListResponse> {
    try {
      const response = await client.get<TestPlanListResponse>(
        API_ENDPOINTS.TEST_PLANS.LIST,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get test plans:", error);
      throw error;
    }
  }

  /**
   * Получить тестовый план по ID
   */
  async getTestPlanById(id: string): Promise<TestPlanDetailResponse> {
    try {
      const response = await client.get<TestPlanDetailResponse>(
        API_ENDPOINTS.TEST_PLANS.GET(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get test plan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить тестовые планы по проекту
   */
  async getTestPlansByProject(projectId: string): Promise<TestPlan[]> {
    try {
      const response = await client.get<TestPlan[]>(
        API_ENDPOINTS.TEST_PLANS.BY_PROJECT(projectId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get test plans for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Создать новый тестовый план
   */
  async createTestPlan(data: TestPlanCreate): Promise<TestPlan> {
    try {
      const response = await client.post<TestPlan>(
        API_ENDPOINTS.TEST_PLANS.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create test plan:", error);
      throw error;
    }
  }

  /**
   * Обновить тестовый план
   */
  async updateTestPlan(id: string, data: TestPlanUpdate): Promise<TestPlan> {
    try {
      const response = await client.put<TestPlan>(
        API_ENDPOINTS.TEST_PLANS.UPDATE(id),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update test plan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить тестовый план
   */
  async deleteTestPlan(id: string): Promise<void> {
    try {
      await client.delete(API_ENDPOINTS.TEST_PLANS.DELETE(id));
    } catch (error) {
      console.error(`Failed to delete test plan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Выполнить тестовый план
   */
  async executeTestPlan(id: string, config?: Partial<TestRunConfig>): Promise<TestRunResult> {
    try {
      const response = await client.post<TestRunResult>(
        API_ENDPOINTS.TEST_PLANS.EXECUTE(id),
        config
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to execute test plan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить результаты выполнения тестового плана
   */
  async getTestPlanResults(id: string): Promise<TestExecution[]> {
    try {
      const response = await client.get<TestExecution[]>(
        API_ENDPOINTS.TEST_PLANS.RESULTS(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get test plan results ${id}:`, error);
      throw error;
    }
  }

  // === CRUD операции с тест-кейсами ===

  /**
   * Получить список тест-кейсов
   */
  async getTestCases(params?: TestCaseQueryParams): Promise<TestCaseListResponse> {
    try {
      const response = await client.get<TestCaseListResponse>(
        API_ENDPOINTS.TEST_CASES.LIST,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get test cases:", error);
      throw error;
    }
  }

  /**
   * Получить тест-кейс по ID
   */
  async getTestCaseById(id: string): Promise<TestCase> {
    try {
      const response = await client.get<TestCase>(
        API_ENDPOINTS.TEST_CASES.GET(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get test case ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить тест-кейсы по тестовому плану
   */
  async getTestCasesByPlan(planId: string): Promise<TestCase[]> {
    try {
      const response = await client.get<TestCase[]>(
        API_ENDPOINTS.TEST_CASES.BY_PLAN(planId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get test cases for plan ${planId}:`, error);
      throw error;
    }
  }

  /**
   * Получить тест-кейсы по требованию
   */
  async getTestCasesByRequirement(requirementId: string): Promise<TestCase[]> {
    try {
      const response = await client.get<TestCase[]>(
        API_ENDPOINTS.TEST_CASES.BY_REQUIREMENT(requirementId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get test cases for requirement ${requirementId}:`, error);
      throw error;
    }
  }

  /**
   * Создать новый тест-кейс
   */
  async createTestCase(data: TestCaseCreate): Promise<TestCase> {
    try {
      const response = await client.post<TestCase>(
        API_ENDPOINTS.TEST_CASES.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create test case:", error);
      throw error;
    }
  }

  /**
   * Обновить тест-кейс
   */
  async updateTestCase(id: string, data: TestCaseUpdate): Promise<TestCase> {
    try {
      const response = await client.put<TestCase>(
        API_ENDPOINTS.TEST_CASES.UPDATE(id),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update test case ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить тест-кейс
   */
  async deleteTestCase(id: string): Promise<void> {
    try {
      await client.delete(API_ENDPOINTS.TEST_CASES.DELETE(id));
    } catch (error) {
      console.error(`Failed to delete test case ${id}:`, error);
      throw error;
    }
  }

  /**
   * Выполнить тест-кейс
   */
  async executeTestCase(id: string, data?: Partial<TestExecutionCreate>): Promise<TestExecution> {
    try {
      const response = await client.post<TestExecution>(
        API_ENDPOINTS.TEST_CASES.EXECUTE(id),
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to execute test case ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить результаты выполнения тест-кейса
   */
  async getTestCaseResults(id: string): Promise<TestExecution[]> {
    try {
      const response = await client.get<TestExecution[]>(
        API_ENDPOINTS.TEST_CASES.RESULTS(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get test case results ${id}:`, error);
      throw error;
    }
  }

  // === CRUD операции с выполнениями ===

  /**
   * Получить список выполнений
   */
  async getTestExecutions(params?: TestExecutionQueryParams): Promise<TestExecutionListResponse> {
    try {
      const response = await client.get<TestExecutionListResponse>(
        API_ENDPOINTS.TESTING.EXECUTIONS,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get test executions:", error);
      throw error;
    }
  }

  /**
   * Создать новое выполнение
   */
  async createTestExecution(data: TestExecutionCreate): Promise<TestExecution> {
    try {
      const response = await client.post<TestExecution>(
        API_ENDPOINTS.TESTING.EXECUTE_CASE,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create test execution:", error);
      throw error;
    }
  }

  /**
   * Обновить выполнение
   */
  async updateTestExecution(id: string, data: TestExecutionUpdate): Promise<TestExecution> {
    try {
      const response = await client.put<TestExecution>(`/test-executions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update test execution ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить выполнение
   */
  async deleteTestExecution(id: string): Promise<void> {
    try {
      await client.delete(`/test-executions/${id}`);
    } catch (error) {
      console.error(`Failed to delete test execution ${id}:`, error);
      throw error;
    }
  }

  // === Bulk операции ===

  /**
   * Выполнить массовую операцию над тестовыми планами
   */
  async bulkTestPlanOperation(operation: TestPlanBulkOperation): Promise<{ affected_count: number }> {
    try {
      const response = await client.post<{ affected_count: number }>(
        "/test-plans/bulk",
        operation
      );
      return response.data;
    } catch (error) {
      console.error("Failed to perform bulk test plan operation:", error);
      throw error;
    }
  }

  /**
   * Выполнить массовую операцию над тест-кейсами
   */
  async bulkTestCaseOperation(operation: TestCaseBulkOperation): Promise<{ affected_count: number }> {
    try {
      const response = await client.post<{ affected_count: number }>(
        "/test-cases/bulk",
        operation
      );
      return response.data;
    } catch (error) {
      console.error("Failed to perform bulk test case operation:", error);
      throw error;
    }
  }

  /**
   * Выполнить массовую операцию над выполнениями
   */
  async bulkExecutionOperation(operation: TestExecutionBulkOperation): Promise<{ affected_count: number }> {
    try {
      const response = await client.post<{ affected_count: number }>(
        "/test-executions/bulk",
        operation
      );
      return response.data;
    } catch (error) {
      console.error("Failed to perform bulk execution operation:", error);
      throw error;
    }
  }

  // === Отчеты и статистика ===

  /**
   * Получить общую статистику тестирования
   */
  async getTestingSummary(projectId?: string): Promise<TestingSummary> {
    try {
      const params = projectId ? { project_id: projectId } : {};
      const response = await client.get<TestingSummary>(
        API_ENDPOINTS.TESTING.SUMMARY_REPORT,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get testing summary:", error);
      throw error;
    }
  }

  /**
   * Получить результаты тестирования
   */
  async getTestResults(params?: any): Promise<any[]> {
    try {
      const response = await client.get<any[]>(
        API_ENDPOINTS.TESTING.RESULTS,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get test results:", error);
      throw error;
    }
  }

  /**
   * Сгенерировать отчет
   */
  async generateReport(config: {
    type: "execution" | "summary" | "coverage" | "trend";
    format: "html" | "pdf" | "json" | "xml" | "csv";
    test_plan_id?: number;
    project_id?: number;
    date_from: string;
    date_to: string;
  }): Promise<TestReport> {
    try {
      const response = await client.post<TestReport>("/test-reports/generate", config);
      return response.data;
    } catch (error) {
      console.error("Failed to generate test report:", error);
      throw error;
    }
  }

  /**
   * Скачать отчет
   */
  async downloadReport(reportId: string): Promise<Blob> {
    try {
      const response = await client.get(`/test-reports/${reportId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to download test report ${reportId}:`, error);
      throw error;
    }
  }

  // === Автоматизация ===

  /**
   * Запустить интеграционные тесты
   */
  async runIntegrationTests(config: TestRunConfig): Promise<TestRunResult> {
    try {
      const response = await client.post<TestRunResult>(
        API_ENDPOINTS.TESTING.INTEGRATION_RUN,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Failed to run integration tests:", error);
      throw error;
    }
  }

  /**
   * Получить статус интеграционных тестов
   */
  async getIntegrationTestStatus(jobId: string): Promise<TestRunResult> {
    try {
      const response = await client.get<TestRunResult>(
        API_ENDPOINTS.TESTING.INTEGRATION_STATUS(jobId)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get integration test status ${jobId}:`, error);
      throw error;
    }
  }

  // === Поиск ===

  /**
   * Поиск тестовых планов
   */
  async searchTestPlans(query: string, filters?: Partial<TestPlanQueryParams>): Promise<TestPlan[]> {
    try {
      const response = await client.get<TestPlan[]>("/test-plans/search", {
        params: {
          q: query,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to search test plans:", error);
      throw error;
    }
  }

  /**
   * Поиск тест-кейсов
   */
  async searchTestCases(query: string, filters?: Partial<TestCaseQueryParams>): Promise<TestCase[]> {
    try {
      const response = await client.get<TestCase[]>("/test-cases/search", {
        params: {
          q: query,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to search test cases:", error);
      throw error;
    }
  }
}

// Экспорт singleton instance
export const testPlanDAO = TestPlanDAO.getInstance();