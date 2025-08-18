/**
 * Project API Components Configuration
 * Конфигурация и целевые правила для API компонентов проектов
 */

export const projectAPIConfig = {
  // Целевые правила компонентов
  targetRules: {
    // ProjectDAO класс
    ProjectDAO: {
      // Производительность
      performance: {
        caching: true,
        maxCacheSize: 100,
        cacheTTL: 300000, // 5 минут
        requestTimeout: 10000,
        retryAttempts: 3,
      },
      // Надежность
      reliability: {
        errorHandling: 'comprehensive',
        logging: 'detailed',
        monitoring: true,
        healthChecks: true,
      },
      // Безопасность
      security: {
        authentication: 'required',
        authorization: 'rbac',
        inputValidation: 'strict',
        outputSanitization: true,
      },
      // Тестирование
      testing: {
        unitTests: true,
        integrationTests: true,
        mockTests: true,
        coverageThreshold: 95,
      },
    },

    // ProjectQueries хуки
    ProjectQueries: {
      performance: {
        staleTime: 300000, // 5 минут
        gcTime: 600000, // 10 минут
        refetchOnWindowFocus: false,
        optimisticUpdates: true,
      },
      reliability: {
        errorBoundaries: true,
        retryLogic: true,
        fallbackData: true,
        offlineSupport: 'basic',
      },
      testing: {
        unitTests: true,
        integrationTests: true,
        e2eTests: false,
        coverageThreshold: 90,
      },
      reactQuery: {
        invalidationStrategy: 'smart',
        backgroundRefetch: 'smart',
        suspenseMode: false,
        errorRetryCount: 3,
      },
    },
  },

  // API Endpoints конфигурация
  endpointsConfig: {
    // Базовые настройки
    base: {
      baseURL: '/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    // Правила валидации
    validation: {
      requestValidation: true,
      responseValidation: true,
      schemaValidation: true,
    },
    // Мониторинг
    monitoring: {
      trackRequests: true,
      trackErrors: true,
      trackPerformance: true,
      alerting: true,
    },
  },

  // Глобальные правила
  globalRules: {
    // FSD соответствие
    fsd: {
      layerCompliance: true,
      noUpperLayerImports: true,
      onlyAPILogic: true,
      noUILogic: true,
    },
    // TypeScript
    typescript: {
      strictMode: true,
      explicitReturnTypes: true,
      noImplicitAny: true,
      exactOptionalPropertyTypes: true,
    },
    // Безопасность
    security: {
      noHardcodedSecrets: true,
      secureTransport: true,
      inputSanitization: true,
      outputValidation: true,
    },
  },

  // Правила тестирования API
  testRules: {
    required: [
      'dao-crud-operations',
      'query-hooks-functionality',
      'error-handling',
      'cache-invalidation',
    ],
    recommended: [
      'load-testing',
      'security-testing',
      'integration-testing',
      'mock-service-testing',
    ],
    mockStrategies: {
      externalAPIs: 'mock',
      database: 'mock',
      networkRequests: 'mock',
      authentication: 'mock',
    },
  },
} as const;

export type ProjectAPIConfig = typeof projectAPIConfig; 