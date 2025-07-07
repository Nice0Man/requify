# React Query в проекте Requify

## Введение

React Query (TanStack Query) используется для управления серверным состоянием, кэшированием и синхронизацией данных. Это обеспечивает отличную производительность и пользовательский опыт.

## Структура

### Файлы конфигурации

- `src/app/providers/QueryProvider.tsx` - Провайдер React Query
- `src/shared/hooks/useQueries.ts` - Центральный экспорт всех хуков
- `src/shared/hooks/useQueryUtils.ts` - Утилиты для работы с кэшем

### Хуки по функциональности

- `src/features/auth/model/useAuthQuery.ts` - Авторизация
- `src/features/dashboard/model/useDashboardQuery.ts` - Дашборд
- `src/features/project-management/model/useProjectQuery.ts` - Проекты
- `src/features/requirement-management/model/useRequirementQuery.ts` - Требования

## Основные принципы

### 1. Query Keys

Каждый модуль имеет свои ключи запросов:

```typescript
export const projectQueryKeys = {
  all: ['projects'] as const,
  lists: () => [...projectQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...projectQueryKeys.lists(), filters] as const,
  details: () => [...projectQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectQueryKeys.details(), id] as const,
};
```

### 2. Queries (Запросы)

Для получения данных используются хуки `useQuery`:

```typescript
export const useProjects = (filters?: any) => {
  return useQuery({
    queryKey: projectQueryKeys.list(filters),
    queryFn: () => projectApi.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 15 * 60 * 1000, // 15 минут
  });
};
```

### 3. Mutations (Мутации)

Для изменения данных используются хуки `useMutation`:

```typescript
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: (newProject) => {
      // Инвалидируем кэш
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
      
      // Добавляем в кэш
      queryClient.setQueryData(projectQueryKeys.detail(newProject.id), newProject);
    },
  });
};
```

## Настройки кэширования

### Глобальные настройки

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 минут
      cacheTime: 10 * 60 * 1000, // 10 минут
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});
```

### Настройки по типу данных

- **Статистика**: `staleTime: 5 минут, cacheTime: 15 минут`
- **Активность**: `staleTime: 2 минуты, refetchInterval: 30 секунд`
- **Детали объектов**: `staleTime: 5 минут, cacheTime: 15 минут`
- **Списки**: `staleTime: 3 минуты, cacheTime: 10 минут`

## Использование в компонентах

### Простой запрос

```typescript
import { useDashboardStats } from '@/shared/hooks';

const DashboardComponent = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Ошибка загрузки</Alert>;

  return <div>{JSON.stringify(stats)}</div>;
};
```

### Мутация с оптимистическим обновлением

```typescript
import { useCreateProject } from '@/shared/hooks';
import { useQueryUtils } from '@/shared/hooks/useQueryUtils';

const CreateProjectForm = () => {
  const createProject = useCreateProject();
  const { performOptimisticUpdate } = useQueryUtils();

  const handleSubmit = async (formData) => {
    // Оптимистическое обновление
    const { rollback } = performOptimisticUpdate(
      projectQueryKeys.lists(),
      (oldData) => [optimisticProject, ...oldData]
    );

    try {
      await createProject.mutateAsync(formData);
    } catch (error) {
      rollback(); // Откатываем при ошибке
    }
  };
};
```

## Утилиты

### useQueryUtils

```typescript
import { useQueryUtils } from '@/shared/hooks/useQueryUtils';

const { 
  invalidateQueries,
  prefetchQuery,
  setQueryData,
  getQueryData 
} = useQueryUtils();
```

### useOptimisticUpdate

```typescript
import { useOptimisticUpdate } from '@/shared/hooks/useQueryUtils';

const { performOptimisticUpdate } = useOptimisticUpdate();
```

## Паттерны

### 1. Условный запрос

```typescript
const { data } = useProject(projectId, {
  enabled: !!projectId, // Запрос выполняется только при наличии ID
});
```

### 2. Зависимые запросы

```typescript
const { data: user } = useCurrentUser();
const { data: projects } = useProjects(user?.id, {
  enabled: !!user?.id,
});
```

### 3. Параллельные запросы

```typescript
const statsQuery = useDashboardStats();
const activityQuery = useRecentActivity();
const chartQuery = useChartData();
```

### 4. Инвалидация связанных данных

```typescript
// При создании проекта инвалидируем все связанные запросы
onSuccess: (newProject) => {
  queryClient.invalidateQueries({ queryKey: ['projects'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}
```

## Рекомендации

1. **Используйте правильные ключи запросов** - они должны быть уникальными и отражать зависимости
2. **Настраивайте staleTime и cacheTime** в зависимости от частоты обновления данных
3. **Используйте оптимистические обновления** для быстрого UI
4. **Инвалидируйте связанные данные** при изменениях
5. **Обрабатывайте состояния loading и error** во всех компонентах
6. **Используйте prefetching** для улучшения UX

## Отладка

React Query DevTools автоматически включены в режиме разработки и помогают:
- Видеть все запросы и их состояния
- Инспектировать данные в кэше
- Отслеживать инвалидацию и рефетчинг
- Понимать, почему запрос выполняется или не выполняется 