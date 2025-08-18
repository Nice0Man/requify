/**
 * Requirements Pages Configuration
 * Конфигурация и целевые правила для страниц требований
 */

export const requirementsPagesConfig = {
  // Целевые правила страниц
  targetRules: {
    // RequirementsKanbanPage
    RequirementsKanbanPage: {
      // Производительность
      performance: {
        shouldMemoize: true,
        lazyLoading: true,
        codesplitting: true,
        maxRerenders: 3,
        loadingStrategy: 'progressive',
      },
      // Пользовательский опыт
      userExperience: {
        loadingStates: 'comprehensive',
        errorBoundaries: true,
        offlineSupport: 'basic',
        breadcrumbs: true,
        pageTitle: 'dynamic',
      },
      // Доступность
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: true,
        screenReaderSupport: true,
        focusManagement: true,
        skipLinks: true,
      },
      // Тестирование
      testing: {
        unitTests: true,
        integrationTests: true,
        e2eTests: true,
        coverageThreshold: 90,
        userFlowTesting: true,
      },
      // SEO и метаданные
      seo: {
        metaTags: 'dynamic',
        structuredData: false,
        sitemap: true,
        robotsMeta: 'noindex', // Internal app
      },
    },

    // RequirementsPage (основная страница)
    RequirementsPage: {
      performance: {
        shouldMemoize: true,
        lazyLoading: true,
        codesplitting: true,
        maxRerenders: 2,
        loadingStrategy: 'skeleton',
      },
      userExperience: {
        loadingStates: 'comprehensive',
        errorBoundaries: true,
        offlineSupport: 'enhanced',
        searchFunctionality: true,
        filteringOptions: true,
      },
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: true,
        screenReaderSupport: true,
        focusManagement: true,
        skipLinks: true,
      },
      testing: {
        unitTests: true,
        integrationTests: true,
        e2eTests: true,
        coverageThreshold: 95,
        userFlowTesting: true,
      },
    },

    // RequirementDetailPage
    RequirementDetailPage: {
      performance: {
        shouldMemoize: true,
        lazyLoading: false, // Детали загружаем сразу
        codesplitting: true,
        maxRerenders: 4,
        loadingStrategy: 'immediate',
      },
      userExperience: {
        loadingStates: 'detailed',
        errorBoundaries: true,
        offlineSupport: 'read-only',
        editMode: 'inline',
        versionHistory: true,
      },
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: true,
        screenReaderSupport: true,
        focusManagement: true,
        skipLinks: true,
      },
      testing: {
        unitTests: true,
        integrationTests: true,
        e2eTests: true,
        coverageThreshold: 95,
        userFlowTesting: true,
      },
    },
  },

  // Архитектурные требования
  architecturalRequirements: {
    // Layout интеграция
    layout: {
      usePageLayout: true,
      universalSidebar: true,
      appHeader: true,
      breadcrumbs: true,
    },
    // Композиция
    composition: {
      maxWidgetsPerPage: 5,
      maxFeaturesPerPage: 8,
      layerCompliance: 'strict',
      dependencyDirection: 'downward-only',
    },
    // State management
    stateManagement: {
      useReactQuery: true,
      localState: 'minimal',
      globalState: 'context-only',
      persistence: 'url-params',
    },
  },

  // Глобальные правила
  globalRules: {
    // FSD соответствие
    fsd: {
      layerCompliance: true,
      compositionOnly: true,
      noBusinessLogic: true,
      integrationLayer: true,
    },
    // Роутинг
    routing: {
      lazyLoading: true,
      codesplitting: true,
      errorBoundaries: true,
      fallbackRoutes: true,
    },
    // Производительность
    performance: {
      bundleSize: 'optimized',
      loadTime: 'fast',
      memoryUsage: 'efficient',
      cacheStrategy: 'smart',
    },
    // Безопасность
    security: {
      authentication: 'required',
      authorization: 'route-based',
      inputValidation: 'comprehensive',
      xssProtection: true,
    },
  },

  // Правила тестирования
  testRules: {
    required: [
      'page-loading',
      'navigation-flows',
      'error-states',
      'accessibility-audit',
      'responsive-behavior',
    ],
    recommended: [
      'user-journey-testing',
      'performance-testing',
      'cross-browser-testing',
      'visual-regression',
      'seo-validation',
    ],
    e2eScenarios: [
      'create-requirement-flow',
      'edit-requirement-flow',
      'filter-requirements',
      'kanban-workflow',
      'search-functionality',
    ],
  },

  // Мониторинг и аналитика
  monitoring: {
    // Производительность
    performance: {
      coreWebVitals: true,
      customMetrics: true,
      errorTracking: true,
      userInteractions: 'anonymized',
    },
    // Пользовательский опыт
    userExperience: {
      clickTracking: false, // Privacy
      heatmaps: false,
      sessionRecording: false,
      feedbackCollection: true,
    },
    // Бизнес-метрики
    business: {
      conversionTracking: false, // Not applicable
      featureUsage: true,
      retentionMetrics: true,
      satisfactionScore: true,
    },
  },
} as const;

export type RequirementsPagesConfig = typeof requirementsPagesConfig; 