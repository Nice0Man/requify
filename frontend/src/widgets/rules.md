# Widgets Layer Rules - Слой виджетов

## Назначение
Содержит сложные композитные UI компоненты, которые объединяют сущности и функциональности в готовые к использованию блоки.

## Структура
```
widgets/
├── app-sidebar/         # сайдбар с DnD
├── app-header/          # Шапка приложения
├── dashboard-stats/     # Виджет статистики дашборда
├── kanban-board/        # Канбан доска
├── project-overview/    # Обзор проектов
└── */
    ├── model/           # Конфигурация виджета
    └── ui/              # Компоненты виджета
```

## Правила

### 1. Зависимости
- **НЕ МОЖЕТ** импортировать из: `pages`
- **МОЖЕТ** импортировать: `shared`, `entities`, `features`

### 2. Структура виджета
Каждый виджет **ДОЛЖЕН** содержать:
- `model/` - типы, конфигурация, интерфейсы
- `ui/` - композитные компоненты

### 3. Принципы
- **Переиспользуемость** - должны работать в разных контекстах
- **Композитность** - объединяют entities и features
- **Конфигурируемость** - настройки через props
- **Производительность** - мемоизация, оптимизация

### 4. Model слой
- Типы пропсов виджета
- Конфигурация по умолчанию
- Интерфейсы взаимодействия
- Енумы и константы

### 5. UI слой
- Основной компонент виджета
- Подкомпоненты (если нужны)
- Хуки для логики виджета
- Стили и темизация

## Обязательные виджеты

### 1. Universal Sidebar
**Цель**: Универсальный сайдбар с DnD для всех страниц (кроме Landing/Auth)

```typescript
// widgets/universal-sidebar/ui/UniversalSidebar.tsx
export const UniversalSidebar: React.FC<UniversalSidebarProps> = ({
  items,
  onReorder,
  isCollapsed,
  onToggleCollapse,
  bottomItems, // Ссылки на страницы + админские настройки
}) => {
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={items}>
        {/* DnD элементы */}
      </SortableContext>
      <Box sx={{ mt: 'auto' }}>
        {/* Нижние ссылки */}
      </Box>
    </DndContext>
  );
};
```

### 2. App Header
```typescript
// widgets/app-header/ui/AppHeader.tsx
export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  actions,
  user,
  notifications,
}) => {
  // Шапка с заголовком, действиями, уведомлениями
};
```

### 3. Dashboard Stats
```typescript
// widgets/dashboard-stats/ui/DashboardStats.tsx
export const DashboardStats: React.FC<DashboardStatsProps> = ({
  metrics,
  layout,
  onMetricClick,
}) => {
  // Виджет статистики с метриками
};
```

## Структура файлов

### Model слой
```typescript
// widgets/universal-sidebar/model/types.ts
export interface UniversalSidebarProps {
  items: SidebarItem[];
  onReorder: (items: SidebarItem[]) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  bottomItems: BottomNavItem[];
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number;
  isActive?: boolean;
}
```

### UI слой
```typescript
// widgets/universal-sidebar/ui/UniversalSidebar.tsx
export const UniversalSidebar = memo<UniversalSidebarProps>(({
  items,
  onReorder,
  isCollapsed,
  onToggleCollapse,
  bottomItems,
}) => {
  const { sensors, handleDragEnd } = useSidebarDnd({ onReorder });
  
  return (
    <Drawer
      variant="permanent"
      sx={{ width: isCollapsed ? 64 : 240 }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)}>
          {items.map(item => (
            <SortableSidebarItem key={item.id} item={item} />
          ))}
        </SortableContext>
      </DndContext>
      
      {/* Нижняя навигация */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        {bottomItems.map(item => (
          <BottomNavItem key={item.id} item={item} />
        ))}
      </Box>
    </Drawer>
  );
});
```

## Примеры использования

### Правильно ✅
```typescript
// widgets/project-overview/ui/ProjectOverview.tsx
import { ProjectCard } from '@/entities/project/ui';
import { useProjects } from '@/entities/project/api';
import { ProjectFilters } from '@/features/projects/ui';

export const ProjectOverview = ({ maxProjects = 5 }) => {
  const { data: projects } = useProjects();
  
  return (
    <Card>
      <CardHeader title="Проекты" />
      <CardContent>
        <ProjectFilters />
        {projects?.slice(0, maxProjects).map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </CardContent>
    </Card>
  );
};
```

### Неправильно ❌
```typescript
// ❌ Прямая работа с API в виджете
export const ProjectOverview = () => {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    fetch('/api/projects').then(/* ... */);
  }, []);
  
  // Должно использовать entities и features
};

// ❌ Слишком простой компонент для widgets
export const SimpleButton = ({ onClick, children }) => {
  return <Button onClick={onClick}>{children}</Button>;
  // Должно быть в shared/ui
};
```

## Список виджетов

### Основные (обязательные)
- [ ] `universal-sidebar` - Универсальный DnD сайдбар
- [ ] `app-header` - Шапка приложения
- [ ] `dashboard-stats` - Статистика дашборда
- [ ] `project-overview` - Обзор проектов
- [ ] `kanban-board` - Канбан доска

### Дополнительные
- [ ] `activity-feed` - Лента активности
- [ ] `quick-actions` - Быстрые действия  
- [ ] `system-health` - Состояние системы
- [ ] `requirement-list` - Список требований
- [ ] `layout` - Компоненты макета

### Устаревшие (требуют рефакторинга)
- [ ] ~~`stats`~~ - Объединить с `dashboard-stats`
- [ ] ~~`app-sidebar`~~ - Заменить на `universal-sidebar`

## Статус реализации
- [ ] Правила созданы
- [ ] Universal Sidebar создан с DnD
- [ ] Дублированные виджеты удалены
- [ ] Все виджеты оптимизированы
- [ ] Типизация завершена
- [ ] Производительность оптимизирована
- [ ] Документация завершена 