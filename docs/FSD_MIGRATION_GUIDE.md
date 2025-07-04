# Feature-Sliced Design (FSD) Migration Guide

## 📋 Оглавление

1. [Что такое FSD](#что-такое-fsd)
2. [Анализ текущей структуры](#анализ-текущей-структуры)
3. [Новая FSD структура](#новая-fsd-структура)
4. [Пошаговая миграция](#пошаговая-миграция)
5. [Обновление конфигурации](#обновление-конфигурации)
6. [Руководство по слоям](#руководство-по-слоям)
7. [Лучшие практики](#лучшие-практики)

## 🎯 Что такое FSD

**Feature-Sliced Design (FSD)** — это архитектурная методология для проектирования фронтенд-приложений. Основные принципы:

- **Явная архитектура** — четкое разделение слоев и ответственности
- **Стандартизация** — единообразная организация кода
- **Контролируемое переиспользование** — импорты только из нижележащих слоев
- **Адаптивность** — гибкость к изменениям бизнес-требований

### Слои FSD (снизу вверх):

1. **`shared`** — переиспользуемые модули (UI-компоненты, утилиты, константы)
2. **`entities`** — бизнес-сущности (User, Project, Requirement)
3. **`features`** — пользовательские сценарии (аутентификация, создание проекта)
4. **`widgets`** — композитные блоки (навигация, дашборд)
5. **`pages`** — страницы приложения
6. **`app`** — инициализация приложения (провайдеры, роутер, стили)

### Сегменты (внутри слоев):

- **`ui`** — UI-компоненты
- **`api`** — взаимодействие с backend
- **`model`** — бизнес-логика (стор, типы, хуки)
- **`lib`** — вспомогательные функции
- **`config`** — конфигурация

## 📊 Анализ текущей структуры

### Текущая организация:

```
frontend/src/
├── App.tsx                    # Роутинг и провайдеры
├── main.tsx                   # Точка входа
├── features/                  # Фичи по доменам
│   ├── auth/                  # ❌ Содержит страницы
│   ├── projects/              # ❌ Смешивает UI и бизнес-логику
│   ├── requirements/          # ❌ Нет разделения на entities
│   └── ...
└── shared/                    # ✅ Общие компоненты
    ├── components/
    ├── api/
    ├── hooks/
    └── ...
```

### Проблемы текущей структуры:

1. **Отсутствие слоя `app`** — провайдеры и роутинг в корне
2. **Страницы внутри features** — нарушает принципы FSD
3. **Отсутствие `entities`** — бизнес-сущности разбросаны
4. **Неправильные сегменты** — `pages`, `context` вместо `ui`, `model`
5. **Нет слоя `widgets`** — переиспользуемые блоки отсутствуют

## 🏗️ Новая FSD структура

```
frontend/src/
├── app/                       # Инициализация приложения
│   ├── providers/             # React провайдеры
│   ├── router/                # Конфигурация роутинга
│   ├── styles/                # Глобальные стили
│   └── config/                # Конфигурация приложения
├── pages/                     # Страницы приложения
│   ├── auth/
│   │   └── ui/                # LoginPage, RegisterPage
│   ├── dashboard/
│   │   └── ui/                # DashboardPage
│   └── projects/
│       └── ui/                # ProjectsPage, ProjectDetailsPage
├── widgets/                   # Переиспользуемые блоки
│   ├── navigation/
│   │   ├── ui/                # Навигационные компоненты
│   │   └── model/             # Логика навигации
│   ├── dashboard-stats/
│   │   ├── ui/                # Статистика дашборда
│   │   └── model/             # Данные статистики
│   └── activity-feed/
│       ├── ui/                # Лента активности
│       └── model/             # Логика ленты
├── features/                  # Пользовательские сценарии
│   ├── auth/
│   │   ├── ui/                # Формы входа, регистрации
│   │   ├── api/               # API аутентификации
│   │   ├── model/             # AuthContext, hooks
│   │   └── lib/               # Утилиты для auth
│   ├── project-management/
│   │   ├── ui/                # Формы создания/редактирования
│   │   ├── api/               # API проектов
│   │   └── model/             # Типы, стор проектов
│   └── requirement-management/
│       ├── ui/                # Компоненты требований
│       ├── api/               # API требований
│       └── model/             # Логика требований
├── entities/                  # Бизнес-сущности
│   ├── user/
│   │   ├── ui/                # UserCard, UserAvatar
│   │   ├── api/               # Базовые API пользователя
│   │   └── model/             # Типы User, hooks
│   ├── project/
│   │   ├── ui/                # ProjectCard, ProjectStatus
│   │   ├── api/               # Базовые API проекта
│   │   └── model/             # Типы Project
│   └── requirement/
│       ├── ui/                # RequirementItem, RequirementStatus
│       ├── api/               # Базовые API требования
│       └── model/             # Типы Requirement
└── shared/                    # Общие модули
    ├── ui/                    # UI-kit (Button, Input, Modal)
    ├── api/                   # Базовый API клиент
    ├── lib/                   # Утилиты, хуки, типы
    ├── config/                # Конфигурация
    └── assets/                # Статические ресурсы
```

## 🚀 Пошаговая миграция

### Шаг 1: Создание новой структуры

```powershell
# Запуск скрипта рефакторинга (предварительный просмотр)
.\scripts\refactor-to-fsd.ps1 -DryRun

# Выполнение рефакторинга
.\scripts\refactor-to-fsd.ps1
```

### Шаг 2: Обновление импортов

```powershell
# Автоматическое обновление импортов
.\scripts\update-imports-fsd.ps1 -SourcePath "frontend/src_fsd"
```

### Шаг 3: Ручная проверка и доработка

1. **Проверка страниц** — убедитесь что все страницы попали в правильные папки
2. **Разделение логики** — вынесите бизнес-логику из UI компонентов
3. **Создание entities** — выделите базовые сущности из features
4. **Создание widgets** — объедините связанные компоненты в виджеты

### Шаг 4: Обновление конфигурации

См. раздел [Обновление конфигурации](#обновление-конфигурации)

## ⚙️ Обновление конфигурации

### TypeScript configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/app/*": ["app/*"],
      "@/pages/*": ["pages/*"],
      "@/widgets/*": ["widgets/*"],
      "@/features/*": ["features/*"],
      "@/entities/*": ["entities/*"],
      "@/shared/*": ["shared/*"]
    }
  }
}
```

### Vite configuration (vite.config.js)

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/widgets': path.resolve(__dirname, './src/widgets'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/entities': path.resolve(__dirname, './src/entities'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
```

### ESLint configuration (eslint.config.js)

```javascript
import { fixupConfigRules } from '@eslint/compat';
import path from 'path';

export default [
  // ... other config
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: path.resolve(__dirname, './tsconfig.json'),
        },
        alias: {
          map: [
            ['@', './src'],
            ['@/app', './src/app'],
            ['@/pages', './src/pages'],
            ['@/widgets', './src/widgets'],
            ['@/features', './src/features'],
            ['@/entities', './src/entities'],
            ['@/shared', './src/shared'],
          ],
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
      },
    },
    rules: {
      // FSD import rules
      'import/no-internal-modules': [
        'error',
        {
          allow: [
            '**/ui/**',
            '**/api/**',
            '**/model/**',
            '**/lib/**',
            '**/config/**',
          ],
        },
      ],
    },
  },
];
```

## 📚 Руководство по слоям

### App Layer

**Назначение:** Инициализация приложения

**Содержит:**
- Провайдеры (Theme, Auth, Router)
- Глобальные стили
- Конфигурацию приложения
- Основной роутинг

**Пример структуры:**
```
app/
├── providers/
│   ├── index.tsx          # Корневой провайдер
│   └── AuthProvider.tsx   # Провайдер аутентификации
├── router/
│   └── index.tsx          # Конфигурация роутов
├── styles/
│   └── index.css          # Глобальные стили
└── config/
    └── constants.ts       # Константы приложения
```

### Pages Layer

**Назначение:** Страницы приложения (роуты)

**Принципы:**
- Одна страница = один роут
- Минимум логики, максимум композиции
- Импорты только из нижележащих слоев

**Пример:**
```typescript
// pages/projects/ui/ProjectsPage.tsx
import { ProjectList } from '@/widgets/project-list';
import { CreateProjectButton } from '@/features/project-management';
import { PageLayout } from '@/shared/ui';

export const ProjectsPage = () => {
  return (
    <PageLayout title="Проекты">
      <CreateProjectButton />
      <ProjectList />
    </PageLayout>
  );
};
```

### Widgets Layer

**Назначение:** Переиспользуемые блоки UI

**Принципы:**
- Самодостаточные компоненты
- Могут содержать бизнес-логику
- Композиция из entities и features

**Пример:**
```typescript
// widgets/project-list/ui/ProjectList.tsx
import { ProjectCard } from '@/entities/project';
import { useProjects } from '@/entities/project/model';
import { LoadingSpinner } from '@/shared/ui';

export const ProjectList = () => {
  const { projects, isLoading } = useProjects();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="project-list">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
```

### Features Layer

**Назначение:** Пользовательские сценарии

**Принципы:**
- Законченная бизнес-функциональность
- Может использовать entities
- Независимые друг от друга

**Пример:**
```typescript
// features/project-management/ui/CreateProjectForm.tsx
import { useCreateProject } from '../api/createProject';
import { Button, Input } from '@/shared/ui';

export const CreateProjectForm = () => {
  const { createProject, isLoading } = useCreateProject();

  const handleSubmit = (data) => {
    createProject(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input name="name" label="Название проекта" />
      <Button type="submit" loading={isLoading}>
        Создать
      </Button>
    </form>
  );
};
```

### Entities Layer

**Назначение:** Бизнес-сущности

**Принципы:**
- Базовые операции с данными
- Переиспользуемые компоненты сущностей
- Независимые от конкретных сценариев

**Пример:**
```typescript
// entities/project/ui/ProjectCard.tsx
import { Project } from '../model/types';
import { Card } from '@/shared/ui';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <span className="status">{project.status}</span>
    </Card>
  );
};
```

### Shared Layer

**Назначение:** Переиспользуемые модули

**Принципы:**
- Не содержит бизнес-логики
- Максимальная переиспользуемость
- Стабильные API

**Пример структуры:**
```
shared/
├── ui/                    # UI-kit
│   ├── Button/
│   ├── Input/
│   └── Modal/
├── api/                   # Базовый API клиент
│   └── client.ts
├── lib/                   # Утилиты и хуки
│   ├── hooks/
│   ├── utils/
│   └── types/
├── config/                # Конфигурация
│   └── theme.ts
└── assets/                # Статика
    └── images/
```

## 🎯 Лучшие практики

### Правила импортов

```typescript
// ✅ Можно - импорт из нижележащих слоев
import { Button } from '@/shared/ui';
import { ProjectCard } from '@/entities/project';

// ❌ Нельзя - импорт из вышележащих слоев
import { ProjectsPage } from '@/pages/projects'; // из feature
import { SomeWidget } from '@/widgets/some-widget'; // из entity

// ❌ Нельзя - импорт между features
import { AuthForm } from '@/features/auth'; // из другой feature
```

### Именование

```typescript
// Слои - kebab-case
features/project-management/
entities/test-case/
widgets/dashboard-stats/

// Компоненты - PascalCase
ProjectCard.tsx
CreateProjectForm.tsx
DashboardStats.tsx

// Файлы API - camelCase
createProject.ts
updateProject.ts
deleteProject.ts
```

### Структура файлов

```typescript
// Каждый компонент в своей папке
Button/
├── index.ts           # Публичный API
├── Button.tsx         # Основной компонент
├── Button.module.css  # Стили
└── Button.test.tsx    # Тесты

// index.ts для реэкспорта
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

### Публичные API

```typescript
// entities/project/index.ts
export { ProjectCard } from './ui/ProjectCard';
export { useProject } from './model/useProject';
export type { Project } from './model/types';

// Не экспортируем внутренние детали
// ❌ export { ProjectRepository } from './api/repository';
```

## 🔍 Проверка соответствия FSD

### Чек-лист миграции:

- [ ] **App layer создан** — провайдеры, роутер, стили вынесены
- [ ] **Pages содержат только роуты** — минимум логики, максимум композиции
- [ ] **Widgets переиспользуемые** — самодостаточные блоки UI
- [ ] **Features независимые** — законченные сценарии без пересечений
- [ ] **Entities выделены** — базовые сущности с переиспользуемыми компонентами
- [ ] **Shared универсальные** — без бизнес-логики
- [ ] **Импорты корректные** — только из нижележащих слоев
- [ ] **Публичные API определены** — через index.ts файлы
- [ ] **TypeScript настроен** — алиасы для всех слоев
- [ ] **Сборка работает** — нет ошибок компиляции

### Команды для проверки:

```bash
# Проверка типов
npm run type-check

# Сборка
npm run build

# Запуск dev-сервера
npm run dev

# Линтинг
npm run lint

# Тесты
npm run test
```

## 🚨 Частые ошибки

1. **Импорты из одного уровня в features** — features должны быть независимы
2. **Бизнес-логика в shared** — shared должен быть универсален
3. **Страницы в features** — страницы выносятся в отдельный слой
4. **Циклические зависимости** — проверяйте направление импортов
5. **Смешивание сегментов** — ui, api, model должны быть разделены

## 📋 Заключение

FSD поможет сделать архитектуру более понятной, стабильной и масштабируемой. Основные преимущества после миграции:

- **Понятная структура** — разработчики быстро ориентируются в коде
- **Контролируемые зависимости** — четкие правила импортов
- **Легкий рефакторинг** — изменения локализованы в слоях
- **Переиспользование** — компоненты легко переносятся между проектами

Следуйте принципам FSD, и ваш код станет более поддерживаемым! 