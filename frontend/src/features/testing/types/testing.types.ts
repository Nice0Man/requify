// Testing types based on backend contracts

export interface TestCase {
  id: number;
  name: string;
  description?: string;
  test_plan_id?: number;
  requirement_id?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'functional' | 'non-functional' | 'integration' | 'regression' | 'smoke' | 'acceptance';
  status: 'draft' | 'review' | 'approved' | 'deprecated';
  preconditions?: string;
  test_steps: TestStep[];
  expected_result?: string;
  automation_level: 'manual' | 'semi-automated' | 'automated';
  automation_script?: string;
  estimated_duration?: number; // in minutes
  tags?: string[];
  created_by: number;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
  // Relations
  test_plan?: {
    id: number;
    name: string;
    version: string;
  };
  requirement?: {
    id: number;
    title: string;
    project_id: number;
  };
  created_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  assigned_to_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  executions?: TestExecution[];
  attachments?: TestAttachment[];
}

export interface TestCaseWithDetails extends TestCase {
  executions: TestExecution[];
  attachments: TestAttachment[];
  execution_history: TestExecutionHistory[];
}

export interface TestCaseCreate {
  name: string;
  description?: string;
  test_plan_id?: number;
  requirement_id?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'functional' | 'non-functional' | 'integration' | 'regression' | 'smoke' | 'acceptance';
  status?: 'draft' | 'review' | 'approved' | 'deprecated';
  preconditions?: string;
  test_steps: TestStepCreate[];
  expected_result?: string;
  automation_level?: 'manual' | 'semi-automated' | 'automated';
  automation_script?: string;
  estimated_duration?: number;
  tags?: string[];
  assigned_to?: number;
}

export interface TestCaseUpdate {
  name?: string;
  description?: string;
  test_plan_id?: number;
  requirement_id?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  type?: 'functional' | 'non-functional' | 'integration' | 'regression' | 'smoke' | 'acceptance';
  status?: 'draft' | 'review' | 'approved' | 'deprecated';
  preconditions?: string;
  test_steps?: TestStepUpdate[];
  expected_result?: string;
  automation_level?: 'manual' | 'semi-automated' | 'automated';
  automation_script?: string;
  estimated_duration?: number;
  tags?: string[];
  assigned_to?: number;
}

export interface TestStep {
  id: number;
  test_case_id: number;
  step_number: number;
  action: string;
  expected_result?: string;
  test_data?: string;
  created_at: string;
  updated_at: string;
}

export interface TestStepCreate {
  step_number: number;
  action: string;
  expected_result?: string;
  test_data?: string;
}

export interface TestStepUpdate {
  id?: number;
  step_number?: number;
  action?: string;
  expected_result?: string;
  test_data?: string;
}

export interface TestExecution {
  id: number;
  test_case_id: number;
  test_plan_id?: number;
  executed_by: number;
  status: 'not_run' | 'passed' | 'failed' | 'blocked' | 'skipped';
  execution_date: string;
  duration?: number; // in minutes
  environment?: string;
  build_version?: string;
  browser?: string;
  os?: string;
  notes?: string;
  defect_ids?: string[];
  created_at: string;
  updated_at: string;
  // Relations
  test_case?: {
    id: number;
    name: string;
    priority: string;
    type: string;
  };
  test_plan?: {
    id: number;
    name: string;
    version: string;
  };
  executed_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  execution_steps?: TestExecutionStep[];
  attachments?: TestAttachment[];
}

export interface TestExecutionWithDetails extends TestExecution {
  execution_steps: TestExecutionStep[];
  attachments: TestAttachment[];
}

export interface TestExecutionCreate {
  test_case_id: number;
  test_plan_id?: number;
  status: 'not_run' | 'passed' | 'failed' | 'blocked' | 'skipped';
  execution_date?: string;
  duration?: number;
  environment?: string;
  build_version?: string;
  browser?: string;
  os?: string;
  notes?: string;
  defect_ids?: string[];
  execution_steps?: TestExecutionStepCreate[];
}

