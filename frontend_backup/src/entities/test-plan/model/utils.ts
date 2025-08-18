/**
 * Test Plan Entity Utils - Утилиты для работы с тестовыми планами
 */

import type { 
  TestPlan, 
  TestCase,
  TestExecution,
  TestPlanStatus,
  TestCaseStatus,
  TestExecutionStatus,
  TestingSummary,
  TestMetrics,
} from './types';

// =============================================================================
// Status Utils
// =============================================================================

/**
 * Получение текста статуса тестового плана на русском
 */
export function getTestPlanStatusText(status: TestPlanStatus): string {
  const texts: Record<TestPlanStatus, string> = {
    active: 'Активный',
    inactive: 'Неактивный',
    draft: 'Черновик',
    completed: 'Завершен',
    archived: 'Архивирован',
  };
  return texts[status] || status;
}

/**
 * Получение цвета статуса тестового плана
 */
export function getTestPlanStatusColor(status: TestPlanStatus): string {
  const colors: Record<TestPlanStatus, string> = {
    active: 'green',
    inactive: 'gray',
    draft: 'yellow',
    completed: 'blue',
    archived: 'slate',
  };
  return colors[status] || 'gray';
}

/**
 * Получение текста статуса тест-кейса на русском
 */
export function getTestCaseStatusText(status: TestCaseStatus): string {
  const texts: Record<TestCaseStatus, string> = {
    active: 'Активный',
    inactive: 'Неактивный',
    draft: 'Черновик',
    approved: 'Утвержден',
    deprecated: 'Устарел',
  };
  return texts[status] || status;
}

/**
 * Получение цвета статуса тест-кейса
 */
export function getTestCaseStatusColor(status: TestCaseStatus): string {
  const colors: Record<TestCaseStatus, string> = {
    active: 'green',
    inactive: 'gray',
    draft: 'yellow',
    approved: 'blue',
    deprecated: 'red',
  };
  return colors[status] || 'gray';
}

/**
 * Получение текста статуса выполнения теста на русском
 */
export function getTestExecutionStatusText(status: TestExecutionStatus): string {
  const texts: Record<TestExecutionStatus, string> = {
    not_started: 'Не начат',
    in_progress: 'Выполняется',
    passed: 'Пройден',
    failed: 'Провален',
    blocked: 'Заблокирован',
    skipped: 'Пропущен',
  };
  return texts[status] || status;
}

/**
 * Получение цвета статуса выполнения теста
 */
export function getTestExecutionStatusColor(status: TestExecutionStatus): string {
  const colors: Record<TestExecutionStatus, string> = {
    not_started: 'gray',
    in_progress: 'blue',
    passed: 'green',
    failed: 'red',
    blocked: 'orange',
    skipped: 'yellow',
  };
  return colors[status] || 'gray';
}

/**
 * Получение иконки статуса выполнения теста
 */
export function getTestExecutionStatusIcon(status: TestExecutionStatus): string {
  const icons: Record<TestExecutionStatus, string> = {
    not_started: '⏸️',
    in_progress: '▶️',
    passed: '✅',
    failed: '❌',
    blocked: '🚫',
    skipped: '⏭️',
  };
  return icons[status] || '❓';
}

// =============================================================================
// Priority Utils
// =============================================================================

/**
 * Получение текста приоритета на русском
 */
export function getPriorityText(priority: "low" | "medium" | "high" | "critical"): string {
  const texts = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический',
  };
  return texts[priority] || priority;
}

/**
 * Получение цвета приоритета
 */
export function getPriorityColor(priority: "low" | "medium" | "high" | "critical"): string {
  const colors = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    critical: 'red',
  };
  return colors[priority] || 'gray';
}

/**
 * Получение иконки приоритета
 */
export function getPriorityIcon(priority: "low" | "medium" | "high" | "critical"): string {
  const icons = {
    low: 'KeyboardArrowDown',
    medium: 'Remove',
    high: 'KeyboardArrowUp',
    critical: 'PriorityHigh',
  };
  return icons[priority] || 'Flag';
}

// =============================================================================
// Test Plan Utils
// =============================================================================

/**
 * Проверка активности тестового плана
 */
export function isTestPlanActive(testPlan: TestPlan): boolean {
  return testPlan.status === 'active';
}

/**
 * Проверка возможности редактирования тестового плана
 */
export function canEditTestPlan(testPlan: TestPlan): boolean {
  return testPlan.status !== 'archived' && testPlan.status !== 'completed';
}

/**
 * Проверка возможности выполнения тестового плана
 */
export function canExecuteTestPlan(testPlan: TestPlan): boolean {
  return testPlan.status === 'active' && (testPlan.test_cases_count || 0) > 0;
}

/**
 * Получение прогресса выполнения тестового плана
 */
export function getTestPlanProgress(testPlan: TestPlan): {
  total: number;
  completed: number;
  percentage: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
} {
  const total = testPlan.total_executions || 0;
  const passed = testPlan.passed_executions || 0;
  const failed = testPlan.failed_executions || 0;
  const completed = passed + failed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    percentage,
    passed,
    failed,
    blocked: 0, // TODO: добавить в схему
    skipped: 0, // TODO: добавить в схему
  };
}

// =============================================================================
// Test Case Utils
// =============================================================================

/**
 * Проверка активности тест-кейса
 */
export function isTestCaseActive(testCase: TestCase): boolean {
  return testCase.status === 'active' || testCase.status === 'approved';
}

/**
 * Проверка возможности выполнения тест-кейса
 */
export function canExecuteTestCase(testCase: TestCase): boolean {
  return isTestCaseActive(testCase);
}

/**
 * Получение последнего результата выполнения тест-кейса
 */
