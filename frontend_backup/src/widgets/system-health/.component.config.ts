/**
 * System Health Widget Configuration
 * Конфигурация виджета состояния системы
 */

export const systemHealthWidgetConfig = {
  // Метаданные виджета
  meta: {
    layer: 'widgets',
    widget: 'system-health',
    description: 'Виджет мониторинга состояния системы и ключевых метрик производительности',
    version: '1.0.0',
  },

  // Требования к производительности
  performance: {
    // Real-time обновления
    realTime: {
      enabled: true,
      updateInterval: 5000, // 5 секунд для критичных метрик
      batchUpdates: true,
      reconnectAttempts: 5,
      fallbackInterval: 30000, // 30 секунд при проблемах
    },

    // Мемоизация
    memoization: {
      SystemHealthWidget: {
        enabled: true,
        dependencies: ['healthData', 'layout', 'thresholds', 'alerts'],
        shallowCompare: false,
      },
      HealthIndicator: {
        enabled: true,
        dependencies: ['value', 'threshold', 'status', 'trend'],
        shallowCompare: true,
      },
      MetricChart: {
        enabled: true,
        dependencies: ['data', 'timeRange', 'chartType'],
        shallowCompare: false,
      },
    },

    // Кэширование
    caching: {
      historicalData: '1 hour',
      thresholds: '10 minutes',
      alerts: '30 seconds',
    },

    // Метрики
    metrics: {
      loadTime: '< 200ms',
      updateLatency: '< 1s',
      memoryUsage: '< 5MB',
      chartRenderTime: '< 300ms',
    },
  },

  // Функциональные требования
  functionality: {
    // Отслеживаемые метрики
    systemMetrics: [
      'cpuUsage',
      'memoryUsage',
      'diskUsage',
      'networkIO',
      'activeUsers',
      'responseTime',
      'errorRate',
      'throughput',
      'uptime',
      'dbConnections',
      'queueSize',
      'cacheHitRate',
    ],

    // Уровни состояния
    healthLevels: [
      'excellent', // 90-100%
      'good',      // 75-89%
      'warning',   // 50-74%
      'critical',  // 25-49%
      'error',     // 0-24%
    ],

    // Типы алертов
    alertTypes: [
      'cpu_high',
      'memory_high',
      'disk_full',
      'response_slow',
      'error_spike',
      'service_down',
      'connection_limit',
      'security_breach',
    ],

    // Режимы отображения
    displayModes: ['dashboard', 'compact', 'detailed', 'alerts-only'],

    // Временные интервалы
    timeRanges: ['1h', '6h', '24h', '7d', '30d'],

    // Группировка метрик
    metricGroups: {
      system: ['cpuUsage', 'memoryUsage', 'diskUsage'],
      performance: ['responseTime', 'throughput', 'errorRate'],
      database: ['dbConnections', 'cacheHitRate'],
      users: ['activeUsers', 'uptime'],
    },
  },

  // UI/UX требования
  ux: {
    // Адаптивность
    responsive: {
      xs: 'critical metrics only',
      sm: 'compact dashboard',
      md: 'standard dashboard',
      lg: 'detailed view with charts',
      xl: 'full dashboard with trends',
    },

    // Анимации
    animations: {
      healthChange: 'color 0.5s ease-in-out',
      chartUpdate: 'transform 0.3s ease-out',
      alertPulse: 'pulse 2s infinite',
      metricUpdate: 'scale 0.2s ease-out',
      progressBar: 'width 1s ease-out',
    },

    // Цветовое кодирование
    statusColors: {
      excellent: 'success.main',
      good: 'success.light',
      warning: 'warning.main',
      critical: 'error.light',
      error: 'error.main',
      unknown: 'grey.500',
    },

    // Интерактивность
    interactions: {
      metricDetails: 'click for detailed view',
      alertActions: ['acknowledge', 'silence', 'escalate'],
      chartZoom: true,
      exportData: true,
      customThresholds: true,
    },

    // Визуализация
    dataVisualization: {
      gauges: 'for single metrics',
      sparklines: 'for trends',
      barCharts: 'for comparisons',
      lineCharts: 'for time series',
      heatmaps: 'for multi-dimensional data',
    },
  },

  // Стандарты доступности
  accessibility: {
    // WCAG соответствие
    wcag: {
      level: 'AA',
      guidelines: ['1.3.1', '1.4.1', '1.4.3', '2.1.1', '4.1.2'],
    },

    // ARIA атрибуты
    aria: {
      widget: {
        role: 'region',
        'aria-label': 'System health dashboard',
        'aria-live': 'polite', // для обновлений метрик
      },
      metrics: {
        role: 'img',
        'aria-label': '{metricName}: {value} ({status})',
        'aria-describedby': 'metric description and threshold',
      },
      alerts: {
        role: 'alert',
        'aria-label': 'system alert: {alertMessage}',
        'aria-live': 'assertive', // для критичных алертов
      },
      charts: {
        role: 'img',
        'aria-label': 'chart showing {metricName} over time',
        'aria-describedby': 'chart data summary',
      },
    },

    // Навигация с клавиатуры
    keyboard: {
      navigation: 'Tab/Shift+Tab for metrics',
      selection: 'Enter/Space for metric details',
      alerts: 'arrow keys for alert navigation',
      shortcuts: {
        refresh: 'F5',
        alerts: 'Alt+A',
        details: 'Alt+D',
        export: 'Ctrl+E',
      },
    },

    // Альтернативы для цветового кодирования
    colorAlternatives: {
      patterns: true, // паттерны для разных статусов
      icons: true,    // иконки состояния
      text: true,     // текстовые индикаторы
    },

    // Скринридеры
    screenReader: {
      announcements: [
        'System health updated',
        'New alert: {alertMessage}',
        'Metric threshold exceeded: {metricName}',
        'System status changed to {status}',
      ],
      descriptions: [
        'Overall system health: {overallStatus}',
        '{metricName} is {value} out of {threshold}',
        'Trend: {trendDirection} over {timeRange}',
      ],
    },
  },

  // Требования к тестированию
  testing: {
    // Покрытие кода
    coverage: {
      statements: 95, // Высокие требования для критичного компонента
      branches: 90,
      functions: 95,
      lines: 95,
    },

    // Обязательные тесты
    required: {
      unit: [
        'SystemHealthWidget - render health data',
        'SystemHealthWidget - handle real-time updates',
        'SystemHealthWidget - calculate overall status',
        'HealthIndicator - render metric status',
        'HealthIndicator - handle threshold changes',
        'MetricChart - render time series data',
        'Alert handling and display',
        'Status color calculations',
      ],
      integration: [
        'Real-time data updates flow',
        'Alert system integration',
        'Threshold configuration',
        'Chart interactivity',
      ],
      e2e: [
        'Health monitoring dashboard',
        'Alert response workflow',
        'Threshold breach scenarios',
        'Data export functionality',
      ],
      performance: [
        'Real-time updates performance',
        'Large dataset rendering',
        'Memory usage optimization',
        'Chart rendering speed',
      ],
    },

    // Тестовые данные
    fixtures: {
      healthData: {
        healthy: 'all metrics in good range',
        warning: 'some metrics approaching thresholds',
        critical: 'metrics exceeding thresholds',
        mixed: 'combination of different statuses',
        historical: 'time-series data for trends',
      },
      alerts: {
        none: 'no active alerts',
        low: 'minor warnings',
        high: 'critical system issues',
        resolved: 'acknowledged alerts',
      },
    },
  },

  // Алертинг и мониторинг
  alerting: {
    // Типы уведомлений
    notificationTypes: [
      'browser', // Browser notifications
      'email',   // Email alerts
      'webhook', // Webhook calls
      'sms',     // SMS for critical alerts
    ],

    // Правила эскалации
    escalation: {
      warning: '15 minutes',
      critical: '5 minutes',
      error: '1 minute',
    },

    // Группировка алертов
    grouping: {
      byService: true,
      byMetric: true,
      bySeverity: true,
      timeWindow: '10 minutes',
    },

    // Подавление алертов
    suppression: {
      maintenance: true,
      duplicates: true,
      dependency: true, // если родительский сервис недоступен
    },
  },

  // Стилизация
  styling: {
    // Цветовая схема
    colors: {
      background: 'background.paper',
      cardBackground: 'background.default',
      excellent: '#4caf50',
      good: '#8bc34a',
      warning: '#ff9800',
      critical: '#f44336',
      error: '#d32f2f',
      unknown: '#9e9e9e',
      chartGrid: 'grey.200',
      alertBadge: 'error.main',
    },

    // Типографика
    typography: {
      metricValue: 'h4',
      metricLabel: 'caption',
      alertTitle: 'subtitle1',
      alertMessage: 'body2',
      chartLabel: 'caption',
    },

    // Размеры
    dimensions: {
      metricCardWidth: 200,
      metricCardHeight: 120,
      compactCardHeight: 80,
      chartHeight: 200,
      alertItemHeight: 60,
      gaugeSize: 100,
    },

    // Эффекты
    effects: {
      cardElevation: 1,
      alertElevation: 3,
      borderRadius: 4,
      pulseAnimation: 'pulse 2s infinite',
    },
  },

  // Интеграционные требования
  integration: {
    // Props interface
    props: {
      required: ['healthData'],
      optional: [
        'layout', 'thresholds', 'alerts', 'realTimeEnabled',
        'onMetricClick', 'onAlertAction', 'onThresholdChange'
      ],
    },

    // События
    events: {
      outgoing: [
        'metricClick',
        'alertAction',
        'thresholdChange',
        'exportRequest',
        'refreshRequest',
      ],
      incoming: [
        'healthDataUpdate',
        'alertUpdate',
        'thresholdUpdate',
        'configUpdate',
      ],
    },

    // External services
    externalServices: {
      metricsAPI: 'system metrics data source',
      alertAPI: 'alert management system',
      notificationService: 'alert notifications',
      exportService: 'data export functionality',
      configService: 'threshold configuration',
    },

    // WebSocket интеграция
    webSocket: {
      endpoint: '/ws/health',
      events: ['metric_update', 'alert_created', 'alert_resolved'],
      reconnect: true,
      heartbeat: 30000,
    },
  },

  // FSD соответствие
  fsd: {
    // Импорты
    imports: {
      allowed: [
        '@/entities/system',
        '@/shared/ui',
        '@/shared/types',
        '@/shared/utils',
        '@mui/material',
        '@mui/icons-material',
        'react',
        'recharts', // для графиков
      ],
      forbidden: [
        '@/entities/user',  // не должен зависеть от пользователей
        '@/entities/project', // не должен зависеть от проектов
        '@/features/*',
        '@/pages/*',
        '@/app/*'
      ],
    },

    // Зависимости
    dependencies: {
      entities: ['system'],
      shared: ['ui', 'types', 'utils', 'api'],
      features: ['none'],
    },

    // Exports
    exports: {
      components: ['SystemHealthWidget'],
      types: ['SystemHealthWidgetProps', 'HealthMetric', 'SystemAlert'],
    },
  },

  // Безопасность
  security: {
    // Доступ к метрикам
    access: {
      requireAuth: true,
      minimumRole: 'operator',
      sensitiveMetrics: ['dbConnections', 'errorRate'],
    },

    // Валидация данных
    validation: {
      validateMetrics: true,
      sanitizeAlerts: true,
      validateThresholds: true,
    },
  },

  // Мониторинг самого виджета
  monitoring: {
    // KPI
    kpi: {
      dataFreshness: '< 10s', // свежесть данных
      alertLatency: '< 2s',   // время до показа алерта
      uptime: '> 99.9%',      // доступность виджета
      accuracy: '> 99.5%',    // точность отображения метрик
    },

    // Метрики виджета
    metrics: [
      'widget_rendered',
      'metric_updated',
      'alert_displayed',
      'threshold_breached',
      'user_interaction',
      'data_export',
      'websocket_reconnect',
    ],

    // Алерты виджета
    alerts: {
      dataStale: 'metrics older than 30s',
      websocketDisconnect: 'connection lost',
      renderError: 'component render failure',
      highMemoryUsage: 'widget memory > 10MB',
    },
  },

  // Валидация
  validation: {
    // Схемы данных
    schemas: {
      healthData: 'required: metrics array, timestamp',
      metric: 'required: name, value, threshold, status',
      alert: 'required: id, type, severity, message, timestamp',
      threshold: 'required: metricName, warning, critical',
    },

    // Runtime проверки
    runtime: {
      metricValidation: 'validate metric data types and ranges',
      thresholdValidation: 'validate threshold configuration',
      alertValidation: 'validate alert structure and content',
    },

    // Business logic validation
    business: {
      thresholdLogic: 'warning < critical thresholds',
      metricRanges: 'values within expected ranges',
      alertPriority: 'severity levels properly ordered',
    },
  },
};

export default systemHealthWidgetConfig; 