# Оптимизированная структура API для Requify

## Принципы оптимизации

### 1. Доменно-ориентированная архитектура (DDD)
Согласно лучшим практикам FastAPI и FSD архитектуре, API организован по бизнес-доменам:

### 2. RESTful Design Patterns
- Использование правильных HTTP методов
- Логическая иерархия ресурсов
- Консистентный naming convention (kebab-case для URLs)

### 3. RBAC (Role-Based Access Control)
- Четкая привязка каждого endpoint к ролям
- Контекстные разрешения (scope-based)
- Принцип наименьших привилегий

### 4. Security Best Practices
- JWT authentication с refresh tokens
- Rate limiting для критических операций
- Input validation и sanitization
- HTTPS-only endpoints

## Оптимизированная структура API

### 🔐 Authentication & Authorization Domain
**Base Path**: `/api/v1/auth`

```typescript
// Core Authentication
POST   /auth/register              // Регистрация нового пользователя
POST   /auth/login                 // Аутентификация (получение токенов)
POST   /auth/refresh              // Обновление access token
POST   /auth/logout               // Выход (инвалидация токенов)
POST   /auth/validate             // Валидация токена

// Password Management  
POST   /auth/password/reset       // Запрос сброса пароля
POST   /auth/password/confirm     // Подтверждение сброса пароля
PUT    /auth/password/change      // Смена пароля (авторизованный)

// Email Verification
POST   /auth/email/verify/request // Запрос верификации email
POST   /auth/email/verify/confirm // Подтверждение email

// Session Management
GET    /auth/sessions             // Список активных сессий
DELETE /auth/sessions/{session_id} // Завершение конкретной сессии
DELETE /auth/sessions             // Завершение всех сессий

// OAuth2 Integration
POST   /auth/oauth2/auth0        // OAuth2 через Auth0
GET    /auth/oauth2/providers    // Список OAuth2 провайдеров

// Permissions & Roles (Read-only для пользователя)
GET    /auth/me/roles            // Мои роли
GET    /auth/me/permissions      // Мои разрешения
GET    /auth/me/scopes           // Мои области доступа
```

**RBAC Rules**:
- Все endpoints доступны анонимным пользователям для регистрации/входа
- `/auth/me/*` требует валидного JWT токена
- Rate limiting: 5 запросов/минуту для регистрации/логина

---

### 👤 Identity Management Domain  
**Base Path**: `/api/v1/identity`

```typescript
// User Management
GET    /identity/users                    // [ADMIN] Список всех пользователей
POST   /identity/users                    // [ADMIN] Создание пользователя
GET    /identity/users/me                 // Мой профиль
PUT    /identity/users/me                 // Обновление моего профиля  
GET    /identity/users/{user_id}          // [MANAGER+] Профиль пользователя
PUT    /identity/users/{user_id}          // [ADMIN] Обновление пользователя
DELETE /identity/users/{user_id}          // [ADMIN] Удаление пользователя
POST   /identity/users/{user_id}/activate   // [ADMIN] Активация
POST   /identity/users/{user_id}/deactivate // [ADMIN] Деактивация

// Profile Management
GET    /identity/profiles/me              // Мой расширенный профиль
PUT    /identity/profiles/me              // Обновление профиля
PUT    /identity/profiles/me/avatar       // Загрузка аватара
PUT    /identity/profiles/me/preferences  // Настройки профиля
GET    /identity/profiles/{user_id}       // [TEAM_MEMBER+] Профиль коллеги
GET    /identity/profiles/{user_id}/public // Публичная информация

// Role & Permission Management  
GET    /identity/roles                    // [ADMIN] Список ролей
POST   /identity/roles                    // [SYSTEM_ADMIN] Создание роли
GET    /identity/roles/{role_id}          // [ADMIN] Детали роли
PUT    /identity/roles/{role_id}          // [SYSTEM_ADMIN] Обновление роли
DELETE /identity/roles/{role_id}          // [SYSTEM_ADMIN] Удаление роли

// Role Assignments
GET    /identity/users/{user_id}/roles    // [MANAGER+] Роли пользователя
POST   /identity/users/{user_id}/roles    // [ADMIN] Назначение роли
DELETE /identity/users/{user_id}/roles/{assignment_id} // [ADMIN] Отзыв роли

// Permission Checks
POST   /identity/permissions/check       // Проверка разрешений
GET    /identity/permissions/matrix      // [ADMIN] Матрица разрешений
```

