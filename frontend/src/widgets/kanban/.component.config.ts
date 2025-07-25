/**
 * Kanban Widget Configuration
 * Конфигурация виджета канбан доски
 */

export const kanbanConfig = {
  // Метаданные виджета
  meta: {
    layer: 'widgets',
    widget: 'kanban',
    description: 'Виджет канбан доски для управления требованиями с Drag & Drop функциональностью',
    version: '1.0.0',
    dependencies: [
      '@/entities/requirement',
      '@/entities/project',
      '@/features/kanban',
      '@/features/requirements',
      '@mui/material',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
    ],
  },

  // Требования к производительности
  performance: {
    // Мемоизация компонентов
    memoization: {
      required: true,
      components: ['KanbanBoard', 'KanbanColumn', 'KanbanCard', 'RequirementCard'],
      deps: ['requirements', 'columns', 'filters', 'groupBy'],
    },

    // Виртуализация
    virtualization: {
      enabled: true,
      threshold: 100, // карточек в колонке
      itemHeight: 120,
      overscan: 5,
      implementation: 'react-window',
    },

    // Drag & Drop оптимизация
    dnd: {
      debounceMove: 16, // ms (60fps)
      optimisticUpdates: true,
      batchUpdates: true,
      ghostElement: true,
    },

    // Лимиты производительности
    limits: {
      maxCards: 500, // всего карточек
      maxColumns: 10,
      renderTime: '< 500ms',
      memoryUsage: '< 20MB',
      dndLatency: '< 100ms',
    },

    // Оптимизация ререндеров
    rerenders: {
      prevention: true,
      useMemo: ['filteredRequirements', 'columnData', 'cardPositions'],
      useCallback: ['onDragEnd', 'onCardClick', 'onFilter'],
    },
  },

  // Функциональные требования
  functionality: {
    // Структура колонок
    columns: {
      default: ['draft', 'review', 'approved', 'implemented', 'tested'],
      customizable: true,
      reorderable: true,
      collapsible: true,
    },

    // Drag & Drop функции
    dragDrop: {
      cardToColumn: true,
      cardReordering: true,
      columnReordering: true,
      multiSelect: true,
      restrictions: 'По ролям пользователей',
    },

    // Фильтрация и поиск
    filtering: {
      byStatus: true,
      byPriority: true,
      byAssignee: true,
      byProject: true,
      byTags: true,
      textSearch: true,
      advancedFilters: true,
    },

    // Группировка
    grouping: {
      byProject: true,
      byAssignee: true,
      byPriority: true,
      byTags: true,
      custom: true,
    },

    // Массовые операции
    bulkActions: [
      'change_status',
      'assign_user',
      'add_tags',
      'set_priority',
      'move_to_project',
    ],

    // Экспорт/импорт
    dataExchange: {
      export: ['csv', 'excel', 'json'],
      import: ['csv', 'excel'],
      templates: true,
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
        mobile: 'Single column swipe',
        tablet: '2-3 columns',
        desktop: 'Full board view',
      },
    },

    // Drag & Drop UX
    dndExperience: {
      visualFeedback: {
        dragStart: 'Card elevation + shadow',
        dragOver: 'Column highlight',
        dragEnd: 'Smooth animation',
        invalidDrop: 'Red border + shake',
      },
      touchSupport: true,
      autoScroll: true,
      snapToGrid: false,
    },

    // Анимации
    animations: {
      cardMove: 'transform 0.3s ease',
      columnExpand: 'height 0.3s ease',
      filterApply: 'opacity 0.2s ease',
      loadMore: 'fade-in 0.5s ease',
    },

    // Интерактивность
    interactions: {
      cardHover: 'Elevation increase',
      columnHover: 'Background highlight',
      quickActions: 'Action buttons on hover',
      contextMenu: 'Right-click menu',
      tooltips: 'Information on hover',
    },

    // Состояния
    states: {
      loading: 'Skeleton cards',
      empty: 'Empty state illustration',
      error: 'Error message + retry',
      dragging: 'Visual feedback',
      saving: 'Loading indicators',
    },

    // Цветовая схема
    colors: {
      columns: {
        draft: '#f5f5f5',
        review: '#fff3e0',
        approved: '#e8f5e8',
        implemented: '#e3f2fd',
        tested: '#f3e5f5',
      },
      priorities: {
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
        '4.1.2 - Name, Role, Value',
      ],
    },

    // ARIA атрибуты
    aria: {
      kanbanBoard: 'role="application", aria-label="Kanban board"',
      columns: 'role="region", aria-labelledby="column-title"',
      cards: 'role="button", aria-describedby="card-details"',
      dragHandle: 'aria-label="Drag to move"',
      liveRegion: 'aria-live="polite" для обновлений',
    },

    // Навигация с клавиатуры
    keyboard: {
      navigation: {
        'Tab/Shift+Tab': 'Между карточками',
        'Arrow keys': 'Внутри колонки',
        'Home/End': 'К началу/концу колонки',
        'Ctrl+Arrow': 'Между колонками',
      },
      actions: {
        'Enter/Space': 'Выбрать карточку',
        'Ctrl+M': 'Переместить карточку',
        'Delete': 'Удалить карточку',
        'Escape': 'Отменить действие',
      },
      dnd: 'Альтернативный интерфейс для DnD',
    },

    // Поддержка скрин-ридеров
    screenReaders: {
      boardDescription: 'Описание структуры доски',
      columnCounts: 'Количество элементов в колонках',
      dragAnnouncements: 'Объявления перемещений',
      statusUpdates: 'Изменения статусов',
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
      'Board rendering',
      'Card drag and drop',
      'Column operations',
      'Filtering functionality',
      'Bulk actions',
      'Responsive behavior',
      'Keyboard navigation',
      'Accessibility compliance',
      'Performance under load',
      'Data persistence',
    ],

    // Фикстуры данных
    fixtures: {
      'mockRequirements.ts': 'Тестовые требования',
      'kanbanBoardData.ts': 'Структура доски',
      'userPermissions.ts': 'Права пользователей',
      'dndScenarios.ts': 'Сценарии перетаскивания',
    },

    // Performance тесты
    performance: [
      'Large dataset rendering (500+ cards)',
      'Drag latency measurements',
      'Memory usage monitoring',
      'Animation frame rate',
    ],

    // E2E тесты
    e2e: [
      'Complete requirement workflow',
      'Multi-user collaboration',
      'Data synchronization',
      'Cross-browser compatibility',
    ],
  },

  // Стилизация и темизация
  styling: {
    // Material-UI компоненты
    muiComponents: [
      'Card',
      'CardContent',
      'Typography',
      'Chip',
      'Avatar',
      'IconButton',
      'Menu',
      'Backdrop',
      'Skeleton',
    ],

    // Кастомные стили
    customStyles: {
      dragOverlay: 'Custom drag preview',
      columnHeaders: 'Gradient backgrounds',
      cardShadows: 'Dynamic elevation',
      loadingStates: 'Pulse animations',
    },

    // Layout система
    layout: {
      columnWidth: 'min: 280px, max: 400px',
      cardSpacing: '8px',
      boardPadding: '16px',
      columnGap: '16px',
    },

    // Темы
    themes: {
      light: 'Default kanban theme',
      dark: 'Dark mode support',
      colorBlind: 'Accessibility colors',
      highContrast: 'High contrast mode',
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
      'kanban': 'Бизнес-логика канбан',
      'requirements': 'Операции с требованиями',
    },

    // Shared ресурсы
    shared: {
      'ui': 'DragAndDrop, VirtualList компоненты',
      'hooks': 'useDragAndDrop, useVirtualization',
      'utils': 'kanbanUtils, filterUtils',
      'types': 'Requirement, KanbanColumn, DragEvent',
    },

    // API эндпоинты
    api: [
      '/api/v1/requirements/',
      '/api/v1/requirements/{id}/change-status',
      '/api/v1/projects/{id}/requirements',
    ],

    // Состояние
    state: {
      board: 'Структура доски',
      filters: 'Активные фильтры',
      selection: 'Выбранные карточки',
      dragState: 'Состояние перетаскивания',
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
        '@/features/kanban',
        '@/features/requirements',
        '@/shared/**',
        '@mui/**',
        '@dnd-kit/**',
      ],
      forbidden: [
        '@/pages/**',
        '@/widgets/**',
        '@/app/**',
      ],
    },

    // Публичный API
    publicApi: {
      components: ['KanbanWidget'],
      types: ['KanbanProps', 'KanbanColumn', 'DragEndEvent'],
      hooks: ['useKanban'],
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
      'board-render-time',
      'drag-response-time',
      'filter-apply-time',
      'memory-usage',
      'animation-fps',
    ],

    // Пользовательские метрики
    user: [
      'cards-moved-count',
      'filters-used',
      'bulk-actions-performed',
      'time-spent-on-board',
    ],

    // Ошибки
    errors: [
      'drag-drop-failures',
      'api-update-errors',
      'filter-errors',
      'rendering-errors',
    ],
  },

  // Документация
  documentation: {
    // Обязательные документы
    required: [
      'README.md - Обзор канбан виджета',
      'DND.md - Руководство по Drag & Drop',
      'PERFORMANCE.md - Оптимизация производительности',
      'ACCESSIBILITY.md - Доступность канбан доски',
    ],

    // Примеры использования
    examples: [
      'BasicKanban.tsx',
      'FilteredKanban.tsx',
      'CustomColumns.tsx',
      'MobileKanban.tsx',
    ],

    // Видео гайды
    videos: [
      'kanban-setup.mp4',
      'drag-drop-demo.mp4',
      'accessibility-demo.mp4',
    ],
  },

  // Валидация конфигурации
  validation: {
    // Схемы валидации
    schemas: {
      props: 'KanbanPropsSchema',
      requirement: 'RequirementSchema',
      dragEvent: 'DragEventSchema',
    },

    // Проверки времени выполнения
    runtime: {
      dragValidation: true,
      permissionChecks: true,
      performanceAssertions: true,
    },
  },
};

export default kanbanConfig; 