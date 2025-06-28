import { ApiClient, ApiResponse } from '@/shared/api/client';

export interface TestResult {
  id: number;
  test_case_id: number;
  requirement_id?: number;
  execution_id: number;
  status: TestStatus;
  result: TestResultType;
  executed_by: number;
  executed_at: string;
  duration?: number;
  notes?: string;
  attachments: string[];
  error_details?: string;
  environment?: string;
  created_at: string;
  updated_at: string;
}

export interface TestPlan {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  release_id?: number;
  status: TestPlanStatus;
  start_date?: string;
  end_date?: string;
  created_by: number;
  test_cases_count: number;
  execution_progress: number;
  created_at: string;
  updated_at: string;
}

export interface TestCase {
  id: number;
  title: string;
  description: string;
  requirement_id?: number;
  project_id: number;
  priority: TestPriority;
  type: TestType;
  status: TestCaseStatus;
  preconditions?: string;
  test_steps: TestStep[];
  expected_result: string;
  created_by: number;
  assigned_to?: number;
  tags: string[];
  automation_status?: AutomationStatus;
  created_at: string;
  updated_at: string;
}

export interface TestExecution {
  id: number;
  test_plan_id: number;
  test_case_id: number;
  executed_by: number;
  status: TestExecutionStatus;
  start_time?: string;
  end_time?: string;
  environment?: string;
  browser?: string;
  platform?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TestStep {
  step_number: number;
  action: string;
  expected_result: string;
  actual_result?: string;
  status?: TestStepStatus;
}

export interface TestResultCreate {
  test_case_id: number;
  requirement_id?: number;
  execution_id: number;
  status: TestStatus;
  result: TestResultType;
  duration?: number;
  notes?: string;
  environment?: string;
  error_details?: string;
}

export interface TestPlanCreate {
  name: string;
  description?: string;
  project_id: number;
  release_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface TestCaseCreate {
  title: string;
  description: string;
  requirement_id?: number;
  project_id: number;
  priority: TestPriority;
  type: TestType;
  preconditions?: string;
  test_steps: Omit<TestStep, 'actual_result' | 'status'>[];
  expected_result: string;
  assigned_to?: number;
  tags?: string[];
}

export interface TestExecutionCreate {
  test_plan_id: number;
  test_case_id: number;
  environment?: string;
  browser?: string;
  platform?: string;
  notes?: string;
}

export interface TestSummaryReport {
  total_test_cases: number;
  executed_test_cases: number;
  passed_test_cases: number;
  failed_test_cases: number;
  blocked_test_cases: number;
  pass_rate: number;
  execution_progress: number;
  test_coverage: number;
  defects_found: number;
  critical_defects: number;
}

export interface IntegrationTestRequest {
  requirement_id?: number;
  release_id?: number;
  test_suite?: string;
  environment?: string;
  config?: Record<string, any>;
}

export interface IntegrationTestStatus {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  start_time: string;
  end_time?: string;
  result?: TestResultType;
  logs_url?: string;
  report_url?: string;
}

export interface RequirementTestingStatus {
  requirement_id: number;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  pending_tests: number;
  coverage_percentage: number;
  last_test_date?: string;
}

export interface ReleaseTestingStatus {
  release_id: number;
  total_requirements: number;
  tested_requirements: number;
  passed_requirements: number;
  failed_requirements: number;
  overall_pass_rate: number;
  test_completion: number;
}

export enum TestStatus {
  NOT_EXECUTED = 'not_executed',
  PASSED = 'passed',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  SKIPPED = 'skipped'
}

export enum TestResultType {
  PASS = 'pass',
  FAIL = 'fail',
  BLOCK = 'block',
  SKIP = 'skip'
}

export enum TestPlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum TestType {
  FUNCTIONAL = 'functional',
  INTEGRATION = 'integration',
  REGRESSION = 'regression',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  USABILITY = 'usability'
}

export enum TestCaseStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  DEPRECATED = 'deprecated'
}

export enum TestExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum AutomationStatus {
  MANUAL = 'manual',
  AUTOMATED = 'automated',
  TO_AUTOMATE = 'to_automate'
}

export enum TestStepStatus {
  NOT_EXECUTED = 'not_executed',
  PASSED = 'passed',
  FAILED = 'failed',
  BLOCKED = 'blocked'
}

export class TestingApi {
  constructor(private client: ApiClient) {}

