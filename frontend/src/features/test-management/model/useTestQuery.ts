import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testApi, TestFilters, TestSuite } from "../api/testApi";
import type {
  TestCase,
  CreateTestCaseRequest,
  UpdateTestCaseRequest,
} from "../api/testApi";

// Query keys
export const testQueryKeys = {
  all: ["test-cases"] as const,
  lists: () => [...testQueryKeys.all, "list"] as const,
  list: (filters: TestFilters) =>
    [...testQueryKeys.lists(), { filters }] as const,
  details: () => [...testQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...testQueryKeys.details(), id] as const,
  stats: () => [...testQueryKeys.all, "stats"] as const,
  executions: (testCaseId: string) =>
    [...testQueryKeys.all, "executions", testCaseId] as const,
  suites: {
    all: ["test-suites"] as const,
    lists: () => [...testQueryKeys.suites.all, "list"] as const,
    list: (projectId?: string) =>
      [...testQueryKeys.suites.lists(), { projectId }] as const,
    details: () => [...testQueryKeys.suites.all, "detail"] as const,
    detail: (id: string) => [...testQueryKeys.suites.details(), id] as const,
  },
};

// Hooks
export const useTestCases = (filters?: TestFilters) => {
  return useQuery({
    queryKey: testQueryKeys.list(filters || {}),
    queryFn: () => testApi.getTestCases(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTestCase = (id: string) => {
  return useQuery({
    queryKey: testQueryKeys.detail(id),
    queryFn: () => testApi.getTestCase(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useTestStats = () => {
  return useQuery({
    queryKey: testQueryKeys.stats(),
    queryFn: () => testApi.getTestStats(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateTestCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestCaseRequest) => testApi.createTestCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: testQueryKeys.stats() });
    },
  });
};

export const useUpdateTestCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestCaseRequest }) =>
      testApi.updateTestCase(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: testQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: testQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: testQueryKeys.stats() });
    },
  });
};

export const useDeleteTestCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testApi.deleteTestCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: testQueryKeys.stats() });
    },
  });
};

export const useExecuteTestCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      testApi.executeTestCase(id, data),
    onSuccess: (execution) => {
      // Инвалидируем выполнения тест-кейса
      queryClient.invalidateQueries({
        queryKey: testQueryKeys.executions(execution.testCaseId),
      });

      // Инвалидируем статистику
      queryClient.invalidateQueries({ queryKey: testQueryKeys.stats() });
    },
    onError: (error) => {
      console.error("Execute test case error:", error);
    },
  });
};

export const useBulkUpdateTestCases = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: Partial<TestCase> }) =>
      testApi.bulkUpdateTestCases(ids, data),
    onSuccess: () => {
      // Инвалидируем все связанные данные
      queryClient.invalidateQueries({ queryKey: testQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: testQueryKeys.stats() });
    },
    onError: (error) => {
      console.error("Bulk update test cases error:", error);
    },
  });
};

export const useDuplicateTestCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testApi.duplicateTestCase,
    onSuccess: (duplicatedTestCase) => {
      // Инвалидируем список тест-кейсов
      queryClient.invalidateQueries({ queryKey: testQueryKeys.lists() });

      // Добавляем дублированный тест-кейс в кэш
      queryClient.setQueryData(
        testQueryKeys.detail(duplicatedTestCase.id),
        duplicatedTestCase
      );

      // Инвалидируем тест-кейсы проекта
      if (duplicatedTestCase.projectId) {
        queryClient.invalidateQueries({
          queryKey: testQueryKeys.list({ projectId: duplicatedTestCase.projectId }),
        });
      }
    },
    onError: (error) => {
      console.error("Duplicate test case error:", error);
    },
  });
};

// Test Suites Queries
export const useTestSuites = (projectId?: string) => {
  return useQuery({
    queryKey: testQueryKeys.suites.list(projectId),
    queryFn: () => testApi.getTestSuites(projectId),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

export const useTestSuite = (id: string) => {
  return useQuery({
    queryKey: testQueryKeys.suites.detail(id),
    queryFn: () => testApi.getTestSuite(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!id,
  });
};

// Test Suites Mutations
export const useCreateTestSuite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<TestSuite, "id" | "createdAt" | "updatedAt">) =>
      testApi.createTestSuite(data),
    onSuccess: (newTestSuite) => {
      queryClient.invalidateQueries({ queryKey: testQueryKeys.suites.lists() });
      queryClient.setQueryData(
        testQueryKeys.suites.detail(newTestSuite.id),
        newTestSuite
      );
    },
  });
};

export const useUpdateTestSuite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TestSuite> }) =>
      testApi.updateTestSuite(id, data),
    onSuccess: (updatedTestSuite) => {
      queryClient.setQueryData(
        testQueryKeys.suites.detail(updatedTestSuite.id),
        updatedTestSuite
      );
      queryClient.invalidateQueries({ queryKey: testQueryKeys.suites.lists() });
    },
  });
};

export const useDeleteTestSuite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testApi.deleteTestSuite(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: testQueryKeys.suites.detail(deletedId),
      });
      queryClient.invalidateQueries({ queryKey: testQueryKeys.suites.lists() });
    },
  });
};

export const useRunTestSuite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testApi.runTestSuite,
    onSuccess: (executions) => {
      // Инвалидируем все выполнения тест-кейсов в сюите
      executions.forEach((execution) => {
        queryClient.invalidateQueries({
          queryKey: testQueryKeys.executions(execution.testCaseId),
        });
      });

      // Инвалидируем статистику
      queryClient.invalidateQueries({ queryKey: testQueryKeys.stats() });
    },
    onError: (error) => {
      console.error("Run test suite error:", error);
    },
  });
};

export const useGenerateTestReport = () => {
  return useMutation({
    mutationFn: ({
      projectId,
      format,
    }: {
      projectId: string;
      format?: "pdf" | "html" | "json";
    }) => testApi.generateTestReport(projectId, format),
    onSuccess: (blob, variables) => {
      // Скачиваем отчет
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `test-report.${variables.format || "html"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error("Generate test report error:", error);
    },
  });
};
