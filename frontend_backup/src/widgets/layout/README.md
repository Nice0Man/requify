# Layout Widget

Виджет макета приложения, предоставляющий основную структуру для страниц с интегрированным сайдбаром и автоматическим управлением заголовками.

## Структура

```
src/widgets/layout/
├── index.ts                # Публичное API
├── model/
│   ├── index.ts           # Экспорт модели
│   ├── types.ts           # Типы и конфигурация
│   └── useLayout.ts       # Хук управления состоянием
├── ui/
│   ├── index.ts           # Экспорт UI
│   └── MainLayout.tsx     # Основной компонент
└── README.md             # Данный файл
```

## Основные возможности

✅ **Интеграция с AppSidebarWidget** - использует рефакторенный сайдбар  
✅ **Автоматические заголовки страниц** - определение по роуту  
✅ **Персистентное состояние** - сохранение в localStorage  
✅ **Конфигурируемость** - гибкие настройки через props  
✅ **Error Boundary** - изоляция ошибок на уровне layout  
✅ **Адаптивный дизайн** - оптимизация для мобильных  
✅ **Производительность** - React.memo и useMemo оптимизации  
✅ **TypeScript** - полная типизация  

## Использование

### Базовый пример

```typescript
import { MainLayout } from "@/widgets/layout";

function App() {
  return (
    <MainLayout>
      <Typography variant="h4">Содержимое страницы</Typography>
    </MainLayout>
  );
}
```

### С кастомной конфигурацией

```typescript
import { MainLayout } from "@/widgets/layout";
import { Button } from "@mui/material";

function CustomPage() {
  const layoutConfig = {
    showSidebar: true,
    showHeader: false,
    contentPadding: 4,
    contentOverflow: "auto" as const,
    enableTransitions: true,
  };

  const pageActions = (
    <Button variant="contained">
      Действие
    </Button>
  );

  return (
    <MainLayout
      title="Кастомная страница"
      subtitle="Пример использования с настройками"
      config={layoutConfig}
      actions={pageActions}
      onSidebarStateChange={(collapsed) => {
        console.log('Sidebar state:', collapsed);
      }}
    >
      <div>Контент страницы</div>
    </MainLayout>
  );
}
```

### Использование хука useLayout

```typescript
import { useLayout } from "@/widgets/layout";

function PageWithLayoutControl() {
  const layout = useLayout({
    showSidebar: true,
    contentPadding: 2,
  });

  const handleToggleSidebar = () => {
    layout.actions.toggleSidebar();
  };

  const handleSetTitle = () => {
    layout.actions.setPageTitle("Новый заголовок", "Новый подзаголовок");
  };

  return (
    <div>
      <p>Текущий заголовок: {layout.state.pageTitle}</p>
      <p>Сайдбар свернут: {layout.state.isSidebarCollapsed ? 'Да' : 'Нет'}</p>
      
      <button onClick={handleToggleSidebar}>
        Переключить сайдбар
      </button>
      
      <button onClick={handleSetTitle}>
        Изменить заголовок
      </button>
    </div>
  );
}
```

## API

### MainLayout Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Содержимое страницы |
| `title` | `string` | auto | Заголовок страницы (автоопределение по роуту) |
| `subtitle` | `string` | auto | Подзаголовок страницы |
| `actions` | `ReactNode` | - | Действия в header области |
| `config` | `Partial<LayoutConfig>` | `DEFAULT_LAYOUT_CONFIG` | Конфигурация layout |
| `className` | `string` | - | CSS класс |
| `sx` | `SxProps<Theme>` | - | Material-UI стили |
| `onSidebarStateChange` | `(collapsed: boolean) => void` | - | Callback при изменении сайдбара |

### LayoutConfig

```typescript
interface LayoutConfig {
  showSidebar: boolean;           // Показывать сайдбар
  showHeader: boolean;            // Показывать заголовок  
  contentPadding: number;         // Отступы контента
  contentOverflow: "auto" | "hidden" | "visible"; // Overflow контента
  enableTransitions: boolean;     // Анимации переходов
}
```

### useLayout Hook

```typescript
const layout = useLayout(config, pageTitles, onSidebarStateChange);

// Возвращает:
interface UseLayoutReturn {
  state: {
    isSidebarCollapsed: boolean;
    pageTitle: string;
    pageSubtitle?: string;
    currentPath: string;
  };
  config: LayoutConfig;
  actions: {
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;
    setPageTitle: (title: string, subtitle?: string) => void;
  };
}
```

## Автоматические заголовки

Layout автоматически определяет заголовки страниц на основе текущего роута:

```typescript
const DEFAULT_PAGE_TITLES = {
  "/dashboard": {
    title: "Дашборд",
    subtitle: "Обзор системы и ключевые показатели",
  },
  "/projects": {
    title: "Проекты", 
    subtitle: "Управление проектами и задачами",
  },
  "/requirements": {
    title: "Требования",
    subtitle: "Анализ и управление требованиями",
  },
  // ... другие маршруты
};
```

### Кастомные заголовки

```typescript
// Переопределение через props
<MainLayout 
  title="Специальная страница"
  subtitle="Кастомное описание"
>
  {content}
</MainLayout>

// Программное изменение через хук
const layout = useLayout();
layout.actions.setPageTitle("Динамический заголовок");
```

## Персистентность

Layout сохраняет состояние сайдбара в localStorage:

```typescript
// Ключ для хранения
'layout-sidebar-collapsed' // boolean

// Автоматическое восстановление при загрузке
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
  const saved = localStorage.getItem('layout-sidebar-collapsed');
  return saved !== null ? JSON.parse(saved) : true;
});
```

## Интеграция с роутингом

### В App.tsx

```typescript
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/widgets/layout";

function App() {
  return (
    <Routes>
      <Route path="/auth/*" element={<AuthLayout />} />
      <Route 
        path="/*" 
        element={
          <MainLayout>
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              {/* Другие защищенные роуты */}
            </Routes>
          </MainLayout>
        } 
      />
    </Routes>
  );
}
```

### В отдельных страницах

```typescript
// pages/ProjectsPage.tsx
function ProjectsPage() {
  return (
    <MainLayout title="Проекты" subtitle="Управление проектами">
      <ProjectsList />
    </MainLayout>
  );
}

// Или без обертки (заголовки автоматические)
function DashboardPage() {
  return <DashboardContent />;
}
```

## Производительность

### Оптимизации

- ✅ React.memo для предотвращения ненужных ре-рендеров
- ✅ useMemo для дорогих вычислений стилей
- ✅ useCallback для стабильных функций
- ✅ ErrorBoundary для изоляции ошибок
- ✅ Lazy loading состояния из localStorage

### Bundle размер

- **Layout Widget**: ~6KB (gzipped)
- **Dependencies**: @/widgets/app-sidebar, @/shared/ui
- **Tree-shaking**: поддерживается

## Error Handling

Layout включает многоуровневые Error Boundary:

```typescript
// Главный уровень
<ErrorBoundary>
  <MainLayout>
    {/* Уровень сайдбара */}
    <ErrorBoundary>
      <AppSidebarWidget />
    </ErrorBoundary>
    
    {/* Уровень контента */}
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </MainLayout>
</ErrorBoundary>
```

## Миграция

### Переход от старого MainLayout

```typescript
// Старый код (в features/layouts)
import { MainLayout } from "@/features/layouts/MainLayout";

<MainLayout 
  showSidebar={true}
  showHeader={true}
  overflow={false}
>
  {children}
</MainLayout>

// Новый код (в widgets/layout)  
import { MainLayout } from "@/widgets/layout";

<MainLayout
  config={{
    showSidebar: true,
    showHeader: true,
    contentOverflow: "hidden",
  }}
>
  {children}
</MainLayout>
```

### Обновление импортов

```bash
# Найти и заменить импорты
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/features/layouts|@/widgets/layout|g'
```

## Кастомизация

### Расширение заголовков страниц

```typescript
import { MainLayout, DEFAULT_PAGE_TITLES } from "@/widgets/layout";

const customPageTitles = {
  ...DEFAULT_PAGE_TITLES,
  "/custom-page": {
    title: "Кастомная страница",
    subtitle: "Специальное описание",
  },
};

// Использование с кастомными заголовками
const layout = useLayout(config, customPageTitles);
```

### Кастомная конфигурация

```typescript
const customLayoutConfig = {
  showSidebar: true,
  showHeader: false,
  contentPadding: 0,
  contentOverflow: "visible" as const,
  enableTransitions: false,
};

<MainLayout config={customLayoutConfig}>
  {children}
</MainLayout>
```

## Архитектура FSD

Layout виджет следует принципам Feature-Sliced Design:

- **Widgets** (`@/widgets/layout`) - композиционный слой для layout
- **Integration** с `@/widgets/app-sidebar` - использование других виджетов
- **Features** (`@/features/auth`) - интеграция с бизнес-логикой
- **Shared** (`@/shared/ui`) - использование общих компонентов
- **Entities** - типизация через сущности пользователя

Правильное разделение ответственности обеспечивает:
- ✅ Переиспользуемость layout в разных частях приложения
- ✅ Легкое тестирование отдельных компонентов  
- ✅ Независимость от конкретных страниц
- ✅ Возможность создания разных layout'ов 