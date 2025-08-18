/**
 * Quick Actions Widget Configuration
 * Конфигурация виджета быстрых действий
 */

export const quickActionsWidgetConfig = {
  // Метаданные виджета
  meta: {
    layer: 'widgets',
    widget: 'quick-actions',
    description: 'Виджет быстрых действий для создания и управления сущностями',
    version: '1.0.0',
  },

  // Требования к производительности
  performance: {
    // Мемоизация
    memoization: {
      QuickActionsWidget: {
        enabled: true,
        dependencies: ['actions', 'permissions', 'layout', 'theme'],
        shallowCompare: true,
      },
      ActionButton: {
        enabled: true,
        dependencies: ['action.id', 'action.enabled', 'loading'],
        shallowCompare: true,
      },
    },

    // Lazy loading
    lazyLoading: {
      enabled: true,
      actionModals: true, // Ленивая загрузка модальных окон
      iconComponents: true, // Ленивая загрузка иконок
    },

    // Метрики
    metrics: {
      renderTime: '< 50ms',
      actionTriggerDelay: '< 100ms',
      memoryUsage: '< 1MB',
      animationFrameRate: '60fps',
    },
  },

  // Функциональные требования
  functionality: {
    // Типы действий
    actionTypes: [
      'create_requirement',
      'create_project',
      'create_release',
      'create_test_case',
      'add_team_member',
      'import_data',
      'export_data',
      'run_tests',
      'generate_report',
      'send_notification',
      'backup_data',
      'system_settings',
    ],

    // Группировка действий
    actionGroups: {
      creation: ['create_requirement', 'create_project', 'create_release'],
      testing: ['create_test_case', 'run_tests'],
      management: ['add_team_member', 'system_settings'],
      data: ['import_data', 'export_data', 'backup_data'],
      reporting: ['generate_report', 'send_notification'],
    },

    // Режимы отображения
    displayModes: ['grid', 'list', 'toolbar', 'floating', 'contextual'],

    // Настройки
    customization: {
      userConfigurable: true,
      reorderActions: true,
      hideActions: true,
      customLabels: true,
      customIcons: true,
    },
  },

  // UI/UX требования
  ux: {
    // Адаптивность
    responsive: {
      xs: 'floating action button only',
      sm: 'compact toolbar',
      md: 'full grid layout',
      lg: 'enhanced with descriptions',
    },

    // Анимации
    animations: {
      actionHover: 'scale 0.1s ease-out',
      actionClick: 'ripple 0.3s ease-out',
      groupExpand: 'slideDown 0.2s ease-in-out',
      modalOpen: 'fadeIn 0.3s ease-out',
      loadingSpinner: 'rotate infinite linear',
    },

    // Интерактивность
    interactions: {
      quickAccess: true, // Быстрый доступ по клавишам
      dragDrop: true, // Перетаскивание для настройки
      contextMenu: true, // Контекстное меню
      tooltips: true, // Подсказки
      badges: true, // Уведомления на действиях
    },

    // Визуальные состояния
    states: {
      default: 'normal action state',
      hover: 'highlighted on hover',
      active: 'pressed/clicked state',
      disabled: 'action not available',
      loading: 'action in progress',
      success: 'action completed successfully',
      error: 'action failed',
    },
  },

  // Стандарты доступности
  accessibility: {
    // WCAG соответствие
    wcag: {
      level: 'AA',
      guidelines: ['2.1.1', '2.4.3', '3.2.1', '4.1.2'],
    },

    // ARIA атрибуты
    aria: {
      widget: {
        role: 'toolbar',
        'aria-label': 'Quick actions',
        'aria-orientation': 'horizontal',
      },
      actions: {
        role: 'button',
        'aria-label': 'action description',
        'aria-pressed': 'for toggle actions',
        'aria-disabled': 'for disabled actions',
        'aria-describedby': 'tooltip or help text',
      },
      groups: {
        role: 'group',
        'aria-label': 'action group name',
      },
    },

    // Навигация с клавиатуры
    keyboard: {
      navigation: 'Tab/Shift+Tab for focus management',
      selection: 'Enter/Space for action execution',
      shortcuts: {
        createRequirement: 'Ctrl+R',
        createProject: 'Ctrl+P',
        createRelease: 'Ctrl+L',
        runTests: 'Ctrl+T',
        settings: 'Ctrl+,',
      },
    },

    // Скринридеры
    screenReader: {
      announcements: [
        'Action executed successfully',
        'Action failed',
        'Quick actions loaded',
        '{actionName} available',
      ],
    },
  },

  // Требования к тестированию
  testing: {
    // Покрытие кода
    coverage: {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },

    // Обязательные тесты
    required: {
      unit: [
        'QuickActionsWidget - render actions',
        'QuickActionsWidget - handle permissions',
        'QuickActionsWidget - display modes',
        'ActionButton - click handling',
        'ActionButton - loading states',
        'ActionButton - disabled states',
        'Action groups rendering',
        'Keyboard shortcuts',
      ],
      integration: [
        'Action execution flow',
        'Permission-based filtering',
        'Modal integration',
        'Navigation integration',
      ],
      e2e: [
        'Create requirement flow',
        'Create project flow',
        'Run tests flow',
        'Keyboard navigation',
      ],
      performance: [
        'Large action set rendering',
        'Animation performance',
        'Memory usage optimization',
      ],
    },

    // Тестовые данные
    fixtures: {
      actions: {
        minimal: '3-5 basic actions',
        full: 'all available actions',
        grouped: 'actions with grouping',
        restricted: 'limited by permissions',
      },
      permissions: {
        admin: 'full access',
        manager: 'limited management',
        user: 'basic actions only',
        readonly: 'no actions available',
      },
    },
  },

  // Стилизация
  styling: {
    // Цветовая схема
    colors: {
      background: 'background.paper',
      action: 'primary.main',
      actionHover: 'primary.dark',
      actionDisabled: 'action.disabled',
      actionSuccess: 'success.main',
      actionError: 'error.main',
      groupHeader: 'text.secondary',
      badge: 'error.main',
    },

    // Типографика
    typography: {
      actionLabel: 'button',
      actionDescription: 'caption',
      groupHeader: 'overline',
      tooltip: 'caption',
    },

    // Размеры
    dimensions: {
      actionButtonSize: 56, // FAB standard
      compactButtonSize: 40,
      toolbarHeight: 64,
      gridSpacing: 16,
      iconSize: 24,
    },

    // Эффекты
    effects: {
      elevation: 2, // для floating buttons
      borderRadius: 4,
      hoverElevation: 4,
      rippleEffect: true,
      focusRing: true,
    },
  },

  // Интеграционные требования
  integration: {
    // Props interface
    props: {
      required: ['actions'],
      optional: [
        'layout', 'permissions', 'onActionClick',
        'customActions', 'theme', 'disabled'
      ],
    },

    // События
    events: {
      outgoing: [
        'actionClick',
        'actionComplete',
        'actionError',
        'customizationChange',
      ],
      incoming: [
        'permissionsUpdate',
        'actionsUpdate',
        'themeChange',
      ],
    },

    // External services
    externalServices: {
      permissionService: 'action permissions check',
      navigationService: 'routing for actions',
      notificationService: 'action result notifications',
      auditService: 'action logging',
    },

    // Action handlers
    actionHandlers: {
      creation: '@/features/create-*',
      navigation: '@/app/router',
      data: '@/features/data-management',
      testing: '@/features/testing',
    },
  },

  // FSD соответствие
  fsd: {
    // Импорты
    imports: {
      allowed: [
        '@/shared/ui',
        '@/shared/types',
        '@/shared/utils',
        '@mui/material',
        '@mui/icons-material',
        'react'
      ],
      forbidden: [
        '@/entities/*', // виджет не должен знать об entities
        '@/pages/*',
        '@/app/*'
      ],
    },

    // Зависимости
    dependencies: {
      entities: ['none'],
      shared: ['ui', 'types', 'utils'],
      features: ['none'], // получает handlers через props
    },

    // Exports
    exports: {
      components: ['QuickActionsWidget'],
      types: ['QuickActionsWidgetProps', 'ActionConfig', 'ActionHandler'],
    },
  },

  // Безопасность
  security: {
    // Проверки разрешений
    permissions: {
      required: true,
      checkOnRender: true,
      checkOnAction: true,
      fallbackBehavior: 'hide', // или 'disable'
    },

    // Аудит
    audit: {
      logActions: true,
      logFailures: true,
      includeUserContext: true,
      includeTimestamp: true,
    },

    // Валидация
    validation: {
      validatePermissions: true,
      validateActionConfig: true,
      sanitizeInputs: true,
    },
  },

  // Мониторинг
  monitoring: {
    // KPI
    kpi: {
      usageRate: '> 40%', // процент использования действий
      completionRate: '> 85%', // процент успешных выполнений
      errorRate: '< 2%',
      averageActionTime: '< 500ms',
    },

    // Метрики
    metrics: [
      'action_clicked',
      'action_completed',
      'action_failed',
      'widget_rendered',
      'permissions_checked',
      'customization_changed',
    ],

    // A/B тестирование
    experiments: {
      layoutOptimization: 'test different layouts',
      actionGrouping: 'test grouping strategies',
      iconVsText: 'test icon vs text labels',
    },
  },

  // Валидация
  validation: {
    // Схемы данных
    schemas: {
      action: 'required: id, label, handler; optional: icon, description, group',
      permissions: 'object with action permissions',
      layout: 'enum: grid, list, toolbar, floating, contextual',
    },

    // Runtime проверки
    runtime: {
      actionValidation: 'validate action configuration',
      permissionValidation: 'validate user permissions',
      handlerValidation: 'validate action handlers exist',
    },
  },
};

export default quickActionsWidgetConfig; 