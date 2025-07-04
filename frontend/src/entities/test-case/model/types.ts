// Test Case entity types - используют контракты из shared/api
// В соответствии с принципами FSD, entities используют типы из shared

import type {
  TestCase as TestCaseSchema,
  TestCaseCreate as TestCaseCreateSchema,
  TestCaseUpdate as TestCaseUpdateSchema,
  TestCaseWithResults as TestCaseWithResultsSchema,
  TestCaseBase as TestCaseBaseSchema,
  TestPlan as TestPlanSchema,
  TestPlanCreate as TestPlanCreateSchema,
  TestPlanUpdate as TestPlanUpdateSchema,
  TestPlanWithStats as TestPlanWithStatsSchema,
  TestPlanBase as TestPlanBaseSchema,
  TestExecution as TestExecutionSchema,
  TestExecutionCreate as TestExecutionCreateSchema,
  TestExecutionUpdate as TestExecutionUpdateSchema,
  TestExecutionWithDetails as TestExecutionWithDetailsSchema,
  TestExecutionBase as TestExecutionBaseSchema,
  TestResult as TestResultSchema,
  TestResultCreate as TestResultCreateSchema,
  TestResultUpdate as TestResultUpdateSchema,
  TestResultWithDetails as TestResultWithDetailsSchema,
  TestResultBase as TestResultBaseSchema,
  TestStatus,
  TestPriority,
  TestType,
  IntegrationTestJob as IntegrationTestJobSchema,
  IntegrationTestStatus as IntegrationTestStatusSchema,
  TestSummary as TestSummarySchema,
} from '@/shared/api/types';

// =============================================================================
// Re-export API types for entity usage
// =============================================================================

export type TestCaseBase = TestCaseBaseSchema;
export type TestCase = TestCaseSchema;
export type TestCaseCreate = TestCaseCreateSchema;
export type TestCaseUpdate = TestCaseUpdateSchema;
export type TestCaseWithResults = TestCaseWithResultsSchema;

export type TestPlanBase = TestPlanBaseSchema;
export type TestPlan = TestPlanSchema;
export type TestPlanCreate = TestPlanCreateSchema;
export type TestPlanUpdate = TestPlanUpdateSchema;
export type TestPlanWithStats = TestPlanWithStatsSchema;

export type TestExecutionBase = TestExecutionBaseSchema;
export type TestExecution = TestExecutionSchema;
export type TestExecutionCreate = TestExecutionCreateSchema;
export type TestExecutionUpdate = TestExecutionUpdateSchema;
export type TestExecutionWithDetails = TestExecutionWithDetailsSchema;

export type TestResultBase = TestResultBaseSchema;
export type TestResult = TestResultSchema;
export type TestResultCreate = TestResultCreateSchema;
export type TestResultUpdate = TestResultUpdateSchema;
export type TestResultWithDetails = TestResultWithDetailsSchema;

// =============================================================================
// Test Status, Priority, Type (re-export from API)
// =============================================================================

export type { TestStatus, TestPriority, TestType };

export const TEST_STATUSES: Record<TestStatus, string> = {
  new: 'Новый',
  active: 'Активный',
  blocked: 'Заблокирован',
  passed: 'Пройден',
  failed: 'Провален',
  skipped: 'Пропущен',
  obsolete: 'Устарел',
};

export const TEST_PRIORITIES: Record<TestPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
};

export const TEST_TYPES: Record<TestType, string> = {
  functional: 'Функциональный',
  integration: 'Интеграционный',
  unit: 'Модульный',
  performance: 'Производительность',
  security: 'Безопасность',
  usability: 'Юзабилити',
  regression: 'Регрессионный',
  smoke: 'Дымовой',
  api: 'API',
  ui: 'UI',
};

// =============================================================================
// Integration Testing (re-export from API)
// =============================================================================

export type IntegrationTestJob = IntegrationTestJobSchema;
export type IntegrationTestStatus = IntegrationTestStatusSchema;
export type TestSummary = TestSummarySchema;

// =============================================================================
// Extended UI Types (не в API, только для UI)
// =============================================================================

export interface TestCaseWithDetails extends TestCaseWithResults {
  requirement_title?: string;
  plan_name?: string;
  author_name?: string;
  assigned_to_name?: string;
  latest_execution?: TestExecution;
  execution_history?: TestExecution[];
  coverage_percentage?: number;
  automation_ready?: boolean;
  tags?: string[];
  attachments?: Array<{
    id: number;
    filename: string;
    url: string;
    size: number;
  }>;
}

export interface TestPlanWithDetails extends TestPlanWithStats {
  project_name?: string;
  author_name?: string;
  test_cases_details?: TestCaseWithDetails[];
  coverage_analysis?: {
    requirements_covered: number;
    requirements_total: number;
    coverage_percentage: number;
    gaps: Array<{
      requirement_id: number;
      requirement_title: string;
      reason: string;
    }>;
  };
}

