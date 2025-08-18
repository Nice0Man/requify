/**
 * Comment Entity UI Components Configuration
 * Конфигурация компонентов комментариев
 */

export const commentUIConfig = {
  // Метаданные компонентов
  meta: {
    layer: 'entities',
    entity: 'comment',
    slice: 'ui',
    description: 'UI компоненты для системы комментариев с поддержкой ответов и упоминаний',
    version: '1.0.0',
  },

  // Требования к производительности
  performance: {
    // Виртуализация
    virtualization: {
      CommentList: {
        enabled: true,
        threshold: 50, // Включать виртуализацию при >50 комментариев
        overscan: 5,
        estimatedItemSize: 150, // Высота карточки комментария
        nestedSupport: true, // Поддержка вложенных комментариев
      },
    },

    // Мемоизация
    memoization: {
      CommentCard: {
        enabled: true,
        dependencies: [
          'comment.id', 
          'comment.content', 
          'comment.likesCount',
          'comment.replies.length',
          'depth',
          'compact'
        ],
        shallowCompare: false,
      },
      CommentList: {
        enabled: true,
        dependencies: ['comments.length', 'viewMode', 'sortOrder', 'filters'],
        shallowCompare: false,
      },
    },

    // Ререндеры
    rerenders: {
      maxAllowed: 3, // Комментарии могут обновляться чаще
      trackingEnabled: process.env.NODE_ENV === 'development',
      warningThreshold: 5,
    },

    // Метрики
    metrics: {
      loadTime: '< 200ms', // Комментарии не критичны к скорости
      interactionDelay: '< 100ms', // Лайки и ответы должны быть быстрыми
      memoryUsage: '< 5MB per 100 comments',
      renderTime: '< 50ms per comment',
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
        'CommentCard - render comment data',
        'CommentCard - handle likes',
        'CommentCard - expand/collapse replies',
        'CommentCard - show mentions correctly',
        'CommentCard - handle nested depth',
        'CommentList - filter comments',
        'CommentList - sort comments',
        'CommentList - search functionality',
        'CommentList - view mode switching',
        'CommentList - handle nested structure',
      ],
      integration: [
        'CommentList + CommentCard interaction',
        'Comment threading and replies',
        'Mention linking and navigation',
        'Real-time comment updates',
      ],
      visual: [
        'CommentCard all states',
        'CommentList view modes',
        'Nested comment threading',
        'Mention highlighting',
      ],
      performance: [
        'CommentList with 100+ comments',
        'Deep nesting performance',
        'Real-time updates performance',
      ],
    },

    // Тестовые данные
    fixtures: {
      comments: {
        simple: 'basic comment without replies',
        withReplies: 'comment with nested replies',
        withMentions: 'comment with user mentions',
        withAttachments: 'comment with file attachments',
        longThread: 'deep nested comment thread',
      },
      threading: {
        shallow: '1-2 levels of nesting',
        deep: '3+ levels of nesting',
        mixed: 'various nesting levels',
      },
    },
  },

  // Стандарты доступности
  accessibility: {
    // WCAG соответствие
    wcag: {
      level: 'AA',
      guidelines: ['1.4.3', '2.1.1', '2.4.3', '4.1.2'],
    },

    // ARIA атрибуты
    aria: {
      CommentCard: {
        role: 'article',
        'aria-label': 'comment by {authorName}',
        'aria-describedby': 'comment content',
        'aria-expanded': 'for replies toggle',
        'aria-level': 'nesting depth',
      },
      CommentList: {
        role: 'list',
        'aria-label': 'Comments list',
        'aria-live': 'polite', // for new comments
        'aria-busy': 'during loading',
      },
    },

    // Навигация с клавиатуры
    keyboard: {
      CommentCard: {
        focusable: true,
        keys: ['Enter', 'Space', 'ArrowDown', 'ArrowUp'],
        tabIndex: 0,
        replyShortcut: 'r',
        likeShortcut: 'l',
      },
      CommentList: {
        arrowNavigation: true,
        focusManagement: 'roving',
        searchShortcut: 'Ctrl+F',
      },
    },

    // Скринридеры
    screenReader: {
      announcements: [
        'Comment posted',
        'Reply added',
        'Comment liked',
        'New comments available',
      ],
      descriptions: [
        'Comment by {author} posted {time}',
        '{likes} likes, {replies} replies',
        'Reply to {parentAuthor}',
      ],
    },
  },

  // Стилизация и темизация
  styling: {
    // Material-UI соответствие
    mui: {
      theme: 'app-theme',
      responsive: true,
      breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
    },

    // Цветовая схема
    colors: {
      CommentCard: {
        default: 'background.paper',
        hover: 'action.hover',
        own: 'primary.light',
        reply: 'grey.50',
      },
      actions: {
        like: 'primary.main',
        liked: 'error.main',
        reply: 'info.main',
        edit: 'warning.main',
        delete: 'error.main',
      },
      mentions: {
        highlight: 'primary.light',
        text: 'primary.main',
        background: 'primary.50',
      },
    },

    // Анимации
    animations: {
      CommentCard: {
        hover: 'transform 0.2s ease-in-out',
        like: 'scale 0.2s ease-in-out',
        expand: 'max-height 0.3s ease-in-out',
        newComment: 'fadeIn 0.5s ease-in-out',
      },
      CommentList: {
        filterChange: 'opacity 0.3s ease-in-out',
        sortChange: 'transform 0.3s ease-in-out',
      },
    },

    // Адаптивность
    responsive: {
      CommentCard: {
        xs: 'compact mode, reduced padding',
        sm: 'standard mode',
        md: 'full mode with all actions',
      },
      CommentList: {
        xs: 'simplified filters',
        md: 'full controls',
      },
    },
  },

  // Бизнес-логика и функциональность
  business: {
    // Правила комментирования
    commenting: {
      maxNestingDepth: 5,
      maxContentLength: 2000,
      allowedMentions: 10,
      allowedAttachments: 3,
      editTimeLimit: 3600, // 1 час
    },

    // Модерация
    moderation: {
      autoModeration: true,
      flaggingEnabled: true,
      reportReasons: ['spam', 'inappropriate', 'offensive'],
    },

    // Уведомления
    notifications: {
      onReply: true,
      onMention: true,
      onLike: false, // по умолчанию выключено
    },
  },

  // Интеграционные требования
  integration: {
    // Props validation
    propTypes: {
      strict: true,
      required: ['comment', 'comments'],
      optional: ['onClick', 'onLike', 'onReply', 'onEdit', 'onDelete'],
    },

    // Callbacks
    callbacks: {
      CommentCard: [
        'onClick', 'onLike', 'onReply', 'onEdit', 'onDelete',
        'onAuthorClick', 'onMentionClick'
      ],
      CommentList: [
        'onCommentClick', 'onCommentLike', 'onCommentReply',
        'onFiltersChange', 'onViewModeChange', 'onSortOrderChange'
      ],
    },

    // External services
    externalServices: {
      mentions: 'user search and autocomplete',
      notifications: 'real-time notifications',
      attachments: 'file upload service',
      moderation: 'content moderation API',
    },
  },

  // FSD соответствие
  fsd: {
    // Импорты
    imports: {
      allowed: [
        '@mui/material',
        '@mui/icons-material', 
        '../model/types',
        'react'
      ],
      forbidden: [
        '@/features/*',
        '@/widgets/*', 
        '@/pages/*'
      ],
    },

    // Экспорты
    exports: {
      components: ['CommentCard', 'CommentList'],
      types: ['CommentCardProps', 'CommentListProps'],
      public: 'index.ts',
    },

    // Зависимости
    dependencies: {
      entities: ['none'], // Независимость от других entities
      shared: ['ui', 'types', 'utils'],
      external: ['react', '@mui/material', '@mui/icons-material'],
    },
  },

  // Мониторинг и метрики
  monitoring: {
    // Ключевые метрики
    kpi: {
      engagementRate: '> 15%', // процент комментариев с ответами
      responseTime: '< 150ms', // время отклика на действия
      errorRate: '< 0.5%', // частота ошибок
      userSatisfaction: '> 4.2/5', // удовлетворенность UX
    },

    // Логирование
    logging: {
      events: [
        'comment_viewed',
        'comment_liked',
        'comment_replied',
        'mention_clicked',
        'comment_edited',
        'comment_deleted',
      ],
      performance: [
        'comment_render_time',
        'list_filter_time',
        'threading_performance',
      ],
    },

    // Алерты
    alerts: {
      slowRendering: 'render time > 100ms',
      memoryLeak: 'memory usage growing',
      highNesting: 'nesting depth > 5',
    },
  },

  // Документация
  documentation: {
    // Обязательные разделы
    required: [
      'Component overview',
      'Threading system',
      'Mentions system',
      'Props interface',
      'Usage examples',
      'Accessibility guide',
      'Performance notes',
    ],

    // Примеры кода
    examples: {
      basic: 'Simple comment display',
      threaded: 'Nested comment thread',
      interactive: 'Full interactive comment system',
      mentions: 'Comments with mentions',
      moderated: 'Moderated comment system',
    },

    // Storybook stories
    storybook: {
      required: true,
      stories: [
        'Basic comment',
        'Comment with replies',
        'Comment with mentions',
        'Comment with attachments',
        'Comment list views',
        'Threading examples',
      ],
    },
  },

  // Валидация
  validation: {
    // Линтинг
    eslint: {
      rules: [
        'react-hooks/exhaustive-deps',
        'jsx-a11y/recommended'
      ],
      noWarnings: true,
    },

    // TypeScript
    typescript: {
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
    },

    // Runtime checks
    runtime: {
      propTypes: 'development only',
      invariants: 'always',
      performanceChecks: 'development only',
    },

    // Business logic validation
    business: {
      contentValidation: 'validate comment content',
      nestingValidation: 'validate nesting depth',
      mentionsValidation: 'validate user mentions',
    },
  },
};

export default commentUIConfig; 