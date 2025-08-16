/**
 * Dashboard Stats Widget Configuration
 * Конфигурация виджета статистики дашборда
 */

export const dashboardStatsConfig = {
  // Метаданные виджета
  meta: {
    layer: 'widgets',
    widget: 'dashboard-stats',
    description: 'Виджет отображения статистики и метрик дашборда с интерактивными графиками',
    version: '1.0.0',
    dependencies: [
      '@/entities/dashboard',
      '@/features/dashboard',
      '@mui/material',
      '@mui/icons-material',
      'recharts'
    ],
  },

  // Требования к производительности
  performance: {
    // Мемоизация компонентов
    memoization: {
      required: true,
      components: ['DashboardStatsWidget', 'MetricCard', 'TrendChart'],
      deps: ['metrics', 'timeRange', 'chartType'],
    },

    // Виртуализация для больших списков
    virtualization: {
      enabled: true,
      threshold: 50, // метрик
      itemHeight: 120,
    },

    // Ленивая загрузка
    lazy: {
      charts: true,
      detailModals: true,
      exportDialogs: true,
    },

    // Лимиты производительности
    limits: {
      maxMetrics: 20,
      maxDataPoints: 1000,
      renderTime: '< 300ms',
      memoryUsage: '< 10MB',
    },

    // Оптимизация ререндеров
    rerenders: {
      prevention: true,
      useMemo: ['calculatedStats', 'chartData', 'filteredMetrics'],
      useCallback: ['onMetricClick', 'onTimeRangeChange', 'onExport'],
    },
  },

  // Функциональные требования
  functionality: {
    // Типы метрик
    metricTypes: [
      'projects_count',
      'requirements_count', 
      'users_active',
      'completion_rate',
      'velocity',
      'quality_index'
    ],

    // Временные периоды
    timeRanges: [
      'today',
      'week', 
      'month',
      'quarter',
      'year',
      'custom'
    ],

    // Типы графиков
    chartTypes: [
      'line',
      'bar',
      'pie',
      'area',
      'doughnut'
    ],

    // Группировка метрик
    grouping: {
      byCategory: true,
      byPriority: true,
      byStatus: true,
      custom: true,
    },

    // Экспорт данных
    export: {
      formats: ['pdf', 'excel', 'csv', 'png'],
      templates: ['summary', 'detailed', 'executive'],
    },

    // Персонализация
    customization: {
      layout: true,
      colors: true,
      metrics: true,
      timeRanges: true,
    },
  },

  // UI/UX требования
  ux: {
    // Адаптивность
    responsive: {
      breakpoints: {
        mobile: '< 768px',
        tablet: '768px - 1024px', 
        desktop: '> 1024px',
      },
      layouts: {
        mobile: 'vertical',
        tablet: 'grid-2x2',
        desktop: 'grid-4x2',
      },
    },

    // Анимации
    animations: {
      chartLoad: 'fade-up 0.5s ease',
      valueChange: 'pulse 0.3s ease',
      hover: 'scale 1.02 transform',
      transitions: 'all 0.2s ease',
    },

    // Интерактивность
    interactions: {
      hoverEffects: true,
      clickableMetrics: true,
      tooltips: true,
      drillDown: true,
      contextMenus: true,
    },

    // Визуальные состояния
    states: {
      loading: 'Skeleton + Pulse',
      empty: 'Illustration + Message',
      error: 'Icon + Retry Button',
      success: 'Checkmark + Animation',
    },

    // Цветовая схема
    colors: {
      primary: '#1976d2',
      success: '#2e7d32',
      warning: '#ed6c02',
      error: '#d32f2f',
      trend: {
        positive: '#4caf50',
        negative: '#f44336',
        neutral: '#757575',
      },
    },
  },

  // Стандарты доступности
  accessibility: {
    // WCAG соответствие
    wcag: {
      level: 'AA',
      requirements: [
        '1.3.1 - Info and Relationships',
        '1.4.3 - Contrast (Minimum)',
        '2.1.1 - Keyboard Navigation',
        '2.4.3 - Focus Order',
        '4.1.2 - Name, Role, Value',
      ],
    },

    // ARIA атрибуты
    aria: {
      labels: 'Обязательно для всех интерактивных элементов',
      descriptions: 'Для сложных графиков и метрик',
      liveRegions: 'Для динамических обновлений данных',
      roles: 'img для графиков, table для таблиц',
    },

    // Навигация с клавиатуры
    keyboard: {
      tabIndex: 'Логический порядок',
      focusIndicators: 'Видимые рамки фокуса',
      shortcuts: 'Ctrl+E экспорт, Ctrl+R обновить',
    },

    // Поддержка скрин-ридеров
    screenReaders: {
      chartDescriptions: 'Текстовые описания для всех графиков',
      dataTable: 'Альтернативное табличное представление',
      liveAnnouncements: 'Объявления изменений данных',
    },
  },

  // Требования к тестированию
  testing: {
    // Покрытие тестами
    coverage: {
      unit: '90%',
      integration: '80%',
      e2e: '70%',
    },

    // Обязательные тесты
    required: [
      'MetricCard rendering',
      'Chart data loading',
      'Time range filtering',
      'Export functionality',
      'Error states handling',
      'Loading states',
      'Responsive layout',
      'Keyboard navigation',
      'Screen reader compatibility',
    ],

    // Фикстуры данных
    fixtures: {
      'mockDashboardStats.ts': 'Моковые данные статистики',
      'chartDataMocks.ts': 'Данные для графиков',
      'performanceMetrics.ts': 'Метрики производительности',
    },

    // Performance тесты
    performance: [
      'Время рендеринга < 300ms',
      'Память < 10MB',
      'FCP < 1.5s',
      'LCP < 2.5s',
    ],
  },

  // Стилизация и темизация
  styling: {
    // Material-UI компоненты
    muiComponents: [
      'Card',
      'CardContent', 
      'Typography',
      'Grid',
      'Box',
      'Skeleton',
      'Tooltip',
      'IconButton',
    ],

    // Кастомные стили
    customStyles: {
      metricCard: 'Градиенты и тени',
      charts: 'Кастомные цвета и анимации',
      tooltips: 'Расширенный контент',
    },

    // Темы
    themes: {
      light: 'Светлая тема по умолчанию',
      dark: 'Поддержка темной темы',
      contrast: 'Высококонтрастная версия',
    },

    // Адаптивность
    breakpoints: {
      xs: 'Мобильная версия',
      sm: 'Планшет',
      md: 'Десктоп',
      lg: 'Широкий экран',
    },
  },

  // Интеграционные требования
  integration: {
    // Entities слой
    entities: {
      'dashboard': 'Основные типы данных и API',
      'user': 'Данные пользователей',
      'project': 'Проектные метрики',
    },

    // Features слой
    features: {
      'dashboard': 'Бизнес-логика дашборда',
      'charts': 'Функции работы с графиками',
    },

    // Shared ресурсы
    shared: {
      'ui': 'Базовые UI компоненты',
      'hooks': 'useDebounce, useLocalStorage',
      'utils': 'formatters, validators',
      'types': 'Общие TypeScript типы',
    },

    // API эндпоинты
    api: [
      '/api/v1/dashboard/stats',
      '/api/v1/dashboard/metrics',
      '/api/v1/dashboard/export/stats',
    ],
  },

  // FSD соответствие
  fsd: {
    // Правила импортов
    imports: {
      allowed: [
        '@/entities/dashboard',
        '@/features/dashboard', 
        '@/shared/**',
        '@mui/**',
        'recharts',
      ],
      forbidden: [
        '@/pages/**',
        '@/widgets/**',
        '@/app/**',
      ],
    },

    // Публичный API
    publicApi: {
      components: ['DashboardStatsWidget'],
      types: ['DashboardStatsProps', 'MetricData'],
      hooks: ['useDashboardStats'],
    },

    // Изоляция слайсов
    isolation: {
      noCrossDependencies: true,
      ownState: true,
      explicitApi: true,
    },
  },

  // Мониторинг и метрики
  monitoring: {
    // Производительность
    performance: [
      'render-time',
      'memory-usage',
      'chart-load-time',
      'data-fetch-time',
    ],

    // Пользовательские метрики
    user: [
      'widget-views',
      'metric-clicks',
      'export-usage',
      'time-range-changes',
    ],

    // Ошибки
    errors: [
      'chart-render-errors',
      'api-failures',
      'export-failures',
    ],
  },

  // Документация
  documentation: {
    // Обязательные документы
    required: [
      'README.md - Обзор виджета',
      'API.md - Интерфейсы компонентов',
      'PERFORMANCE.md - Руководство по производительности',
      'ACCESSIBILITY.md - Рекомендации по доступности',
    ],

    // Примеры использования
    examples: [
      'BasicUsage.tsx',
      'CustomMetrics.tsx',
      'ResponsiveLayout.tsx',
      'ExportIntegration.tsx',
    ],

    // Storybook истории
    stories: [
      'Default.stories.tsx',
      'Loading.stories.tsx',
      'Error.stories.tsx',
      'CustomTheme.stories.tsx',
    ],
  },

  // Валидация конфигурации
  validation: {
    // Схемы валидации
    schemas: {
      props: 'DashboardStatsPropsSchema',
      data: 'MetricDataSchema',
      config: 'WidgetConfigSchema',
    },

    // Проверки времени выполнения
    runtime: {
      propTypes: true,
      dataValidation: true,
      performanceAssertions: true,
    },
  },
};

export default dashboardStatsConfig; 