// =============================================================================
// UI State Types
// =============================================================================

export interface TestCaseState {
  testCases: TestCase[];
  currentTestCase: TestCase | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  per_page: number;
}

export interface TestPlanState {
  testPlans: TestPlan[];
  currentTestPlan: TestPlan | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  per_page: number;
}

export interface TestExecutionState {
  executions: TestExecution[];
  currentExecution: TestExecution | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  per_page: number;
}

export interface TestCaseFilters {
  search?: string;
  plan_id?: number;
  requirement_id?: number;
  status?: TestStatus[];
  priority?: TestPriority[];
  type?: TestType[];
  author_id?: number;
  assigned_to?: number;
  created_from?: string;
  created_to?: string;
  tags?: string[];
  automated?: boolean;
}

export interface TestPlanFilters {
  search?: string;
  project_id?: number;
  author_id?: number;
  status?: string[];
  created_from?: string;
  created_to?: string;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
}

// =============================================================================
// Test Automation (UI specific)
// =============================================================================

export interface AutomationScript {
  id: number;
  test_case_id: number;
  language: 'javascript' | 'python' | 'java' | 'csharp' | 'ruby';
  framework: string;
  script_content: string;
  dependencies: string[];
  environment_setup: string;
  execution_command: string;
  created_at: string;
  updated_at: string;
  author_id: number;
}

export interface AutomationResult {
  script_id: number;
  execution_id: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'error';
  start_time: string;
  end_time?: string;
  duration?: number;
  output: string;
  error_message?: string;
  screenshots?: string[];
  logs?: string[];
}

// =============================================================================
// UI Helper Functions
// =============================================================================

export const getTestStatusColor = (status: TestStatus): string => {
  switch (status) {
    case 'new': return '#1890ff';
    case 'active': return '#fadb14';
    case 'blocked': return '#fa8c16';
    case 'passed': return '#52c41a';
    case 'failed': return '#ff4d4f';
    case 'skipped': return '#8c8c8c';
    case 'obsolete': return '#d9d9d9';
    default: return '#d9d9d9';
  }
};

export const getTestPriorityColor = (priority: TestPriority): string => {
  switch (priority) {
    case 'critical': return '#ff4d4f';
    case 'high': return '#fa8c16';
    case 'medium': return '#fadb14';
    case 'low': return '#52c41a';
    default: return '#d9d9d9';
  }
};

export const getTestTypeIcon = (type: TestType): string => {
  switch (type) {
    case 'functional': return '⚙️';
    case 'integration': return '🔗';
    case 'unit': return '🧩';
    case 'performance': return '⚡';
    case 'security': return '🔒';
    case 'usability': return '👤';
    case 'regression': return '🔄';
    case 'smoke': return '💨';
    case 'api': return '🌐';
    case 'ui': return '🖥️';
    default: return '📋';
  }
};

export const calculateTestCoverage = (testCases: TestCase[], requirements: number): number => {
  const coveredRequirements = new Set(
    testCases
      .filter(tc => tc.requirement_id)
      .map(tc => tc.requirement_id!)
  );
  
  if (requirements === 0) return 0;
  return Math.round((coveredRequirements.size / requirements) * 100);
};

export const getTestExecutionDuration = (execution: TestExecution): string => {
  if (!execution.start_time) return 'Не запущен';
  if (!execution.end_time) return 'Выполняется...';
  
  const start = new Date(execution.start_time);
  const end = new Date(execution.end_time);
  const duration = end.getTime() - start.getTime();
  
  const seconds = Math.floor(duration / 1000) % 60;
  const minutes = Math.floor(duration / (1000 * 60)) % 60;
  const hours = Math.floor(duration / (1000 * 60 * 60));
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м ${seconds}с`;
  } else if (minutes > 0) {
    return `${minutes}м ${seconds}с`;
  } else {
    return `${seconds}с`;
  }
};

export const getTestPlanProgress = (plan: TestPlanWithStats): number => {
  if (plan.total_test_cases === 0) return 0;
  return Math.round((plan.executed_test_cases / plan.total_test_cases) * 100);
};

export const getTestPlanSuccessRate = (plan: TestPlanWithStats): number => {
  if (plan.executed_test_cases === 0) return 0;
  return Math.round((plan.passed_test_cases / plan.executed_test_cases) * 100);
};

export const isTestCaseAutomatable = (testCase: TestCase): boolean => {
  // Простая логика определения возможности автоматизации
  const manualKeywords = ['manual', 'визуальный', 'ручной', 'human'];
  const description = (testCase.description || '').toLowerCase();
  const steps = (testCase.steps || '').toLowerCase();
  
  return !manualKeywords.some(keyword => 
    description.includes(keyword) || steps.includes(keyword)
  );
}; 