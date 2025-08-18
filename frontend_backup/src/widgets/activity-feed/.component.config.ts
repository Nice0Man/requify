/**
 * Activity Feed Widget Configuration
 * Конфигурация виджета ленты активности
 */

export const activityFeedWidgetConfig = {
  // Метаданные виджета
  meta: {
    layer: 'widgets',
    widget: 'activity-feed',
    description: 'Виджет отображения ленты активности пользователей и системных событий',
    version: '1.0.0',
  },

  // Требования к производительности
  performance: {
    // Виртуализация
    virtualization: {
      enabled: true,
      threshold: 25, // Включать виртуализацию при >25 элементах
      overscan: 3,
      estimatedItemSize: 80, // Высота элемента активности
      bufferSize: 10,
    },

    // Мемоизация
    memoization: {
      ActivityFeedWidget: {
        enabled: true,
        dependencies: ['activities.length', 'loading', 'filters', 'viewMode'],
        shallowCompare: false,
      },
      ActivityItem: {
        enabled: true,
        dependencies: ['activity.id', 'activity.timestamp', 'compact'],
        shallowCompare: true,
      },
    },

    // Real-time обновления
    realTime: {
      enabled: true,
      updateInterval: 30000, // 30 секунд
      batchUpdates: true,
      maxBatchSize: 10,
    },

    // Метрики
    metrics: {
      loadTime: '< 200ms',
      scrollPerformance: '60fps',
      memoryUsage: '< 3MB per 100 activities',
      updateDelay: '< 500ms', // для real-time обновлений
    },
  },

  // Функциональные требования
  functionality: {
    // Типы активности
    activityTypes: [
      'user_login',
      'user_logout', 
      'requirement_created',
      'requirement_updated',
      'requirement_status_changed',
      'project_created',
      'project_updated',
      'release_published',
      'test_executed',
      'comment_posted',
      'team_member_added',
      'system_notification',
    ],

    // Фильтрация
    filtering: {
      byType: true,
      byUser: true,
      byProject: true,
      byDateRange: true,
      byImportance: true,
    },

    // Группировка
    grouping: {
      byDate: true,
      byProject: true,
      byUser: true,
      automatic: true, // автоматическая группировка похожих событий
    },

    // Режимы отображения
    viewModes: ['feed', 'timeline', 'compact', 'cards'],
  },

  // UI/UX требования
  ux: {
    // Адаптивность
    responsive: {
      xs: 'compact mode only',
      sm: 'simplified filters',
      md: 'full functionality',
      lg: 'enhanced view with sidebars',
    },

    // Анимации
    animations: {
      newActivity: 'slideIn 0.3s ease-out',
      groupExpand: 'expandHeight 0.2s ease-in-out',
      filterChange: 'fadeTransition 0.2s ease-in-out',
      autoScroll: 'smooth scrolling to new items',
    },

    // Интерактивность
    interactions: {
      clickableItems: true,
      hoverEffects: true,
      quickActions: ['like', 'comment', 'share'],
      contextMenu: true,
    },
  },

  // Стандарты доступности
  accessibility: {
    // WCAG соответствие
    wcag: {
      level: 'AA',
      guidelines: ['1.3.1', '2.1.1', '2.4.3', '4.1.2'],
    },

    // ARIA атрибуты
    aria: {
      widget: {
        role: 'feed',
        'aria-label': 'Activity feed',
        'aria-live': 'polite', // для новых активностей
        'aria-busy': 'during loading',
      },
      items: {
        role: 'article',
        'aria-label': 'activity description',
        'aria-posinset': 'position in feed',
        'aria-setsize': 'total activities',
      },
    },

    // Навигация с клавиатуры
    keyboard: {
      navigation: 'arrow keys for scrolling',
      selection: 'Enter/Space for item selection',
      shortcuts: {
        refresh: 'F5',
        filter: 'Ctrl+F',
        newFirst: 'Home',
        oldFirst: 'End',
      },
    },

    // Скринридеры
    screenReader: {
      announcements: [
        'New activity available',
        'Activity feed updated',
        'Filter applied',
        '{count} activities loaded',
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
        'ActivityFeedWidget - render activities',
        'ActivityFeedWidget - handle loading states',
        'ActivityFeedWidget - apply filters',
        'ActivityFeedWidget - group activities',
        'ActivityItem - render activity data',
        'ActivityItem - handle interactions',
        'Real-time updates integration',
      ],
      integration: [
        'Activity feed + filters interaction',
        'Real-time updates flow',
        'Activity click navigation',
        'Feed refresh functionality',
      ],
      performance: [
        'Large activity list rendering',
        'Real-time updates performance',
        'Memory usage with long feeds',
      ],
    },

    // Тестовые данные
    fixtures: {
      activities: {
        empty: 'no activities',
        few: '5-10 activities',
        many: '100+ activities',
        realTime: 'streaming activities',
        grouped: 'activities with grouping',
      },
    },
  },

  // Стилизация
  styling: {
    // Цветовая схема
    colors: {
      background: 'background.paper',
      item: 'background.default',
      hover: 'action.hover',
      selected: 'primary.light',
      grouped: 'grey.50',
      importance: {
        low: 'text.secondary',
        medium: 'text.primary', 
        high: 'warning.main',
        critical: 'error.main',
      },
    },

    // Типографика
    typography: {
      activityTitle: 'body2',
      activityDescription: 'caption',
      timestamp: 'caption',
      groupHeader: 'subtitle2',
    },

    // Размеры
    dimensions: {
      itemHeight: 80,
      compactItemHeight: 48,
      groupHeaderHeight: 32,
      maxWidth: 400,
      minWidth: 280,
    },
  },

  // Интеграционные требования
  integration: {
    // Props interface
    props: {
      required: ['activities'],
      optional: [
        'loading', 'error', 'filters', 'viewMode',
        'onActivityClick', 'onRefresh', 'onFilterChange'
      ],
    },

    // События
    events: {
      outgoing: [
        'activityClick',
        'activityAction', 
        'filterChange',
        'refreshRequest',
        'loadMore',
      ],
      incoming: [
        'newActivity',
        'activitiesUpdate',
        'filterUpdate',
      ],
    },

    // External services
    externalServices: {
      activityAPI: 'activity data source',
      realTimeService: 'WebSocket for live updates',
      userService: 'user information',
      notificationService: 'activity notifications',
    },
  },

  // FSD соответствие
  fsd: {
    // Импорты
    imports: {
      allowed: [
        '@/entities/user',
        '@/entities/project',
        '@/entities/requirement',
        '@/shared/ui',
        '@/shared/types',
        '@/shared/utils',
        '@mui/material',
        'react'
      ],
      forbidden: [
        '@/pages/*',
        '@/app/*'
      ],
    },

    // Зависимости
    dependencies: {
      entities: ['user', 'project', 'requirement'],
      shared: ['ui', 'types', 'utils', 'api'],
      features: ['none'], // виджет не зависит от features
    },
  },

  // Мониторинг
  monitoring: {
    // KPI
    kpi: {
      engagementRate: '> 25%', // процент кликов по активностям
      loadTime: '< 200ms',
      realTimeLatency: '< 1s',
      errorRate: '< 1%',
    },

    // Метрики
    metrics: [
      'activity_viewed',
      'activity_clicked', 
      'filter_used',
      'real_time_update_received',
      'load_more_triggered',
    ],

    // Алерты
    alerts: {
      slowLoading: 'load time > 500ms',
      realTimeDisconnect: 'WebSocket disconnected',
      highErrorRate: 'error rate > 2%',
    },
  },

  // Валидация
  validation: {
    // Схемы данных
    schemas: {
      activity: 'required: id, type, timestamp, user, description',
      filters: 'optional: types, users, projects, dateRange',
    },

    // Runtime проверки
    runtime: {
      activityValidation: 'validate activity structure',
      timestampValidation: 'validate timestamp format',
      userValidation: 'validate user references',
    },
  },
};

export default activityFeedWidgetConfig; 