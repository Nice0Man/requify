# Система разрешений Requify

Документация по новой системе разрешений, построенной согласно архитектуре Feature-Sliced Design (FSD).

## Обзор

Система разрешений Requify предоставляет гранулярный контроль доступа на основе ролей пользователей. Она построена с использованием современных паттернов React и оптимизирована для производительности.

## Архитектура FSD

### Слои архитектуры

```
📂 entities/permissions        # Базовые типы и конфигурация ролей
├── model/
│   ├── types.ts              # Интерфейсы и типы разрешений
│   ├── config.ts             # Конфигурация разрешений по ролям
│   └── index.ts              # Экспорт модели
└── index.ts                  # Главный экспорт entity

📂 shared/lib/permissions     # Утилиты для работы с разрешениями
├── hasPermission.ts          # Функции проверки разрешений
└── index.ts                  # Экспорт утилит

📂 features/permissions       # Функциональность управления разрешениями
├── hooks/
│   ├── usePermissions.ts     # Хуки для работы с разрешениями
│   └── index.ts              # Экспорт хуков
├── ui/
│   ├── Can.tsx               # Компонент условного рендеринга
│   ├── PermissionWrapper.tsx # Компонент-обертка
│   └── index.ts              # Экспорт UI компонентов
└── index.ts                  # Главный экспорт feature

📂 app/providers             # Провайдеры приложения
├── PermissionsProvider.tsx   # Интеграция с App слоем
└── AppProviders.tsx          # Главный провайдер приложения
```

## Роли пользователей

### Иерархия ролей

```
admin              - Полный доступ ко всем функциям
project_manager    - Управление проектами, командами, релизами
analyst           - Работа с требованиями, просмотр отчетов
developer         - Обновление статуса требований, выполнение тестов
tester            - Полное управление тестированием
viewer            - Только просмотр проектов и требований
```

### Матрица разрешений

| Ресурс                        | Admin | PM  | Analyst | Developer | Tester | Viewer |
| ----------------------------- | ----- | --- | ------- | --------- | ------ | ------ |
| Dashboard                     | ✅    | ✅  | ✅      | ✅        | ✅     | ✅     |
| Projects (управление)         | ✅    | ✅  | ❌      | ❌        | ❌     | ❌     |
| Projects (создание)           | ✅    | ✅  | ❌      | ❌        | ❌     | ❌     |
| Projects (редактирование)     | ✅    | ✅  | ❌      | ❌        | ❌     | ❌     |
| Projects (удаление)           | ✅    | ❌  | ❌      | ❌        | ❌     | ❌     |
| Requirements (управление)     | ✅    | ✅  | ✅      | ❌        | ❌     | ❌     |
| Requirements (создание)       | ✅    | ✅  | ✅      | ❌        | ❌     | ❌     |
| Requirements (редактирование) | ✅    | ✅  | ✅      | ✅        | ❌     | ❌     |
| Testing (просмотр)            | ✅    | ✅  | ✅      | ✅        | ✅     | ❌     |
| Testing (управление)          | ✅    | ✅  | ❌      | ❌        | ✅     | ❌     |
| Users (управление)            | ✅    | ❌  | ❌      | ❌        | ❌     | ❌     |
| Admin Panel                   | ✅    | ❌  | ❌      | ❌        | ❌     | ❌     |

## Использование

### Основные хуки

#### `usePermissions()`

Основной хук для работы с разрешениями.

```tsx
import { usePermissions } from "@/features/permissions";

const MyComponent = () => {
  const { user, permissions, hasPermission, canAccessPage } = usePermissions();

  return (
    <div>
      {hasPermission("projects", "create") && <button>Создать проект</button>}
    </div>
  );
};
```

#### Специализированные хуки

```tsx
import {
  useCanAccess,
  useCanAccessPage,
  useProjectPermissions,
  useAdminPermissions,
} from "@/features/permissions";

const ProjectPanel = () => {
  const canCreateProject = useCanAccess("projects", "create");
  const canAccessAdmin = useCanAccessPage("admin");
  const projectPerms = useProjectPermissions();
  const adminPerms = useAdminPermissions();

  return (
    <div>
      {projectPerms.canCreate && <CreateProjectButton />}
      {adminPerms.isAdmin && <AdminControls />}
    </div>
  );
};
```