**RBAC Rules**:
- `me` endpoints доступны всем авторизованным пользователям
- Просмотр других пользователей: TEAM_MEMBER+ в контексте команды/проекта
- Управление пользователями: ADMIN+ роли
- Управление ролями: SYSTEM_ADMIN

---

### 🏢 Organization Management Domain
**Base Path**: `/api/v1/organizations`

```typescript
// Company Management
GET    /organizations/companies           // [SYSTEM_ADMIN] Все компании
POST   /organizations/companies           // [SYSTEM_ADMIN] Создание компании
GET    /organizations/companies/my        // Моя компания
PUT    /organizations/companies/my        // [COMPANY_ADMIN] Обновление компании
DELETE /organizations/companies/{company_id} // [SYSTEM_ADMIN] Удаление компании

// Company Settings & Configuration
GET    /organizations/companies/{company_id}/settings    // [COMPANY_ADMIN] Настройки
PUT    /organizations/companies/{company_id}/settings    // [COMPANY_ADMIN] Обновление настроек
GET    /organizations/companies/{company_id}/branding    // [COMPANY_ADMIN] Брендинг
PUT    /organizations/companies/{company_id}/branding    // [COMPANY_ADMIN] Обновление брендинга
GET    /organizations/companies/{company_id}/contact     // [COMPANY_ADMIN] Контакты
PUT    /organizations/companies/{company_id}/contact     // [COMPANY_ADMIN] Обновление контактов

// Subscription Management
GET    /organizations/companies/{company_id}/subscription        // [BILLING_MANAGER] Подписка
PUT    /organizations/companies/{company_id}/subscription        // [BILLING_MANAGER] Изменение подписки
GET    /organizations/companies/{company_id}/subscription/usage  // [BILLING_MANAGER] Использование
GET    /organizations/companies/{company_id}/subscription/plans  // Доступные планы

// Department Hierarchy
GET    /organizations/departments                     // [COMPANY_VIEWER+] Департаменты компании
POST   /organizations/departments                     // [COMPANY_ADMIN] Создание департамента  
GET    /organizations/departments/{department_id}     // [DEPARTMENT_VIEWER+] Департамент
PUT    /organizations/departments/{department_id}     // [DEPARTMENT_ADMIN] Обновление департамента
DELETE /organizations/departments/{department_id}     // [COMPANY_ADMIN] Удаление департамента
GET    /organizations/departments/hierarchy           // [COMPANY_VIEWER+] Иерархия департаментов
POST   /organizations/departments/{department_id}/members // [DEPARTMENT_ADMIN] Добавление участника

// Team Management
GET    /organizations/teams                           // [COMPANY_VIEWER+] Команды компании
POST   /organizations/teams                           // [DEPARTMENT_MANAGER+] Создание команды
GET    /organizations/teams/{team_id}                 // [TEAM_VIEWER+] Команда
PUT    /organizations/teams/{team_id}                 // [TEAM_ADMIN] Обновление команды
DELETE /organizations/teams/{team_id}                 // [DEPARTMENT_ADMIN+] Удаление команды
GET    /organizations/teams/{team_id}/members         // [TEAM_VIEWER+] Участники команды
POST   /organizations/teams/{team_id}/members         // [TEAM_ADMIN] Добавление участника
DELETE /organizations/teams/{team_id}/members/{user_id} // [TEAM_ADMIN] Удаление участника
GET    /organizations/teams/my                        // Мои команды
```

**RBAC Rules**:
- Иерархическая структура: Company > Department > Team
- Роли наследуются вниз по иерархии
- Каждый уровень имеет собственные ADMIN роли
- Участники могут просматривать информацию своего уровня и ниже

