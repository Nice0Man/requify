/**
 * Конфигурация компонентов страницы Reports
 * @description Определяет правила разработки для страницы отчетов и аналитики
 */

export const reportsPageConfig = {
  performance: {
    // Оптимизация загрузки данных
    lazyDataLoading: true,
    memoizeReportTypes: true,
    virtualScrollForLargeData: true,
    
    // Целевые метрики
    metrics: {
      firstContentfulPaint: '<2s',
      largestContentfulPaint: '<3s',
      reportGeneration: '<5s',
      exportTime: '<10s'
    },
    
    // Оптимизации
    optimizations: [
      'React.memo для карточек отчетов',
      'useMemo для конфигураций',
      'useCallback для обработчиков',
      'Lazy loading для компонентов экспорта',
      'Debounce для фильтров'
    ]
  },

  functionality: {
    // Типы отчетов
    reportTypes: [
      'project_summary',
      'requirements_analysis', 
      'testing_metrics',
      'release_statistics',
      'team_performance',
      'custom_dashboard'
    ],
    
    // Форматы экспорта
    exportFormats: ['PDF', 'Excel', 'CSV', 'Email'],
    
    // Фильтрация
    filters: {
      dateRange: 'required',
      projectFilter: 'required',
      statusFilter: 'optional',
      userFilter: 'optional'
    },
    
    // Интерактивность
    interactions: [
      'Выбор типа отчета',
      'Настройка параметров',
      'Генерация отчета',
      'Экспорт в различных форматах',
      'Предварительный просмотр'
    ]
  },

  ui: {
    // Адаптивность
    responsive: {
      mobile: 'vertical layout',
      tablet: 'mixed layout',
      desktop: 'side-by-side layout'
    },
    
    // Анимации
    animations: [
      'Fade in для заголовка',
      'Slide для конфигурации',
      'Staggered animation для карточек',
      'Loading states для генерации'
    ],
    
    // Визуальные эффекты
    effects: {
      gradients: true,
      shadows: true,
      backdropFilter: true,
      hover: 'transform + shadow'
    }
  },

  accessibility: {
    // ARIA поддержка
    aria: {
      labels: 'all interactive elements',
      descriptions: 'complex components',
      roles: 'semantic markup',
      states: 'loading/error states'
    },
    
    // Клавиатурная навигация
    keyboard: {
      tabNavigation: true,
      shortcuts: ['Enter для генерации', 'Esc для отмены'],
      focusManagement: true
    },
    
    // Доступность данных
    dataAccess: {
      screenReader: 'structured data reading',
      altText: 'chart descriptions',
      summaries: 'report summaries'
    }
  },

  testing: {
    // Unit тесты
    unit: {
      coverage: '85%',
      components: ['ReportsPage', 'export handlers', 'state management'],
      mocks: 'external APIs only'
    },
    
    // Integration тесты
    integration: {
      userFlows: [
        'Выбор типа отчета',
        'Настройка параметров',
        'Генерация отчета',
        'Экспорт отчета'
      ],
      apiIntegration: 'mock server responses'
    },
    
    // E2E тесты
    e2e: {
      scenarios: [
        'Complete report generation flow',
        'Export functionality',
        'Error handling',
        'Mobile responsiveness'
      ]
    }
  },

  styling: {
    // Дизайн система
    designSystem: {
      colors: 'theme colors + report-specific palette',
      typography: 'consistent with app typography',
      spacing: 'standard grid system',
      components: 'Material-UI + custom cards'
    },
    
    // Кастомизация
    customization: {
      reportCards: 'gradient backgrounds + hover effects',
      configPanel: 'glassmorphism effect',
      buttons: 'gradient + shadow transitions',
      animations: 'smooth cubic-bezier transitions'
    }
  },

  integration: {
    // FSD интеграция
    fsd: {
      layer: 'pages',
      dependencies: [
        '@/shared/ui (PageLayout)',
        '@/widgets/layout',
        '@/features/reports (future)',
        '@/entities/project',
        '@/entities/requirement'
      ]
    },
    
    // API интеграция
    api: {
      endpoints: [
        '/api/v1/reports/generate',
        '/api/v1/reports/export',
        '/api/v1/projects',
        '/api/v1/requirements'
      ],
      caching: 'React Query',
      errorHandling: 'global + local handlers'
    }
  },

  monitoring: {
    // Метрики
    metrics: [
      'Report generation time',
      'Export success rate',
      'User interaction patterns',
      'Performance bottlenecks'
    ],
    
    // Логирование
    logging: {
      reportGeneration: 'start/end/error',
      exports: 'format + success/failure',
      userActions: 'anonymized interaction tracking'
    }
  },

  validation: {
    // Правила валидации
    rules: [
      'Date range validation',
      'Project selection validation',
      'Export format support',
      'Data availability checks'
    ],
    
    // Проверки качества
    quality: {
      codeStyle: 'ESLint + Prettier',
      typeScript: 'strict mode',
      performance: 'Lighthouse CI',
      accessibility: 'axe-core'
    }
  }
} as const;

export type ReportsPageConfig = typeof reportsPageConfig; 