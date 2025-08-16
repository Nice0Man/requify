/**
 * Requirement UI Components Configuration
 * Конфигурация и целевые правила для UI компонентов требований
 */

export const requirementUIConfig = {
  // Целевые правила компонентов
  targetRules: {
    // RequirementCard компонент
    RequirementCard: {
      // Производительность
      performance: {
        shouldMemoize: true,
        maxRerenders: 5,
        lazyLoading: false,
      },
      // Тестирование
      testing: {
        unitTests: true,
        integrationTests: true,
        e2eTests: false,
        coverageThreshold: 90,
      },
      // Доступность
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: true,
        screenReaderSupport: true,
        colorContrastRatio: 4.5,
      },
      // Стилизация
      styling: {
        useTheme: true,
        responsiveDesign: true,
        mobileFirst: true,
        animations: 'minimal',
      },
    },

    // RequirementList компонент
    RequirementList: {
      performance: {
        shouldMemoize: true,
        maxRerenders: 3,
        lazyLoading: true,
        virtualScrolling: 'auto', // Включается при >100 элементах
      },
      testing: {
        unitTests: true,
        integrationTests: true,
        e2eTests: true,
        coverageThreshold: 95,
      },
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: true,
        screenReaderSupport: true,
        focusManagement: true,
      },
      styling: {
        useTheme: true,
        responsiveDesign: true,
        mobileFirst: true,
        animations: 'enhanced',
      },
    },

    // RequirementStatus компонент
    RequirementStatus: {
      performance: {
        shouldMemoize: true,
        maxRerenders: 2,
        lazyLoading: false,
      },
      testing: {
        unitTests: true,
        integrationTests: false,
        e2eTests: false,
        coverageThreshold: 85,
      },
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: false,
        screenReaderSupport: true,
        colorContrastRatio: 7, // Высокий контраст для статусов
      },
      styling: {
        useTheme: true,
        responsiveDesign: true,
        mobileFirst: true,
        animations: 'none',
      },
    },

    // RequirementPriority компонент
    RequirementPriority: {
      performance: {
        shouldMemoize: true,
        maxRerenders: 2,
        lazyLoading: false,
      },
      testing: {
        unitTests: true,
        integrationTests: false,
        e2eTests: false,
        coverageThreshold: 85,
      },
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: false,
        screenReaderSupport: true,
        colorContrastRatio: 7,
      },
      styling: {
        useTheme: true,
        responsiveDesign: true,
        mobileFirst: true,
        animations: 'none',
      },
    },

    // RequirementType компонент
    RequirementType: {
      performance: {
        shouldMemoize: true,
        maxRerenders: 2,
        lazyLoading: false,
      },
      testing: {
        unitTests: true,
        integrationTests: false,
        e2eTests: false,
        coverageThreshold: 85,
      },
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: false,
        screenReaderSupport: true,
        colorContrastRatio: 4.5,
      },
      styling: {
        useTheme: true,
        responsiveDesign: true,
        mobileFirst: true,
        animations: 'none',
      },
    },
  },

  // Общие правила для всех компонентов entity
  globalRules: {
    // FSD соответствие
    fsd: {
      layerCompliance: true,
      noUpperLayerImports: true,
      onlyDisplayLogic: true,
      noBusinessLogic: true,
    },
    // TypeScript
    typescript: {
      strictMode: true,
      explicitReturnTypes: true,
      noImplicitAny: true,
      exactOptionalPropertyTypes: true,
    },
    // Производительность
    performance: {
      bundleSize: 'small',
      loadTime: 'fast',
      memoryUsage: 'low',
    },
    // Совместимость
    compatibility: {
      ie11: false,
      safari: true,
      chrome: true,
      firefox: true,
      edge: true,
    },
  },

  // Правила линтера
  lintRules: {
    // React правила
    react: {
      'react/memo-usage': 'error',
      'react/display-name': 'error',
      'react/prop-types': 'off', // Используем TypeScript
      'react/jsx-key': 'error',
    },
    // FSD правила (кастомные)
    fsd: {
      'fsd/no-upper-layer-imports': 'error',
      'fsd/layer-compliance': 'error',
      'fsd/slice-isolation': 'error',
    },
    // Производительность
    performance: {
      'performance/no-heavy-computations-in-render': 'error',
      'performance/prefer-memo': 'warn',
      'performance/prefer-callback': 'warn',
    },
  },

  // Правила тестирования
  testRules: {
    // Обязательные тесты
    required: [
      'render-without-crash',
      'props-validation',
      'accessibility-audit',
      'theme-compatibility',
    ],
    // Рекомендуемые тесты
    recommended: [
      'snapshot-testing',
      'interaction-testing',
      'responsive-testing',
      'performance-testing',
    ],
    // Мок-стратегии
    mocking: {
      externalDependencies: 'mock',
      internalDependencies: 'real',
      dateTime: 'mock',
      randomValues: 'mock',
    },
  },
} as const;

export type RequirementUIConfig = typeof requirementUIConfig; 