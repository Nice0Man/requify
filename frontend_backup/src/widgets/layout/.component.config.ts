/**
 * Layout Widget Configuration
 * Конфигурация виджета компоновки страниц
 */

export const layoutConfig = {
  // Метаданные виджета
  meta: {
    layer: 'widgets',
    widget: 'layout',
    description: 'Виджет компоновки страниц с адаптивными сетками и структурированными контейнерами',
    version: '1.0.0',
    dependencies: [
      '@mui/material',
      '@mui/system',
      'react',
    ],
  },

  // Требования к производительности
  performance: {
    // Мемоизация компонентов
    memoization: {
      required: true,
      components: ['Layout', 'Container', 'GridLayout', 'FlexLayout'],
      deps: ['breakpoint', 'spacing', 'direction'],
    },

    // Оптимизация
    optimization: {
      cssInJs: 'styled-components/emotion optimization',
      responsiveCalculations: 'useMemo for breakpoint calculations',
      layoutShifts: 'Prevent cumulative layout shift',
    },

    // Лимиты производительности
    limits: {
      maxNestingLevel: 5,
      renderTime: '< 50ms',
      memoryUsage: '< 1MB',
      layoutShift: '< 0.1',
    },

    // CSS оптимизации
    css: {
      criticalCSS: 'Inline critical layout styles',
      lazyCSS: 'Load non-critical styles lazily',
      cssModules: 'Use CSS modules for component isolation',
    },
  },

  // Функциональные требования
  functionality: {
    // Типы layout
    layoutTypes: [
      'container',        // Основной контейнер
      'grid',            // Grid layout
      'flex',            // Flexbox layout
      'stack',           // Vertical stack
      'center',          // Centered content
      'sidebar',         // Sidebar layout
      'header-footer',   // Header + content + footer
    ],

    // Адаптивная система
    responsive: {
      breakpoints: {
        xs: '0px',
        sm: '600px',
        md: '900px',
        lg: '1200px',
        xl: '1536px',
      },
      gridColumns: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 12,
        xl: 12,
      },
    },

    // Spacing система
    spacing: {
      unit: 8, // 8px базовая единица
      scale: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10],
      semantic: {
        xs: 0.5,  // 4px
        sm: 1,    // 8px
        md: 2,    // 16px
        lg: 3,    // 24px
        xl: 4,    // 32px
      },
    },

    // Контейнеры
    containers: {
      maxWidths: {
        xs: '100%',
        sm: '600px',
        md: '900px',
        lg: '1200px',
        xl: '1536px',
      },
      padding: {
        mobile: 16,
        desktop: 24,
      },
    },

    // Layout утилиты
    utilities: [
      'center-content',
      'full-height',
      'sticky-header',
      'sticky-footer',
      'scrollable-content',
      'overflow-hidden',
    ],
  },

  // UI/UX требования
  ux: {
    // Адаптивность
    responsive: {
      approach: 'Mobile-first',
      fluidDesign: true,
      touchTargets: '44px минимум',
      viewportMeta: 'width=device-width, initial-scale=1',
    },

    // Анимации layout
    animations: {
      transitions: 'layout changes 0.3s ease',
      transforms: 'transform 0.2s ease',
      reflow: 'Minimize reflow/repaint',
      willChange: 'Use will-change sparingly',
    },

    // Визуальная иерархия
    hierarchy: {
      spacing: 'Consistent spacing scale',
      alignment: 'Proper content alignment',
      grouping: 'Visual grouping of related elements',
      whitespace: 'Effective use of white space',
    },

    // Состояния
    states: {
      loading: 'Skeleton layout preservation',
      error: 'Error boundary layout',
      empty: 'Empty state layout',
      overflow: 'Overflow handling strategies',
    },
  },

  // Стандарты доступности
  accessibility: {
    // WCAG соответствие
    wcag: {
      level: 'AA',
      requirements: [
        '1.3.1 - Info and Relationships',
        '1.3.2 - Meaningful Sequence',
        '1.4.4 - Resize text',
        '1.4.10 - Reflow',
        '2.4.3 - Focus Order',
      ],
    },

    // Семантическая разметка
    semantics: {
      landmarks: 'header, nav, main, aside, footer',
      headingHierarchy: 'Logical heading structure',
      listStructure: 'Proper list markup',
      tableStructure: 'Semantic table layout',
    },

    // Адаптивность и доступность
    responsive: {
      textScaling: 'Support 200% text scaling',
      reflow: 'Content reflow at 320px width',
      orientation: 'Support both orientations',
      touchTargets: 'Minimum 44x44px touch targets',
    },

    // ARIA использование
    aria: {
      landmarks: 'role="main", role="banner", etc.',
      navigation: 'aria-label for navigation',
      regions: 'aria-labelledby for content regions',
      liveRegions: 'aria-live for dynamic content',
    },
  },

  // Требования к тестированию
  testing: {
    // Покрытие тестами
    coverage: {
      unit: '85%',
      integration: '75%',
      visual: '90%',
    },

    // Обязательные тесты
    required: [
      'Layout rendering',
      'Responsive breakpoints',
      'Spacing consistency',
      'Container max-widths',
      'Grid system behavior',
      'Flexbox utilities',
      'Accessibility compliance',
      'Performance metrics',
    ],

    // Visual regression тесты
    visual: {
      breakpoints: 'All responsive breakpoints',
      components: 'Layout component variations',
      states: 'Different content states',
      browsers: 'Cross-browser consistency',
    },

    // Performance тесты
    performance: [
      'Layout shift measurements',
      'Render time benchmarks',
      'Memory usage monitoring',
      'CSS parsing time',
    ],
  },

  // Стилизация и темизация
  styling: {
    // Material-UI система
    muiSystem: {
      spacing: 'theme.spacing() function',
      breakpoints: 'theme.breakpoints utilities',
      palette: 'theme.palette for colors',
      typography: 'theme.typography for text',
    },

    // CSS-in-JS
    cssInJs: {
      styled: 'styled-components or @emotion/styled',
      sx: 'MUI sx prop for quick styling',
      makeStyles: 'makeStyles for complex styles',
      globalStyles: 'Global CSS reset and base styles',
    },

    // Design tokens
    tokens: {
      spacing: 'Consistent spacing scale',
      colors: 'Semantic color palette',
      typography: 'Type scale and weights',
      shadows: 'Elevation system',
      borderRadius: 'Consistent border radius',
    },

    // Layout patterns
    patterns: {
      cardLayout: 'Card-based content layout',
      listLayout: 'List and table layouts',
      formLayout: 'Form field arrangements',
      dashboardLayout: 'Dashboard grid layouts',
    },
  },

  // Интеграционные требования
  integration: {
    // Material-UI интеграция
    mui: {
      theme: 'Full MUI theme integration',
      components: 'Container, Grid, Box, Stack',
      breakpoints: 'Responsive behavior',
      spacing: 'Spacing system integration',
    },

    // Shared ресурсы
    shared: {
      'ui': 'Base layout components',
      'utils': 'Layout utility functions',
      'types': 'Layout-related TypeScript types',
      'styles': 'Global styles and themes',
    },

    // React ecosystem
    ecosystem: {
      'react-router': 'Layout integration with routing',
      'react-helmet': 'SEO and meta tags',
      'react-window': 'Virtual scrolling layouts',
    },
  },

  // FSD соответствие
  fsd: {
    // Правила импортов
    imports: {
      allowed: [
        '@/shared/**',
        '@mui/material',
        '@mui/system',
        'react',
      ],
      forbidden: [
        '@/pages/**',
        '@/widgets/**',
        '@/features/**',
        '@/entities/**',
        '@/app/**',
      ],
    },

    // Публичный API
    publicApi: {
      components: [
        'LayoutContainer',
        'GridLayout',
        'FlexLayout',
        'StackLayout',
        'CenterLayout',
      ],
      types: [
        'LayoutProps',
        'GridProps',
        'FlexProps',
        'SpacingProps',
      ],
      utilities: [
        'getBreakpointValue',
        'calculateSpacing',
        'getContainerWidth',
      ],
    },

    // Изоляция
    isolation: {
      pureComponents: 'Layout components are pure',
      noBusinessLogic: 'Only presentation logic',
      reusable: 'Highly reusable across app',
    },
  },

  // Мониторинг и метрики
  monitoring: {
    // Web Vitals
    webVitals: [
      'Cumulative Layout Shift (CLS)',
      'First Contentful Paint (FCP)',
      'Largest Contentful Paint (LCP)',
      'Time to Interactive (TTI)',
    ],

    // Performance метрики
    performance: [
      'layout-render-time',
      'css-parse-time',
      'reflow-count',
      'repaint-count',
    ],

    // Пользовательские метрики
    user: [
      'viewport-sizes',
      'breakpoint-usage',
      'scroll-behavior',
      'interaction-patterns',
    ],
  },

  // Документация
  documentation: {
    // Обязательные документы
    required: [
      'README.md - Layout system overview',
      'RESPONSIVE.md - Responsive design guide',
      'SPACING.md - Spacing system documentation',
      'ACCESSIBILITY.md - Accessible layout practices',
    ],

    // Примеры использования
    examples: [
      'BasicLayout.tsx',
      'ResponsiveGrid.tsx',
      'FlexboxLayouts.tsx',
      'ComplexLayouts.tsx',
    ],

    // Design system документация
    designSystem: [
      'layout-principles.md',
      'responsive-guidelines.md',
      'spacing-guide.md',
      'component-compositions.md',
    ],
  },

  // Валидация конфигурации
  validation: {
    // Схемы валидации
    schemas: {
      props: 'LayoutPropsSchema',
      spacing: 'SpacingSchema',
      breakpoint: 'BreakpointSchema',
    },

    // CSS валидация
    css: {
      linting: 'stylelint for CSS validation',
      a11y: 'CSS accessibility checks',
      performance: 'CSS performance audits',
    },

    // Проверки времени выполнения
    runtime: {
      propValidation: true,
      layoutShiftDetection: true,
      performanceAssertions: true,
    },
  },
};

export default layoutConfig; 