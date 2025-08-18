# Features Layer Rules - Слой функциональностей

## Назначение
Содержит функциональности (фичи) приложения с бизнес-логикой, взаимодействием с пользователем и интеграцией сущностей.

## Структура
```
features/
├── auth/             # Авторизация и аутентификация
├── dashboard/        # Функции дашборда
├── projects/         # Управление проектами
├── requirements/     # Управление требованиями
├── testing/          # Функции тестирования
└── */
    ├── api/          # Специфичные API вызовы фичи
    ├── model/        # Бизнес-логика, стейт менеджмент
    └── ui/           # Интерактивные компоненты
```

## Правила

### 1. Зависимости
- **НЕ МОЖЕТ** импортировать из: `widgets`, `pages`
- **МОЖЕТ** импортировать: `shared`, `entities`, другие `features` (осторожно)

### 2. Структура фичи
Каждая фича **ДОЛЖНА** содержать:
- `api/` - специфичные API запросы (опционально)
- `model/` - бизнес-логика, хуки, состояние
- `ui/` - интерактивные компоненты с логикой

### 3. API слой
- Комбинирует API из entities
- Сложные запросы для конкретной фичи
- Кастомные хуки для работы с данными
- Использует React Query

### 4. Model слой
- Бизнес-логика фичи
- Валидация пользовательского ввода
- Состояние фичи (Zustand/Redux)
- Хуки для управления состоянием

### 5. UI слой
- Интерактивные компоненты
- Обработка событий пользователя
- Интеграция с entities/ui
- Формы и их валидация

## Структура файлов

### API слой
```typescript
// features/auth/api/authApi.ts
export const authApi = {
  login: (credentials: LoginDto) => 
    apiClient.post(API_ENDPOINTS.auth.login, credentials),
  
  refreshToken: () => 
    apiClient.post(API_ENDPOINTS.auth.refresh),
};

// features/auth/api/authQueries.ts
export const useLogin = () => useMutation({
  mutationFn: authApi.login,
  onSuccess: (data) => {
    // Сохранение токенов
  },
});
```

### Model слой
```typescript
// features/auth/model/authStore.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, token: null }),
}));

// features/auth/model/authHooks.ts
export const useAuth = () => {
  const { user, token } = useAuthStore();
  const isAuthenticated = !!user && !!token;
  
  return { user, token, isAuthenticated };
};
```

### UI слой
```typescript
// features/auth/ui/LoginForm.tsx
export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginDto>();
  const loginMutation = useLogin();
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(credentials);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Форма входа */}
    </form>
  );
};
```

## Примеры использования

### Правильно ✅
```typescript
// features/projects/model/projectFilters.ts
export const useProjectFilters = () => {
  const [filters, setFilters] = useState<ProjectFilters>();
  // Логика фильтрации
  return { filters, setFilters };
};

// features/projects/ui/ProjectCreateDialog.tsx
export const ProjectCreateDialog = ({ open, onClose }) => {
  const createProject = useCreateProject();
  // Форма создания проекта
};
```

### Неправильно ❌
```typescript
// ❌ Прямое использование DOM API
document.getElementById('modal').style.display = 'block';

// ❌ Хардкод бизнес-логики в UI
export const ProjectCard = ({ project }) => {
  const isExpired = new Date() > new Date(project.deadline);
  // Логика должна быть в model слое
};

// ❌ Импорт из верхних слоев
import { ProjectsPage } from '../../pages/projects';
```

## Основные фичи

### Авторизация
- [ ] `auth/` - Вход, выход, регистрация
  - [ ] LoginForm
  - [ ] RegisterForm  
  - [ ] ForgotPasswordForm
  - [ ] AuthGuard

### Dashboard
- [ ] `dashboard/` - Функции дашборда
  - [ ] StatsAggregation
  - [ ] ChartConfigurator
  - [ ] WidgetManager
  - [ ] DashboardExport

### Проекты
- [ ] `projects/` - Управление проектами
  - [ ] ProjectCreateForm
  - [ ] ProjectEditForm
  - [ ] ProjectFilters
  - [ ] ProjectActions

### Требования
- [ ] `requirements/` - Управление требованиями
  - [ ] RequirementCreateForm
  - [ ] RequirementEditForm
  - [ ] RequirementFilters
  - [ ] RequirementRelations

### Тестирование
- [ ] `testing/` - Функции тестирования
  - [ ] TestCaseCreateForm
  - [ ] TestExecutionForm
  - [ ] TestPlanManager
  - [ ] TestReports

## Статус реализации
- [ ] Правила созданы
- [ ] Все фичи имеют структуру api/model/ui
- [ ] Бизнес-логика вынесена в model
- [ ] UI компоненты интерактивные
- [ ] React Query интегрирован
- [ ] Состояние управляется правильно
- [ ] Документация завершена 