---

### 📊 Project Management Domain  
**Base Path**: `/api/v1/projects`

```typescript
// Project Lifecycle
GET    /projects                          // Проекты (с фильтрацией по доступу)
POST   /projects                          // [PROJECT_CREATOR+] Создание проекта
GET    /projects/{project_id}             // [PROJECT_VIEWER+] Проект
PUT    /projects/{project_id}             // [PROJECT_MANAGER+] Обновление проекта
DELETE /projects/{project_id}             // [PROJECT_OWNER] Удаление проекта
POST   /projects/{project_id}/archive     // [PROJECT_MANAGER+] Архивация
POST   /projects/{project_id}/restore     // [PROJECT_MANAGER+] Восстановление

// Project Team & Access
GET    /projects/{project_id}/members     // [PROJECT_VIEWER+] Участники проекта
POST   /projects/{project_id}/members     // [PROJECT_MANAGER+] Добавление участника
PUT    /projects/{project_id}/members/{user_id} // [PROJECT_MANAGER+] Изменение роли
DELETE /projects/{project_id}/members/{user_id} // [PROJECT_MANAGER+] Удаление участника
GET    /projects/{project_id}/permissions // [PROJECT_VIEWER+] Разрешения в проекте

// Requirements Management
GET    /projects/{project_id}/requirements           // [PROJECT_VIEWER+] Требования проекта
POST   /projects/{project_id}/requirements           // [ANALYST+] Создание требования
GET    /projects/{project_id}/requirements/search    // [PROJECT_VIEWER+] Поиск требований
GET    /projects/{project_id}/requirements/stats     // [PROJECT_VIEWER+] Статистика требований
POST   /projects/{project_id}/requirements/import    // [ANALYST+] Импорт требований
GET    /projects/{project_id}/requirements/export    // [PROJECT_VIEWER+] Экспорт требований

// Individual Requirements
GET    /projects/{project_id}/requirements/{req_id}        // [PROJECT_VIEWER+] Требование
PUT    /projects/{project_id}/requirements/{req_id}        // [ANALYST+] Обновление требования
DELETE /projects/{project_id}/requirements/{req_id}        // [ANALYST+] Удаление требования
POST   /projects/{project_id}/requirements/{req_id}/approve // [APPROVER+] Утверждение
POST   /projects/{project_id}/requirements/{req_id}/reject  // [APPROVER+] Отклонение
PUT    /projects/{project_id}/requirements/{req_id}/status // [ANALYST+] Смена статуса

// Requirement Relationships
GET    /projects/{project_id}/requirements/{req_id}/relationships    // [PROJECT_VIEWER+] Связи
POST   /projects/{project_id}/requirements/{req_id}/relationships    // [ANALYST+] Создание связи
DELETE /projects/{project_id}/requirements/{req_id}/relationships/{rel_id} // [ANALYST+] Удаление связи
GET    /projects/{project_id}/requirements/{req_id}/trace-matrix     // [PROJECT_VIEWER+] Матрица трассировки

// Release Management  
GET    /projects/{project_id}/releases               // [PROJECT_VIEWER+] Релизы проекта
POST   /projects/{project_id}/releases               // [RELEASE_MANAGER+] Создание релиза
GET    /projects/{project_id}/releases/{release_id}  // [PROJECT_VIEWER+] Релиз
PUT    /projects/{project_id}/releases/{release_id}  // [RELEASE_MANAGER+] Обновление релиза
DELETE /projects/{project_id}/releases/{release_id}  // [RELEASE_MANAGER+] Удаление релиза
POST   /projects/{project_id}/releases/{release_id}/publish   // [RELEASE_MANAGER+] Публикация
POST   /projects/{project_id}/releases/{release_id}/rollback  // [RELEASE_MANAGER+] Откат
GET    /projects/{project_id}/releases/{release_id}/changelog // [PROJECT_VIEWER+] Журнал изменений

// Project Analytics
GET    /projects/{project_id}/analytics/summary      // [PROJECT_VIEWER+] Сводка проекта
GET    /projects/{project_id}/analytics/progress     // [PROJECT_VIEWER+] Прогресс
GET    /projects/{project_id}/analytics/velocity     // [PROJECT_MANAGER+] Скорость работы
GET    /projects/{project_id}/analytics/quality      // [QA_ENGINEER+] Метрики качества
```

