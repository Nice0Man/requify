/**
 * Конфигурация компонентов страницы Admin
 * @description Определяет правила разработки для административной панели
 */

export const adminPageConfig = {
  performance: {
    // Оптимизация загрузки
    lazyLoading: true,
    memoizeAdminSections: true,
    preloadCriticalData: true,
    
    // Целевые метрики
    metrics: {
      firstContentfulPaint: '<1.5s',
      largestContentfulPaint: '<2.5s',
      actionResponse: '<1s',
      dataRefresh: '<3s'
    },
    
    // Оптимизации
    optimizations: [
      'React.memo для секций',
      'useMemo для конфигураций',
      'useCallback для навигации',
      'Lazy loading для модулей админки',
      'Кэширование разрешений'
    ]
  },

  functionality: {
    // Административные секции
    sections: [
      'userManagement',
      'systemSettings',
      'security',
      'analytics',
      'notifications',
      'database'
    ],
    
    // Быстрые действия
    quickActions: [
      'Просмотр пользователей',
      'Системный отчет',
      'Журнал аудита',
      'Backup системы',
      'Мониторинг производительности'
    ],
    
    // Права доступа
    permissions: {
      levels: ['super_admin', 'admin', 'moderator'],
      restrictions: 'role-based access control',
      audit: 'все действия логируются'
    },
    
    // Навигация
    navigation: {
      sections: 'card-based interface',
      breadcrumbs: true,
      backNavigation: true,
      deepLinks: 'поддержка прямых ссылок'
    }
  },

  security: {
    // Аутентификация
    authentication: {
      required: true,
      mfa: 'recommended for admin actions',
      sessionTimeout: '30 minutes',
      reauth: 'для критических операций'
    },
    
    // Авторизация
    authorization: {
      rbac: 'role-based access control',
      permissions: 'granular permissions',
      validation: 'server-side + client-side',
      logging: 'все действия в audit log'
    },
    
    // Защита данных
    dataProtection: {
      encryption: 'sensitive data encryption',
      sanitization: 'input/output sanitization',
      validation: 'strict input validation',
      audit: 'comprehensive audit trail'
    }
  },

  ui: {
    // Адаптивность
    responsive: {
      mobile: 'limited functionality warning',
      tablet: 'condensed layout',
      desktop: 'full feature set'
    },
    
    // Анимации
    animations: [
      'Fade in для заголовка',
      'Staggered cards animation',
      'Hover effects на карточках',
      'Loading states для действий'
    ],
    
    // Визуальные индикаторы
    indicators: {
      status: 'system health indicators',
      permissions: 'role-based UI changes',
      actions: 'action feedback',
      alerts: 'critical system alerts'
    }
  },

  accessibility: {
    // ARIA поддержка
    aria: {
      labels: 'all admin controls',
      descriptions: 'complex operations',
      roles: 'semantic admin interface',
      states: 'system states'
    },
    
    // Клавиатурная навигация
    keyboard: {
      tabNavigation: true,
      shortcuts: ['F1 для помощи', 'Esc для отмены'],
      focusManagement: 'trap focus in modals'
    },
    
    // Административная доступность
    adminAccess: {
      screenReader: 'detailed operation descriptions',
      highContrast: 'admin theme support',
      fontSize: 'scalable admin interface'
    }
  },

  testing: {
    // Unit тесты
    unit: {
      coverage: '90%',
      components: ['AdminPage', 'navigation handlers', 'permission checks'],
      security: 'security function testing'
    },
    
    // Integration тесты
    integration: {
      userFlows: [
        'Admin login flow',
        'Section navigation',
        'Quick actions',
        'Permission validation'
      ],
      apiIntegration: 'admin API endpoints'
    },
    
    // Security тесты
    security: {
      authentication: 'auth bypass attempts',
      authorization: 'privilege escalation tests',
      injection: 'XSS/CSRF protection',
      dataAccess: 'unauthorized data access'
    },
    
    // E2E тесты
    e2e: {
      scenarios: [
        'Complete admin workflow',
        'Role-based access',
        'Emergency procedures',
        'Mobile admin access'
      ]
    }
  },

  styling: {
    // Административная тема
    adminTheme: {
      colors: 'professional color scheme',
      typography: 'clear hierarchy',
      spacing: 'generous spacing for controls',
      components: 'consistent admin components'
    },
    
    // Статусные индикаторы
    statusIndicators: {
      success: 'green indicators',
      warning: 'yellow/orange alerts',
      error: 'red critical alerts',
      info: 'blue informational'
    },
    
    // Кастомизация
    customization: {
      sectionCards: 'role-specific styling',
      actionButtons: 'clear action hierarchy',
      statusDisplay: 'prominent status indicators',
      branding: 'consistent admin branding'
    }
  },

  integration: {
    // FSD интеграция
    fsd: {
      layer: 'pages',
      dependencies: [
        '@/shared/ui (PageLayout)',
        '@/widgets/layout',
        '@/features/admin (future)',
        '@/entities/user',
        '@/entities/system'
      ]
    },
    
    // API интеграция
    api: {
      endpoints: [
        '/api/v1/admin/*',
        '/api/v1/users',
        '/api/v1/system-info',
        '/api/v1/audit-log',
        '/api/v1/metrics'
      ],
      caching: 'minimal caching for security',
      errorHandling: 'comprehensive error handling'
    },
    
    // Системная интеграция
    system: {
      monitoring: 'real-time system monitoring',
      alerts: 'critical system alerts',
      backup: 'automated backup systems',
      logging: 'comprehensive audit logging'
    }
  },

  monitoring: {
    // Административные метрики
    metrics: [
      'Admin session duration',
      'Action completion rates',
      'Error frequencies',
      'Security event tracking'
    ],
    
    // Аудит
    audit: {
      actions: 'все административные действия',
      access: 'попытки доступа к админке',
      changes: 'изменения системных настроек',
      errors: 'ошибки и исключения'
    },
    
    // Алерты
    alerts: {
      security: 'suspicious admin activity',
      system: 'system health issues',
      performance: 'performance degradation',
      errors: 'critical error rates'
    }
  },

  validation: {
    // Правила валидации
    rules: [
      'Admin role validation',
      'Permission level checks',
      'Action authorization',
      'Data access validation'
    ],
    
    // Проверки качества
    quality: {
      security: 'security audit tools',
      codeStyle: 'ESLint + Prettier',
      typeScript: 'strict mode',
      accessibility: 'admin-specific a11y'
    },
    
    // Compliance
    compliance: {
      dataProtection: 'GDPR compliance',
      security: 'security best practices',
      audit: 'audit trail requirements',
      backup: 'data retention policies'
    }
  }
} as const;

export type AdminPageConfig = typeof adminPageConfig; 