export interface TestExecutionUpdate {
  status?: 'not_run' | 'passed' | 'failed' | 'blocked' | 'skipped';
  execution_date?: string;
  duration?: number;
  environment?: string;
  build_version?: string;
  browser?: string;
  os?: string;
  notes?: string;
  defect_ids?: string[];
  execution_steps?: TestExecutionStepUpdate[];
}

export interface TestExecutionStep {
  id: number;
  test_execution_id: number;
  test_step_id: number;
  status: 'not_run' | 'passed' | 'failed' | 'blocked' | 'skipped';
  actual_result?: string;
  notes?: string;
  execution_time?: number; // in seconds
  screenshot?: string;
  created_at: string;
  updated_at: string;
  // Relations
  test_step?: {
    id: number;
    step_number: number;
    action: string;
    expected_result?: string;
  };
}

export interface TestExecutionStepCreate {
  test_step_id: number;
  status: 'not_run' | 'passed' | 'failed' | 'blocked' | 'skipped';
  actual_result?: string;
  notes?: string;
  execution_time?: number;
  screenshot?: string;
}

export interface TestExecutionStepUpdate {
  id?: number;
  status?: 'not_run' | 'passed' | 'failed' | 'blocked' | 'skipped';
  actual_result?: string;
  notes?: string;
  execution_time?: number;
  screenshot?: string;
}

