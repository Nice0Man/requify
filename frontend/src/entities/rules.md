# Entities Layer Rules - Слой сущностей

## Назначение
Содержит бизнес-сущности приложения с их API, моделями данных и UI компонентами представления.

## Структура
```
entities/
├── user/          # Сущность пользователя
├── project/       # Сущность проекта
├── requirement/   # Сущность требований
├── release/       # Сущность релизов
├── team/          # Сущность команд
└── */
    ├── api/       # API запросы для сущности
    ├── model/     # Модели данных, схемы валидации
    └── ui/        # UI компоненты представления
```

## Правила

### 1. Зависимости
- **НЕ МОЖЕТ** импортировать из: `features`, `widgets`, `pages`
- **МОЖЕТ** импортировать: `shared`, другие `entities`

### 2. Структура сущности
Каждая сущность **ДОЛЖНА** содержать:
- `api/` - запросы к серверу
- `model/` - типы, схемы, интерфейсы
- `ui/` - компоненты отображения (без логики)

### 3. API слой
- Использовать только `API_ENDPOINTS` из workspace rules
- React Query для кеширования
- Типизация всех запросов и ответов
- DAO паттерн для работы с данными

### 4. Model слой
- TypeScript интерфейсы и типы
- Схемы валидации (Zod)
- Маппинг между DTO и Entity
- Бизнес-логика валидации

### 5. UI слой
- Только компоненты отображения
- БЕЗ бизнес-логики
- Принимают данные через props
- Переиспользуемые в features

## Структура файлов

### API слой
```typescript
// entities/user/api/userApi.ts
export const userApi = {
  getUser: (id: string) => apiClient.get(API_ENDPOINTS.users.getUser(id)),
  updateUser: (data: UpdateUserDto) => apiClient.put(API_ENDPOINTS.users.updateUser, data),
};

// entities/user/api/userQueries.ts
export const useUser = (id: string) => useQuery({
  queryKey: ['user', id],
  queryFn: () => userApi.getUser(id),
});
```

### Model слой
```typescript
// entities/user/model/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// entities/user/model/schemas.ts
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
});
```

### UI слой
```typescript
// entities/user/ui/UserCard.tsx
export const UserCard: React.FC<{ user: User }> = ({ user }) => {
  return (
    <Card>
      <CardContent>
        <Typography>{user.name}</Typography>
        <Typography variant="body2">{user.email}</Typography>
      </CardContent>
    </Card>
  );
};
```

## Примеры использования

### Правильно ✅
```typescript
// entities/user/api/userApi.ts
import { API_ENDPOINTS } from '@/shared/api';
import { apiClient } from '@/shared/api/client';

// entities/user/model/types.ts
export interface User {
  id: string;
  // ...
}

// entities/user/ui/UserAvatar.tsx
export const UserAvatar: React.FC<{ user: User }> = ({ user }) => {
  // Только отображение
};
```

### Неправильно ❌
```typescript
// ❌ Бизнес-логика в UI
export const UserCard = ({ user }) => {
  const handleEdit = () => {
    // Логика редактирования - должна быть в features
  };
};

// ❌ Хардкод эндпоинтов
const response = await fetch('/api/users');

// ❌ Импорт из верхних слоев
import { EditUserFeature } from '../../features/user';
```

## Сущности проекта

### Основные
- [ ] `user` - Пользователи системы
- [ ] `project` - Проекты
- [ ] `requirement` - Требования
- [ ] `release` - Релизы
- [ ] `team` - Команды

### Дополнительные
- [ ] `comment` - Комментарии
- [ ] `notification` - Уведомления
- [ ] `dashboard` - Данные дашборда
- [ ] `test-case` - Тест-кейсы
- [ ] `admin` - Админские данные

## Статус реализации
- [ ] Правила созданы
- [ ] Все сущности имеют структуру api/model/ui
- [ ] API использует API_ENDPOINTS
- [ ] React Query интегрирован
- [ ] Типизация завершена
- [ ] UI компоненты созданы
- [ ] Документация завершена 