# Sidebar Entity

Сущность сайдбара содержит базовые компоненты, типы и логику для работы с элементами боковой навигации согласно архитектуре FSD.

## Структура

```
src/entities/sidebar/
├── index.ts              # Публичное API
├── api/
│   └── sidebarApi.ts     # DAO для работы с настройками сайдбара
├── model/
│   ├── types.ts          # Базовые типы и интерфейсы
│   └── constants.ts      # Константы и конфигурация
├── ui/
│   ├── SidebarButton.tsx # Компонент кнопки элемента сайдбара
│   ├── SidebarGroup.tsx  # Компонент группы элементов
│   └── UserProfile.tsx   # Компонент профиля пользователя
└── README.md            # Данный файл
```

## Основные типы

### SidebarItem
Базовый элемент сайдбара с поддержкой:
- Иконок (строковые имена или ReactNode)
- Бейджей для уведомлений
- Ролевой модели доступа
- Групп и вложенности
- Drag & Drop

### SidebarUserPreferences
Пользовательские настройки сайдбара:
- Порядок элементов
- Скрытые элементы
- Закрепленные элементы
- Состояние сворачивания
- Развернутые группы

## API

### SidebarPreferencesDAO
Класс для работы с настройками сайдбара:
- `getUserPreferences(userId)` - получение настроек
- `saveUserPreferences(userId, preferences)` - сохранение настроек  
- `resetUserPreferences(userId)` - сброс к настройкам по умолчанию

## UI Компоненты

### SidebarButton
Базовая кнопка элемента сайдбара:
- Поддержка collapsed/expanded режимов
- Tooltips в collapsed режиме
- Бейджи для уведомлений
- Клавиатурные сочетания

### SidebarGroup
Группа элементов с возможностью сворачивания:
- Адаптивность под collapsed режим
- Анимации разворачивания/сворачивания
- Вложенная структура элементов

### UserProfile
Компонент профиля пользователя:
- Аватар с инициалами
- Роль пользователя
- Адаптивность под collapsed режим
- Tooltip с дополнительной информацией

## Константы

### DEFAULT_SIDEBAR_CONFIG
Базовая конфигурация сайдбара:
- Ширина в collapsed/expanded режимах
- Настройки анимаций
- Параметры long click для DnD

### getDefaultSidebarItems
Функция для получения элементов навигации по умолчанию с фильтрацией по ролям пользователя.

## Утилиты

### filterItemsByRole
Фильтрация элементов сайдбара по ролям пользователя с поддержкой вложенной структуры.

### groupItemsByCategory  
Группировка элементов по категориям (main, admin, profile).

## Использование

```typescript
import { 
  SidebarButton, 
  SidebarGroup, 
  UserProfile,
  getDefaultSidebarItems,
  filterItemsByRole 
} from "@/entities/sidebar";

// Получение элементов для конкретной роли
const items = getDefaultSidebarItems(user.role);

// Фильтрация элементов
const filteredItems = filterItemsByRole(items, user.role);

// Использование компонентов
<SidebarButton 
  item={item}
  state={getItemState(item)}
  isCollapsed={isCollapsed}
  onClick={handleClick}
/>
```

## Интеграция с виджетами

Сущность sidebar используется в `@/widgets/sidebar` для создания полнофункционального виджета навигации с поддержкой:
- Drag & Drop
- Состояния сворачивания
- Пользовательских настроек
- Роутинга

## DAO Pattern

Следует паттерну DAO (Data Access Object) для работы с API:
- Инкапсуляция логики работы с данными
- Маппинг между DTO и моделями
- Обработка ошибок
- Типобезопасность 