# AppSidebar Widget Refactoring

## 🎯 Цель рефакторинга

Декомпозиция монолитного `AppSidebarWidget` согласно принципам Feature-Sliced Design (FSD) [[cite](https://medium.com/dailyjs/techniques-for-decomposing-react-components-e8a1081ef5da)] для:

- ✅ Разделения ответственности
- ✅ Повышения переиспользуемости
- ✅ Упрощения тестирования
- ✅ Улучшения сопровождаемости

## 📊 Архитектура до рефакторинга

```
AppSidebarWidget (820+ строк)
├── UI рендеринг
├── Навигационная логика  
├── DnD логика
├── Управление группами
├── Аутентификация
└── Состояние сворачивания
```

## 🏗️ Архитектура после рефакторинга

### 🔧 Widgets Layer
- **`AppSidebarWidget`** - контейнер, композиция features
- **`AppSidebarView`** - презентационный компонент  
- **`SortableItem`** - DnD обертка для элементов

### ⚡ Features Layer
- **`@/features/navigation`** - навигационная логика
- **`@/features/sidebar-dnd`** - drag-and-drop функциональность
- **`@/features/sidebar-management`** - управление группами
- **`@/features/auth`** - аутентификация (переиспользование)

### 🏗️ Entities Layer
- **`@/entities/sidebar`** - базовые компоненты (SidebarButton, SidebarGroup, UserProfile)
- **`@/entities/user`** - типы пользователя

## 📝 Декомпозиция по компонентам

### 1. Navigation Feature (`@/features/navigation`)

**Ответственность:** Управление навигацией и роутингом

```typescript
// useSidebarNavigation.ts
export const useSidebarNavigation = (items, onNavigate) => ({
  state: {
    activeItemId,
    currentPath,
  },
  actions: {
    handleItemClick,
    handleProfileClick, 
    handleSettingsClick,
    getItemState,
  },
});
```

**Выделенная логика:**
- Определение активного элемента по роуту
- Обработка кликов по элементам навигации
- Редиректы на профиль и настройки
- Состояние элементов для презентации

### 2. Sidebar DnD Feature (`@/features/sidebar-dnd`)

**Ответственность:** Drag-and-drop функциональность

```typescript
// useSidebarDnd.ts  
export const useSidebarDnd = (initialItems, onItemsChange) => ({
  state: {
    activeId,
    sidebarItems,
    sensors,
  },
  actions: {
    handleDragStart,
    handleDragEnd,
    setSidebarItems,
    getActiveItem,
  },
});
```

**Выделенная логика:**
- Конфигурация DnD sensors
- Обработка начала/окончания перетаскивания
- Переупорядочивание элементов
- Состояние для DragOverlay

### 3. Sidebar Management Feature (`@/features/sidebar-management`)

**Ответственность:** Управление состоянием групп

```typescript
// useSidebarGroups.ts
export const useSidebarGroups = (user, onGroupToggle) => ({
  state: {
    expandedGroups,
  },
  actions: {
    handleToggleGroup,
    setExpandedGroups, 
    isGroupExpanded,
  },
});
```

**Выделенная логика:**
- Состояние расширенных групп
- Переключение групп
- Начальные состояния для ролей

### 4. Presentation Layer (`AppSidebarView`)

**Ответственность:** Чистое отображение UI

```typescript
// AppSidebarView.tsx
export const AppSidebarView: React.FC<AppSidebarViewProps> = ({
  // State от features
  navigationState,
  navigationActions,
  dndState, 
  dndActions,
  groupsState,
  groupsActions,
  // UI props
  isCollapsed,
  onToggleCollapse,
  // ...
}) => {
  // Только UI логика
  return <Drawer>...</Drawer>;
};
```

**Ответственность:**
- Рендеринг структуры сайдбара
- Композиция entities компонентов
- Применение стилей и анимаций
- DnD контекст и overlay

## 🔄 Container Pattern

```typescript
// AppSidebarWidget.tsx (новый контейнер)
export const AppSidebarWidget: React.FC<AppSidebarProps> = (props) => {
  // Композиция features
  const navigation = useSidebarNavigation(items, onNavigate);
  const dnd = useSidebarDnd(initialItems);
  const groups = useSidebarGroups(user);
  const sidebarState = useAppSidebar(user, defaultCollapsed);
  
  // Передача в presentation
  return (
    <AppSidebarView
      navigationState={navigation.state}
      navigationActions={navigation.actions}
      dndState={dnd.state}
      dndActions={dnd.actions}
      groupsState={groups.state}
      groupsActions={groups.actions}
      isCollapsed={sidebarState.isCollapsed}
      onToggleCollapse={sidebarActions.toggleCollapse}
      {...props}
    />
  );
};
```

## 📊 Результаты декомпозиции

### Размер файлов
- **До:** `AppSidebarWidget.tsx` - 820+ строк
- **После:** 
  - `AppSidebarWidget.tsx` - 98 строк (контейнер)
  - `AppSidebarView.tsx` - 580 строк (презентация)
  - `useSidebarNavigation.ts` - 97 строк
  - `useSidebarDnd.ts` - 91 строк  
  - `useSidebarGroups.ts` - 64 строки

### Преимущества
- ✅ **Единая ответственность** - каждый модуль решает одну задачу
- ✅ **Переиспользуемость** - features можно использовать в других виджетах
- ✅ **Тестируемость** - изолированные модули легче тестировать
- ✅ **Читаемость** - небольшие файлы с четкой структурой
- ✅ **Расширяемость** - новая функциональность добавляется как новая feature

### Тестирование
```typescript
// Теперь можно тестировать отдельно:
describe('useSidebarNavigation', () => {
  it('should handle item click', () => {
    // test navigation logic
  });
});

describe('useSidebarDnd', () => {
  it('should reorder items', () => {
    // test drag and drop
  });
});

describe('AppSidebarView', () => {
  it('should render correctly', () => {
    // test UI presentation
  });
});
```

## 🚀 Дальнейшие улучшения

1. **Сохранение состояния** - интеграция с `useAppSidebar` для persist группы и порядок элементов
2. **Мемоизация** - добавление `useMemo`/`useCallback` для оптимизации
3. **Виртуализация** - для больших списков элементов
4. **Анимации** - улучшение переходов между состояниями
5. **Типизация** - строгая типизация всех интерфейсов

## 🎨 Сохраненные стили

Все современные стили и темы остались без изменений:
- ✅ Glassmorphism эффекты
- ✅ Микроанимации  
- ✅ Современная цветовая палитра
- ✅ Адаптивность
- ✅ Drag-and-drop визуализация

---

*Рефакторинг выполнен согласно принципам [Techniques for decomposing React components](https://medium.com/dailyjs/techniques-for-decomposing-react-components-e8a1081ef5da) и [How do you separate components?](https://frontarm.com/james-k-nelson/how-should-i-separate-components)* 