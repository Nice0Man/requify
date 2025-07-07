import { client } from '@/shared/api/client';

export interface TestCase {
  id: string;
  title: string;
  description?: string;
  steps: string[];
  expectedResult: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'deprecated';
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestCaseRequest {
  title: string;
  description?: string;
  steps: string[];
  expectedResult: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
}

export interface UpdateTestCaseRequest {
  title?: string;
  description?: string;
  steps?: string[];
  expectedResult?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'draft' | 'active' | 'deprecated';
}

export interface TestFilters {
  status?: 'draft' | 'active' | 'deprecated';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  assigneeId?: string;
  search?: string;
}

export interface TestStats {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  executionRate: number;
}

export interface TestExecution {
  id: string;
  testCaseId: string;
  status: 'passed' | 'failed' | 'skipped';
  executedBy: string;
  executedAt: string;
  duration: number;
  notes?: string;
  screenshots?: string[];
  logs?: string[];
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  testCases: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export const testApi = {
  async getTestCases(filters?: TestFilters): Promise<TestCase[]> {
    const response = await client.get('/test-cases', { params: filters });
    return response.data;
  },

  async getTestCase(id: string): Promise<TestCase> {
    const response = await client.get(`/test-cases/${id}`);
    return response.data;
  },

  async createTestCase(data: CreateTestCaseRequest): Promise<TestCase> {
    const response = await client.post('/test-cases', data);
    return response.data;
  },

  async updateTestCase(id: string, data: UpdateTestCaseRequest): Promise<TestCase> {
    const response = await client.put(`/test-cases/${id}`, data);
    return response.data;
  },

  async deleteTestCase(id: string): Promise<void> {
    await client.delete(`/test-cases/${id}`);
  },

  async getTestStats(): Promise<TestStats> {
    const response = await client.get('/test-cases/stats');
    return response.data;
  },

  async getProjectTestCases(projectId: string): Promise<TestCase[]> {
    const response = await client.get(`/projects/${projectId}/test-cases`);
    return response.data;
  },

  async executeTestCase(id: string, data: Omit<TestExecution, 'id' | 'testCaseId' | 'executedAt'>): Promise<TestExecution> {
    const response = await client.post(`/test-cases/${id}/execute`, data);
    return response.data;
  },

  async getTestExecutions(testCaseId: string): Promise<TestExecution[]> {
    const response = await client.get(`/test-cases/${testCaseId}/executions`);
    return response.data;
  },

  async getTestSuites(projectId?: string): Promise<TestSuite[]> {
    const response = await client.get('/test-suites', { 
      params: projectId ? { projectId } : {} 
    });
    return response.data;
  },

  async getTestSuite(id: string): Promise<TestSuite> {
    const response = await client.get(`/test-suites/${id}`);
    return response.data;
  },

  async createTestSuite(data: Omit<TestSuite, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestSuite> {
    const response = await client.post('/test-suites', data);
    return response.data;
  },

  async updateTestSuite(id: string, data: Partial<TestSuite>): Promise<TestSuite> {
    const response = await client.put(`/test-suites/${id}`, data);
    return response.data;
  },

  async deleteTestSuite(id: string): Promise<void> {
    await client.delete(`/test-suites/${id}`);
  },

  async runTestSuite(id: string): Promise<TestExecution[]> {
    const response = await client.post(`/test-suites/${id}/run`);
    return response.data;
  },

  async generateTestReport(projectId: string, format: 'pdf' | 'html' | 'json' = 'html'): Promise<Blob> {
    const response = await client.get(`/projects/${projectId}/test-report`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  async bulkUpdateTestCases(ids: string[], data: Partial<TestCase>): Promise<TestCase[]> {
    const response = await client.put('/test-cases/bulk', { ids, data });
    return response.data;
  },

  async duplicateTestCase(id: string): Promise<TestCase> {
    const response = await client.post(`/test-cases/${id}/duplicate`);
    return response.data;
  },
}; 