**RBAC Rules**:
- Доступ к проекту определяется членством в проектной команде
- Роли: PROJECT_VIEWER, ANALYST, APPROVER, RELEASE_MANAGER, PROJECT_MANAGER, PROJECT_OWNER
- Иерархические права: PROJECT_OWNER > PROJECT_MANAGER > RELEASE_MANAGER > APPROVER > ANALYST > PROJECT_VIEWER

---

### 🔬 Quality Assurance Domain
**Base Path**: `/api/v1/quality`

```typescript
// Test Management
GET    /quality/test-plans                    // [QA_VIEWER+] Планы тестирования
POST   /quality/test-plans                    // [QA_ENGINEER+] Создание плана
GET    /quality/test-plans/{plan_id}          // [QA_VIEWER+] План тестирования
PUT    /quality/test-plans/{plan_id}          // [QA_ENGINEER+] Обновление плана
DELETE /quality/test-plans/{plan_id}          // [QA_LEAD+] Удаление плана
POST   /quality/test-plans/{plan_id}/execute  // [QA_ENGINEER+] Выполнение плана

// Test Cases
GET    /quality/test-cases                    // [QA_VIEWER+] Тест-кейсы
POST   /quality/test-cases                    // [QA_ENGINEER+] Создание тест-кейса
GET    /quality/test-cases/{case_id}          // [QA_VIEWER+] Тест-кейс
PUT    /quality/test-cases/{case_id}          // [QA_ENGINEER+] Обновление тест-кейса
DELETE /quality/test-cases/{case_id}          // [QA_ENGINEER+] Удаление тест-кейса
POST   /quality/test-cases/{case_id}/execute  // [QA_ENGINEER+] Выполнение тест-кейса

// Test Execution & Results
GET    /quality/executions                    // [QA_VIEWER+] Выполнения тестов
POST   /quality/executions                    // [QA_ENGINEER+] Создание выполнения
GET    /quality/executions/{execution_id}     // [QA_VIEWER+] Выполнение теста
PUT    /quality/executions/{execution_id}     // [QA_ENGINEER+] Обновление результата

// Integration Testing
POST   /quality/integration/run               // [QA_AUTOMATION+] Запуск интеграционных тестов
GET    /quality/integration/jobs/{job_id}     // [QA_VIEWER+] Статус задания
GET    /quality/integration/results           // [QA_VIEWER+] Результаты интеграционных тестов

// Test Reporting
GET    /quality/reports/summary               // [QA_VIEWER+] Сводный отчет
GET    /quality/reports/coverage              // [QA_VIEWER+] Покрытие тестами
GET    /quality/reports/quality-metrics       // [QA_LEAD+] Метрики качества
GET    /quality/reports/defect-analysis       // [QA_LEAD+] Анализ дефектов

// Specifications & Documentation
GET    /quality/specifications                // [PROJECT_VIEWER+] Спецификации
POST   /quality/specifications                // [ANALYST+] Создание спецификации
GET    /quality/specifications/{spec_id}      // [PROJECT_VIEWER+] Спецификация
PUT    /quality/specifications/{spec_id}      // [ANALYST+] Обновление спецификации
DELETE /quality/specifications/{spec_id}      // [ANALYST+] Удаление спецификации
POST   /quality/specifications/{spec_id}/generate-document // [ANALYST+] Генерация документа
GET    /quality/specifications/{spec_id}/download/{format} // [PROJECT_VIEWER+] Скачивание
```

**RBAC Rules**:
- QA роли: QA_VIEWER, QA_ENGINEER, QA_AUTOMATION, QA_LEAD
- Интеграция с проектными ролями для доступа к требованиям
- Специальные права для автоматизированного тестирования

