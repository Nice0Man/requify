# Миграция MainLayout

Руководство по переходу от старого MainLayout (в features/layouts) к новому виджету layout согласно архитектуре FSD.

## Что изменилось

### 1. Расположение

```bash
# Старый путь
src/features/layouts/MainLayout.tsx

# Новый путь  
src/widgets/layout/ui/MainLayout.tsx
```

### 2. Структура пропсов

```typescript
// Старые пропсы
interface OldMainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode[];  // Массив
  showSidebar?: boolean;        // Отдельные булевы флаги
  showHeader?: boolean;
  overflow?: boolean;
  className?: string;
  sx?: Record<string, any>;
}

// Новые пропсы
interface NewMainLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;          // Один элемент
  config?: Partial<LayoutConfig>; // Объединено в конфигурацию
  className?: string;
  sx?: SxProps<Theme>;
  onSidebarStateChange?: (collapsed: boolean) => void; // Новый callback
}
```

### 3. Конфигурация

```typescript
// Старый подход
<MainLayout 
  showSidebar={true}
  showHeader={false}
  overflow={true}
/>

// Новый подход
<MainLayout
  config={{
    showSidebar: true,
    showHeader: false,
    contentOverflow: "auto",
    contentPadding: 3,
    enableTransitions: true,
  }}
/>
```

## Пошаговая миграция

### Шаг 1: Обновить импорты

```typescript
// Было
import { MainLayout } from "@/features/layouts/MainLayout";

// Стало
import { MainLayout } from "@/widgets/layout";
```

### Шаг 2: Обновить пропсы

```typescript
// Было
<MainLayout
  title="Проекты"
  subtitle="Управление проектами"
  actions={[
    <Button key="1">Действие 1</Button>,
    <Button key="2">Действие 2</Button>
  ]}
  showSidebar={true}
  showHeader={false}
  overflow={true}
  className="custom-layout"
  sx={{ backgroundColor: 'red' }}
>
  {children}
</MainLayout>

// Стало
<MainLayout
  title="Проекты"
  subtitle="Управление проектами"
  actions={
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button>Действие 1</Button>
      <Button>Действие 2</Button>
    </Box>
  }
  config={{
    showSidebar: true,
    showHeader: false,
    contentOverflow: "auto",
  }}
  className="custom-layout"
  sx={{ backgroundColor: 'red' }}
  onSidebarStateChange={(collapsed) => {
    console.log('Sidebar state changed:', collapsed);
  }}
>
  {children}
</MainLayout>
```

### Шаг 3: Использовать хук useLayout (опционально)

```typescript
// Для компонентов которым нужен контроль над layout
import { useLayout } from "@/widgets/layout";

function MyPage() {
  const layout = useLayout({
    showSidebar: true,
    contentPadding: 2,
  });

  const handleToggleSidebar = () => {
    layout.actions.toggleSidebar();
  };

  return (
    <div>
      <button onClick={handleToggleSidebar}>
        {layout.state.isSidebarCollapsed ? 'Развернуть' : 'Свернуть'}
      </button>
      {/* Остальной контент */}
    </div>
  );
}
```

## Автоматическая замена

### Script для массовой замены импортов

```bash
#!/bin/bash

# Заменить импорты во всех TypeScript файлах
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|import.*MainLayout.*from.*"@/features/layouts.*"|import { MainLayout } from "@/widgets/layout";|g'

# Заменить именованные импорты
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/features/layouts/MainLayout|@/widgets/layout|g'
```

### VS Code Find & Replace

```
Поиск: import.*MainLayout.*from.*"@/features/layouts.*"
Замена: import { MainLayout } from "@/widgets/layout";
Параметры: Regex включен, Search in all files
```

## Маппинг пропсов

