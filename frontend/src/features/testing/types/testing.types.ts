// Testing types based on backend contracts

export interface TestCase {
  id: number;
  title: string;
  description?: string;
  steps: TestStep[];
  expected_result: string;
  preconditions?: string;
  test_data?: string;
  priority: TestPriority;
  type: TestType;
  status: TestCaseStatus;
  requirement_ids: number[];
  project_id: number;
  suite_id?: number;
  suite_name?: string;
  estimated_time?: number;
  tags: string[];
  created_by: number;
  created_by_name?: string;
  updated_by: number;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
  custom_fields?: Record<string, any>;
}

export interface TestStep {
  id: number;
  step_number: number;
  action: string;
  expected_result: string;
  notes?: string;
}

export interface TestCaseCreate {
  title: string;
  description?: string;
  steps: Omit<TestStep, 'id'>[];
  expected_result: string;
  preconditions?: string;
  test_data?: string;
  priority: TestPriority;
  type: TestType;
  requirement_ids?: number[];
  project_id: number;
  suite_id?: number;
  estimated_time?: number;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface TestCaseUpdate {
  title?: string;
  description?: string;
  steps?: Omit<TestStep, 'id'>[];
  expected_result?: string;
  preconditions?: string;
  test_data?: string;
  priority?: TestPriority;
  type?: TestType;
  status?: TestCaseStatus;
  requirement_ids?: number[];
  suite_id?: number;
  estimated_time?: number;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export enum TestPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum TestType {
  FUNCTIONAL = 'functional',
  INTEGRATION = 'integration',
  SYSTEM = 'system',
  ACCEPTANCE = 'acceptance',
  REGRESSION = 'regression',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  USABILITY = 'usability',
  API = 'api',
  UI = 'ui'
}

export enum TestCaseStatus {
  DRAFT = 'draft',
  READY = 'ready',
  BLOCKED = 'blocked',
  DEPRECATED = 'deprecated',
  ACTIVE = 'active'
}

export interface TestSuite {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  parent_id?: number;
  children_ids: number[];
  test_cases_count: number;
  status: TestSuiteStatus;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TestSuiteCreate {
  name: string;
  description?: string;
  project_id: number;
  parent_id?: number;
}

export interface TestSuiteUpdate {
  name?: string;
  description?: string;
  parent_id?: number;
  status?: TestSuiteStatus;
}

export enum TestSuiteStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export interface TestRun {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  suite_ids: number[];
  test_case_ids: number[];
  status: TestRunStatus;
  environment: string;
  tester_id?: number;
  tester_name?: string;
  start_date?: string;
  end_date?: string;
  planned_start?: string;
  planned_end?: string;
  configuration?: Record<string, any>;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TestRunCreate {
  name: string;
  description?: string;
  project_id: number;
  suite_ids?: number[];
  test_case_ids?: number[];
  environment: string;
  tester_id?: number;
  planned_start?: string;
  planned_end?: string;
  configuration?: Record<string, any>;
}

export interface TestRunUpdate {
  name?: string;
  description?: string;
  suite_ids?: number[];
  test_case_ids?: number[];
  status?: TestRunStatus;
  environment?: string;
  tester_id?: number;
  start_date?: string;
  end_date?: string;
  planned_start?: string;
  planned_end?: string;
  configuration?: Record<string, any>;
}

export enum TestRunStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export interface TestResult {
  id: number;
  test_run_id: number;
  test_case_id: number;
  test_case_title?: string;
  status: TestResultStatus;
  actual_result?: string;
  notes?: string;
  defects: Defect[];
  execution_time?: number;
  screenshots: string[];
  attachments: string[];
  executed_by: number;
  executed_by_name?: string;
  executed_at: string;
  step_results: TestStepResult[];
}

export interface TestStepResult {
  step_id: number;
  status: TestResultStatus;
  actual_result?: string;
  notes?: string;
  screenshot?: string;
}

export interface TestResultCreate {
  test_run_id: number;
  test_case_id: number;
  status: TestResultStatus;
  actual_result?: string;
  notes?: string;
  execution_time?: number;
  step_results?: Omit<TestStepResult, 'step_id'>[];
}

export interface TestResultUpdate {
  status?: TestResultStatus;
  actual_result?: string;
  notes?: string;
  execution_time?: number;
  step_results?: TestStepResult[];
}

export enum TestResultStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  SKIPPED = 'skipped',
  NOT_EXECUTED = 'not_executed'
}

export interface Defect {
  id: number;
  title: string;
  description: string;
  severity: DefectSeverity;
  priority: DefectPriority;
  status: DefectStatus;
  test_result_id: number;
  requirement_id?: number;
  assignee_id?: number;
  assignee_name?: string;
  reporter_id: number;
  reporter_name?: string;
  environment?: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
}

export enum DefectSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum DefectPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum DefectStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  VERIFIED = 'verified',
  CLOSED = 'closed',
  REOPENED = 'reopened',
  REJECTED = 'rejected'
}

export interface TestPlan {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  objective: string;
  scope: string;
  approach: string;
  entry_criteria: string;
  exit_criteria: string;
  test_deliverables: string[];
  environment_requirements: string;
  schedule: TestSchedule;
  resources: TestResource[];
  risks: TestRisk[];
  suite_ids: number[];
  status: TestPlanStatus;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TestSchedule {
  start_date: string;
  end_date: string;
  milestones: Array<{
    name: string;
    date: string;
    description?: string;
  }>;
}

export interface TestResource {
  type: 'human' | 'tool' | 'environment';
  name: string;
  quantity?: number;
  description?: string;
}

export interface TestRisk {
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export enum TestPlanStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface TestFilters {
  project_id?: number;
  suite_id?: number;
  status?: TestCaseStatus[];
  priority?: TestPriority[];
  type?: TestType[];
  requirement_ids?: number[];
  tags?: string[];
  search?: string;
  created_by?: number[];
  created_from?: string;
  created_to?: string;
}

export interface TestRunFilters {
  project_id?: number;
  status?: TestRunStatus[];
  environment?: string[];
  tester_id?: number[];
  created_from?: string;
  created_to?: string;
  search?: string;
}

export interface TestListParams {
  skip?: number;
  limit?: number;
  filters?: TestFilters;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TestRunListParams {
  skip?: number;
  limit?: number;
  filters?: TestRunFilters;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TestListResponse {
  items: TestCase[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface TestRunListResponse {
  items: TestRun[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface TestRunWithResults extends TestRun {
  results: TestResult[];
  statistics: {
    total_tests: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    not_executed: number;
    pass_rate: number;
    completion_rate: number;
  };
}

export interface TestStats {
  total_cases: number;
  by_status: Record<TestCaseStatus, number>;
  by_priority: Record<TestPriority, number>;
  by_type: Record<TestType, number>;
  automation_rate: number;
  coverage_rate: number;
  recent_results: {
    total_runs: number;
    pass_rate: number;
    defect_rate: number;
  };
}

export interface TestState {
  testCases: TestCase[];
  testSuites: TestSuite[];
  testRuns: TestRun[];
  testResults: TestResult[];
  currentTestRun: TestRunWithResults | null;
  currentTestCase: TestCase | null;
  stats: TestStats | null;
  isLoading: boolean;
  error: string | null;
  filters: TestFilters;
  runFilters: TestRunFilters;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
} 