---

### 🤝 Collaboration Domain
**Base Path**: `/api/v1/collaboration`

```typescript
// Comments & Discussions
GET    /collaboration/comments                        // [PROJECT_VIEWER+] Комментарии (с фильтрацией)
POST   /collaboration/comments                        // [PROJECT_VIEWER+] Создание комментария
GET    /collaboration/comments/{comment_id}           // [PROJECT_VIEWER+] Комментарий
PUT    /collaboration/comments/{comment_id}           // [AUTHOR|MODERATOR+] Редактирование
DELETE /collaboration/comments/{comment_id}           // [AUTHOR|MODERATOR+] Удаление

// Resource-specific Comments
GET    /collaboration/requirements/{req_id}/comments     // [PROJECT_VIEWER+] Комментарии к требованию
POST   /collaboration/requirements/{req_id}/comments     // [PROJECT_VIEWER+] Комментарий к требованию
GET    /collaboration/releases/{release_id}/comments     // [PROJECT_VIEWER+] Комментарии к релизу
POST   /collaboration/releases/{release_id}/comments     // [PROJECT_VIEWER+] Комментарий к релизу

// Relationships & Dependencies
GET    /collaboration/relationships                   // [PROJECT_VIEWER+] Связи
POST   /collaboration/relationships                   // [ANALYST+] Создание связи
GET    /collaboration/relationships/{rel_id}          // [PROJECT_VIEWER+] Связь
PUT    /collaboration/relationships/{rel_id}          // [ANALYST+] Обновление связи
DELETE /collaboration/relationships/{rel_id}          // [ANALYST+] Удаление связи

// Relationship Analytics
GET    /collaboration/relationships/matrix            // [PROJECT_VIEWER+] Матрица связей
GET    /collaboration/relationships/dependencies      // [PROJECT_VIEWER+] Граф зависимостей
GET    /collaboration/relationships/impact-analysis   // [ANALYST+] Анализ влияния

// Activity Feeds
GET    /collaboration/activity/recent                 // [PROJECT_VIEWER+] Недавняя активность
GET    /collaboration/activity/my                     // Моя активность
GET    /collaboration/activity/project/{project_id}   // [PROJECT_VIEWER+] Активность проекта
GET    /collaboration/activity/requirement/{req_id}   // [PROJECT_VIEWER+] Активность требования

// Notifications
GET    /collaboration/notifications/my                // Мои уведомления
PUT    /collaboration/notifications/{notification_id}/read // Отметить как прочитанное
DELETE /collaboration/notifications/{notification_id}      // Удалить уведомление
PUT    /collaboration/notifications/preferences       // Настройки уведомлений
```

**RBAC Rules**:
- Комментарии доступны всем участникам проекта для чтения
- Создание комментариев: PROJECT_VIEWER+
- Редактирование: автор комментария или MODERATOR+
- Управление связями: ANALYST+

---

### 📊 Analytics & Reporting Domain
**Base Path**: `/api/v1/analytics`