  // 1. Get Test Results
  async getTestResults(params?: { skip?: number; limit?: number; execution_id?: number; status?: TestStatus }): Promise<ApiResponse<{ items: TestResult[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.execution_id) queryParams.append('execution_id', params.execution_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = queryString ? `/testing/results?${queryString}` : '/testing/results';
    
    return this.client.get<{ items: TestResult[]; total: number }>(url);
  }

  // 2. Create Test Result
  async createTestResult(resultData: TestResultCreate): Promise<ApiResponse<TestResult>> {
    return this.client.post<TestResult>('/testing/results', resultData);
  }

  // 3. Get Test Plans
  async getTestPlans(params?: { skip?: number; limit?: number; project_id?: number; status?: TestPlanStatus }): Promise<ApiResponse<{ items: TestPlan[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.project_id) queryParams.append('project_id', params.project_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = queryString ? `/testing/plans?${queryString}` : '/testing/plans';
    
    return this.client.get<{ items: TestPlan[]; total: number }>(url);
  }

  // 4. Create Test Plan
  async createTestPlan(planData: TestPlanCreate): Promise<ApiResponse<TestPlan>> {
    return this.client.post<TestPlan>('/testing/plans', planData);
  }

  // 5. Get Test Plan
  async getTestPlan(planId: number): Promise<ApiResponse<TestPlan>> {
    return this.client.get<TestPlan>(`/testing/plans/${planId}`);
  }

  // 6. Get Test Cases
  async getTestCases(params?: { skip?: number; limit?: number; project_id?: number; requirement_id?: number; type?: TestType }): Promise<ApiResponse<{ items: TestCase[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.project_id) queryParams.append('project_id', params.project_id.toString());
    if (params?.requirement_id) queryParams.append('requirement_id', params.requirement_id.toString());
    if (params?.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    const url = queryString ? `/testing/cases?${queryString}` : '/testing/cases';
    
    return this.client.get<{ items: TestCase[]; total: number }>(url);
  }

  // 7. Create Test Case
  async createTestCase(caseData: TestCaseCreate): Promise<ApiResponse<TestCase>> {
    return this.client.post<TestCase>('/testing/cases', caseData);
  }

  // 8. Get Test Executions
  async getTestExecutions(params?: { skip?: number; limit?: number; test_plan_id?: number; status?: TestExecutionStatus }): Promise<ApiResponse<{ items: TestExecution[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.test_plan_id) queryParams.append('test_plan_id', params.test_plan_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = queryString ? `/testing/executions?${queryString}` : '/testing/executions';
    
    return this.client.get<{ items: TestExecution[]; total: number }>(url);
  }

  // 9. Execute Test Case
  async executeTestCase(executionData: TestExecutionCreate): Promise<ApiResponse<TestExecution>> {
    return this.client.post<TestExecution>('/testing/executions', executionData);
  }

  // 10. Get Testing Summary
  async getTestingSummary(params?: { project_id?: number; release_id?: number; test_plan_id?: number }): Promise<ApiResponse<TestSummaryReport>> {
    const queryParams = new URLSearchParams();
    if (params?.project_id) queryParams.append('project_id', params.project_id.toString());
    if (params?.release_id) queryParams.append('release_id', params.release_id.toString());
    if (params?.test_plan_id) queryParams.append('test_plan_id', params.test_plan_id.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/testing/reports/summary?${queryString}` : '/testing/reports/summary';
    
    return this.client.get<TestSummaryReport>(url);
  }

  // 11. Request Requirement Testing Status
  async requestRequirementTestingStatus(requirementId: number): Promise<ApiResponse<RequirementTestingStatus>> {
    return this.client.post<RequirementTestingStatus>('/testing/asuts/requirement-status', { requirement_id: requirementId });
  }

  // 12. Request Release Testing Status
  async requestReleaseTestingStatus(releaseId: number): Promise<ApiResponse<ReleaseTestingStatus>> {
    return this.client.post<ReleaseTestingStatus>('/testing/asuts/release-status', { release_id: releaseId });
  }

  // 13. Run Integration Tests
  async runIntegrationTests(testRequest: IntegrationTestRequest): Promise<ApiResponse<{ job_id: string; status: string }>> {
    return this.client.post<{ job_id: string; status: string }>('/testing/integration/run', testRequest);
  }

  // 14. Get Integration Test Status
  async getIntegrationTestStatus(jobId: string): Promise<ApiResponse<IntegrationTestStatus>> {
    return this.client.get<IntegrationTestStatus>(`/testing/integration/status/${jobId}`);
  }
}

// Export singleton instance
export const testingApi = new TestingApi(new ApiClient()); 