export interface TestResult {
  id: number;
  requirement_id: number;
  test_case_id?: number;
  test_plan_id?: number;
  status: 'passed' | 'failed' | 'skipped' | 'blocked';
  executed_by: number;
  executed_at: string;
  notes?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  // Relations
  requirement?: {
    id: number;
    title: string;
    project_id: number;
  };
  test_case?: {
    id: number;
    name: string;
    type: string;
  };
  test_plan?: {
    id: number;
    name: string;
    version: string;
  };
  executed_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface TestResultCreate {
  requirement_id: number;
  test_case_id?: number;
  test_plan_id?: number;
  status: 'passed' | 'failed' | 'skipped' | 'blocked';
  executed_at?: string;
  notes?: string;
  attachments?: string[];
}

export interface TestAttachment {
  id: number;
  test_case_id?: number;
  test_execution_id?: number;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_path: string;
  uploaded_by: number;
  uploaded_at: string;
  description?: string;
  // Relations
  uploaded_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface TestExecutionHistory {
  id: number;
  test_case_id: number;
  executed_by: number;
  execution_date: string;
  status: 'passed' | 'failed' | 'blocked' | 'skipped';
  duration?: number;
  notes?: string;
  // Relations
  executed_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

// List and search parameters
export interface TestPlanListParams {
  skip?: number;
  limit?: number;
  project_id?: number;
  status?: string;
  assigned_to?: number;
  created_by?: number;
  search?: string;
  tags?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TestCaseListParams {
  skip?: number;
  limit?: number;
  test_plan_id?: number;
  requirement_id?: number;
  priority?: string;
  type?: string;
  status?: string;
  assigned_to?: number;
  created_by?: number;
  automation_level?: string;
  search?: string;
  tags?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TestExecutionListParams {
  skip?: number;
  limit?: number;
  test_plan_id?: number;
  test_case_id?: number;
  executed_by?: number;
  status?: string;
  execution_date_from?: string;
  execution_date_to?: string;
  environment?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TestResultListParams {
  skip?: number;
  limit?: number;
  requirement_id?: number;
  test_plan_id?: number;
  executed_by?: number;
  status?: string;
  executed_at_from?: string;
  executed_at_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Response types
export interface TestPlanListResponse {
  items: TestPlan[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TestCaseListResponse {
  items: TestCase[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TestExecutionListResponse {
  items: TestExecution[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TestResultListResponse {
  items: TestResult[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Statistics and reports
export interface TestPlanStats {
  total_test_cases: number;
  test_cases_by_status: Record<string, number>;
  test_cases_by_priority: Record<string, number>;
  test_cases_by_type: Record<string, number>;
  automation_coverage: number;
  execution_progress: number;
  pass_rate: number;
  estimated_effort: number; // in hours
  actual_effort: number; // in hours
}

export interface TestSummaryReport {
  project_id: number;
  project_name: string;
  total_test_plans: number;
  total_test_cases: number;
  total_executions: number;
  overall_pass_rate: number;
  automation_coverage: number;
  execution_trends: {
    date: string;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
  }[];
  test_case_distribution: {
    priority: Record<string, number>;
    type: Record<string, number>;
    status: Record<string, number>;
  };
  defect_trends: {
    date: string;
    found: number;
    fixed: number;
    open: number;
  }[];
}

export interface TestCoverageReport {
  requirement_id: number;
  requirement_title: string;
  test_cases_count: number;
  executions_count: number;
  last_execution_date?: string;
  last_execution_status?: string;
  pass_rate: number;
  coverage_percentage: number;
}

// Integration and automation
export interface AutomationJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  test_plan_id?: number;
  test_case_ids?: number[];
  environment: string;
  build_version?: string;
  started_at?: string;
  completed_at?: string;
  progress: number; // 0-100
  results?: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    blocked: number;
  };
  logs?: string[];
}

export interface AutomationJobCreate {
  name: string;
  test_plan_id?: number;
  test_case_ids?: number[];
  environment: string;
  build_version?: string;
  parameters?: Record<string, any>;
}

// UI-specific types
export interface TestFilters {
  search: string;
  projectId: number | null;
  testPlanId: number | null;
  status: string[];
  priority: string[];
  type: string[];
  automationLevel: string[];
  assignedTo: number | null;
  tags: string[];
  executionDateRange: {
    start: string | null;
    end: string | null;
  };
}

export interface TestExecutionFilters {
  search: string;
  testPlanId: number | null;
  testCaseId: number | null;
  status: string[];
  executedBy: number | null;
  environment: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

// Enums
export enum TestPlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum TestCaseStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  DEPRECATED = 'deprecated'
}

export enum TestCasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum TestCaseType {
  FUNCTIONAL = 'functional',
  NON_FUNCTIONAL = 'non-functional',
  INTEGRATION = 'integration',
  REGRESSION = 'regression',
  SMOKE = 'smoke',
  ACCEPTANCE = 'acceptance'
}

export enum TestExecutionStatus {
  NOT_RUN = 'not_run',
  PASSED = 'passed',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  SKIPPED = 'skipped'
}

export enum AutomationLevel {
  MANUAL = 'manual',
  SEMI_AUTOMATED = 'semi-automated',
  AUTOMATED = 'automated'
}

export interface TestPlan {
  id: number;
  name: string;
  description?: string;
  version: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  project_id: number;
  created_by: number;
  assigned_to?: number;
  start_date?: string;
  end_date?: string;
  environment?: string;
  test_objectives?: string;
  entry_criteria?: string;
  exit_criteria?: string;
  risk_assessment?: string;
  test_approach?: string;
  deliverables?: string[];
  tags?: string[];
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Relations
  project?: {
    id: number;
    name: string;
    code: string;
  };
  created_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_to_user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  test_cases?: TestCase[];
  test_executions?: TestExecution[];
}

export interface TestPlanWithDetails extends TestPlan {
  test_cases: TestCase[];
  test_executions: TestExecution[];
  stats: TestPlanStats;
}

export interface TestPlanCreate {
  name: string;
  description?: string;
  version: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
  project_id: number;
  assigned_to?: number;
  start_date?: string;
  end_date?: string;
  environment?: string;
  test_objectives?: string;
  entry_criteria?: string;
  exit_criteria?: string;
  risk_assessment?: string;
  test_approach?: string;
  deliverables?: string[];
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface TestPlanUpdate {
  name?: string;
  description?: string;
  version?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
  assigned_to?: number;
  start_date?: string;
  end_date?: string;
  environment?: string;
  test_objectives?: string;
  entry_criteria?: string;
  exit_criteria?: string;
  risk_assessment?: string;
  test_approach?: string;
  deliverables?: string[];
  tags?: string[];
  custom_fields?: Record<string, any>;
} 