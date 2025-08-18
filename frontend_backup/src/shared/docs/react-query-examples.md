# React Query хуки - Примеры использования

## Обзор

Этот документ содержит практические примеры использования всех React Query хуков в проекте Requify.

## Управление релизами

### Основные запросы

```typescript
import { useReleases, useRelease, useReleaseStats } from '@/shared/hooks';

const ReleasesComponent = () => {
  // Получение списка релизов с фильтрацией
  const { data: releases, isLoading } = useReleases({
    projectId: 'project-123',
    status: 'published'
  });

  // Получение конкретного релиза
  const { data: release } = useRelease('release-456');

  // Статистика релизов
  const { data: stats } = useReleaseStats();

  return (
    <div>
      {isLoading ? 'Загрузка...' : releases?.map(release => (
        <div key={release.id}>{release.name}</div>
      ))}
    </div>
  );
};
```

### Мутации релизов

```typescript
import { 
  useCreateRelease, 
  usePublishRelease, 
  useDeployRelease 
} from '@/shared/hooks';

const ReleaseActions = () => {
  const createRelease = useCreateRelease();
  const publishRelease = usePublishRelease();
  const deployRelease = useDeployRelease();

  const handleCreateRelease = async () => {
    try {
      const newRelease = await createRelease.mutateAsync({
        name: 'v1.2.0',
        version: '1.2.0',
        description: 'Новый релиз с исправлениями',
        projectId: 'project-123'
      });
      console.log('Релиз создан:', newRelease);
    } catch (error) {
      console.error('Ошибка создания релиза:', error);
    }
  };

  const handlePublish = async (releaseId: string) => {
    await publishRelease.mutateAsync(releaseId);
  };

  const handleDeploy = async (releaseId: string) => {
    await deployRelease.mutateAsync({
      id: releaseId,
      environment: 'production'
    });
  };

  return (
    <div>
      <button onClick={handleCreateRelease}>
        Создать релиз
      </button>
    </div>
  );
};
```

## Управление тестированием

### Работа с тест-кейсами

```typescript
import { 
  useTestCases, 
  useTestCase, 
  useExecuteTestCase,
  useTestStats 
} from '@/shared/hooks';

const TestingComponent = () => {
  // Получение тест-кейсов
  const { data: testCases } = useTestCases({
    projectId: 'project-123',
    status: 'pending'
  });

  // Статистика тестирования
  const { data: testStats } = useTestStats();

  // Выполнение тест-кейса
  const executeTest = useExecuteTestCase();

  const handleExecuteTest = async (testId: string) => {
    await executeTest.mutateAsync({
      id: testId,
      data: {
        executorId: 'user-123',
        status: 'passed',
        duration: 1200,
        notes: 'Тест прошел успешно'
      }
    });
  };

  return (
    <div>
      <h3>Покрытие: {testStats?.coverage}%</h3>
      {testCases?.map(test => (
        <div key={test.id}>
          <span>{test.title}</span>
          <button onClick={() => handleExecuteTest(test.id)}>
            Выполнить
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Работа с тест-сюитами

```typescript
import { 
  useTestSuites, 
  useRunTestSuite, 
  useGenerateTestReport 
} from '@/shared/hooks';

const TestSuiteManager = () => {
  const { data: testSuites } = useTestSuites('project-123');
  const runSuite = useRunTestSuite();
  const generateReport = useGenerateTestReport();

  const handleRunSuite = async (suiteId: string) => {
    const executions = await runSuite.mutateAsync(suiteId);
    console.log('Результаты выполнения:', executions);
  };

  const handleGenerateReport = async () => {
    await generateReport.mutateAsync({
      projectId: 'project-123',
      format: 'html'
    });
  };

  return (
    <div>
      {testSuites?.map(suite => (
        <div key={suite.id}>
          <h4>{suite.name}</h4>
          <p>Тестов: {suite.testCases?.length}</p>
          <button 
            onClick={() => handleRunSuite(suite.id)}
            disabled={runSuite.isLoading}
          >
            {runSuite.isLoading ? 'Выполняется...' : 'Запустить'}
          </button>
        </div>
      ))}
      <button onClick={handleGenerateReport}>
        Сгенерировать отчет
      </button>
    </div>
  );
};
```

## Управление уведомлениями

### Получение уведомлений

```typescript
import { 
  useNotifications, 
  useUnreadCount, 
  useNotificationPolling 
} from '@/shared/hooks';