### Компоненты условного рендеринга

#### `Can` - Основной компонент

```tsx
import { Can } from '@/features/permissions';

// Простая проверка разрешения
<Can resource="projects" action="create">
  <button>Создать проект</button>
</Can>

// Проверка множественных разрешений (ИЛИ)
<Can anyOf={[['projects', 'edit'], ['projects', 'manage']]}>
  <EditProjectButton />
</Can>

// Проверка по роли
<Can role="admin">
  <AdminPanel />
</Can>

// Функция как дочерний элемент
<Can resource="users" action="delete">
  {(allowed) => (
    <button disabled={!allowed}>
      {allowed ? 'Удалить' : 'Нет прав'}
    </button>
  )}
</Can>

// С fallback компонентом
<Can resource="reports" action="view" fallback={<NoAccessMessage />}>
  <ReportsPanel />
</Can>
```

#### `PermissionWrapper` - Инъекция разрешений

```tsx
import { PermissionWrapper } from "@/features/permissions";

<PermissionWrapper resource="projects" action="manage">
  <ProjectForm />
  <ProjectActions />
</PermissionWrapper>;

// Дочерние компоненты получат props:
interface ChildProps {
  hasPermission: boolean;
  permissions: {
    hasMainPermission: boolean;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canManage: boolean;
  };
  userRole?: string;
}
```

#### Higher-Order Component

```tsx
import { withPermissions } from "@/features/permissions";

const ProjectFormWithPermissions = withPermissions(ProjectForm, {
  resource: "projects",
  action: "create",
});
```

### Защищенные маршруты

#### Базовый `ProtectedRoute`

```tsx
import { ProtectedRoute } from '@/app/router/ProtectedRoute';

// Legacy поддержка ролей
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// Новая система разрешений
<ProtectedRoute resource="projects" action="manage">
  <ProjectManagement />
</ProtectedRoute>

// Проверка доступа к странице
<ProtectedRoute page="admin">
  <AdminPanel />
</ProtectedRoute>

// Множественные разрешения
<ProtectedRoute anyPermissions={[['projects', 'edit'], ['projects', 'manage']]}>
  <ProjectEditor />
</ProtectedRoute>

// С кастомным fallback
<ProtectedRoute
  resource="reports"
  action="view"
  fallbackComponent={CustomNoAccessPage}
>
  <Reports />
</ProtectedRoute>
```

#### Специализированные маршруты

```tsx
import {
  AdminRoute,
  ProjectManagerRoute,
  ProjectManagementRoute,
  UserManagementRoute
} from '@/app/router/ProtectedRoute';

<AdminRoute>
  <AdminDashboard />
</AdminRoute>

<ProjectManagerRoute>
  <ProjectDashboard />
</ProjectManagerRoute>

<ProjectManagementRoute>
  <ProjectSettings />
</ProjectManagementRoute>
```

### Интеграция с Router

```tsx
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";

const AppRoutes = () => (
  <Routes>
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute page="dashboard">
          <Dashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/projects"
      element={
        <ProtectedRoute resource="projects" action="view">
          <Projects />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin"
      element={
        <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
          <AdminPanel />
        </ProtectedRoute>
      }
    />
  </Routes>
);
```

## Утилиты

### Прямое использование утилит

```tsx
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessPage,
  canShowSidebarItem,
} from "@/shared/lib/permissions";

const checkAccess = (userPermissions) => {
  const canCreate = hasPermission(userPermissions, "projects", "create");
  const canEditOrManage = hasAnyPermission(userPermissions, [
    ["projects", "edit"],
    ["projects", "manage"],
  ]);
  const hasFullAccess = hasAllPermissions(userPermissions, [
    ["projects", "create"],
    ["projects", "edit"],
    ["projects", "delete"],
  ]);

  return { canCreate, canEditOrManage, hasFullAccess };
};
```

