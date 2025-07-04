// Export test-case entity types and API
export type {
  TestCase,
  TestCaseBase,
  TestCaseCreate,
  TestCaseUpdate,
  TestCaseWithDetails,
  TestCaseWithStats,
  TestPlan,
  TestPlanCreate,
  TestPlanUpdate,
  TestExecution,
  TestExecutionCreate,
  TestExecutionUpdate,
  TestResult,
  TestResultCreate,
  TestCasePriority,
  TestCaseStatus,
  TestExecutionStatus,
  TestCasePriorityRu,
  TestCaseStatusRu,
  TestExecutionStatusRu,
  TEST_CASE_PRIORITY_LABELS,
  TEST_CASE_STATUS_LABELS,
  TEST_EXECUTION_STATUS_LABELS,
  TEST_CASE_PRIORITY_COLORS,
  TEST_CASE_STATUS_COLORS,
  TEST_EXECUTION_STATUS_COLORS,
} from "./model/types";

// Export test-case API if needed
export * from "./api/testing.api"; 