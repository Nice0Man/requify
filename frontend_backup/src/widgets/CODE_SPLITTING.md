# Code Splitting для Виджетов

## Обзор

Реализован code splitting для виджетов с помощью React.lazy() и Suspense для улучшения производительности приложения.

## Структура

### LazyWidget компонент
- `src/shared/ui/LazyWidget/LazyWidget.tsx` - основной компонент-обёртка
- Автоматически отображает индикатор загрузки
- Поддерживает кастомные fallback компоненты

### Ленивые загрузки
- `src/widgets/lazy.ts` - все ленивые виджеты
- Каждый виджет загружается только при необходимости
- Импорты организованы в удобный объект `LazyWidgets`

## Использование

### Базовое использование
```typescript
import { LazyWidget, LazyDashboardStatsWidget } from '@/widgets';

function MyPage() {
  return (
    <LazyWidget name="Статистика">
      <LazyDashboardStatsWidget {...props} />
    </LazyWidget>
  );
}
```

### С кастомным fallback
```typescript
import { LazyWidget, LazyActivityFeedWidget } from '@/widgets';

const CustomLoader = () => (
  <div>Загружаем ленту активности...</div>
);

function MyPage() {
  return (
    <LazyWidget fallback={<CustomLoader />}>
      <LazyActivityFeedWidget {...props} />
    </LazyWidget>
  );
}
```

### Через объект LazyWidgets
```typescript
import { LazyWidgets, LazyWidget } from '@/widgets';

function Dashboard() {
  return (
    <>
      <LazyWidget name="Статистика">
        <LazyWidgets.DashboardStats {...props} />
      </LazyWidget>
      
      <LazyWidget name="Активность">
        <LazyWidgets.ActivityFeed {...props} />
      </LazyWidget>
    </>
  );
}
```

## Доступные ленивые виджеты

### Dashboard виджеты
- `LazyDashboardStatsWidget` - статистика дашборда
- `LazyActivityFeedWidget` - лента активности  
- `LazyQuickActionsWidget` - быстрые действия
- `LazyProjectOverviewWidget` - обзор проектов
- `LazySystemHealthWidget` - системное здоровье
- `LazyRequirementListWidget` - список требований
- `LazyProjectStatsWidget` - статистика проектов
- `LazyKanbanWidget` - kanban доска

### Layout виджеты
- `LazyAppSidebarWidget` - боковая панель
- `LazyAppHeaderWidget` - заголовок приложения
- `LazyAppNavigationWidget` - навигация
- `LazyDashboardHeaderWidget` - заголовок дашборда
- `LazyScrollNavigationWidget` - навигация прокрутки
- `LazyContainerWidget` - контейнер

## Преимущества

### Производительность
- **Уменьшение размера bundle**: виджеты загружаются по требованию
- **Улучшенная скорость загрузки**: критический код загружается быстрее
- **Лучшие показатели Web Vitals**: улучшение LCP и FID

### UX
- **Плавная загрузка**: индикаторы загрузки вместо белых экранов
- **Постепенная загрузка**: пользователь видит контент по мере готовности
- **Отказоустойчивость**: ошибки загрузки изолированы от основного приложения

### Разработка
- **Модульность**: каждый виджет может загружаться независимо
- **Легкое тестирование**: ленивые компоненты можно тестировать отдельно
- **Простота поддержки**: четкое разделение между критическим и второстепенным кодом

## Рекомендации

### Когда использовать
- ✅ Крупные виджеты с большим количеством зависимостей
- ✅ Виджеты, которые не отображаются сразу при загрузке страницы
- ✅ Виджеты с тяжелыми библиотеками (графики, диаграммы)
- ✅ Административные панели и редко используемые компоненты

### Когда не использовать  
- ❌ Критические компоненты (заголовки, основная навигация)
- ❌ Очень маленькие компоненты (< 10KB)
- ❌ Компоненты, которые всегда видны пользователю

### Лучшие практики
1. **Всегда используйте LazyWidget**: обеспечивает консистентный UX
2. **Указывайте осмысленные названия**: помогает пользователю понять, что загружается
3. **Группируйте связанные виджеты**: избегайте слишком детального разбиения
4. **Мониторьте производительность**: отслеживайте влияние на показатели

## Мониторинг

Для отслеживания эффективности code splitting:

```typescript
// В компоненте страницы
useEffect(() => {
  // Метрика времени загрузки виджета
  performance.mark('widget-load-start');
  
  return () => {
    performance.mark('widget-load-end');
    performance.measure('widget-load', 'widget-load-start', 'widget-load-end');
  };
}, []);
```

## Troubleshooting

### Ошибки загрузки
```typescript
// Отладка failed imports
const LazyWidget = lazy(() => 
  import('./MyWidget')
    .catch(error => {
      console.error('Failed to load widget:', error);
      // Возвращаем fallback компонент
      return { default: () => <div>Виджет недоступен</div> };
    })
);
```

### Тестирование ленивых компонентов
```typescript
// В тестах используйте act и waitFor
import { act, waitFor } from '@testing-library/react';

test('lazy widget loads correctly', async () => {
  render(
    <LazyWidget>
      <LazyDashboardStatsWidget />
    </LazyWidget>
  );
  
  await waitFor(() => {
    expect(screen.getByText('Dashboard Stats')).toBeInTheDocument();
  });
});
``` 