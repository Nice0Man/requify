/**
 * Test Plan Entity Types - Типы сущности тестовых планов
 * Соответствуют backend API schemas (backend/app/schemas/test_plan.py, test_case.py, test_result.py)
 */

// =============================================================================
// Enums (соответствуют backend схемам)
// =============================================================================

export const TEST_PLAN_STATUSES = [
  "active",
  "inactive",
  "draft",
  "completed",
  "archived",
] as const;

export type TestPlanStatus = (typeof TEST_PLAN_STATUSES)[number];

export const TEST_CASE_STATUSES = [
  "active",
  "inactive", 
  "draft",
  "approved",
  "deprecated",
] as const;

export type TestCaseStatus = (typeof TEST_CASE_STATUSES)[number];

export const TEST_EXECUTION_STATUSES = [
  "not_started",
  "in_progress",
  "passed",
  "failed",
  "blocked",
  "skipped",
] as const;

export type TestExecutionStatus = (typeof TEST_EXECUTION_STATUSES)[number];

// =============================================================================
// Test Plan Types
// =============================================================================

export interface TestPlanBase {
  name: string;
  description?: string;
  project_id: number;
  status: TestPlanStatus;
}

export interface TestPlanCreate extends TestPlanBase {}

export interface TestPlanUpdate {
  name?: string;
  description?: string;
  status?: TestPlanStatus;
}

export interface TestPlan extends TestPlanBase {
  id: number;
  created_at: string;
  updated_at: string;
  
  // Связанные данные (опционально загружаются)
  project?: {
    id: number;
    name: string;
    code: string;
  };
  test_cases?: TestCase[];
  test_cases_count?: number;
  total_executions?: number;
  passed_executions?: number;
  failed_executions?: number;
  pass_rate?: number;
  created_by?: {
    id: number;
    username: string;
    full_name?: string;
  };
}

// =============================================================================
// Test Case Types  
// =============================================================================

export interface TestCaseBase {
  name: string;
  description?: string;
  test_plan_id: number;
  status: TestCaseStatus;
  priority?: "low" | "medium" | "high" | "critical";
  estimated_duration?: number; // в минутах
  prerequisites?: string;
  test_steps?: TestStep[];
  expected_result?: string;
  tags?: string[];
}

export interface TestCaseCreate extends TestCaseBase {}

export interface TestCaseUpdate {
  name?: string;
  description?: string;
  status?: TestCaseStatus;
  priority?: "low" | "medium" | "high" | "critical";
  estimated_duration?: number;
  prerequisites?: string;
  test_steps?: TestStep[];
  expected_result?: string;
  tags?: string[];
}

export interface TestCase extends TestCaseBase {
  id: number;
  created_at: string;
  updated_at: string;
  
  // Связанные данные
  test_plan?: TestPlan;
  executions?: TestExecution[];
  executions_count?: number;
  last_execution?: TestExecution;
  requirements?: {
    id: number;
    title: string;
  }[];
  created_by?: {
    id: number;
    username: string;
    full_name?: string;
  };
}

export interface TestStep {
  id?: number;
  step_number: number;
  action: string;
  expected_result?: string;
  actual_result?: string;
  status?: TestExecutionStatus;
}

// =============================================================================
// Test Execution Types
// =============================================================================

export interface TestExecutionBase {
  test_case_id: number;
  status: TestExecutionStatus;
  started_at?: string;
  completed_at?: string;
  duration?: number; // в секундах
  logs?: string;
  notes?: string;
  environment?: string;
  browser?: string;
  os?: string;
  device?: string;
}

export interface TestExecutionCreate extends TestExecutionBase {
  executor_id?: number;
}

export interface TestExecutionUpdate {
  status?: TestExecutionStatus;
  completed_at?: string;
  duration?: number;
  logs?: string;
  notes?: string;
  actual_results?: TestStep[];
}

export interface TestExecution extends TestExecutionBase {
  id: number;
  executor_id?: number;
  created_at: string;
  updated_at: string;
  
  // Связанные данные
  test_case?: TestCase;
  executor?: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  screenshots?: TestScreenshot[];
  attachments?: TestAttachment[];
  defects?: {
    id: number;
    title: string;
    severity: string;
    status: string;
  }[];
}

export interface TestScreenshot {
  id: number;
  execution_id: number;
  step_number?: number;
  url: string;
  description?: string;
  created_at: string;
}

