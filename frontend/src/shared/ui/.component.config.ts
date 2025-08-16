/**
 * Shared UI Components Configuration
 * Конфигурация и целевые правила для общих UI компонентов
 */

export const sharedUIConfig = {
  // Целевые правила компонентов
  targetRules: {
    // PageLayout основной layout
    PageLayout: {
      // Производительность
      performance: {
        shouldMemoize: true,
        maxRerenders: 1,
        lazyLoading: false,
        renderOptimization: 'aggressive',
      },
      // Адаптивность
      responsive: {
        breakpoints: 'all',
        mobileFirst: true,
        touchOptimized: true,
        orientationSupport: true,
      },
      // Доступность
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: true,
        screenReaderSupport: true,
        focusManagement: 'comprehensive',
        skipLinks: true,
      },
      // Тестирование
      testing: {
        unitTests: true,
        integrationTests: true,
        e2eTests: true,
        coverageThreshold: 95,
        layoutTesting: true,
      },
      // Стилизация
      styling: {
        useTheme: true,
        responsiveDesign: true,
        darkModeSupport: true,
        customization: 'high',
      },
    },

    // ErrorBoundary компонент
    ErrorBoundary: {
      performance: {
        shouldMemoize: false, // Не нужно для error boundary
        maxRerenders: 'unlimited',
        lazyLoading: false,
      },
      reliability: {
        errorCapture: 'comprehensive',
        errorReporting: true,
        fallbackUI: 'user-friendly',
        recovery: 'automatic',
      },
      testing: {
        unitTests: true,
        integrationTests: true,
        e2eTests: false,
        coverageThreshold: 100, // Критически важный компонент
        errorScenarios: 'comprehensive',
      },
      monitoring: {
        errorTracking: true,
        performance: true,
        userImpact: true,
      },
    },

    // LoadingSpinner компонент
    LoadingSpinner: {
      performance: {
        shouldMemoize: true,
        maxRerenders: 2,
        lazyLoading: false,
        animationOptimization: true,
      },
      accessibility: {
        ariaLabels: true,
        screenReaderAnnouncements: true,
        reducedMotion: 'respect-preference',
      },
      testing: {
        unitTests: true,
        integrationTests: false,
        e2eTests: false,
        coverageThreshold: 90,
        animationTesting: true,
      },
      styling: {
        useTheme: true,
        customizable: true,
        animations: 'smooth',
      },
    },

    // NotificationCenter компонент
    NotificationCenter: {
      performance: {
        shouldMemoize: true,
        maxRerenders: 3,
        lazyLoading: true,
        virtualScrolling: 'auto',
      },
      functionality: {
        persistence: 'localStorage',
        realTime: true,
        prioritization: true,
        grouping: true,
      },
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: true,
        screenReaderSupport: true,
        liveRegions: true,
      },
      testing: {
        unitTests: true,
        integrationTests: true,
        e2eTests: true,
        coverageThreshold: 95,
        realtimeTesting: true,
      },
    },
  },

  // Глобальные правила для shared компонентов
  globalRules: {
    // Переиспользуемость
    reusability: {
      maxSpecificity: 'low',
      businessLogic: 'none',
      platformAgnostic: true,
      configurable: 'high',
    },
    // FSD соответствие
    fsd: {
      layerCompliance: true,
      noUpperLayerImports: true,
      universalUsage: true,
      isolatedDependencies: true,
    },
    // Качество кода
    codeQuality: {
      typescript: 'strict',
      documentation: 'comprehensive',
      examples: 'required',
      apiConsistency: 'high',
    },
    // Производительность
    performance: {
      bundleSize: 'minimal',
      loadTime: 'immediate',
      memoryUsage: 'low',
      treeshaking: 'optimized',
    },
  },

  // Правила дизайн-системы
  designSystemRules: {
    // Компоненты
    components: {
      consistency: 'strict',
      themeable: true,
      variants: 'standardized',
      composition: 'atomic',
    },
    // Стилизация
    styling: {
      cssInJs: 'emotion',
      themeProvider: 'mui',
      responsive: 'mobile-first',
      accessibility: 'wcag-aa',
    },
    // Типизация
    typing: {
      props: 'explicit',
      generics: 'when-needed',
      unions: 'discriminated',
      extensions: 'interfaces',
    },
  },

  // Правила тестирования
  testRules: {
    required: [
      'render-without-crash',
      'props-validation',
      'theme-compatibility',
      'accessibility-audit',
      'responsive-behavior',
    ],
    recommended: [
      'snapshot-testing',
      'visual-regression',
      'performance-testing',
      'cross-browser-testing',
    ],
    sharedSpecific: [
      'reusability-testing',
      'composition-testing',
      'api-consistency',
      'documentation-examples',
    ],
  },

  // Документационные требования
  documentation: {
    // API документация
    api: {
      propsDocumentation: 'complete',
      usageExamples: 'multiple',
      codeSnippets: 'interactive',
      bestPractices: 'included',
    },
    // Storybook
    storybook: {
      stories: 'comprehensive',
      controls: 'all-props',
      docs: 'auto-generated',
      examples: 'real-world',
    },
    // Миграционные гайды
    migration: {
      breakingChanges: 'documented',
      upgradeGuides: 'detailed',
      deprecated: 'warnings',
      alternatives: 'suggested',
    },
  },
} as const;

export type SharedUIConfig = typeof sharedUIConfig; 