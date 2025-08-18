# Integration Entity

Энтити для управления интеграциями в системе Requify, организованная согласно Feature-Sliced Design (FSD) архитектуре.

## Структура

```
src/entities/integration/
├── model/           # Модель данных
│   ├── types.ts     # TypeScript типы и интерфейсы
│   ├── data.ts      # Статические данные интеграций
│   └── index.ts     # Экспорты модели
├── ui/              # UI компоненты
│   ├── IntegrationCard.tsx      # Карточка интеграции
│   ├── CarouselControls.tsx     # Элементы управления каруселью
│   └── index.ts     # Экспорты UI
├── api/             # API слой
│   ├── integrationApi.ts        # API функции для интеграций
│   └── index.ts     # Экспорты API
└── index.ts         # Главный экспорт сущности
```

## Типы

### Integration
```typescript
interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: SvgIconComponent;
  color: string;
  popular: boolean;
  connections: string;
  features?: string[];
  status?: 'active' | 'coming_soon' | 'beta';
}
```

### IntegrationCategory
```typescript
interface IntegrationCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: SvgIconComponent;
}
```

## UI Компоненты

### IntegrationCard
Карточка интеграции с анимациями и hover эффектами.

**Props:**
- `integration: Integration` - Данные интеграции
- `index?: number` - Индекс для анимаций
- `onClick?: (integration: Integration) => void` - Обработчик клика
- `variant?: 'default' | 'compact' | 'detailed'` - Вариант отображения

**Особенности:**
- Компактный дизайн с уменьшенными размерами
- Анимации hover с spring physics
- Responsive design для мобильных устройств
- Популярные интеграции отмечены badge

### CarouselControls
Элементы управления каруселью интеграций.

**Props:**
- `currentIndex: number` - Текущий индекс
- `totalItems: number` - Общее количество элементов
- `onPrevious: () => void` - Переход назад
- `onNext: () => void` - Переход вперед
- `onGoToSlide: (index: number) => void` - Переход к слайду
- `isAutoPlay: boolean` - Состояние автопроигрывания
- `onToggleAutoPlay: () => void` - Переключение автопроигрывания
- `isTransitioning?: boolean` - Состояние перехода

## Данные

### INTEGRATIONS
Массив всех доступных интеграций:
- GitHub - Синхронизация с репозиториями
- Slack - Командные уведомления
- Jira - Управление проектами
- Microsoft Teams - Корпоративное общение
- Zoom - Видеозвонки
- REST API - Кастомные интеграции
- SSO - Единый вход
- Webhooks - Real-time синхронизация

### INTEGRATION_CATEGORIES
Категории интеграций:
- development - Инструменты разработки
- communication - Коммуникации
- management - Управление проектами
- security - Безопасность

## API (Заглушки)

Подготовленные методы для будущей интеграции с backend:
- `getIntegrations()` - Получить все интеграции
- `getIntegration(id)` - Получить интеграцию по ID
- `getCategories()` - Получить категории
- `connectIntegration()` - Подключить интеграцию
- `disconnectIntegration()` - Отключить интеграцию
- `syncIntegration()` - Синхронизировать данные

## Использование

```typescript
import {
  INTEGRATIONS,
  IntegrationCard,
  CarouselControls,
  type Integration,
  integrationApi
} from '@/entities/integration';

// Использование в компоненте
const MyComponent = () => {
  const handleIntegrationClick = (integration: Integration) => {
    console.log('Clicked:', integration.name);
  };

  return (
    <IntegrationCard
      integration={INTEGRATIONS[0]}
      onClick={handleIntegrationClick}
      variant="compact"
    />
  );
};
```

## Рефакторинг

### До рефакторинга:
- Все данные и компоненты в одном файле `IntegrationsSection.tsx`
- Большие размеры карточек и отступов
- Локальные компоненты `FloatingParticle` и `AnimatedGradient`
- Отсутствие типизации

### После рефакторинга:
- ✅ Разделение на слои согласно FSD (model, ui, api)
- ✅ Компактные размеры карточек (260/280px vs 280/320px)
- ✅ Уменьшенные gaps (12/16px vs 16/20px)  
- ✅ Использование shared UI эффектов
- ✅ Полная TypeScript типизация
- ✅ Модульная архитектура
- ✅ Лучшее выравнивание и меньше пустого пространства

### Улучшения UI/UX:
- Компактный header с уменьшенными размерами шрифтов
- Центрированная карусель без больших отступов
- Оптимизированные paddings и margins
- Responsive spacing для мобильных устройств
- Улучшенное вертикальное выравнивание
- Более плотная компоновка элементов

## Соответствие FSD

- ✅ **Model** - типы, данные, бизнес-логика
- ✅ **UI** - переиспользуемые компоненты
- ✅ **API** - взаимодействие с backend
- ✅ **Exports** - четкие границы публичного API
- ✅ **Dependencies** - только в сторону shared слоя 