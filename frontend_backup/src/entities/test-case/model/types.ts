// Test case entity types
export interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  requirementId: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "draft" | "active" | "deprecated";
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestCaseRequest {
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  requirementId: string;
  priority: TestCase["priority"];
}

// Дополнительные типы для UI компонентов

/**
 * Статус выполнения тест-кейса
 */
export type TestExecutionStatus =
  | "not_executed" // Не выполнен
  | "passed" // Прошел успешно
  | "failed" // Провалился
  | "blocked" // Заблокирован
  | "skipped" // Пропущен
  | "in_progress"; // В процессе выполнения

/**
 * Приоритет тест-кейса
 */
export type TestCasePriority = "low" | "medium" | "high" | "critical";

/**
 * Статус тест-кейса
 */
export type TestCaseStatus = "draft" | "active" | "deprecated";

/**
 * Выполнение тест-кейса
 */
export interface TestExecution {
  id: string;
  testCaseId: string;
  status: TestExecutionStatus;
  executedBy?: string;
  executedAt?: string;
  notes?: string;
  attachments?: string[];
  duration?: number; // в секундах
}

/**
 * Результат выполнения тест-кейса
 */
export interface TestCaseResult {
  testCase: TestCase;
  execution?: TestExecution;
  lastExecution?: TestExecution;
  totalExecutions: number;
  passRate: number; // процент успешных выполнений
}

/**
 * Фильтры для списка тест-кейсов
 */
export interface TestCaseFilters {
  search?: string;
  priority?: TestCasePriority[];
  status?: TestCaseStatus[];
  executionStatus?: TestExecutionStatus[];
  requirementId?: string;
  executedBy?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

/**
 * Режим отображения тест-кейсов
 */
export enum TestCaseViewMode {
  CARDS = "cards",
  LIST = "list",
  TABLE = "table",
}

/**
 * Статистика по тест-кейсам
 */
export interface TestCaseStats {
  total: number;
  byStatus: Record<TestCaseStatus, number>;
  byPriority: Record<TestCasePriority, number>;
  byExecutionStatus: Record<TestExecutionStatus, number>;
  passRate: number;
  averageDuration: number;
}

/**
 * DTO типы для API
 */
export interface TestCaseDTO {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expected_result: string;
  requirement_id: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TestExecutionDTO {
  id: string;
  test_case_id: string;
  status: string;
  executed_by?: string;
  executed_at?: string;
  notes?: string;
  attachments?: string[];
  duration?: number;
}

/**
 * Формы для создания/редактирования
 */
export interface TestCaseFormData {
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  requirementId: string;
  priority: TestCasePriority;
}

export interface TestExecutionFormData {
  status: TestExecutionStatus;
  notes?: string;
  attachments?: File[];
}
