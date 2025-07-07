// Export test-case entity types
export type {
  TestCase,
  TestCaseBase,
  TestCaseCreate,
  TestCaseUpdate,
  TestCaseWithDetails,
  TestCaseWithResults,
  TestPlan,
  TestPlanBase,
  TestPlanCreate,
  TestPlanUpdate,
  TestPlanWithStats,
  TestExecution,
  TestExecutionBase,
  TestExecutionCreate,
  TestExecutionUpdate,
  TestExecutionWithDetails,
  TestResult,
  TestResultBase,
  TestResultCreate,
  TestResultUpdate,
  TestResultWithDetails,
  TestStatus,
  TestPriority,
  TestType,
  IntegrationTestJob,
  IntegrationTestStatus,
  TestSummary,
} from "./model/types";

// Export test constants and helpers
export {
  TEST_STATUSES,
  TEST_PRIORITIES,
  TEST_TYPES,
  getTestStatusColor,
  getTestPriorityColor,
  getTestTypeIcon,
  calculateTestCoverage,
  getTestExecutionDuration,
  getTestPlanProgress,
  getTestPlanSuccessRate,
  isTestCaseAutomatable,
} from "./model/types";

// Export testing API
export { TestingApi, testingApi, testCasesApi } from "./api"; 