/**
 * Requirement List Widget Configuration
 * Конфигурация виджета списка требований
 */

export const requirementListConfig = {
  // Метаданные виджета
  meta: {
    layer: 'widgets',
    widget: 'requirement-list',
    description: 'Виджет отображения списка требований с фильтрацией, сортировкой и массовыми операциями',
    version: '1.0.0',
    dependencies: [
      '@/entities/requirement',
      '@/entities/project',
      '@/entities/user',
      '@/features/requirements',
      '@mui/material',
      '@mui/icons-material',
      'react-window',
    ],
  },

  // Требования к производительности
  performance: {
    // Мемоизация компонентов
    memoization: {
      required: true,
      components: ['RequirementList', 'RequirementItem', 'FilterPanel', 'SortControls'],
      deps: ['requirements', 'filters', 'sortOrder', 'selectedIds'],
    },

    // Виртуализация
    virtualization: {
      enabled: true,
      threshold: 50, // требований
      itemHeight: 80,
      overscan: 10,
      implementation: 'react-window',
    },

    // Оптимизация
    optimization: {
      debounceFilter: 300, // ms
      debounceSearch: 250, // ms
      batchOperations: true,
      lazyImageLoading: true,
    },

    // Лимиты производительности
    limits: {
      maxVisibleItems: 1000,
      maxSelectedItems: 500,
      renderTime: '< 400ms',
      memoryUsage: '< 15MB',
      filterTime: '< 200ms',
    },

    // Оптимизация ререндеров
    rerenders: {
      prevention: true,
      useMemo: ['filteredRequirements', 'sortedData', 'groupedItems'],
      useCallback: ['onSelect', 'onFilter', 'onSort', 'onBulkAction'],
    },
  },

  // Функциональные требования
  functionality: {
    // Отображение данных
    display: {
      viewModes: ['list', 'grid', 'table', 'compact'],
      itemDetails: ['id', 'title', 'status', 'priority', 'assignee', 'project'],
      avatars: true,
      statusIcons: true,
    },

    // Фильтрация
    filtering: {
      textSearch: true,
      statusFilter: true,
      priorityFilter: true,
      projectFilter: true,
      assigneeFilter: true,
      dateRangeFilter: true,
      customFilters: true,
      savedFilters: true,
    },

    // Сортировка
    sorting: {
      fields: ['title', 'status', 'priority', 'created_at', 'updated_at'],
      directions: ['asc', 'desc'],
      multiSort: true,
      defaultSort: 'updated_at desc',
    },

    // Группировка
    grouping: {
      byStatus: true,
      byPriority: true,
      byProject: true,
      byAssignee: true,
      customGrouping: true,
    },

    // Выбор элементов
    selection: {
      singleSelect: true,
      multiSelect: true,
      selectAll: true,
      selectByFilter: true,
      preserveSelection: true,
    },

    // Массовые операции
    bulkActions: [
      'change_status',
      'assign_user',
      'set_priority',
      'move_to_project',
      'add_tags',
      'export_selected',
      'delete_selected',
    ],

    // Экспорт данных
    export: {
      formats: ['csv', 'excel', 'pdf', 'json'],
      includedFields: 'Configurable',
      templates: ['summary', 'detailed', 'custom'],
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
        mobile: 'Single column, swipe actions',
        tablet: 'Grid 2-3 columns',
        desktop: 'Full table/grid view',
      },
    },

    // Состояния загрузки
    loadingStates: {
      initial: 'Skeleton list items',
      filtering: 'Filter spinner',
      loadMore: 'Load more button/infinite scroll',
      updating: 'Individual item loaders',
    },

    // Анимации
    animations: {
      itemEntry: 'fade-up 0.3s ease',
      filterApply: 'opacity 0.2s ease',
      bulkAction: 'scale 0.2s ease',
      selection: 'highlight 0.15s ease',
    },

    // Интерактивность
    interactions: {
      itemClick: 'Navigate to detail',
      itemHover: 'Preview tooltip',
      contextMenu: 'Right-click actions',
      dragSelect: 'Rectangle selection',
      swipeActions: 'Mobile swipe gestures',
    },

    // Пустые состояния
    emptyStates: {
      noData: 'Illustration + create action',
      noResults: 'Search suggestions',
      noPermission: 'Access denied message',
      error: 'Error illustration + retry',
    },

    // Цветовая схема
    colors: {
      itemBackground: 'background.paper',
      selectedItem: 'primary.light',
      hoverItem: 'action.hover',
      statusColors: {
        draft: '#757575',
        review: '#ff9800',
        approved: '#4caf50',
        rejected: '#f44336',
      },
      priorityColors: {
        low: '#4caf50',
        medium: '#ff9800',
        high: '#f44336',
        critical: '#9c27b0',
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
        '3.2.2 - On Input',
      ],
    },

    // ARIA атрибуты
    aria: {
      list: 'role="list", aria-label="Requirements list"',
      listItem: 'role="listitem", aria-describedby',
      selection: 'aria-selected, aria-multiselectable',
      filters: 'aria-label, aria-expanded',
      liveRegion: 'aria-live="polite" для обновлений',
    },

    // Навигация с клавиатуры
    keyboard: {
      navigation: {
        'Tab/Shift+Tab': 'Между элементами',
        'Arrow keys': 'По списку',
        'Home/End': 'К началу/концу списка',
        'Page Up/Down': 'Страничная навигация',
      },
      selection: {
        'Space': 'Выбор элемента',
        'Ctrl+A': 'Выбрать все',
        'Shift+Click': 'Диапазон выбора',
        'Ctrl+Click': 'Множественный выбор',
      },
      actions: {
        'Enter': 'Открыть элемент',
        'Delete': 'Удалить выбранные',
        'Ctrl+E': 'Экспорт',
        'F': 'Фокус на поиск',
      },
    },

    // Скрин-ридеры
    screenReaders: {
      listDescription: 'Количество и тип элементов',
      filterStatus: 'Активные фильтры',
      selectionCount: 'Количество выбранных',
      sortOrder: 'Текущая сортировка',
      bulkActions: 'Доступные массовые операции',
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
      'List rendering',
      'Filtering functionality',
      'Sorting mechanisms',
      'Selection behavior',
      'Bulk operations',
      'Virtual scrolling',
      'Responsive layouts',
      'Keyboard navigation',
      'Accessibility compliance',
      'Performance with large datasets',
    ],

    // Фикстуры данных
    fixtures: {
      'mockRequirements.ts': 'Тестовые требования',
      'filterScenarios.ts': 'Сценарии фильтрации',
      'sortingData.ts': 'Данные для сортировки',
      'bulkActionData.ts': 'Тестовые массовые операции',
    },

    // Performance тесты
    performance: [
      'Large list rendering (1000+ items)',
      'Filter response time',
      'Sort performance',
      'Virtual scroll efficiency',
      'Memory usage monitoring',
    ],

    // E2E тесты
    e2e: [
      'Complete filtering workflow',
      'Bulk operations execution',
      'Export functionality',
      'Cross-browser compatibility',
    ],
  },

  // Стилизация и темизация
  styling: {
    // Material-UI компоненты
    muiComponents: [
      'List',
      'ListItem',
      'ListItemText',
      'ListItemAvatar',
      'Card',
      'CardContent',
      'Checkbox',
      'Chip',
      'Typography',
      'Avatar',
      'IconButton',
      'Menu',
      'TextField',
      'FormControl',
      'Select',
    ],

    // Layout система
    layout: {
      itemSpacing: '8px между элементами',
      padding: '16px внутренние отступы',
      minItemHeight: '72px',
      maxItemHeight: '120px',
      gridColumns: {
        mobile: 1,
        tablet: 2,
        desktop: 3,
      },
    },

    // Кастомные стили
    customStyles: {
      selectedOverlay: 'Gradient overlay для выбранных',
      statusIndicators: 'Цветные полосы слева',
      priorityIcons: 'Иконки приоритета',
      hoverEffects: 'Elevation change',
    },

    // Темы
    themes: {
      light: 'Светлая тема списка',
      dark: 'Темная тема с контрастом',
      compact: 'Компактный режим отображения',
      detailed: 'Детальный режим с расширенной информацией',
    },
  },

  // Интеграционные требования
  integration: {
    // Entities слой
    entities: {
      'requirement': 'Основные данные требований',
      'project': 'Проектная принадлежность',
      'user': 'Информация о пользователях',
    },

    // Features слой
    features: {
      'requirements': 'Бизнес-логика требований',
    },

    // Shared ресурсы
    shared: {
      'ui': 'VirtualList, FilterPanel, BulkActions',
      'hooks': 'useFilter, useSort, useVirtualization',
      'utils': 'filterUtils, sortUtils, exportUtils',
      'types': 'Requirement, Filter, SortOrder',
    },

    // API эндпоинты
    api: [
      '/api/v1/requirements/',
      '/api/v1/requirements/search',
      '/api/v1/requirements/{id}/change-status',
    ],

    // Состояние
    state: {
      requirements: 'Список требований',
      filters: 'Активные фильтры',
      selection: 'Выбранные элементы',
      viewMode: 'Режим отображения',
    },
  },

  // FSD соответствие
  fsd: {
    // Правила импортов
    imports: {
      allowed: [
        '@/entities/requirement',
        '@/entities/project',
        '@/entities/user',
        '@/features/requirements',
        '@/shared/**',
        '@mui/**',
        'react-window',
      ],
      forbidden: [
        '@/pages/**',
        '@/widgets/**',
        '@/app/**',
      ],
    },

    // Публичный API
    publicApi: {
      components: ['RequirementListWidget'],
      types: ['RequirementListProps', 'ListFilter', 'ViewMode'],
      hooks: ['useRequirementList'],
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
      'list-render-time',
      'filter-apply-time',
      'sort-execution-time',
      'virtual-scroll-fps',
      'memory-usage',
    ],

    // Пользовательские метрики
    user: [
      'most-used-filters',
      'sort-preferences',
      'bulk-actions-usage',
      'export-frequency',
      'time-spent-on-list',
    ],

    // Ошибки
    errors: [
      'filter-errors',
      'sort-failures',
      'bulk-action-errors',
      'export-failures',
    ],
  },

  // Документация
  documentation: {
    // Обязательные документы
    required: [
      'README.md - Обзор виджета списка требований',
      'FILTERING.md - Система фильтрации',
      'VIRTUALIZATION.md - Виртуализация больших списков',
      'ACCESSIBILITY.md - Доступность списка',
    ],

    // Примеры использования
    examples: [
      'BasicList.tsx',
      'FilteredList.tsx',
      'VirtualizedList.tsx',
      'BulkOperations.tsx',
    ],

    // Демо данные
    demos: [
      'large-dataset-demo.json',
      'filter-examples.json',
      'bulk-operations-demo.json',
    ],
  },

  // Валидация конфигурации
  validation: {
    // Схемы валидации
    schemas: {
      props: 'RequirementListPropsSchema',
      requirement: 'RequirementSchema',
      filter: 'FilterSchema',
    },

    // Проверки времени выполнения
    runtime: {
      dataValidation: true,
      filterValidation: true,
      performanceAssertions: true,
    },
  },
};

export default requirementListConfig; 