const NotificationsComponent = () => {
  // Получение уведомлений с фильтрацией
  const { data: notifications } = useNotifications({
    status: 'unread',
    category: 'project',
    priority: 'high'
  });

  // Счетчик непрочитанных
  const { data: unreadCount } = useUnreadCount();

  // Полинг уведомлений в реальном времени
  const { 
    unreadCount: realtimeCount, 
    latestNotifications 
  } = useNotificationPolling();

  return (
    <div>
      <h3>Уведомления ({realtimeCount})</h3>
      {latestNotifications.map(notification => (
        <div key={notification.id}>
          <strong>{notification.title}</strong>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
};
```

### Управление уведомлениями

```typescript
import { 
  useMarkAsRead, 
  useMarkAllAsRead, 
  useArchiveNotification,
  useCreateNotification 
} from '@/shared/hooks';

const NotificationActions = () => {
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const archiveNotification = useArchiveNotification();
  const createNotification = useCreateNotification();

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead.mutateAsync(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  const handleCreateNotification = async () => {
    await createNotification.mutateAsync({
      title: 'Новое уведомление',
      message: 'Тестовое уведомление от системы',
      type: 'info',
      category: 'system',
      priority: 'medium'
    });
  };

  return (
    <div>
      <button onClick={handleMarkAllAsRead}>
        Прочитать все
      </button>
      <button onClick={handleCreateNotification}>
        Создать уведомление
      </button>
    </div>
  );
};
```

### Настройки уведомлений

```typescript
import { 
  useNotificationPreferences, 
  useUpdateNotificationPreferences 
} from '@/shared/hooks';

const NotificationSettings = () => {
  const { data: preferences } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const handleToggleEmail = async () => {
    await updatePreferences.mutateAsync({
      emailEnabled: !preferences?.emailEnabled
    });
  };

  const handleUpdateCategories = async (category: string, enabled: boolean) => {
    await updatePreferences.mutateAsync({
      categories: {
        ...preferences?.categories,
        [category]: enabled
      }
    });
  };

  return (
    <div>
      <h3>Настройки уведомлений</h3>
      <label>
        <input 
          type="checkbox" 
          checked={preferences?.emailEnabled}
          onChange={handleToggleEmail}
        />
        Email уведомления
      </label>
      <label>
        <input 
          type="checkbox" 
          checked={preferences?.categories.project}
          onChange={(e) => handleUpdateCategories('project', e.target.checked)}
        />
        Уведомления о проектах
      </label>
    </div>
  );
};
```

## Комбинированное использование

### Комплексный дашборд

```typescript
import { 
  useDashboardStats,
  useReleaseStats,
  useTestStats,
  useNotificationPolling,
  useRecentActivity 
} from '@/shared/hooks';

const Dashboard = () => {
  const { data: dashboardStats } = useDashboardStats();
  const { data: releaseStats } = useReleaseStats();
  const { data: testStats } = useTestStats();
  const { data: activity } = useRecentActivity();
  const { unreadCount } = useNotificationPolling();

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Проекты</h3>
          <p>{dashboardStats?.totalProjects}</p>
        </div>
        <div className="stat-card">
          <h3>Релизы</h3>
          <p>{releaseStats?.totalReleases}</p>
        </div>
        <div className="stat-card">
          <h3>Тестовое покрытие</h3>
          <p>{testStats?.coverage}%</p>
        </div>
        <div className="stat-card">
          <h3>Уведомления</h3>
          <p>{unreadCount}</p>
        </div>
      </div>
      <div className="recent-activity">
        <h3>Последняя активность</h3>
        {activity?.map(item => (
          <div key={item.id}>{item.description}</div>
        ))}
      </div>
    </div>
  );
};
```

## Обработка ошибок

### Глобальная обработка ошибок

```typescript
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

const QueryErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <div>
          <h2>Что-то пошло не так!</h2>
          <button onClick={resetErrorBoundary}>Попробовать снова</button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### Локальная обработка ошибок

```typescript
import { useReleases } from '@/shared/hooks';

const ReleasesWithErrorHandling = () => {
  const { 
    data: releases, 
    isLoading, 
    error, 
    refetch 
  } = useReleases();

  if (error) {
    return (
      <div className="error-state">
        <p>Ошибка загрузки релизов: {error.message}</p>
        <button onClick={() => refetch()}>
          Повторить запрос
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      {releases?.map(release => (
        <div key={release.id}>{release.name}</div>
      ))}
    </div>
  );
};
```

## Оптимистические обновления

```typescript
import { useOptimisticUpdate } from '@/shared/hooks';

const OptimisticExample = () => {
  const updateRelease = useUpdateRelease();
  
  const handleOptimisticUpdate = useOptimisticUpdate(
    ['releases', 'detail', 'release-123'],
    (oldData: Release, newData: Partial<Release>) => ({
      ...oldData,
      ...newData
    }),
    updateRelease
  );

  const handleUpdateTitle = async () => {
    await handleOptimisticUpdate({
      id: 'release-123',
      data: { name: 'Новое название' }
    });
  };

  return (
    <button onClick={handleUpdateTitle}>
      Обновить название
    </button>
  );
};
```

## Кэширование и предварительная загрузка

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { releaseQueryKeys, projectQueryKeys } from '@/shared/hooks';

const CacheManagement = () => {
  const queryClient = useQueryClient();

  const prefetchReleases = async (projectId: string) => {
    await queryClient.prefetchQuery({
      queryKey: releaseQueryKeys.byProject(projectId),
      queryFn: () => releaseApi.getProjectReleases(projectId),
      staleTime: 5 * 60 * 1000
    });
  };

  const invalidateProjectData = () => {
    queryClient.invalidateQueries({ 
      queryKey: projectQueryKeys.all 
    });
  };

  const updateReleaseInCache = (releaseId: string, updates: Partial<Release>) => {
    queryClient.setQueryData(
      releaseQueryKeys.detail(releaseId),
      (oldData: Release | undefined) => 
        oldData ? { ...oldData, ...updates } : undefined
    );
  };

  return (
    <div>
      <button onClick={() => prefetchReleases('project-123')}>
        Предварительно загрузить релизы
      </button>
      <button onClick={invalidateProjectData}>
        Обновить данные проектов
      </button>
    </div>
  );
};
```

## Советы по производительности

1. **Используйте правильные ключи запросов** для эффективной инвалидации
2. **Настраивайте staleTime и cacheTime** в зависимости от типа данных
3. **Применяйте оптимистические обновления** для улучшения UX
4. **Используйте prefetching** для критически важных данных
5. **Группируйте связанные мутации** для атомарных обновлений

## Интеграция с компонентами

### Использование с NotificationCenter

```typescript
import { NotificationCenter } from '@/shared/ui';

const AppHeader = () => {
  return (
    <header>
      <h1>Requify</h1>
      <NotificationCenter 
        onSettingsClick={() => {/* открыть настройки */}}
      />
    </header>
  );
};
```

Эта система React Query хуков обеспечивает эффективное управление серверным состоянием, автоматическое кэширование, фоновые обновления и оптимистические мутации для всех модулей приложения Requify. 