```typescript
// Dashboard Overview
GET    /analytics/dashboard/overview          // [PROJECT_VIEWER+] Общий обзор
GET    /analytics/dashboard/my                // Мой персональный дашборд
POST   /analytics/dashboard/preferences       // Настройки дашборда
GET    /analytics/dashboard/widgets/available // Доступные виджеты

// Project Analytics
GET    /analytics/projects/summary            // [PROJECT_VIEWER+] Сводка по проектам  
GET    /analytics/projects/{project_id}/stats // [PROJECT_VIEWER+] Статистика проекта
GET    /analytics/projects/{project_id}/health // [PROJECT_MANAGER+] Здоровье проекта
GET    /analytics/projects/portfolio          // [PORTFOLIO_MANAGER+] Портфель проектов

// Requirements Analytics
GET    /analytics/requirements/stats          // [PROJECT_VIEWER+] Статистика требований
GET    /analytics/requirements/trends         // [ANALYST+] Тренды требований
GET    /analytics/requirements/quality        // [QA_VIEWER+] Качество требований
GET    /analytics/requirements/coverage       // [QA_VIEWER+] Покрытие требований

// Team Performance
GET    /analytics/teams/{team_id}/performance // [TEAM_LEAD+] Производительность команды
GET    /analytics/teams/{team_id}/workload    // [TEAM_LEAD+] Нагрузка команды
GET    /analytics/teams/{team_id}/velocity    // [TEAM_LEAD+] Скорость команды

// Quality Metrics
GET    /analytics/quality/defects             // [QA_VIEWER+] Метрики дефектов
GET    /analytics/quality/test-coverage       // [QA_VIEWER+] Покрытие тестами
GET    /analytics/quality/automation-rate     // [QA_LEAD+] Уровень автоматизации

// Business Intelligence
GET    /analytics/business/roi                // [BUSINESS_ANALYST+] ROI проектов
GET    /analytics/business/time-to-market     // [BUSINESS_ANALYST+] Time-to-market
GET    /analytics/business/resource-utilization // [RESOURCE_MANAGER+] Использование ресурсов

// Custom Reports
GET    /analytics/reports                     // [ANALYST+] Список отчетов
POST   /analytics/reports                     // [ANALYST+] Создание отчета
GET    /analytics/reports/{report_id}         // [ANALYST+] Отчет
GET    /analytics/reports/{report_id}/export  // [ANALYST+] Экспорт отчета
```

**RBAC Rules**:
- Базовая аналитика доступна PROJECT_VIEWER+
- Детальная аналитика команд: TEAM_LEAD+
- Бизнес-аналитика: BUSINESS_ANALYST+
- Создание кастомных отчетов: ANALYST+

---

### ⚙️ Configuration Domain
**Base Path**: `/api/v1/configuration`

```typescript
// System Settings
GET    /configuration/settings                // [ADMIN+] Системные настройки
PUT    /configuration/settings                // [SYSTEM_ADMIN] Обновление настроек
GET    /configuration/settings/schema         // [ADMIN+] Схема настроек

// Reference Data Management
GET    /configuration/reference/requirement-types        // [PROJECT_VIEWER+] Типы требований
POST   /configuration/reference/requirement-types        // [SYSTEM_ADMIN] Создание типа
PUT    /configuration/reference/requirement-types/{id}   // [SYSTEM_ADMIN] Обновление типа
DELETE /configuration/reference/requirement-types/{id}   // [SYSTEM_ADMIN] Удаление типа

GET    /configuration/reference/requirement-priorities   // [PROJECT_VIEWER+] Приоритеты
POST   /configuration/reference/requirement-priorities   // [SYSTEM_ADMIN] Создание приоритета
PUT    /configuration/reference/requirement-priorities/{id} // [SYSTEM_ADMIN] Обновление приоритета
DELETE /configuration/reference/requirement-priorities/{id} // [SYSTEM_ADMIN] Удаление приоритета

GET    /configuration/reference/requirement-statuses     // [PROJECT_VIEWER+] Статусы требований
POST   /configuration/reference/requirement-statuses     // [SYSTEM_ADMIN] Создание статуса
PUT    /configuration/reference/requirement-statuses/{id} // [SYSTEM_ADMIN] Обновление статуса
DELETE /configuration/reference/requirement-statuses/{id} // [SYSTEM_ADMIN] Удаление статуса

GET    /configuration/reference/relationship-types       // [PROJECT_VIEWER+] Типы связей
POST   /configuration/reference/relationship-types       // [SYSTEM_ADMIN] Создание типа связи
PUT    /configuration/reference/relationship-types/{id}  // [SYSTEM_ADMIN] Обновление типа связи
DELETE /configuration/reference/relationship-types/{id}  // [SYSTEM_ADMIN] Удаление типа связи

// User Preferences
GET    /configuration/preferences/my          // Мои предпочтения
PUT    /configuration/preferences/my          // Обновление предпочтений
GET    /configuration/preferences/defaults    // Предпочтения по умолчанию

// Company Configuration
GET    /configuration/company/workflows       // [COMPANY_ADMIN] Рабочие процессы
PUT    /configuration/company/workflows       // [COMPANY_ADMIN] Настройка процессов
GET    /configuration/company/templates       // [COMPANY_ADMIN] Шаблоны
POST   /configuration/company/templates       // [COMPANY_ADMIN] Создание шаблона
```