export interface TestAttachment {
  id: number;
  execution_id: number;
  filename: string;
  url: string;
  file_type: string;
  file_size: number;
  description?: string;
  created_at: string;
}

// =============================================================================
// Test Summary and Statistics
// =============================================================================

export interface TestingSummary {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  blocked_tests: number;
  in_progress_tests: number;
  pass_rate: number;
  project_id?: number;
  project_name?: string;
  total_projects?: number;
  errors?: string[];
}

export interface TestPlanSummary extends TestingSummary {
  test_plan_id: number;
  test_plan_name: string;
  total_test_cases: number;
  active_test_cases: number;
  estimated_duration: number;
  actual_duration: number;
  coverage_percentage: number;
}

export interface TestMetrics {
  execution_trend: {
    date: string;
    passed: number;
    failed: number;
    total: number;
  }[];
  pass_rate_trend: {
    date: string;
    pass_rate: number;
  }[];
  test_case_distribution: {
    status: TestCaseStatus;
    count: number;
  }[];
  execution_time_distribution: {
    range: string;
    count: number;
  }[];
  defect_discovery_rate: {
    date: string;
    defects_found: number;
  }[];
}

// =============================================================================
// API Response Types
// =============================================================================

export interface TestPlanListResponse {
  test_plans: TestPlan[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TestPlanDetailResponse {
  test_plan: TestPlan;
}

export interface TestCaseListResponse {
  test_cases: TestCase[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TestExecutionListResponse {
  executions: TestExecution[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// =============================================================================
// Query Parameters
// =============================================================================

export interface TestPlanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  project_id?: number;
  status?: TestPlanStatus;
  created_by?: number;
  sort_by?: "name" | "created_at" | "updated_at" | "pass_rate";
  sort_order?: "asc" | "desc";
  include_test_cases?: boolean;
  include_statistics?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface TestCaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  test_plan_id?: number;
  status?: TestCaseStatus;
  priority?: "low" | "medium" | "high" | "critical";
  tags?: string[];
  sort_by?: "name" | "created_at" | "updated_at" | "priority";
  sort_order?: "asc" | "desc";
  include_executions?: boolean;
  include_requirements?: boolean;
}

export interface TestExecutionQueryParams {
  page?: number;
  limit?: number;
  test_case_id?: number;
  test_plan_id?: number;
  status?: TestExecutionStatus;
  executor_id?: number;
  date_from?: string;
  date_to?: string;
  environment?: string;
  sort_by?: "created_at" | "completed_at" | "duration";
  sort_order?: "asc" | "desc";
  include_test_case?: boolean;
  include_screenshots?: boolean;
  include_attachments?: boolean;
}

// =============================================================================
// Bulk Operations
// =============================================================================

export interface TestPlanBulkOperation {
  test_plan_ids: number[];
  action: "activate" | "deactivate" | "archive" | "delete" | "clone";
  target_project_id?: number; // для clone
}

export interface TestCaseBulkOperation {
  test_case_ids: number[];
  action: "activate" | "deactivate" | "delete" | "move" | "execute";
  target_test_plan_id?: number; // для move
  executor_id?: number; // для execute
}

export interface TestExecutionBulkOperation {
  execution_ids: number[];
  action: "delete" | "rerun" | "export";
  format?: "json" | "csv" | "xml"; // для export
}

// =============================================================================
// Test Run and Automation
// =============================================================================

export interface TestRunConfig {
  test_plan_id?: number;
  test_case_ids?: number[];
  environment: string;
  browser?: string;
  parallel_execution?: boolean;
  max_parallel_workers?: number;
  timeout_minutes?: number;
  retry_failed_tests?: boolean;
  retry_count?: number;
  notify_on_completion?: boolean;
  notification_channels?: ("email" | "slack" | "webhook")[];
}

export interface TestRunResult {
  run_id: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  started_at: string;
  completed_at?: string;
  duration?: number;
  summary: TestingSummary;
  executions: TestExecution[];
  logs_url?: string;
  report_url?: string;
}

// =============================================================================
// Test Reports
// =============================================================================

export interface TestReport {
  id: number;
  name: string;
  type: "execution" | "summary" | "coverage" | "trend" | "custom";
  format: "html" | "pdf" | "json" | "xml" | "csv";
  test_plan_id?: number;
  project_id?: number;
  date_from: string;
  date_to: string;
  generated_at: string;
  file_url: string;
  file_size: number;
  generated_by: {
    id: number;
    username: string;
    full_name?: string;
  };
}