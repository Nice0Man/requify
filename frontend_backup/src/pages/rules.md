# Pages Layer Rules - Слой страниц

## Назначение
Содержит страницы приложения, которые объединяют виджеты, функциональности и сущности в готовые к использованию экраны.

## Структура
```
pages/
├── landing/        # Лендинг (НЕ ИЗМЕНЯТЬ)
├── auth/           # Авторизация (НЕ ИЗМЕНЯТЬ)
├── dashboard/      # Главная страница дашборда
├── projects/       # Страница проектов
├── requirements/   # Страница требований
├── testing/        # Страница тестирования
├── releases/       # Страница релизов
├── settings/       # Настройки
├── admin/          # Администрирование
└── */
    └── ui/         # Компоненты страницы
```

## Правила

### 1. Зависимости
- **МОЖЕТ** импортировать: `shared`, `entities`, `features`, `widgets`
- **Главное правило**: страницы - это композиция нижележащих слоев

### 2. Структура страницы
Каждая страница **ДОЛЖНА** содержать:
- `ui/` - компоненты страницы
- Только композиция, без бизнес-логики

### 3. Обязательные элементы
Каждая страница (кроме Landing/Auth) **ДОЛЖНА** содержать:
- **Universal Sidebar** с DnD функциональностью
- **App Header** с заголовком и действиями
- **Main Content Area** с контентом страницы
- **Bottom Navigation** в сайдбаре с:
  - Ссылками на другие страницы
  - Ссылкой на админские настройки (если пользователь - админ)

### 4. Layout структура
```typescript
export const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <UniversalSidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
```

### 5. Оптимизация
- **React.memo** для всех страниц
- **Lazy loading** через React.lazy
- **Error boundaries** вокруг всего контента
- **Suspense** с fallback компонентами

## Структура файлов

### Основная страница
```typescript
// pages/dashboard/ui/DashboardPage.tsx
import { PageLayout } from '@/shared/ui/layout';
import { DashboardStats } from '@/widgets/dashboard-stats';
import { ProjectOverview } from '@/widgets/project-overview';
import { ActivityFeed } from '@/widgets/activity-feed';

export const DashboardPage = memo(() => {
  return (
    <PageLayout title="Дашборд">
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <DashboardStats />
        </Grid>
        <Grid item xs={12} lg={4}>
          <ProjectOverview />
        </Grid>
        <Grid item xs={12}>
          <ActivityFeed />
        </Grid>
      </Grid>
    </PageLayout>
  );
});
```

### Страница с сайдбаром
```typescript
// pages/projects/ui/ProjectsPage.tsx
export const ProjectsPage = memo(() => {
  const sidebarItems = useMemo(() => [
    { id: 'all', label: 'Все проекты', icon: <FolderIcon /> },
    { id: 'active', label: 'Активные', icon: <PlayArrowIcon /> },
    { id: 'archived', label: 'Архив', icon: <ArchiveIcon /> },
  ], []);

  const bottomItems = useMemo(() => [
    { id: 'settings', label: 'Настройки', href: '/settings' },
    { id: 'admin', label: 'Админ панель', href: '/admin', adminOnly: true },
  ], []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <UniversalSidebar 
        items={sidebarItems}
        bottomItems={bottomItems}
        onReorder={handleReorder}
      />
      <Box sx={{ flexGrow: 1 }}>
        <AppHeader title="Проекты" />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <ProjectsList />
        </Container>
      </Box>
    </Box>
  );
});
```

## Lazy Loading и Performance

```typescript
// pages/index.ts
import { lazy } from 'react';

// Lazy loading для лучшей производительности
export const DashboardPage = lazy(() => 
  import('./dashboard/ui/DashboardPage').then(m => ({ default: m.DashboardPage }))
);

export const ProjectsPage = lazy(() => 
  import('./projects/ui/ProjectsPage').then(m => ({ default: m.ProjectsPage }))
);

// Fallback компонент
export const PageSkeleton = () => (
  <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <Skeleton variant="rectangular" width={240} height="100vh" />
    <Box sx={{ flexGrow: 1 }}>
      <Skeleton variant="rectangular" height={64} />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Container>
    </Box>
  </Box>
);
```

## Роутинг

```typescript
// app/router/index.tsx
import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/shared/ui';
import { 
  DashboardPage, 
  ProjectsPage, 
  PageSkeleton 
} from '@/pages';

export const AppRouter = () => (
  <ErrorBoundary>
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        {/* Остальные роуты */}
      </Routes>
    </Suspense>
  </ErrorBoundary>
);
```

## Список страниц

### Основные страницы (с сайдбаром)
- [ ] `/dashboard` - Главная страница дашборда
- [ ] `/projects` - Управление проектами
- [ ] `/requirements` - Управление требованиями
- [ ] `/testing` - Тестирование и QA
- [ ] `/releases` - Управление релизами
- [ ] `/reports` - Отчеты и аналитика
- [ ] `/settings` - Пользовательские настройки
- [ ] `/admin` - Администрирование (только для админов)

### Специальные страницы (без изменений)
- [x] `/` - Landing page (НЕ ИЗМЕНЯТЬ)
- [x] `/auth` - Авторизация (НЕ ИЗМЕНЯТЬ)
- [ ] `/404` - Страница не найдена

### Модальные/дополнительные
- [ ] `/kanban` - Канбан доска (может быть в рамках проектов)

## Примеры использования

### Правильно ✅
```typescript
// Композиция виджетов без логики
export const DashboardPage = memo(() => {
  return (
    <PageLayout title="Дашборд">
      <DashboardStats />
      <ProjectOverview />
      <ActivityFeed />
    </PageLayout>
  );
});

// Использование сайдбара
const sidebarItems = useSidebarConfig('projects');
const bottomItems = useBottomNavigation({ showAdmin: user?.isAdmin });
```

### Неправильно ❌
```typescript
// ❌ Бизнес-логика в странице
export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // API запросы - должны быть в entities/features
    fetchProjects().then(setProjects);
  }, []);
  
  // Логика должна быть в нижележащих слоях
};

// ❌ Прямое использование API
const handleCreate = async () => {
  await fetch('/api/projects', { method: 'POST' });
};
```

## Статус реализации
- [ ] Правила созданы
- [ ] Universal Sidebar интегрирован во все страницы
- [ ] Lazy loading настроен
- [ ] Error boundaries добавлены
- [ ] Bottom navigation реализована
- [ ] Admin links добавлены
- [ ] Производительность оптимизирована
- [ ] Документация завершена 