**RBAC Rules**:
- Справочные данные: чтение для всех, управление для SYSTEM_ADMIN
- Пользовательские настройки: доступны владельцу
- Компанийские настройки: COMPANY_ADMIN+

---

### 🛠️ System Administration Domain
**Base Path**: `/api/v1/system`

```typescript
// System Health & Monitoring
GET    /system/health                         // [PUBLIC] Базовая проверка здоровья
GET    /system/health/detailed                // [ADMIN+] Детальная проверка
GET    /system/metrics                        // [ADMIN+] Системные метрики
GET    /system/info                          // [ADMIN+] Информация о системе

// User Management (Admin)
GET    /system/admin/users                    // [SYSTEM_ADMIN] Все пользователи системы
GET    /system/admin/users/stats              // [SYSTEM_ADMIN] Статистика пользователей
POST   /system/admin/users/{user_id}/impersonate // [SYSTEM_ADMIN] Авторизация от имени
GET    /system/admin/users/{user_id}/audit    // [SYSTEM_ADMIN] Журнал действий пользователя

// Company Management (Admin)
GET    /system/admin/companies                // [SYSTEM_ADMIN] Все компании
GET    /system/admin/companies/stats          // [SYSTEM_ADMIN] Статистика компаний
POST   /system/admin/companies/{company_id}/suspend // [SYSTEM_ADMIN] Приостановка компании
POST   /system/admin/companies/{company_id}/activate // [SYSTEM_ADMIN] Активация компании

// System Audit & Logging
GET    /system/audit/log                      // [SECURITY_AUDITOR+] Журнал аудита
GET    /system/audit/security-events          // [SECURITY_AUDITOR+] События безопасности
GET    /system/logs                          // [SYSTEM_ADMIN] Системные логи
GET    /system/logs/errors                   // [SUPPORT_ADMIN+] Логи ошибок

// Backup & Maintenance
POST   /system/backup/create                  // [SYSTEM_ADMIN] Создание резервной копии
GET    /system/backup/list                    // [SYSTEM_ADMIN] Список резервных копий
POST   /system/backup/restore                 // [SYSTEM_ADMIN] Восстановление из копии
GET    /system/backup/{backup_id}/download    // [SYSTEM_ADMIN] Скачивание копии

// Performance & Optimization
GET    /system/performance/stats              // [SYSTEM_ADMIN] Статистика производительности
POST   /system/cache/clear                    // [SYSTEM_ADMIN] Очистка кеша
POST   /system/maintenance/start              // [SYSTEM_ADMIN] Начало обслуживания
POST   /system/maintenance/end                // [SYSTEM_ADMIN] Окончание обслуживания

// Feature Flags & Configuration
GET    /system/features                       // [ADMIN+] Список feature flags
PUT    /system/features/{feature_id}          // [SYSTEM_ADMIN] Управление feature flag
GET    /system/configuration/export           // [SYSTEM_ADMIN] Экспорт конфигурации
POST   /system/configuration/import           // [SYSTEM_ADMIN] Импорт конфигурации
```

**RBAC Rules**:
- Системные операции: SYSTEM_ADMIN, PLATFORM_ADMIN
- Мониторинг и логи: SUPPORT_ADMIN+
- Аудит безопасности: SECURITY_AUDITOR+
- Базовая проверка здоровья доступна всем

---

## Security & Rate Limiting

### Rate Limiting Rules

