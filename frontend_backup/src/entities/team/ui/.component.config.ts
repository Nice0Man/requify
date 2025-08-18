/**
 * Team Entity UI Components Configuration
 * Конфигурация компонентов отображения команд
 */

export const teamUIConfig = {
  // Метаданные компонентов
  meta: {
    layer: "entities",
    entity: "team",
    slice: "ui",
    description: "UI компоненты для отображения команд и участников",
    version: "1.0.0",
  },

  // Требования к производительности
  performance: {
    // Виртуализация
    virtualization: {
      TeamList: {
        enabled: true,
        threshold: 50, // Включать виртуализацию при >50 элементах
        overscan: 5,
        estimatedItemSize: 120,
      },
    },

    // Мемоизация
    memoization: {
      TeamCard: {
        enabled: true,
        dependencies: ["team.id", "team.name", "team.updated_at"],
        shallowCompare: false,
      },
      TeamMemberAvatar: {
        enabled: true,
        dependencies: ["member.id", "member.avatar_url", "member.role"],
        shallowCompare: true,
      },
    },

    // Ререндеры
    rerenders: {
      maxAllowed: 3,
      trackingEnabled: process.env.NODE_ENV === "development",
      warningThreshold: 5,
    },

    // Метрики
    metrics: {
      loadTime: "< 200ms",
      interactionDelay: "< 100ms",
      memoryUsage: "< 10MB per 100 teams",
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
        "TeamCard - render with team data",
        "TeamCard - handle click events",
        "TeamCard - show archived state",
        "TeamList - filter teams",
        "TeamList - search functionality",
        "TeamMemberAvatar - role display",
        "TeamMemberAvatar - online status",
      ],
      integration: [
        "TeamList + TeamCard interaction",
        "TeamCard + TeamMemberAvatar composition",
        "Search and filter combinations",
      ],
      visual: [
        "TeamCard variants",
        "TeamList view modes",
        "TeamMemberAvatar sizes",
      ],
    },

    // Тестовые данные
    fixtures: {
      teams: {
        basic: "team with 3-5 members",
        archived: "archived team",
        empty: "team without members",
        large: "team with 20+ members",
      },
      members: {
        owner: "team owner",
        admin: "team admin",
        member: "regular member",
        guest: "guest member",
      },
    },
  },

  // Стандарты доступности
  accessibility: {
    // WCAG соответствие
    wcag: {
      level: "AA",
      guidelines: ["1.4.3", "1.4.11", "2.1.1", "2.1.2", "4.1.2"],
    },

    // ARIA атрибуты
    aria: {
      TeamCard: {
        role: "button",
        "aria-label": "team.name + member count",
        "aria-describedby": "team description",
      },
      TeamList: {
        role: "list",
        "aria-label": "Teams list",
        "aria-live": "polite", // for filter updates
      },
      TeamMemberAvatar: {
        role: "img",
        "aria-label": "member.username + role",
      },
    },

    // Навигация с клавиатуры
    keyboard: {
      TeamCard: {
        focusable: true,
        keys: ["Enter", "Space"],
        tabIndex: 0,
      },
      TeamList: {
        arrowNavigation: true,
        focusManagement: "roving",
      },
    },

    // Скринридеры
    screenReader: {
      announcements: [
        "Team selected",
        "Filter applied",
        "Search results updated",
      ],
      descriptions: [
        "Team card with {memberCount} members",
        "Archived team",
        "Team member with {role} role",
      ],
    },
  },

  // Стилизация и темизация
  styling: {
    // Material-UI соответствие
    mui: {
      theme: "app-theme",
      responsive: true,
      breakpoints: ["xs", "sm", "md", "lg", "xl"],
    },

    // Цветовая схема
    colors: {
      TeamCard: {
        default: "background.paper",
        hover: "action.hover",
        selected: "primary.main",
        archived: "action.disabled",
      },
      roles: {
        owner: "error.main",
        admin: "warning.main",
        editor: "primary.main",
        member: "text.secondary",
        guest: "text.disabled",
      },
    },

    // Анимации
    animations: {
      TeamCard: {
        hover: "transform 0.2s ease-in-out",
        click: "scale 0.1s ease-out",
      },
      TeamList: {
        fadeIn: "opacity 0.3s ease-in",
        slideIn: "transform 0.3s ease-out",
      },
    },

    // Адаптивность
    responsive: {
      TeamCard: {
        xs: "full width",
        sm: "2 columns",
        md: "3 columns",
        lg: "4 columns",
      },
      TeamList: {
        xs: "list mode only",
        md: "cards/list toggle",
      },
    },
  },

  // Интеграционные требования
  integration: {
    // Props validation
    propTypes: {
      strict: true,
      required: ["team", "member"],
      optional: ["onClick", "showActions", "compact"],
    },

    // Callbacks
    callbacks: {
      TeamCard: ["onClick", "onMenuClick"],
      TeamList: ["onTeamClick", "onFiltersChange"],
      TeamMemberAvatar: ["onClick"],
    },

    // State management
    state: {
      external: false, // Компоненты stateless
      props: "controlled",
      updates: "reactive",
    },
  },

  // FSD соответствие
  fsd: {
    // Импорты
    imports: {
      allowed: ["@mui/material", "@mui/icons-material", "../model/types"],
      forbidden: ["@/features/*", "@/widgets/*", "@/pages/*"],
    },

    // Экспорты
    exports: {
      components: ["TeamCard", "TeamList", "TeamMemberAvatar"],
      types: ["TeamCardProps", "TeamListProps", "TeamMemberAvatarProps"],
      public: "index.ts",
    },

    // Зависимости
    dependencies: {
      entities: ["none"], // Независимость от других entities
      shared: ["ui", "types", "utils"],
      external: ["react", "@mui/material"],
    },
  },

  // Документация
  documentation: {
    // Обязательные разделы
    required: [
      "Component overview",
      "Props interface",
      "Usage examples",
      "Accessibility notes",
      "Performance considerations",
    ],

    // Примеры кода
    examples: {
      basic: "Simple team card",
      interactive: "Clickable team card with menu",
      filtered: "Team list with search",
      compact: "Compact team avatars",
    },

    // Storybook stories
    storybook: {
      required: true,
      stories: [
        "Default",
        "Archived",
        "Large team",
        "Empty team",
        "Loading state",
        "Error state",
      ],
    },
  },

  // Валидация
  validation: {
    // Линтинг
    eslint: {
      rules: ["react-hooks/exhaustive-deps", "jsx-a11y/recommended"],
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
      propTypes: "development only",
      invariants: "always",
    },
  },
};

export default teamUIConfig;
