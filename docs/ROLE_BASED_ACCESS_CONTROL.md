# Система ролей и разграничение доступа

## Обзор

Система Requify использует роле-ориентированную модель доступа (RBAC) для контроля прав пользователей. Каждая роль имеет определенный набор разрешений (scopes), которые контролируют доступ к API эндпоинтам.

## Роли пользователей

### 1. Суперпользователь (Superuser)
- **Описание**: Максимальные права доступа ко всем функциям системы
- **Права**: Все scopes + системное администрирование
- **Scopes**: `system:admin` + все остальные scopes
- **Возможности**:
  - Полный доступ ко всем функциям
  - Системное администрирование
  - Управление пользователями и их ролями
  - Резервное копирование и восстановление

### 2. Администратор (Admin)
- **Описание**: Широкие права управления системой, кроме системных операций
- **Роль**: `admin`
- **Scopes**: 
  - `users:read`, `users:write`, `users:delete`
  - `projects:read`, `projects:write`, `projects:delete`
  - `requirements:read`, `requirements:write`, `requirements:delete`
  - `releases:read`, `releases:write`, `releases:delete`
  - `testing:read`, `testing:write`, `testing:execute`
  - `admin:read`, `admin:write`
- **Возможности**:
  - Управление пользователями
  - Полное управление проектами
  - Управление требованиями и релизами
  - Доступ к административной панели
  - Создание справочных данных

### 3. Менеджер (Manager)
- **Описание**: Управление проектами и требованиями
- **Роль**: `manager`
- **Scopes**:
  - `users:read`
  - `projects:read`, `projects:write`
  - `requirements:read`, `requirements:write`, `requirements:delete`
  - `releases:read`, `releases:write`
  - `testing:read`, `testing:write`
  - `admin:read`
- **Возможности**:
  - Создание и управление проектами
  - Управление требованиями
  - Управление релизами
  - Планирование тестирования
  - Просмотр отчетов

### 4. Аналитик (Analyst)
- **Описание**: Работа с требованиями и создание спецификаций
- **Роль**: `analyst`
- **Scopes**:
  - `projects:read`, `projects:write`
  - `requirements:read`, `requirements:write`
  - `releases:read`
  - `testing:read`
- **Возможности**:
  - Создание и изменение требований
  - Создание спецификаций
  - Создание проектов
  - Просмотр релизов и тестирования

### 5. Разработчик (Developer)
- **Описание**: Работа с релизами и чтение требований
- **Роль**: `developer`
- **Scopes**:
  - `projects:read`
  - `requirements:read`
  - `releases:read`, `releases:write`
  - `testing:read`
- **Возможности**:
  - Просмотр проектов и требований
  - Работа с релизами
  - Просмотр результатов тестирования

### 6. Тестировщик (Tester)
- **Описание**: Выполнение тестирования и работа с тест-планами
- **Роль**: `tester`
- **Scopes**:
  - `projects:read`
  - `requirements:read`
  - `releases:read`
  - `testing:read`, `testing:write`, `testing:execute`
- **Возможности**:
  - Просмотр проектов, требований и релизов
  - Создание и выполнение тестов
  - Работа с тест-планами
  - Интеграция с АСУТс

### 7. Пользователь (User)
- **Описание**: Базовые права на просмотр
- **Роль**: `user` (по умолчанию)
- **Scopes**:
  - `projects:read`
  - `requirements:read`
  - `releases:read`
  - `testing:read`
- **Возможности**:
  - Просмотр проектов
  - Просмотр требований
  - Просмотр релизов
  - Просмотр результатов тестирования

## Карта доступа к API эндпоинтам

### Аутентификация (`/api/v1/auth/`)
- **Регистрация, вход, выход**: Доступно всем
- **Управление сессиями**: Авторизованные пользователи
- **Сброс пароля**: Доступно всем

### Пользователи (`/api/v1/users/`)
- **GET /**: `users:read` (Admin+)
- **POST /**: `users:write` (Admin+)
- **GET /me**: Авторизованные пользователи
- **PUT /me**: Авторизованные пользователи
- **GET /{id}**: `users:read` (Admin+)
- **PUT /{id}**: `users:write` (Admin+)
- **DELETE /{id}**: `users:delete` (Admin+)

### Проекты (`/api/v1/projects/`)
- **GET /**: `projects:read` (User+)
- **POST /**: `projects:write` (Analyst+)
- **GET /{id}**: `projects:read` (User+)
- **PUT /{id}**: `projects:write` (Analyst+)
- **DELETE /{id}**: `projects:delete` (Admin+)

### Требования (`/api/v1/requirements/`)
- **GET /**: `requirements:read` (User+)
- **POST /**: `requirements:write` (Analyst+)
- **GET /{id}**: `requirements:read` (User+)
- **PUT /{id}**: `requirements:write` (Analyst+)
- **DELETE /{id}**: `requirements:delete` (Manager+)

### Релизы (`/api/v1/releases/`)
- **GET /**: `releases:read` (User+)
- **POST /**: `releases:write` (Developer+)
- **GET /{id}**: `releases:read` (User+)
- **PUT /{id}**: `releases:write` (Developer+)
- **DELETE /{id}**: `releases:delete` (Manager+)

### Тестирование (`/api/v1/testing/`)
- **GET /results**: `testing:read` (User+)
- **GET /plans**: `testing:read` (User+)
- **POST /plans**: `testing:write` (Tester+)
- **POST /executions**: `testing:execute` (Tester+)
- **GET /integration/**: `testing:read` (User+)
- **POST /integration/**: `testing:write` (Tester+)

### Справочники (`/api/v1/reference/`)
- **GET /**: Авторизованные пользователи
- **POST /**: `admin:write` (Admin+)

### Администрирование (`/api/v1/admin/`)
- **Все операции**: `admin:write` (Admin+)

### Dashboard (`/api/v1/dashboard/`)
- **Все операции**: Авторизованные пользователи

## Специальные зависимости

### По ролям
- `get_admin_user()`: Только администраторы
- `get_manager_user()`: Менеджеры и выше
- `get_analyst_user()`: Аналитики и выше
- `get_developer_user()`: Разработчики и выше
- `get_tester_user()`: Тестировщики и выше

### По операциям
- `get_spec_creator_user()`: Создание спецификаций (Analyst+)
- `get_release_manager_user()`: Управление релизами (Manager+)

## Принципы назначения ролей

### Иерархия ролей
```
Superuser > Admin > Manager > Analyst > Developer/Tester > User
```

### Принцип минимальных привилегий
- Каждому пользователю назначается минимальная роль, необходимая для выполнения его обязанностей
- Права доступа наследуются по иерархии (высшие роли включают права низших)

### Разделение обязанностей
- **Аналитики**: Создают и управляют требованиями
- **Менеджеры**: Планируют проекты и релизы
- **Разработчики**: Работают с релизами
- **Тестировщики**: Выполняют тестирование
- **Администраторы**: Управляют системой

## Безопасность

### Проверка прав доступа
- Все API эндпоинты проверяют соответствующие scopes
- JWT токены содержат информацию о ролях и правах
- Дополнительная проверка на уровне роли для критичных операций

### Аудит доступа
- Все действия пользователей логируются
- Отслеживается активность и подозрительные паттерны
- Регулярная проверка прав доступа

### Рекомендации
- Регулярно пересматривать права пользователей
- Отзывать права при смене ролей
- Использовать двухфакторную аутентификацию для администраторов
- Ограничивать время жизни токенов 