## Типы

### Основные интерфейсы

```typescript
import type {
  Permission,
  PermissionConfig,
  PermissionResource,
  PermissionAction,
  UserRole,
} from "@/entities/permissions";

// Проверка типа ресурса
const resource: PermissionResource = "projects"; // ✅
const action: PermissionAction = "create"; // ✅

// Конфигурация разрешений пользователя
interface UserWithPermissions {
  user: User;
  permissions: PermissionConfig;
}
```

## Производительность

### Оптимизация

1. **Мемоизация**: Все хуки используют `useMemo` для кэширования результатов
2. **Контекстная оптимизация**: Провайдер мемоизирует значения контекста
3. **Lazy loading**: Компоненты загружаются по требованию

### Лучшие практики

```tsx
// ✅ Хорошо - мемоизированная проверка
const MyComponent = () => {
  const canEdit = useCanAccess("projects", "edit");
  return canEdit ? <EditButton /> : null;
};

// ❌ Плохо - проверка в рендере
const MyComponent = () => {
  const { hasPermission } = usePermissions();
  return hasPermission("projects", "edit") ? <EditButton /> : null;
};

// ✅ Хорошо - использование Can компонента
<Can resource="projects" action="edit">
  <EditButton />
</Can>;
```

## Миграция с старой системы

### Замена usePermissions

```tsx
// Старый код
import { usePermissions } from "@/app/providers/PermissionsProvider";

// Новый код
import { usePermissions } from "@/features/permissions";
```

### Замена ProtectedRoute

```tsx
// Старый код
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>

// Новый код (работает и так, обратная совместимость)
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>

// Рекомендуемый новый подход
<ProtectedRoute resource="admin" action="view">
  <AdminPanel />
</ProtectedRoute>
```

## Отладка

### Инструменты разработчика

```tsx
import { usePermissions } from "@/features/permissions";

const DebugPermissions = () => {
  const { user, permissions, error } = usePermissions();

  if (process.env.NODE_ENV === "development") {
    console.log("User:", user);
    console.log("Permissions:", permissions);
    console.log("Error:", error);
  }

  return null;
};
```

### Проверка разрешений в консоли

```javascript
// В консоли браузера
window.__REQUIFY_DEBUG__ = {
  user: window.__PERMISSION_CONTEXT__.user,
  permissions: window.__PERMISSION_CONTEXT__.permissions,
};
```

## Расширение системы

### Добавление новых разрешений

1. Обновите `PermissionConfig` в `entities/permissions/model/types.ts`
2. Добавьте разрешения в `ROLE_PERMISSIONS` в `entities/permissions/model/config.ts`
3. Обновите функцию `canAccessPage` в `shared/lib/permissions/hasPermission.ts`

### Добавление новых ролей

1. Добавьте роль в `USER_ROLES` в `entities/user/model/types.ts`
2. Добавьте конфигурацию в `ROLE_PERMISSIONS` в `entities/permissions/model/config.ts`

## Тестирование

### Мокирование разрешений

```tsx
import { render } from "@testing-library/react";
import { PermissionsProvider } from "@/app/providers/PermissionsProvider";

const renderWithPermissions = (component, userRole = "viewer") => {
  const mockUser = { id: 1, role: userRole, email: "test@test.com" };

  return render(
    <PermissionsProvider user={mockUser}>{component}</PermissionsProvider>
  );
};

test("should show create button for admin", () => {
  const { getByText } = renderWithPermissions(<MyComponent />, "admin");
  expect(getByText("Создать")).toBeInTheDocument();
});
```

## Заключение

Новая система разрешений Requify предоставляет:

- 🏗️ **Архитектурную чистоту** согласно FSD принципам
- 🔒 **Гранулярный контроль доступа** на уровне ресурсов и действий
- ⚡ **Высокую производительность** благодаря мемоизации
- 🔄 **Обратную совместимость** с существующим кодом
- 🛠️ **Удобные инструменты разработки** и отладки
- 📝 **Type-safe API** с полной поддержкой TypeScript

Система готова к использованию и может быть легко расширена для новых требований.
