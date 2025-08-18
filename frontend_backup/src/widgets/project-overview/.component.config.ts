/**
 * Project Overview Widget Configuration
 * Конфигурация виджета обзора проектов
 */

export const projectOverviewWidgetConfig = {
  // Метаданные виджета
  meta: {
    layer: 'widgets',
    widget: 'project-overview',
    description: 'Виджет обзора проектов с ключевыми метриками и статусами',
    version: '1.0.0',
  },

  // Требования к производительности
  performance: {
    // Виртуализация
    virtualization: {
      ProjectList: {
        enabled: true,
        threshold: 20, // Включать виртуализацию при >20 проектах
        overscan: 2,
        estimatedItemSize: 120, // Высота карточки проекта
      },
    },

    // Мемоизация
    memoization: {
      ProjectOverviewWidget: {
        enabled: true,
        dependencies: ['projects', 'layout', 'filters', 'sortOrder'],
        shallowCompare: false,
      },
      ProjectCard: {
        enabled: true,
        dependencies: [
          'project.id', 
          'project.status', 
          'project.progress',
          'project.lastActivity',
          'compact'
        ],
        shallowCompare: false,
      },
      ProjectMetrics: {
        enabled: true,
        dependencies: ['metrics', 'timeRange'],
        shallowCompare: true,
      },
    },

    // Кэширование
    caching: {
      projectData: '5 minutes',
      metrics: '1 minute',
      charts: '10 minutes',
    },

    // Метрики
    metrics: {
      loadTime: '< 300ms',
      renderTime: '< 200ms',
      memoryUsage: '< 10MB per 50 projects',
      chartRenderTime: '< 500ms',
    },
  },

  // Функциональные требования
  functionality: {
    // Отображаемые метрики
    projectMetrics: [
      'totalRequirements',
      'completedRequirements',
      'testCoverage',
      'activeReleases',
      'teamMembers',
      'lastActivity',
      'healthScore',
      'riskLevel',
    ],

    // Статусы проектов
    projectStatuses: [
      'planning',
      'active',
      'on_hold',
      'completed',
      'archived',
      'cancelled',
    ],

    // Фильтрация
    filtering: {
      byStatus: true,
      byOwner: true,
      byTeam: true,
      byHealthScore: true,
      byActivity: true,
      byProgress: true,
    },

    // Сортировка
    sorting: {
      byName: true,
      byStatus: true,
      byProgress: true,
      byLastActivity: true,
      byHealthScore: true,
      byCreatedDate: true,
    },

    // Режимы отображения
    viewModes: ['cards', 'list', 'table', 'timeline', 'kanban'],

    // Группировка
    grouping: {
      byStatus: true,
      byOwner: true,
      byTeam: true,
      byHealthScore: true,
    },
  },

  // UI/UX требования
  ux: {
    // Адаптивность
    responsive: {
      xs: 'single column, compact cards',
      sm: '2 columns, basic info',
      md: '3 columns, full info',
      lg: '4 columns, enhanced metrics',
      xl: 'grid + sidebar with details',
    },

    // Анимации
    animations: {
      cardHover: 'transform 0.2s ease-out',
      progressBar: 'width 1s ease-out',
      statusChange: 'color 0.3s ease-in-out',
      filterUpdate: 'opacity 0.2s ease-in-out',
      chartTransition: 'all 0.5s ease-in-out',
    },

    // Интерактивность
    interactions: {
      cardClick: 'navigate to project details',
      quickActions: ['edit', 'archive', 'share'],
      contextMenu: true,
      dragDrop: 'reorder projects',
      bulkActions: ['archive', 'export', 'update status'],
    },

    // Визуализация данных
    dataVisualization: {
      progressBars: true,
      healthIndicators: true,
      activityTimelines: true,
      statusBadges: true,
      trendCharts: true,
    },
  },

  // Стандарты доступности
  accessibility: {
    // WCAG соответствие
    wcag: {
      level: 'AA',
      guidelines: ['1.3.1', '1.4.3', '2.1.1', '2.4.3', '4.1.2'],
    },

    // ARIA атрибуты
    aria: {
      widget: {
        role: 'region',
        'aria-label': 'Project overview',
        'aria-live': 'polite', // для обновлений данных
      },
      projectCards: {
        role: 'article',
        'aria-label': 'project {name} overview',
        'aria-describedby': 'project metrics and status',
      },
      metrics: {
        role: 'img',
        'aria-label': 'progress bar showing {value}% completion',
      },
      filters: {
        role: 'group',
        'aria-label': 'Project filters',
      },
    },

    // Навигация с клавиатуры
    keyboard: {
      navigation: 'Tab/Shift+Tab for cards',
      selection: 'Enter/Space for project selection',
      filters: 'arrow keys for filter navigation',
      shortcuts: {
        refresh: 'F5',
        newProject: 'Ctrl+N',
        search: 'Ctrl+F',
        viewMode: 'Ctrl+V',
      },
    },

    // Скринридеры
    screenReader: {
      announcements: [
        'Project overview loaded',
        'Filters applied',
        'Projects sorted by {criteria}',
        '{count} projects found',
      ],
      descriptions: [
        'Project {name} with {progress}% completion',
        'Health score: {score}',
        'Last activity: {timeAgo}',
      ],
    },
  },

  // Требования к тестированию
  testing: {
    // Покрытие кода
    coverage: {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },

    // Обязательные тесты
    required: {
      unit: [
        'ProjectOverviewWidget - render projects',
        'ProjectOverviewWidget - handle loading',
        'ProjectOverviewWidget - apply filters',
        'ProjectOverviewWidget - sort projects',
        'ProjectCard - render project data',
        'ProjectCard - handle interactions',
        'ProjectMetrics - calculate and display',
        'Filter and sort combinations',
      ],
      integration: [
        'Project overview + project details navigation',
        'Filter + sort + search interaction',
        'Bulk actions execution',
        'Real-time data updates',
      ],
      visual: [
        'Project cards in all view modes',
        'Progress bars and health indicators',
        'Filter states and interactions',
        'Loading and error states',
      ],
      performance: [
        'Large project list rendering',
        'Chart rendering performance',
        'Filter and sort performance',
      ],
    },

    // Тестовые данные
    fixtures: {
      projects: {
        empty: 'no projects',
        few: '3-5 projects',
        many: '50+ projects',
        mixed: 'various statuses and progress',
        realWorld: 'realistic project data',
      },
      metrics: {
        basic: 'standard project metrics',
        advanced: 'detailed analytics',
        historical: 'time-series data',
      },
    },
  },

  // Стилизация
  styling: {
    // Цветовая схема
    colors: {
      background: 'background.paper',
      cardBackground: 'background.default',
      cardHover: 'action.hover',
      cardSelected: 'primary.light',
      status: {
        planning: 'info.main',
        active: 'success.main',
        on_hold: 'warning.main',
        completed: 'success.dark',
        archived: 'text.disabled',
        cancelled: 'error.main',
      },
      health: {
        excellent: 'success.main',
        good: 'success.light',
        fair: 'warning.main',
        poor: 'error.main',
      },
      progress: {
        bar: 'primary.main',
        background: 'grey.200',
        text: 'text.primary',
      },
    },

    // Типографика
    typography: {
      projectName: 'h6',
      projectDescription: 'body2',
      metrics: 'caption',
      status: 'caption',
      progress: 'body2',
    },

    // Размеры
    dimensions: {
      cardWidth: 280,
      cardHeight: 200,
      compactCardHeight: 120,
      listItemHeight: 80,
      tableRowHeight: 56,
      progressBarHeight: 8,
    },

    // Эффекты
    effects: {
      cardElevation: 1,
      cardHoverElevation: 3,
      borderRadius: 4,
      progressBarRadius: 4,
    },
  },

  // Интеграционные требования
  integration: {
    // Props interface
    props: {
      required: ['projects'],
      optional: [
        'loading', 'error', 'viewMode', 'filters',
        'onProjectClick', 'onProjectAction', 'onFilterChange',
        'metrics', 'realTimeUpdates'
      ],
    },

    // События
    events: {
      outgoing: [
        'projectClick',
        'projectAction',
        'filterChange',
        'sortChange',
        'viewModeChange',
        'bulkAction',
      ],
      incoming: [
        'projectsUpdate',
        'metricsUpdate',
        'statusUpdate',
        'realTimeUpdate',
      ],
    },

    // External services
    externalServices: {
      projectAPI: 'project data source',
      metricsAPI: 'project analytics',
      realTimeService: 'live project updates',
      userService: 'user and team information',
    },

    // Data flow
    dataFlow: {
      projectData: '@/entities/project/api',
      userData: '@/entities/user/api', 
      teamData: '@/entities/team/api',
      navigation: '@/app/router',
    },
  },

  // FSD соответствие
  fsd: {
    // Импорты
    imports: {
      allowed: [
        '@/entities/project',
        '@/entities/user',
        '@/entities/team',
        '@/shared/ui',
        '@/shared/types',
        '@/shared/utils',
        '@mui/material',
        '@mui/icons-material',
        'react'
      ],
      forbidden: [
        '@/features/*', // кроме переданных через props
        '@/pages/*',
        '@/app/*'
      ],
    },

    // Зависимости
    dependencies: {
      entities: ['project', 'user', 'team'],
      shared: ['ui', 'types', 'utils', 'api'],
      features: ['none'], // получает handlers через props
    },

    // Exports
    exports: {
      components: ['ProjectOverviewWidget'],
      types: ['ProjectOverviewWidgetProps', 'ProjectViewMode', 'ProjectFilters'],
    },
  },

  // Мониторинг
  monitoring: {
    // KPI
    kpi: {
      projectClickRate: '> 30%', // процент кликов по проектам
      filterUsageRate: '> 20%', // использование фильтров
      loadTime: '< 300ms',
      userEngagement: '> 60%', // время взаимодействия
    },

    // Метрики
    metrics: [
      'project_viewed',
      'project_clicked',
      'filter_applied',
      'sort_changed',
      'view_mode_changed',
      'bulk_action_performed',
      'widget_rendered',
    ],

    // Аналитика
    analytics: {
      mostViewedProjects: true,
      popularFilters: true,
      userBehaviorPatterns: true,
      performanceMetrics: true,
    },

    // Алерты
    alerts: {
      slowLoading: 'load time > 1s',
      highErrorRate: 'error rate > 3%',
      lowEngagement: 'click rate < 10%',
    },
  },

  // Валидация
  validation: {
    // Схемы данных
    schemas: {
      project: 'required: id, name, status; optional: description, progress, health',
      metrics: 'object with numeric values',
      filters: 'object with filter criteria',
      viewMode: 'enum: cards, list, table, timeline, kanban',
    },

    // Runtime проверки
    runtime: {
      projectValidation: 'validate project data structure',
      metricsValidation: 'validate metrics calculations',
      filterValidation: 'validate filter parameters',
    },

    // Business logic validation
    business: {
      progressValidation: 'progress must be 0-100',
      statusValidation: 'status must be valid enum value',
      healthValidation: 'health score must be 0-100',
    },
  },
};

export default projectOverviewWidgetConfig; 