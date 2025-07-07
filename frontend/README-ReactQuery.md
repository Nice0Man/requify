# React Query Integration - Requify Frontend

## 🚀 Быстрый старт

React Query успешно интегрирован в проект для оптимального управления серверным состоянием и кэшированием данных.

### Ключевые возможности

✅ **Автоматическое кэширование** - данные кэшируются и переиспользуются  
✅ **Фоновое обновление** - данные обновляются в фоне  
✅ **Оптимистические обновления** - мгновенный UI отклик  
✅ **Умные повторные запросы** - автоматические повторы при ошибках  
✅ **Инвалидация данных** - умное обновление связанных данных  
✅ **DevTools** - отладка запросов в режиме разработки  

## 📁 Структура файлов

```
src/
├── app/providers/QueryProvider.tsx     # Провайдер React Query
├── shared/hooks/
│   ├── useQueries.ts                   # Экспорт всех хуков
│   └── useQueryUtils.ts                # Утилиты для кэша
├── features/
│   ├── auth/model/useAuthQuery.ts      # Хуки авторизации
│   ├── dashboard/model/useDashboardQuery.ts
│   ├── project-management/model/useProjectQuery.ts
│   └── requirement-management/model/useRequirementQuery.ts
└── shared/docs/react-query-guide.md   # Подробная документация
```

## 🔧 Использование

### Простой запрос данных

```typescript
import { useDashboardStats } from '@/shared/hooks';

const Dashboard = () => {
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Ошибка загрузки</Alert>;

  return <StatsDisplay data={data} />;
};
```

### Создание данных с мутацией

```typescript
import { useCreateProject } from '@/shared/hooks';

const CreateButton = () => {
  const createProject = useCreateProject();

  const handleCreate = async () => {
    try {
      await createProject.mutateAsync({
        name: 'Новый проект',
        description: 'Описание проекта'
      });
      // Данные автоматически обновятся в кэше
    } catch (error) {
      console.error('Ошибка создания:', error);
    }
  };

  return (
    <Button 
      onClick={handleCreate}
      disabled={createProject.isLoading}
    >
      {createProject.isLoading ? 'Создание...' : 'Создать'}
    </Button>
  );
};
```

### Оптимистические обновления

```typescript
import { useOptimisticUpdate } from '@/shared/hooks/useQueryUtils';

const OptimisticForm = () => {
  const { performOptimisticUpdate } = useOptimisticUpdate();
  
  const handleSubmit = async (data) => {
    const { rollback } = performOptimisticUpdate(
      ['projects'],
      (old) => [...old, optimisticData]
    );
    
    try {
      await api.createProject(data);
    } catch (error) {
      rollback(); // Откатываем при ошибке
    }
  };
};
```

## 🎯 Настройки производительности

### Времена кэширования по типу данных

| Тип данных | staleTime | cacheTime | Особенности |
|-----------|-----------|-----------|-------------|
| Статистика | 5 мин | 15 мин | Обновляется при фокусе |
| Активность | 2 мин | 10 мин | Автообновление каждые 30с |
| Детали объектов | 5 мин | 15 мин | Включается по ID |
| Списки | 3 мин | 10 мин | Поддержка фильтров |

### Глобальные настройки

- **Повторы**: 3 попытки с экспоненциальной задержкой
- **Таймаут**: до 30 секунд между попытками
- **Фоновое обновление**: включено при переподключении
- **Обновление при фокусе**: отключено (настраивается по запросу)

## 🛠️ Реализованные хуки

### Авторизация
- `useCurrentUser()` - текущий пользователь
- `useLoginMutation()` - вход в систему
- `useLogoutMutation()` - выход из системы

### Дашборд
- `useDashboardStats()` - статистика
- `useRecentActivity()` - последняя активность
- `useChartData(period)` - данные для графиков

### Проекты
- `useProjects(filters)` - список проектов
- `useProject(id)` - детали проекта
- `useCreateProject()` - создание проекта

### Требования
- `useRequirements(filters)` - список требований
- `useProjectRequirements(projectId)` - требования проекта
- `useCreateRequirement()` - создание требования

## 📊 Отладка

React Query DevTools доступны в режиме разработки:
- Нажмите логотип React Query в левом нижнем углу
- Просматривайте состояние всех запросов
- Отслеживайте кэш и инвалидацию
- Мануально инвалидируйте запросы

## 🔄 Следующие шаги

Планируется добавить:
- [ ] Хуки для управления релизами
- [ ] Хуки для тестирования
- [ ] Обработка уведомлений
- [ ] Поддержка офлайн-режима
- [ ] Оптимизация для мобильных устройств

## 📚 Полная документация

Смотрите `src/shared/docs/react-query-guide.md` для подробной документации со всеми паттернами и примерами использования.

---

**Производительность**: React Query значительно улучшает производительность за счет умного кэширования и минимизации повторных запросов к серверу.

**UX**: Пользователи получают мгновенный отклик интерфейса благодаря оптимистическим обновлениям и фоновой синхронизации данных. 