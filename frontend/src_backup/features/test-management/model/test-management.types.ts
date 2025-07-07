import {
  TestCase,
  TestPlan,
  TestExecution,
  TestResult,
  TestSuite,
} from "@/entities/test-case/model/types";

// Dashboard State
export interface TestManagementDashboardState {
  testPlans: TestPlan[];
  testCases: TestCase[];
  executions: TestExecution[];
  analytics: TestAnalytics;
  summary: TestSummary;
  recentActivity: TestActivity[];
  criticalIssues: TestIssue[];
  upcomingRuns: TestRun[];
  loading: boolean;
  error: string | null;
}

// Test Analytics
export interface TestAnalytics {
  coverage: number;
  automationRate: number;
  passRate: number;
  trends: TestTrends;
  distribution: TestDistribution;
  quality: QualityMetrics;
  performance: PerformanceMetrics;
  riskAssessment: RiskAssessment;
}

export interface TestTrends {
  passRateTrend: "up" | "down" | "stable";
  coverageTrend: "up" | "down" | "stable";
  velocityTrend: "up" | "down" | "stable";
  automationTrend: "up" | "down" | "stable";
}

export interface TestDistribution {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  byAutomation: {
    automated: number;
    manual: number;
  };
}

export interface QualityMetrics {
  defectDensity: number;
  regressionRate: number;
  testEffectiveness: number;
  bugLeakage: number;
}

export interface PerformanceMetrics {
  avgExecutionTime: number;
  testVelocity: number;
  resourceUtilization: number;
  parallelExecutionRate: number;
}

export interface RiskAssessment {
  highRiskAreas: Array<{
    area: string;
    riskLevel: "low" | "medium" | "high";
    coverage: number;
    issues: number;
  }>;
  recommendations: string[];
  criticalGaps: Array<{
    description: string;
    impact: "low" | "medium" | "high";
    effort: "low" | "medium" | "high";
  }>;
}

// Test Summary
export interface TestSummary {
  totalPlans: number;
  totalCases: number;
  passRate: number;
  coverage: number;
  automationRate: number;
  activePlans: number;
  pendingCases: number;
  failedCases: number;
}

// Test Execution State
export interface TestExecutionState {
  currentExecution: TestExecution | null;
  executionHistory: TestExecution[];
  batchExecution: BatchExecution | null;
  realTimeResults: TestResult[];
  environments: TestEnvironment[];
  executionQueue: QueuedExecution[];
  loading: boolean;
  error: string | null;
}