export function getLastTestCaseResult(testCase: TestCase): TestExecution | null {
  if (!testCase.executions || testCase.executions.length === 0) {
    return null;
  }

  return testCase.executions.reduce((latest, current) => {
    return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
  });
}

/**
 * Получение статистики выполнения тест-кейса
 */
export function getTestCaseStats(testCase: TestCase): {
  total_executions: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  pass_rate: number;
  avg_duration: number;
} {
  if (!testCase.executions) {
    return {
      total_executions: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
      pass_rate: 0,
      avg_duration: 0,
    };
  }

  const executions = testCase.executions;
  const total = executions.length;
  const passed = executions.filter(e => e.status === 'passed').length;
  const failed = executions.filter(e => e.status === 'failed').length;
  const blocked = executions.filter(e => e.status === 'blocked').length;
  const skipped = executions.filter(e => e.status === 'skipped').length;
  const pass_rate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const completedExecutions = executions.filter(e => e.duration);
  const totalDuration = completedExecutions.reduce((sum, e) => sum + (e.duration || 0), 0);
  const avg_duration = completedExecutions.length > 0 ? Math.round(totalDuration / completedExecutions.length) : 0;

  return {
    total_executions: total,
    passed,
    failed,
    blocked,
    skipped,
    pass_rate,
    avg_duration,
  };
}

// =============================================================================
// Test Execution Utils
// =============================================================================

/**
 * Проверка завершенности выполнения теста
 */
export function isTestExecutionCompleted(execution: TestExecution): boolean {
  return ['passed', 'failed', 'blocked', 'skipped'].includes(execution.status);
}

/**
 * Проверка успешности выполнения теста
 */
export function isTestExecutionPassed(execution: TestExecution): boolean {
  return execution.status === 'passed';
}

/**
 * Получение длительности выполнения в читаемом формате
 */
export function formatExecutionDuration(duration?: number): string {
  if (!duration) return 'Не измерено';

  if (duration < 60) {
    return `${duration}с`;
  } else if (duration < 3600) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return seconds > 0 ? `${minutes}м ${seconds}с` : `${minutes}м`;
  } else {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return minutes > 0 ? `${hours}ч ${minutes}м` : `${hours}ч`;
  }
}

/**
 * Получение времени выполнения между датами
 */
export function calculateExecutionDuration(
  startedAt?: string,
  completedAt?: string
): number | null {
  if (!startedAt || !completedAt) return null;

  const start = new Date(startedAt);
  const end = new Date(completedAt);
  return Math.round((end.getTime() - start.getTime()) / 1000);
}

// =============================================================================
// Statistics Utils
// =============================================================================

/**
 * Расчет общей статистики тестирования
 */
export function calculateTestingSummary(executions: TestExecution[]): TestingSummary {
  const total = executions.length;
  const passed = executions.filter(e => e.status === 'passed').length;
  const failed = executions.filter(e => e.status === 'failed').length;
  const blocked = executions.filter(e => e.status === 'blocked').length;
  const skipped = executions.filter(e => e.status === 'skipped').length;
  const inProgress = executions.filter(e => e.status === 'in_progress').length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return {
    total_tests: total,
    passed_tests: passed,
    failed_tests: failed,
    blocked_tests: blocked,
    skipped_tests: skipped,
    in_progress_tests: inProgress,
    pass_rate: passRate,
  };
}

/**
 * Группировка выполнений по дням
 */
export function groupExecutionsByDate(executions: TestExecution[]): Record<string, TestExecution[]> {
  return executions.reduce((groups, execution) => {
    const date = execution.created_at.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(execution);
    return groups;
  }, {} as Record<string, TestExecution[]>);
}

/**
 * Расчет тренда выполнения тестов
 */
export function calculateExecutionTrend(executions: TestExecution[], days: number = 7): {
  date: string;
  passed: number;
  failed: number;
  total: number;
}[] {
  const grouped = groupExecutionsByDate(executions);
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayExecutions = grouped[dateStr] || [];
    const passed = dayExecutions.filter(e => e.status === 'passed').length;
    const failed = dayExecutions.filter(e => e.status === 'failed').length;
    const total = dayExecutions.length;

    result.push({
      date: dateStr,
      passed,
      failed,
      total,
    });
  }

  return result;
}

// =============================================================================
// Sorting and Filtering Utils
// =============================================================================

/**
 * Сортировка тестовых планов
 */
export function sortTestPlans(
  testPlans: TestPlan[],
  sortBy: 'name' | 'created_at' | 'updated_at' | 'pass_rate',
  order: 'asc' | 'desc' = 'asc'
): TestPlan[] {
  return [...testPlans].sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'created_at':
      case 'updated_at':
        aValue = new Date(a[sortBy]);
        bValue = new Date(b[sortBy]);
        break;
      case 'pass_rate':
        aValue = a.pass_rate || 0;
        bValue = b.pass_rate || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Фильтрация тестовых планов
 */
export function filterTestPlans(
  testPlans: TestPlan[],
  filters: {
    search?: string;
    status?: TestPlanStatus;
    project_id?: number;
    pass_rate_min?: number;
    pass_rate_max?: number;
  }
): TestPlan[] {
  return testPlans.filter(plan => {
    // Поиск по названию и описанию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        plan.name.toLowerCase().includes(searchLower) ||
        plan.description?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Фильтр по статусу
    if (filters.status && plan.status !== filters.status) {
      return false;
    }

    // Фильтр по проекту
    if (filters.project_id && plan.project_id !== filters.project_id) {
      return false;
    }

    // Фильтр по проценту прохождения
    if (filters.pass_rate_min !== undefined && (plan.pass_rate || 0) < filters.pass_rate_min) {
      return false;
    }

    if (filters.pass_rate_max !== undefined && (plan.pass_rate || 0) > filters.pass_rate_max) {
      return false;
    }

    return true;
  });
}