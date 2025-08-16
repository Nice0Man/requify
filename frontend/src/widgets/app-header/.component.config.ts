/**
 * App Header Widget Configuration
 * Конфигурация виджета шапки приложения
 */

export const appHeaderConfig = {
  // Метаданные виджета
  meta: {
    layer: 'widgets',
    widget: 'app-header',
    description: 'Виджет шапки приложения с навигацией, уведомлениями и пользовательским меню',
    version: '1.0.0',
    dependencies: [
      '@/entities/user',
      '@/entities/notification',
      '@/features/auth',
      '@/features/navigation',
      '@mui/material',
      '@mui/icons-material',
    ],
  },

  // Требования к производительности
  performance: {
    // Мемоизация компонентов
    memoization: {
      required: true,
      components: ['AppHeader', 'UserMenu', 'NotificationCenter', 'SearchBar'],
      deps: ['user', 'notifications', 'searchQuery'],
    },

    // Ленивая загрузка
    lazy: {
      userMenu: true,
      notificationPanel: true,
      searchSuggestions: true,
    },

    // Оптимизация
    optimization: {
      debounceSearch: 300, // ms
      notificationPolling: 30000, // ms
      avatarCaching: true,
    },

    // Лимиты производительности
    limits: {
      maxNotifications: 50,
      maxSearchResults: 20,
      renderTime: '< 200ms',
      memoryUsage: '< 5MB',
    },
  },

  // Функциональные требования
  functionality: {
    // Компоненты навигации
    navigation: {
      logo: true,
      breadcrumbs: true,
      globalSearch: true,
      quickActions: true,
    },

    // Пользовательские функции
    user: {
      avatar: true,
      dropdownMenu: true,
      profileLink: true,
      settingsLink: true,
      logoutAction: true,
    },

    // Система уведомлений
    notifications: {
      badge: true,
      dropdown: true,
      realTime: true,
      markAsRead: true,
      categories: ['system', 'project', 'mention', 'deadline'],
    },

    // Глобальный поиск
    search: {
      entities: ['projects', 'requirements', 'users', 'releases'],
      suggestions: true,
      history: true,
      shortcuts: true,
    },

    // Быстрые действия
    quickActions: [
      'create_project',
      'create_requirement',
      'create_test_case',
      'toggle_sidebar',
    ],
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
        mobile: 'Hamburger menu, collapsed search',
        tablet: 'Compact layout, icon shortcuts',
        desktop: 'Full layout, expanded search',
      },
    },

    // Позиционирование
    layout: {
      position: 'sticky',
      zIndex: 1100,
      height: {
        mobile: '56px',
        desktop: '64px',
      },
      elevation: 4,
    },

    // Анимации
    animations: {
      menuToggle: 'slide-in 0.3s ease',
      notificationBadge: 'bounce 0.5s ease',
      userMenuOpen: 'fade-scale 0.2s ease',
      searchExpand: 'width 0.3s ease',
    },

    // Интерактивность
    interactions: {
      hoverEffects: true,
      rippleEffect: true,
      focusIndicators: true,
      tooltips: true,
    },

    // Состояния
    states: {
      loading: 'Skeleton placeholders',
      offline: 'Offline indicator',
      error: 'Error badge on avatar',
      notifications: 'Badge with count',
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
        '2.4.6 - Headings and Labels',
        '3.2.2 - On Input',
      ],
    },

    // ARIA атрибуты
    aria: {
      banner: 'role="banner" для шапки',
      navigation: 'role="navigation" для навигации',
      search: 'role="search" для поиска',
      menuButton: 'aria-expanded, aria-haspopup',
      notifications: 'aria-live="polite" для уведомлений',
    },

    // Навигация с клавиатуры
    keyboard: {
      tabOrder: 'Logo → Search → Notifications → User Menu',
      shortcuts: {
        'Alt+S': 'Фокус на поиск',
        'Alt+N': 'Открыть уведомления',
        'Alt+U': 'Открыть пользовательское меню',
        'Escape': 'Закрыть открытые меню',
      },
      focusTrapping: 'В открытых dropdown меню',
    },

    // Скрин-ридеры
    screenReaders: {
      logoAlt: 'Логотип Requify',
      searchLabel: 'Глобальный поиск',
      notificationLabel: 'Уведомления',
      userMenuLabel: 'Меню пользователя',
      liveRegions: 'Для уведомлений и статусов',
    },
  },

  // Требования к тестированию
  testing: {
    // Покрытие тестами
    coverage: {
      unit: '90%',
      integration: '85%',
      e2e: '75%',
    },

    // Обязательные тесты
    required: [
      'Header rendering',
      'User menu functionality',
      'Notification center',
      'Search functionality',
      'Mobile responsive behavior',
      'Keyboard navigation',
      'Accessibility compliance',
      'Quick actions',
      'Logout functionality',
    ],

    // Фикстуры данных
    fixtures: {
      'mockUser.ts': 'Данные пользователя',
      'mockNotifications.ts': 'Тестовые уведомления',
      'searchResults.ts': 'Результаты поиска',
    },

    // Интеграционные тесты
    integration: [
      'Auth flow integration',
      'Notification real-time updates',
      'Search API integration',
      'Navigation state synchronization',
    ],
  },

  // Стилизация и темизация
  styling: {
    // Material-UI компоненты
    muiComponents: [
      'AppBar',
      'Toolbar',
      'IconButton',
      'Menu',
      'MenuItem',
      'Badge',
      'Avatar',
      'TextField',
      'Autocomplete',
      'Tooltip',
    ],

    // Цветовая схема
    colors: {
      background: 'primary.main',
      text: 'primary.contrastText',
      hover: 'primary.dark',
      accent: 'secondary.main',
      notification: 'error.main',
    },

    // Кастомные стили
    customStyles: {
      logo: 'Векторный логотип с анимацией',
      searchBar: 'Расширяющаяся строка поиска',
      notificationBadge: 'Анимированный счетчик',
      userAvatar: 'Круглый аватар с статусом',
    },

    // Темы
    themes: {
      light: 'Светлая тема (primary: blue)',
      dark: 'Темная тема (primary: dark blue)',
      contrast: 'Высококонтрастная версия',
    },
  },

  // Интеграционные требования
  integration: {
    // Entities слой
    entities: {
      'user': 'Данные текущего пользователя',
      'notification': 'Система уведомлений',
    },

    // Features слой
    features: {
      'auth': 'Аутентификация и logout',
      'navigation': 'Состояние навигации',
      'header': 'Специфичная логика шапки',
    },

    // Shared ресурсы
    shared: {
      'ui': 'Базовые UI компоненты',
      'hooks': 'useDebounce, useLocalStorage, useAuth',
      'utils': 'searchUtils, notificationUtils',
      'types': 'User, Notification, SearchResult',
    },

    // API эндпоинты
    api: [
      '/api/v1/auth/logout',
      '/api/v1/dashboard/search',
      '/api/v1/dashboard/my-notifications',
      '/api/v1/users/me',
    ],

    // Глобальное состояние
    state: {
      auth: 'Состояние аутентификации',
      notifications: 'Список уведомлений',
      search: 'История поиска',
    },
  },

  // FSD соответствие
  fsd: {
    // Правила импортов
    imports: {
      allowed: [
        '@/entities/user',
        '@/entities/notification',
        '@/features/auth',
        '@/features/navigation',
        '@/shared/**',
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
      components: ['AppHeaderWidget'],
      types: ['AppHeaderProps', 'UserMenuProps', 'NotificationCenterProps'],
      hooks: ['useHeaderState'],
    },

    // Изоляция слайсов
    isolation: {
      noCrossDependencies: true,
      ownState: true,
      explicitApi: true,
    },
  },

  // Безопасность
  security: {
    // Защита данных
    dataProtection: {
      sensitiveInfo: 'Не отображать в логах',
      userTokens: 'Безопасное хранение',
      searchHistory: 'Локальное шифрование',
    },

    // XSS защита
    xssProtection: {
      searchInput: 'Санитизация ввода',
      userContent: 'Экранирование HTML',
      notifications: 'Валидация контента',
    },
  },

  // Мониторинг и метрики
  monitoring: {
    // Производительность
    performance: [
      'header-render-time',
      'search-response-time',
      'notification-load-time',
      'menu-interaction-time',
    ],

    // Пользовательские метрики
    user: [
      'search-usage',
      'notification-clicks',
      'menu-interactions',
      'quick-action-usage',
    ],

    // Ошибки
    errors: [
      'search-failures',
      'notification-errors',
      'auth-failures',
      'api-errors',
    ],
  },

  // Документация
  documentation: {
    // Обязательные документы
    required: [
      'README.md - Обзор виджета шапки',
      'NAVIGATION.md - Руководство по навигации',
      'SEARCH.md - Функциональность поиска',
      'ACCESSIBILITY.md - Доступность шапки',
    ],

    // Примеры использования
    examples: [
      'BasicHeader.tsx',
      'CustomSearch.tsx',
      'NotificationIntegration.tsx',
      'MobileLayout.tsx',
    ],

    // Дизайн документация
    design: [
      'Header-Desktop.figma',
      'Header-Mobile.figma',
      'Interaction-States.figma',
      'Animation-Specs.figma',
    ],
  },

  // Валидация конфигурации
  validation: {
    // Схемы валидации
    schemas: {
      props: 'AppHeaderPropsSchema',
      user: 'UserDataSchema',
      notifications: 'NotificationArraySchema',
    },

    // Проверки времени выполнения
    runtime: {
      propValidation: true,
      authStateValidation: true,
      performanceAssertions: true,
    },
  },
};

export default appHeaderConfig; 