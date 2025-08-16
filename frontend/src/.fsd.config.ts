/**
 * FSD Project Configuration
 * Главная конфигурация Feature-Sliced Design для проекта Requify
 */

// Import all component configurations
import { requirementUIConfig } from './entities/requirement/ui/.component.config';
import { projectAPIConfig } from './entities/project/api/.component.config';
import { universalSidebarConfig } from './widgets/universal-sidebar/.component.config';
import { requirementsPagesConfig } from './pages/requirements/.component.config';
import { sharedUIConfig } from './shared/ui/.component.config';

export const fsdProjectConfig = {
  // Метаданные проекта
  project: {
    name: 'Requify',
    version: '1.0.0',
    architecture: 'Feature-Sliced Design',
    description: 'Requirements Management System',
  },

  // Конфигурация слоев FSD
  layers: {
    // App layer
    app: {
      description: 'Application initialization and global setup',
      allowedImports: ['shared', 'entities', 'features', 'widgets', 'pages'],
      rules: {
        singletonPattern: true,
        globalProviders: true,
        routingConfiguration: true,
        noBusinessLogic: true,
      },
    },

    // Pages layer
    pages: {
      description: 'Application pages and routes',
      allowedImports: ['shared', 'entities', 'features', 'widgets'],
      rules: {
        compositionOnly: true,
        noBusinessLogic: true,
        lazyLoading: 'required',
        layoutIntegration: 'pageLayout',
      },
      config: requirementsPagesConfig,
    },

    // Widgets layer
    widgets: {
      description: 'Complex UI blocks combining features and entities',
      allowedImports: ['shared', 'entities', 'features'],
      rules: {
        reusability: 'high',
        composition: 'entities+features',
        isolation: 'strong',
        configurability: 'high',
      },
      config: universalSidebarConfig,
    },

    // Features layer
    features: {
      description: 'Business features with user interactions',
      allowedImports: ['shared', 'entities'],
      rules: {
        businessValue: 'required',
        userInteraction: 'encouraged',
        crossFeatureImports: 'limited',
        stateful: 'allowed',
      },
    },

    // Entities layer
    entities: {
      description: 'Business entities and their representations',
      allowedImports: ['shared'],
      rules: {
        displayOnly: 'ui-layer',
        noBusinessLogic: 'ui-layer',
        crossEntityImports: 'limited',
        dataModeling: 'model-layer',
      },
      config: {
        ui: requirementUIConfig,
        api: projectAPIConfig,
      },
    },

    // Shared layer
    shared: {
      description: 'Reusable code without business context',
      allowedImports: ['external-libraries'],
      rules: {
        noBusinessLogic: true,
        maxReusability: true,
        noUpperLayerImports: true,
        universalUsage: true,
      },
      config: sharedUIConfig,
    },
  },

  // Глобальные правила проекта
  globalRules: {
    // Импорты
    imports: {
      noCircularDependencies: true,
      noUpwardImports: true,
      explicitExports: true,
      barrelExports: 'preferred',
    },

    // TypeScript
    typescript: {
      strictMode: true,
      noImplicitAny: true,
      exactOptionalPropertyTypes: true,
      noUncheckedIndexedAccess: true,
    },

    // Производительность
    performance: {
      lazyLoading: 'pages-and-widgets',
      codesplitting: 'by-route',
      bundleAnalysis: 'enabled',
      treeShaking: 'optimized',
    },

    // Качество кода
    codeQuality: {
      eslint: 'strict',
      prettier: 'enforced',
      husky: 'pre-commit',
      commitlint: 'conventional',
    },

    // Тестирование
    testing: {
      unitTests: 'required',
      integrationTests: 'encouraged',
      e2eTests: 'critical-paths',
      coverageThreshold: 85,
    },

    // Доступность
    accessibility: {
      wcagLevel: 'AA',
      ariaLabels: 'required',
      keyboardNavigation: 'full',
      screenReaderSupport: 'comprehensive',
    },
  },

  // Инструменты и интеграции
  tooling: {
    // Линтеры
    linting: {
      eslint: {
        extends: ['@typescript-eslint/recommended', 'react-hooks'],
        rules: {
          'fsd/no-upper-layer-imports': 'error',
          'fsd/layer-compliance': 'error',
          'fsd/public-api-imports': 'error',
        },
      },
      stylelint: 'enabled',
      commitlint: 'conventional-commits',
    },

    // Сборка
    build: {
      bundler: 'vite',
      typescript: 'strict',
      optimization: 'production',
      sourceMaps: 'development-only',
    },

    // Документация
    documentation: {
      storybook: 'ui-components',
      typedoc: 'api-documentation',
      readme: 'comprehensive',
      examples: 'live-demos',
    },

    // Мониторинг
    monitoring: {
      bundleSize: 'webpack-bundle-analyzer',
      performance: 'lighthouse-ci',
      errors: 'sentry',
      metrics: 'custom-dashboard',
    },
  },

  // Правила файловой структуры
  fileStructure: {
    // Naming conventions
    naming: {
      components: 'PascalCase',
      files: 'camelCase',
      directories: 'kebab-case',
      constants: 'SCREAMING_SNAKE_CASE',
    },

    // Структура слайсов
    sliceStructure: {
      required: ['index.ts'],
      optional: ['api/', 'model/', 'ui/'],
      entities: {
        required: ['index.ts'],
        structure: ['api/', 'model/', 'ui/'],
      },
      features: {
        required: ['index.ts'],
        structure: ['api/', 'model/', 'ui/'],
      },
    },

    // Экспорты
    exports: {
      publicAPI: 'index.ts-only',
      reExports: 'explicit',
      typeExports: 'separate',
      defaultExports: 'components-only',
    },
  },

  // Процессы разработки
  development: {
    // Workflow
    workflow: {
      gitFlow: 'feature-branches',
      codeReview: 'required',
      testing: 'pre-merge',
      deployment: 'automated',
    },

    // Стандарты
    standards: {
      codeStyle: 'prettier',
      commitMessages: 'conventional-commits',
      documentation: 'inline-and-separate',
      apiDesign: 'restful',
    },

    // Автоматизация
    automation: {
      ci: 'github-actions',
      cd: 'docker-compose',
      testing: 'jest-and-playwright',
      codeAnalysis: 'sonarqube',
    },
  },

  // Метрики и мониторинг
  metrics: {
    // Качество кода
    codeQuality: {
      complexity: 'cyclomatic < 10',
      coverage: '> 85%',
      duplication: '< 3%',
      maintainability: 'A-rating',
    },

    // Производительность
    performance: {
      bundleSize: '< 1MB initial',
      loadTime: '< 2s on 3G',
      coreWebVitals: 'good',
      accessibility: '> 95%',
    },

    // Архитектура
    architecture: {
      layerCompliance: '100%',
      circularDependencies: '0',
      publicAPIUsage: '> 90%',
      coupling: 'loose',
    },
  },
} as const;

export type FSDProjectConfig = typeof fsdProjectConfig;

// Экспорт конфигураций отдельных компонентов
export {
  requirementUIConfig,
  projectAPIConfig,
  universalSidebarConfig,
  requirementsPagesConfig,
  sharedUIConfig,
};

// Валидация конфигурации
export const validateFSDConfig = (config: typeof fsdProjectConfig) => {
  const errors: string[] = [];

  // Проверка соответствия слоев
  const requiredLayers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
  const configLayers = Object.keys(config.layers);
  
  const missingLayers = requiredLayers.filter(layer => !configLayers.includes(layer));
  if (missingLayers.length > 0) {
    errors.push(`Missing required layers: ${missingLayers.join(', ')}`);
  }

  // Проверка правил импортов
  for (const [layerName, layer] of Object.entries(config.layers)) {
    if (!layer.allowedImports || !Array.isArray(layer.allowedImports)) {
      errors.push(`Layer ${layerName} must have allowedImports array`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Автоматическая валидация при импорте
const validation = validateFSDConfig(fsdProjectConfig);
if (!validation.isValid) {
  console.warn('FSD Configuration validation errors:', validation.errors);
} 