```typescript
// Authentication endpoints
/auth/login                    - 5 requests / minute
/auth/register                 - 3 requests / minute  
/auth/password/reset           - 3 requests / minute
/auth/email/verify/request     - 5 requests / minute

// API endpoints (authenticated)
Default rate limit             - 1000 requests / hour
Admin endpoints               - 500 requests / hour
Bulk operations               - 100 requests / hour
Report generation             - 10 requests / hour

// Public endpoints
/system/health                - 60 requests / minute
Static content                - No limit
```

### HTTPS & Security Headers

```typescript
// Required security headers
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin

// CORS configuration
Access-Control-Allow-Origin: https://app.requify.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With
Access-Control-Max-Age: 86400
```

### JWT Token Management

```typescript
// Token configuration
Access Token TTL: 15 minutes
Refresh Token TTL: 30 days
Token Algorithm: RS256 (asymmetric)
Token Issuer: api.requify.com
Audience: app.requify.com

// Token payload
{
  "iss": "api.requify.com",
  "aud": "app.requify.com", 
  "sub": "user_id",
  "iat": timestamp,
  "exp": timestamp,
  "scope": ["role:project_manager", "context:project_123"],
  "company_id": "company_456",
  "user_id": "user_789"
}
```

## Implementation Migration Plan

### Phase 1: Core Authentication (1-2 weeks)
1. Реорганизация `/auth` endpoints
2. Внедрение новой JWT structure
3. Добавление rate limiting
4. Обновление CORS настроек

### Phase 2: Identity Management (2-3 weeks)  
1. Перенос user management в `/identity`
2. Реорганизация role management
3. Внедрение контекстных разрешений
4. Обновление permission checking

### Phase 3: Organization Structure (2-3 weeks)
1. Создание `/organizations` domain
2. Реорганизация company/department/team endpoints
3. Внедрение иерархической ролевой модели
4. Миграция данных и разрешений

### Phase 4: Project Management (3-4 weeks)
1. Реорганизация `/projects` domain  
2. Интеграция requirements и releases
3. Внедрение project-specific RBAC
4. Обновление аналитики проектов

### Phase 5: Quality & Collaboration (2-3 weeks)
1. Создание `/quality` domain
2. Реорганизация `/collaboration` domain
3. Интеграция testing endpoints
4. Обновление комментариев и связей

### Phase 6: Analytics & Configuration (2-3 weeks)
1. Создание `/analytics` domain
2. Реорганизация `/configuration` domain  
3. Миграция dashboard endpoints
4. Обновление reference data management

### Phase 7: System Administration (1-2 weeks)
1. Создание `/system` domain
2. Реорганизация admin endpoints
3. Внедрение системного мониторинга
4. Finalization и документация

## Breaking Changes & Backward Compatibility

### Deprecated Endpoints (будут удалены в v2.0)
```typescript
// Old structure -> New structure
/users/* -> /identity/users/*
/companies/* -> /organizations/companies/*  
/teams/* -> /organizations/teams/*
/dashboard/* -> /analytics/dashboard/*
/admin/* -> /system/admin/*
/reference/* -> /configuration/reference/*
```

### Migration Strategy
1. **Dual API support**: старые и новые endpoints работают параллельно
2. **Deprecation warnings**: в response headers старых endpoints
3. **Client SDK updates**: обновление для поддержки новой структуры
4. **Grace period**: 6 месяцев для миграции клиентов
5. **Automated migration tools**: скрипты для обновления конфигураций

### Monitoring & Rollback Plan
1. **API usage metrics**: отслеживание использования старых/новых endpoints
2. **Error rate monitoring**: контроль ошибок после изменений
3. **Performance benchmarks**: сравнение производительности
4. **Feature flags**: возможность быстрого отката на старую версию
5. **Database migrations**: обратимые изменения схемы данных

Эта оптимизированная структура обеспечивает:
- ✅ Лучшую организацию по бизнес-доменам
- ✅ Консистентную ролевую модель RBAC  
- ✅ Улучшенную безопасность
- ✅ Масштабируемость архитектуры
- ✅ Соответствие REST принципам
- ✅ Простоту сопровождения и развития