| Старый проп | Новый проп | Примечание |
|-------------|------------|------------|
| `showSidebar` | `config.showSidebar` | Перенесено в конфигурацию |
| `showHeader` | `config.showHeader` | Перенесено в конфигурацию |
| `overflow` | `config.contentOverflow` | Теперь enum: "auto" \| "hidden" \| "visible" |
| `actions` (array) | `actions` (ReactNode) | Нужно обернуть в контейнер |
| - | `config.contentPadding` | Новая настройка |
| - | `config.enableTransitions` | Новая настройка |
| - | `onSidebarStateChange` | Новый callback |

## Частые проблемы и решения

### 1. Actions как массив

```typescript
// Проблема: actions больше не массив
const actions = [
  <Button key="1">Действие 1</Button>,
  <Button key="2">Действие 2</Button>
];

// Решение: обернуть в контейнер
const actions = (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Button>Действие 1</Button>
    <Button>Действие 2</Button>
  </Box>
);
```

### 2. Отсутствует AppSidebarWidget

```typescript
// Проблема: импорт не найден
import { AppSidebarWidget } from "@/widgets";

// Решение: использовать правильный путь
import { AppSidebarWidget } from "@/widgets/app-sidebar";
```

### 3. Типы User изменились

```typescript
// Проблема: старые поля User
interface OldUser {
  id: string;
  firstName: string;
  lastName: string;
  // ...
}

// Решение: обновить до новых полей
interface NewUser {
  id: number;
  full_name: string;
  avatar_url: string;
  // ...
}
```

### 4. Overflow boolean -> string

```typescript
// Проблема: overflow как boolean
overflow={true}

// Решение: использовать enum в конфигурации
config={{
  contentOverflow: "auto" // или "hidden" | "visible"
}}
```

## Тестирование миграции

### 1. Проверить компиляцию

```bash
npm run build
# или
yarn build
```

### 2. Проверить runtime

```typescript
// Добавить console.log для отладки
<MainLayout
  onSidebarStateChange={(collapsed) => {
    console.log('Layout migration: sidebar state =', collapsed);
  }}
>
  {children}
</MainLayout>
```

### 3. Проверить автоматические заголовки

Убедиться что заголовки страниц отображаются корректно:

```typescript
// В разных роутах
"/dashboard" → "Дашборд"
"/projects" → "Проекты"
"/requirements" → "Требования"
```

## Rollback план

Если миграция вызывает проблемы:

### 1. Откатить импорты

```bash
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|import { MainLayout } from "@/widgets/layout";|import { MainLayout } from "@/features/layouts/MainLayout";|g'
```

### 2. Откатить изменения пропсов

Использовать git для отката файлов с изменениями пропсов:

```bash
git checkout -- src/path/to/file.tsx
```

### 3. Временное использование старого и нового

Можно временно импортировать оба:

```typescript
import { MainLayout as OldMainLayout } from "@/features/layouts/MainLayout";
import { MainLayout as NewMainLayout } from "@/widgets/layout";

// Использовать нужный в зависимости от ситуации
```

## Чеклист миграции

- [ ] Обновлены все импорты с `@/features/layouts` на `@/widgets/layout`
- [ ] Конвертированы boolean пропсы в объект `config`
- [ ] Обновлены массивы `actions` в единый ReactNode
- [ ] Добавлены callbacks `onSidebarStateChange` где нужно
- [ ] Проверена компиляция TypeScript
- [ ] Протестирована работа в браузере
- [ ] Проверены автоматические заголовки страниц
- [ ] Проверена работа сайдбара
- [ ] Обновлены тесты (если есть)

## Дополнительные возможности

После миграции становятся доступны новые возможности:

### 1. Управление layout через хук

```typescript
const layout = useLayout();
layout.actions.setPageTitle("Динамический заголовок");
```

### 2. Персистентное состояние сайдбара

```typescript
// Состояние автоматически сохраняется в localStorage
// и восстанавливается при перезагрузке
```

### 3. Интеграция с AppSidebarWidget

```typescript
// Использует новый рефакторенный сайдбар с улучшенными возможностями
```

### 4. Лучшая типизация

```typescript
// Полная типизация с TypeScript
// IntelliSense поддержка в IDE
``` 