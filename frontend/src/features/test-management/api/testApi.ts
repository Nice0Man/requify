import { client } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";

export interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  status: TestCaseStatus;
  priority: TestCasePriority;
  requirementId?: string;
  projectId: string;
  authorId: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

export type TestCaseStatus = 'draft' | 'active' | 'deprecated';
export type TestCasePriority = 'low' | 'medium' | 'high' | 'critical';

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  projectId: string;
  testCases: TestCase[];
  createdAt: string;
  updatedAt: string;
}

export interface TestExecution {
  id: string;
  testCaseId: string;
  status: TestExecutionStatus;
  result: string;
  executedBy: string;
  executedAt: string;
  duration?: number;
}

export type TestExecutionStatus = 'passed' | 'failed' | 'skipped' | 'blocked';

export interface TestFilters {
  status?: TestCaseStatus;
  priority?: TestCasePriority;
  projectId?: string;
  assigneeId?: string;
  search?: string;
}

export interface CreateTestCaseRequest {
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  priority: TestCasePriority;
  requirementId?: string;
  projectId: string;
  assigneeId?: string;
}

export interface UpdateTestCaseRequest extends Partial<CreateTestCaseRequest> {}

export interface CreateTestSuiteRequest {
  name: string;
  description: string;
  projectId: string;
}

export interface UpdateTestSuiteRequest extends Partial<CreateTestSuiteRequest> {}

export interface ExecuteTestCaseRequest {
  result: string;
  status: TestExecutionStatus;
  duration?: number;
}

export const testApi = {
  // Test Cases
  async getTestCases(filters?: TestFilters): Promise<TestCase[]> {
    const response = await client.get(API_ENDPOINTS.TESTING.CASES, { params: filters });
    return response.data;
  },

  async getTestCase(id: string): Promise<TestCase> {
    const response = await client.get(`${API_ENDPOINTS.TESTING.CASES}/${id}`);
    return response.data;
  },

  async createTestCase(data: CreateTestCaseRequest): Promise<TestCase> {
    const response = await client.post(API_ENDPOINTS.TESTING.CREATE_CASE, data);
    return response.data;
  },

  async updateTestCase(id: string, data: UpdateTestCaseRequest): Promise<TestCase> {
    const response = await client.put(`${API_ENDPOINTS.TESTING.CASES}/${id}`, data);
    return response.data;
  },

  async deleteTestCase(id: string): Promise<void> {
    await client.delete(`${API_ENDPOINTS.TESTING.CASES}/${id}`);
  },

  // Test Plans
  async getTestPlans(projectId?: string): Promise<TestSuite[]> {
    const response = await client.get(API_ENDPOINTS.TESTING.PLANS, {
      params: { projectId }
    });
    return response.data;
  },

  async getTestPlan(id: string): Promise<TestSuite> {
    const response = await client.get(API_ENDPOINTS.TESTING.GET_PLAN(id));
    return response.data;
  },

  async createTestPlan(data: CreateTestSuiteRequest): Promise<TestSuite> {
    const response = await client.post(API_ENDPOINTS.TESTING.CREATE_PLAN, data);
    return response.data;
  },

  async updateTestPlan(id: string, data: UpdateTestSuiteRequest): Promise<TestSuite> {
    const response = await client.put(`${API_ENDPOINTS.TESTING.PLANS}/${id}`, data);
    return response.data;
  },

  async deleteTestPlan(id: string): Promise<void> {
    await client.delete(`${API_ENDPOINTS.TESTING.PLANS}/${id}`);
  },

  // Test Executions
  async executeTestCase(id: string, data: ExecuteTestCaseRequest): Promise<TestExecution> {
    const response = await client.post(API_ENDPOINTS.TESTING.EXECUTE_CASE, {
      testCaseId: id,
      ...data
    });
    return response.data;
  },

  async getTestExecutions(testCaseId: string): Promise<TestExecution[]> {
    const response = await client.get(`${API_ENDPOINTS.TESTING.EXECUTIONS}?testCaseId=${testCaseId}`);
    return response.data;
  },

  async getTestResults(): Promise<TestExecution[]> {
    const response = await client.get(API_ENDPOINTS.TESTING.RESULTS);
    return response.data;
  },

  // Reports
  async getTestingSummary(): Promise<any> {
    const response = await client.get(API_ENDPOINTS.TESTING.SUMMARY_REPORT);
    return response.data;
  },

  async getRequirementTestingStatus(requirementId: string): Promise<any> {
    const response = await client.post(API_ENDPOINTS.TESTING.REQUIREMENT_STATUS, {
      requirementId
    });
    return response.data;
  },

  async getReleaseTestingStatus(releaseId: string): Promise<any> {
    const response = await client.post(API_ENDPOINTS.TESTING.RELEASE_STATUS, {
      releaseId
    });
    return response.data;
  },

  // Integration Testing
  async runIntegrationTests(data: any): Promise<{ jobId: string }> {
    const response = await client.post(API_ENDPOINTS.TESTING.INTEGRATION_RUN, data);
    return response.data;
  },

  async getIntegrationTestStatus(jobId: string): Promise<any> {
    const response = await client.get(API_ENDPOINTS.TESTING.INTEGRATION_STATUS(jobId));
    return response.data;
  },

  // Legacy methods for backward compatibility
  /** @deprecated Use getTestPlans */
  async getTestSuites(projectId?: string): Promise<TestSuite[]> {
    return this.getTestPlans(projectId);
  },

  /** @deprecated Use createTestPlan */
  async createTestSuite(data: CreateTestSuiteRequest): Promise<TestSuite> {
    return this.createTestPlan(data);
  },

  /** @deprecated Use updateTestPlan */
  async updateTestSuite(id: string, data: UpdateTestSuiteRequest): Promise<TestSuite> {
    return this.updateTestPlan(id, data);
  },

  /** @deprecated Use deleteTestPlan */
  async deleteTestSuite(id: string): Promise<void> {
    return this.deleteTestPlan(id);
  },
}; 
