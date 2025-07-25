/**
 * Test Case Entity UI Components Configuration
 * Конфигурация компонентов отображения тест-кейсов
 */

export const testCaseUIConfig = {
  // Метаданные компонентов
  meta: {
    layer: 'entities',
    entity: 'test-case',
    slice: 'ui',
    description: 'UI компоненты для отображения тест-кейсов и статусов выполнения',
    version: '1.0.0',
  },

  // Требования к производительности
  performance: {
    // Виртуализация
    virtualization: {
      TestCaseList: {
        enabled: true,
        threshold: 30, // Включать виртуализацию при >30 элементах
        overscan: 3,
        estimatedItemSize: 200, // Высота карточки тест-кейса
      },
    },

    // Мемоизация
    memoization: {
      TestCaseCard: {
        enabled: true,
        dependencies: [
          'testCase.id', 
          'testCase.title', 
          'testCase.status',
          'result.execution.status',
          'showExecutionControls'
        ],
        shallowCompare: false,
      },
      TestExecutionStatus: {
        enabled: true,
        dependencies: ['status', 'execution.id', 'variant', 'size'],
        shallowCompare: true,
      },
      TestExecutionProgress: {
        enabled: true,
        dependencies: ['stats.total', 'stats.byExecutionStatus', 'compact'],
        shallowCompare: false,
      },
    },

    // Ререндеры
    rerenders: {
      maxAllowed: 2, // Строже для тест-кейсов
      trackingEnabled: process.env.NODE_ENV === 'development',
      warningThreshold: 3,
    },

    // Метрики
    metrics: {
      loadTime: '< 150ms', // Быстрее для тестовых компонентов
      interactionDelay: '< 50ms', // Критично для выполнения тестов
      memoryUsage: '< 8MB per 100 test cases',
      executionTime: '< 100ms per test execution',
    },
  },

  // Требования к тестированию
  testing: {
    // Покрытие кода
    coverage: {
      statements: 95, // Выше для критичных компонентов
      branches: 90,
      functions: 95,
      lines: 95,
    },

    // Обязательные тесты
    required: {
      unit: [
        'TestCaseCard - render with test case data',
        'TestCaseCard - handle execution controls',
        'TestCaseCard - expand/collapse details',
        'TestCaseCard - show execution status',
        'TestCaseList - filter test cases',
        'TestCaseList - search functionality',
        'TestCaseList - view mode switching',
        'TestExecutionStatus - all status variants',
        'TestExecutionStatus - animation for in_progress',
        'TestExecutionProgress - calculation accuracy',
        'TestExecutionProgress - progress bars display',
      ],
      integration: [
        'TestCaseList + TestCaseCard interaction',
        'TestCaseCard + TestExecutionStatus composition',
        'Filter combinations with search',
        'Execution flow end-to-end',
      ],
      visual: [
        'TestCaseCard states and variants',
        'TestExecutionStatus all statuses',
        'TestExecutionProgress different stats',
        'TestCaseList view modes',
      ],
      performance: [
        'TestCaseList with 100+ items',
        'TestCaseCard rapid status changes',
        'TestExecutionProgress real-time updates',
      ],
    },

    // Тестовые данные
    fixtures: {
      testCases: {
        basic: 'simple test case with steps',
        complex: 'test case with many steps and long description',
        executed: 'test case with execution results',
        failed: 'failed test case with notes',
        inProgress: 'test case currently executing',
        blocked: 'blocked test case',
      },
      executions: {
        passed: 'successful execution with timing',
        failed: 'failed execution with error notes',
        blocked: 'blocked execution with reason',
        inProgress: 'currently running execution',
      },
      stats: {
        empty: 'no test cases',
        mixed: 'various execution statuses',
        allPassed: 'all tests passed',
        allFailed: 'all tests failed',
      },
    },
  },

  // Стандарты доступности
  accessibility: {
    // WCAG соответствие
    wcag: {
      level: 'AA',
      guidelines: ['1.4.3', '1.4.11', '2.1.1', '2.1.2', '2.4.3', '4.1.2'],
    },

    // ARIA атрибуты
    aria: {
      TestCaseCard: {
        role: 'article',
        'aria-label': 'testCase.title + execution status',
        'aria-describedby': 'test case description',
        'aria-expanded': 'controlled by details toggle',
      },
      TestCaseList: {
        role: 'list',
        'aria-label': 'Test cases list',
        'aria-live': 'polite', // for filter/search updates
        'aria-busy': 'during loading',
      },
      TestExecutionStatus: {
        role: 'status',
        'aria-label': 'execution status with details',
        'aria-live': 'assertive', // for status changes
      },
      TestExecutionProgress: {
        role: 'progressbar',
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-valuenow': 'current progress',
        'aria-label': 'test execution progress',
      },
    },

    // Навигация с клавиатуры
    keyboard: {
      TestCaseCard: {
        focusable: true,
        keys: ['Enter', 'Space', 'ArrowDown', 'ArrowUp'],
        tabIndex: 0,
        executionControls: ['1', '2', '3', '4'], // быстрые клавиши для статусов
      },
      TestCaseList: {
        arrowNavigation: true,
        focusManagement: 'roving',
        searchShortcut: 'Ctrl+F',
        filterShortcut: 'Ctrl+Shift+F',
      },
    },

    // Скринридеры
    screenReader: {
      announcements: [
        'Test case selected',
        'Execution status changed',
        'Filter applied',
        'Search results updated',
        'Test execution started',
        'Test execution completed',
      ],
      descriptions: [
        'Test case {title} with {steps.length} steps',
        'Execution status: {status}',
        'Progress: {passed}/{total} tests passed',
        'Test case expanded showing details',
      ],
    },
  },

  // Стилизация и темизация
  styling: {
    // Material-UI соответствие
    mui: {
      theme: 'app-theme',
      responsive: true,
      breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
    },

    // Цветовая схема
    colors: {
      TestCaseCard: {
        default: 'background.paper',
        hover: 'action.hover',
        selected: 'primary.main',
        executing: 'primary.light',
      },
      executionStatus: {
        passed: 'success.main',
        failed: 'error.main',
        blocked: 'warning.main',
        skipped: 'info.main',
        in_progress: 'primary.main',
        not_executed: 'text.disabled',
      },
      priority: {
        critical: 'error.main',
        high: 'warning.main',
        medium: 'info.main',
        low: 'text.secondary',
      },
    },

    // Анимации
    animations: {
      TestCaseCard: {
        hover: 'transform 0.2s ease-in-out',
        expand: 'max-height 0.3s ease-in-out',
        statusChange: 'background-color 0.3s ease-in-out',
      },
      TestExecutionStatus: {
        statusChange: 'color 0.2s ease-in-out',
        inProgress: 'rotation 2s linear infinite',
        pulse: 'opacity 1.5s ease-in-out infinite',
      },
      TestExecutionProgress: {
        progressBar: 'width 0.5s ease-out',
        valueChange: 'transform 0.3s ease-in-out',
      },
    },

    // Адаптивность
    responsive: {
      TestCaseCard: {
        xs: 'full width, collapsed details',
        sm: '2 columns',
        md: '3 columns',
        lg: '4 columns',
      },
      TestCaseList: {
        xs: 'list mode only, simplified filters',
        sm: 'cards/list toggle',
        md: 'full filters, table mode available',
      },
      TestExecutionProgress: {
        xs: 'compact mode',
        md: 'full details mode',
      },
    },
  },

  // Бизнес-логика и функциональность
  business: {
    // Правила выполнения тестов
    execution: {
      allowedTransitions: {
        not_executed: ['in_progress', 'skipped'],
        in_progress: ['passed', 'failed', 'blocked'],
        passed: ['in_progress'], // повторное выполнение
        failed: ['in_progress'], // повторное выполнение
        blocked: ['in_progress', 'skipped'],
        skipped: ['in_progress'],
      },
      timeouts: {
        maxExecutionTime: 3600, // 1 час
        warningTime: 1800, // 30 минут
      },
    },

    // Правила отображения
    display: {
      maxStepsShown: 10,
      maxDescriptionLength: 200,
      maxNotesLength: 500,
      expandThreshold: 3, // шагов для автоматического сворачивания
    },

    // Фильтрация и поиск
    filtering: {
      searchFields: ['title', 'description', 'steps'],
      defaultFilters: ['status:active'],
      maxSearchResults: 100,
      searchDelay: 300, // мс для debounce
    },
  },

  // Интеграционные требования
  integration: {
    // Props validation
    propTypes: {
      strict: true,
      required: ['testCase', 'status', 'stats'],
      optional: ['result', 'execution', 'onClick', 'onExecute'],
    },

    // Callbacks
    callbacks: {
      TestCaseCard: ['onClick', 'onMenuClick', 'onExecute'],
      TestCaseList: [
        'onTestCaseClick', 
        'onTestCaseExecute', 
        'onFiltersChange',
        'onViewModeChange'
      ],
      TestExecutionStatus: ['onClick'],
    },

    // External services
    externalServices: {
      testExecution: 'integration with test execution service',
      notifications: 'execution status notifications',
      analytics: 'test metrics tracking',
    },
  },

  // FSD соответствие
  fsd: {
    // Импорты
    imports: {
      allowed: [
        '@mui/material',
        '@mui/icons-material', 
        '../model/types',
        'react'
      ],
      forbidden: [
        '@/features/*',
        '@/widgets/*', 
        '@/pages/*'
      ],
    },

    // Экспорты
    exports: {
      components: [
        'TestCaseCard',
        'TestCaseList', 
        'TestExecutionStatus',
        'TestExecutionProgress'
      ],
      types: [
        'TestCaseCardProps',
        'TestCaseListProps',
        'TestExecutionStatusProps',
        'TestExecutionProgressProps'
      ],
      public: 'index.ts',
    },

    // Зависимости
    dependencies: {
      entities: ['none'], // Независимость от других entities
      shared: ['ui', 'types', 'utils'],
      external: ['react', '@mui/material', '@mui/icons-material'],
    },
  },

  // Мониторинг и метрики
  monitoring: {
    // Ключевые метрики
    kpi: {
      executionAccuracy: '> 99%', // точность отображения статуса
      responseTime: '< 100ms', // время отклика на действия
      errorRate: '< 0.1%', // частота ошибок
      userSatisfaction: '> 4.5/5', // удовлетворенность UX
    },

    // Логирование
    logging: {
      events: [
        'test_case_viewed',
        'test_execution_started',
        'test_execution_completed',
        'filter_applied',
        'search_performed',
      ],
      performance: [
        'component_render_time',
        'list_filter_time',
        'status_update_time',
      ],
    },

    // Алерты
    alerts: {
      slowExecution: 'execution time > 30s',
      highErrorRate: 'error rate > 1%',
      memoryLeak: 'memory usage growing',
    },
  },

  // Документация
  documentation: {
    // Обязательные разделы
    required: [
      'Component overview',
      'Execution workflow',
      'Props interface',
      'Usage examples',
      'Accessibility notes',
      'Performance considerations',
      'Testing guidelines',
    ],

    // Примеры кода
    examples: {
      basic: 'Simple test case display',
      interactive: 'Test case with execution controls',
      filtered: 'Test case list with filters',
      progress: 'Execution progress tracking',
      realtime: 'Real-time status updates',
    },

    // Storybook stories
    storybook: {
      required: true,
      stories: [
        'Default test case',
        'Executed test case', 
        'Failed test case',
        'In progress test case',
        'Blocked test case',
        'Test case list',
        'Execution progress',
        'Status variations',
      ],
    },
  },

  // Валидация
  validation: {
    // Линтинг
    eslint: {
      rules: [
        'react-hooks/exhaustive-deps',
        'jsx-a11y/recommended',
        'testing-library/recommended'
      ],
      noWarnings: true,
    },

    // TypeScript
    typescript: {
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      exactOptionalPropertyTypes: true,
    },

    // Runtime checks
    runtime: {
      propTypes: 'development only',
      invariants: 'always',
      performanceChecks: 'development only',
    },

    // Business logic validation
    business: {
      statusTransitions: 'validate allowed transitions',
      executionTiming: 'validate execution durations',
      dataIntegrity: 'validate test case data',
    },
  },
};

export default testCaseUIConfig; 