export interface BatchExecution {
  id: string;
  name: string;
  testCaseIds: number[];
  environment: string;
  executor_id: number;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  startedAt: string | null;
  completedAt: string | null;
  results: TestResult[];
  progress: {
    total: number;
    completed: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

export interface TestEnvironment {
  id: number;
  name: string;
  type: "development" | "staging" | "production" | "qa";
  status: "available" | "busy" | "maintenance" | "offline";
  configuration: Record<string, string>;
  lastUsed: string;
}

export interface QueuedExecution {
  id: string;
  testCaseId: number;
  testCaseName: string;
  priority: "low" | "medium" | "high";
  estimatedDuration: number;
  environment: string;
  scheduledAt: string;
  dependencies: string[];
}

// Test Activity
export interface TestActivity {
  id: string;
  type: "execution" | "plan_created" | "case_updated" | "result_logged";
  testId: number;
  testName: string;
  description: string;
  timestamp: string;
  userId: number;
  userName: string;
  result?: "passed" | "failed" | "skipped";
  environment?: string;
}

// Test Issues
export interface TestIssue {
  id: number;
  testCaseId: number;
  testCaseName: string;
  issueType: "failure" | "timeout" | "environment" | "data" | "automation";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  firstOccurrence: string;
  lastOccurrence: string;
  frequency: number;
  status: "open" | "investigating" | "resolved" | "ignored";
  assignedTo?: number;
  resolution?: string;
}

// Test Runs
export interface TestRun {
  id: number;
  name: string;
  planId: number;
  planName: string;
  scheduledAt: string;
  environment: string;
  testCaseCount: number;
  estimatedDuration: number;
  status: "scheduled" | "running" | "completed" | "cancelled";
  createdBy: number;
}

// Test Reporting State
export interface TestReportingState {
  reportTypes: ReportType[];
  currentReport: TestReport | null;
  reportHistory: TestReportSummary[];
  filters: ReportFilters;
  loading: boolean;
  error: string | null;
}

export interface ReportType {
  id: string;
  name: string;
  description: string;
  template: string;
  parameters: ReportParameter[];
  outputFormats: ("pdf" | "excel" | "html" | "csv")[];
}

export interface ReportParameter {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "select" | "multiselect";
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
}

export interface TestReport {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  parameters: Record<string, any>;
  data: {
    summary: TestReportSummary;
    details: TestReportDetails;
    charts: TestReportChart[];
    recommendations: string[];
  };
  format: "pdf" | "excel" | "html" | "csv";
  downloadUrl?: string;
}

export interface TestReportSummary {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  generatedBy: number;
  status: "generating" | "completed" | "failed";
  size?: number;
  downloadUrl?: string;
}

export interface TestReportDetails {
  executionSummary: {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
    duration: number;
  };
  coverageDetails: {
    overall: number;
    byModule: Array<{
      module: string;
      coverage: number;
      requirements: number;
      tested: number;
    }>;
  };
  defectSummary: {
    totalDefects: number;
    byPriority: Record<string, number>;
    bySeverity: Record<string, number>;
    byComponent: Record<string, number>;
  };
  performanceMetrics: {
    avgExecutionTime: number;
    slowestTests: Array<{
      testName: string;
      duration: number;
    }>;
  };
}

export interface TestReportChart {
  id: string;
  title: string;
  type: "line" | "bar" | "pie" | "area";
  data: any;
  config: any;
}

export interface ReportFilters {
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  projects: number[];
  testPlans: number[];
  environments: string[];
  testTypes: string[];
  priorities: string[];
  includeAutomated: boolean;
  includeManual: boolean;
}

// Test Planning State
export interface TestPlanningState {
  currentPlan: TestPlan | null;
  availableTestCases: TestCase[];
  selectedTestCases: number[];
  planTemplates: PlanTemplate[];
  dependencies: TestDependency[];
  resources: TestResource[];
  timeline: PlanTimeline;
  loading: boolean;
  error: string | null;
}

export interface PlanTemplate {
  id: number;
  name: string;
  description: string;
  testCaseIds: number[];
  estimatedDuration: number;
  requiredResources: string[];
  isDefault: boolean;
}

export interface TestDependency {
  id: number;
  sourceTestId: number;
  targetTestId: number;
  type: "prerequisite" | "blocks" | "related";
  description: string;
}

export interface TestResource {
  id: number;
  name: string;
  type: "environment" | "data" | "tool" | "person";
  availability: ResourceAvailability[];
  capacity: number;
}

export interface ResourceAvailability {
  startDate: string;
  endDate: string;
  available: boolean;
  reason?: string;
}

export interface PlanTimeline {
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  phases: TestPhase[];
  criticalPath: number[];
}

export interface Milestone {
  id: number;
  name: string;
  date: string;
  type: "checkpoint" | "delivery" | "review";
  testCaseIds: number[];
  status: "pending" | "completed" | "delayed";
}

export interface TestPhase {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  testCaseIds: number[];
  dependencies: number[];
  status: "not_started" | "in_progress" | "completed" | "blocked";
}

// Filters and Search
export interface TestManagementFilters {
  testCases: TestCaseFilters;
  executions: ExecutionFilters;
  plans: PlanFilters;
  reports: ReportFilters;
}

export interface TestCaseFilters {
  status: string[];
  priority: string[];
  type: string[];
  automated: boolean | null;
  suiteId: number | null;
  assignee: number[];
  tags: string[];
  searchQuery: string;
  dateCreated: {
    startDate: string | null;
    endDate: string | null;
  };
  lastExecuted: {
    startDate: string | null;
    endDate: string | null;
  };
}

export interface ExecutionFilters {
  result: string[];
  environment: string[];
  executor: number[];
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  duration: {
    min: number | null;
    max: number | null;
  };
  testPlanId: number | null;
}

export interface PlanFilters {
  status: string[];
  createdBy: number[];
  environment: string[];
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  includeArchived: boolean;
}

// Action Types
export type TestManagementAction =
  | { type: "LOAD_DASHBOARD_START" }
  | { type: "LOAD_DASHBOARD_SUCCESS"; payload: TestManagementDashboardState }
  | { type: "LOAD_DASHBOARD_ERROR"; payload: string }
  | { type: "UPDATE_FILTERS"; payload: Partial<TestManagementFilters> }
  | { type: "EXECUTE_TEST_START"; payload: number }
  | { type: "EXECUTE_TEST_SUCCESS"; payload: TestExecution }
  | { type: "EXECUTE_TEST_ERROR"; payload: string }
  | { type: "REFRESH_ANALYTICS" }
  | { type: "SELECT_TEST_CASES"; payload: number[] }
  | { type: "UPDATE_PLAN"; payload: Partial<TestPlan> };

// API Response Types
export interface TestDashboardResponse {
  testPlans: TestPlan[];
  testCases: TestCase[];
  executions: TestExecution[];
  analytics: TestAnalytics;
  summary: TestSummary;
}

export interface CoverageReportResponse {
  overall: {
    totalRequirements: number;
    coveredRequirements: number;
    coveragePercentage: number;
  };
  byModule: Array<{
    module: string;
    requirements: number;
    covered: number;
    percentage: number;
  }>;
  gaps: Array<{
    requirement_id: number;
    requirement_title: string;
    module: string;
    priority: string;
    reason: string;
  }>;
}

// Permission Types
export interface TestManagementPermissions {
  canCreatePlans: boolean;
  canExecuteTests: boolean;
  canViewReports: boolean;
  canManageEnvironments: boolean;
  canDeleteResults: boolean;
  canConfigureAutomation: boolean;
} 