/**
 * App Navigation Widget Configuration
 * Конфигурация виджета навигации приложения
 */

export const appNavigationConfig = {
  // Метаданные виджета
  meta: {
    layer: 'widgets',
    widget: 'app-navigation',
    description: 'Виджет основной навигации приложения с хлебными крошками и индикаторами активных разделов',
    version: '1.0.0',
    dependencies: [
      '@/features/navigation',
      '@/entities/user',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
    ],
  },

  // Требования к производительности
  performance: {
    // Мемоизация компонентов
    memoization: {
      required: true,
      components: ['AppNavigation', 'NavigationItem', 'Breadcrumbs', 'NavMenu'],
      deps: ['location', 'user', 'permissions'],
    },

    // Ленивая загрузка
    lazy: {
      subMenus: true,
      iconComponents: true,
      tooltips: true,
    },

    // Оптимизация
    optimization: {
      routeMatching: 'useMemo for route calculations',
      iconCaching: true,
      permissionCaching: true,
    },

    // Лимиты производительности
    limits: {
      maxMenuItems: 50,
      maxNestingLevel: 3,
      renderTime: '< 100ms',
      memoryUsage: '< 2MB',
    },
  },

  // Функциональные требования
  functionality: {
    // Основные элементы навигации
    navigation: {
      mainMenu: true,
      breadcrumbs: true,
      activeIndicators: true,
      quickNavigation: true,
    },

    // Структура меню
    menuStructure: {
      hierarchy: 'Многоуровневая структура',
      sections: ['Dashboard', 'Projects', 'Requirements', 'Testing', 'Reports', 'Admin'],
      collapsible: true,
      bookmarks: true,
    },

    // Хлебные крошки
    breadcrumbs: {
      dynamic: true,
      clickable: true,
      contextual: true,
      maxItems: 5,
    },

    // Права доступа
    permissions: {
      roleBasedAccess: true,
      dynamicMenus: true,
      hiddenItems: 'Скрытие недоступных пунктов',
      contextualAccess: true,
    },

    // Поиск по навигации
    search: {
      quickFind: true,
      fuzzySearch: true,
      shortcuts: true,
      recent: true,
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
      behavior: {
        mobile: 'Drawer navigation',
        tablet: 'Collapsible sidebar',
        desktop: 'Full sidebar navigation',
      },
    },

    // Визуальные состояния
    visualStates: {
      active: 'Background highlight + border',
      hover: 'Subtle background change',
      focus: 'Focus ring + highlight',
      disabled: 'Opacity 0.5 + no interaction',
    },

    // Анимации
    animations: {
      menuToggle: 'slide 0.3s ease',
      itemHover: 'background 0.2s ease',
      breadcrumbChange: 'fade 0.3s ease',
      submenuExpand: 'height 0.25s ease',
    },

    // Интерактивность
    interactions: {
      clickableItems: true,
      hoverEffects: true,
      keyboardNavigation: true,
      touchGestures: 'Swipe for mobile',
    },

    // Индикаторы
    indicators: {
      currentPage: 'Visual highlight',
      notifications: 'Badge counters',
      newFeatures: 'Feature flags',
      loading: 'Skeleton states',
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
        '3.2.3 - Consistent Navigation',
      ],
    },

    // ARIA атрибуты
    aria: {
      navigation: 'role="navigation", aria-label="Main navigation"',
      menuItems: 'role="menuitem", aria-current для активных',
      breadcrumbs: 'role="navigation", aria-label="Breadcrumb"',
      expandable: 'aria-expanded, aria-controls',
    },

    // Навигация с клавиатуры
    keyboard: {
      navigation: {
        'Tab/Shift+Tab': 'Между пунктами меню',
        'Arrow keys': 'Внутри меню',
        'Enter/Space': 'Активация пункта',
        'Escape': 'Закрытие подменю',
      },
      shortcuts: {
        'Alt+N': 'Фокус на навигацию',
        'Ctrl+/': 'Поиск по навигации',
        'Home/End': 'К началу/концу меню',
      },
    },

    // Скрин-ридеры
    screenReaders: {
      menuStructure: 'Четкая иерархия навигации',
      currentLocation: 'Объявление текущей страницы',
      breadcrumbPath: 'Полный путь навигации',
      stateChanges: 'Уведомления об изменениях',
    },
  },

  // Требования к тестированию
  testing: {
    // Покрытие тестами
    coverage: {
      unit: '90%',
      integration: '85%',
      e2e: '80%',
    },

    // Обязательные тесты
    required: [
      'Navigation rendering',
      'Route activation',
      'Breadcrumb generation',
      'Permission-based visibility',
      'Mobile responsiveness',
      'Keyboard navigation',
      'Accessibility compliance',
      'Menu state management',
      'Search functionality',
    ],

    // Фикстуры данных
    fixtures: {
      'navigationRoutes.ts': 'Структура навигации',
      'userPermissions.ts': 'Права доступа',
      'routeData.ts': 'Тестовые маршруты',
    },

    // Интеграционные тесты
    integration: [
      'Router integration',
      'Permission system integration',
      'State synchronization',
      'Cross-component communication',
    ],
  },

  // Стилизация и темизация
  styling: {
    // Material-UI компоненты
    muiComponents: [
      'List',
      'ListItem',
      'ListItemIcon',
      'ListItemText',
      'Breadcrumbs',
      'Link',
      'Collapse',
      'Drawer',
      'Typography',
    ],

    // Цветовая схема
    colors: {
      background: 'background.paper',
      activeItem: 'primary.main',
      hoverItem: 'action.hover',
      text: 'text.primary',
      textSecondary: 'text.secondary',
      divider: 'divider',
    },

    // Кастомные стили
    customStyles: {
      activeIndicator: 'Левая граница + цвет фона',
      icons: 'Унифицированные размеры и цвета',
      breadcrumbSeparator: 'Кастомный разделитель',
      collapsedState: 'Иконки с tooltips',
    },

    // Layout система
    layout: {
      spacing: '8px между элементами',
      padding: '16px внутренние отступы',
      iconSize: '24x24px',
      minItemHeight: '48px',
    },

    // Темы
    themes: {
      light: 'Светлая навигационная тема',
      dark: 'Темная тема с контрастом',
      compact: 'Компактный режим отображения',
    },
  },

  // Интеграционные требования
  integration: {
    // Routing
    routing: {
      'react-router': 'Интеграция с React Router',
      'route-matching': 'Определение активных маршрутов',
      'navigation-guards': 'Проверка доступа к маршрутам',
    },

    // Features слой
    features: {
      'navigation': 'Логика навигации и состояние',
      'auth': 'Проверка прав доступа',
    },

    // Entities слой
    entities: {
      'user': 'Данные пользователя и роли',
    },

    // Shared ресурсы
    shared: {
      'ui': 'Базовые UI компоненты',
      'hooks': 'useRouter, usePermissions',
      'utils': 'routeUtils, navigationUtils',
      'types': 'Route, MenuItem, Permission',
    },

    // Глобальное состояние
    state: {
      location: 'Текущий маршрут',
      navigation: 'Состояние навигации',
      permissions: 'Права пользователя',
    },
  },

  // FSD соответствие
  fsd: {
    // Правила импортов
    imports: {
      allowed: [
        '@/features/navigation',
        '@/entities/user',
        '@/shared/**',
        'react-router-dom',
        '@mui/**',
      ],
      forbidden: [
        '@/pages/**',
        '@/widgets/**',
        '@/app/**',
      ],
    },

    // Публичный API
    publicApi: {
      components: ['AppNavigationWidget'],
      types: ['NavigationProps', 'MenuItem', 'BreadcrumbItem'],
      hooks: ['useNavigation'],
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
      'navigation-render-time',
      'route-switch-time',
      'breadcrumb-generation-time',
      'permission-check-time',
    ],

    // Пользовательские метрики
    user: [
      'navigation-usage',
      'most-visited-pages',
      'breadcrumb-clicks',
      'search-usage',
    ],

    // Ошибки
    errors: [
      'route-not-found',
      'permission-denied',
      'navigation-failures',
    ],
  },

  // Документация
  documentation: {
    // Обязательные документы
    required: [
      'README.md - Обзор навигационного виджета',
      'ROUTING.md - Интеграция с роутингом',
      'PERMISSIONS.md - Система прав доступа',
      'ACCESSIBILITY.md - Доступность навигации',
    ],

    // Примеры использования
    examples: [
      'BasicNavigation.tsx',
      'PermissionBasedNav.tsx',
      'MobileNavigation.tsx',
      'CustomBreadcrumbs.tsx',
    ],

    // Схемы навигации
    diagrams: [
      'navigation-structure.svg',
      'permission-flow.svg',
      'responsive-behavior.svg',
    ],
  },

  // Валидация конфигурации
  validation: {
    // Схемы валидации
    schemas: {
      props: 'NavigationPropsSchema',
      menuItem: 'MenuItemSchema',
      route: 'RouteSchema',
    },

    // Проверки времени выполнения
    runtime: {
      routeValidation: true,
      permissionValidation: true,
      performanceAssertions: true,
    },
  },
};

export default appNavigationConfig; 