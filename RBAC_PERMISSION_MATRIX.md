# RBAC Permission Matrix для Requify API

## Обзор ролевой системы

### Иерархия ролей

```
SYSTEM LEVEL
├── SYSTEM_ADMIN (highest)
├── PLATFORM_ADMIN  
├── SUPPORT_ADMIN
├── BILLING_ADMIN
└── SECURITY_AUDITOR

COMPANY LEVEL
├── COMPANY_OWNER (highest in company)
├── COMPANY_ADMIN
├── BILLING_MANAGER
├── HR_MANAGER
├── SECURITY_MANAGER
└── COMPANY_VIEWER

DEPARTMENT LEVEL  
├── DEPARTMENT_HEAD (highest in department)
├── DEPARTMENT_ADMIN
├── DEPUTY_HEAD
├── SENIOR_MANAGER
├── MANAGER
├── COORDINATOR
└── DEPARTMENT_VIEWER

TEAM LEVEL
├── TEAM_OWNER (highest in team)
├── TEAM_ADMIN
├── TEAM_LEAD
├── TECH_LEAD
├── SCRUM_MASTER
├── PRODUCT_OWNER
├── SENIOR_DEVELOPER
├── DEVELOPER
├── ANALYST
├── TESTER
├── MEMBER
└── TEAM_VIEWER

PROJECT LEVEL
├── PROJECT_OWNER (highest in project)
├── PROJECT_MANAGER
├── ARCHITECT
├── BUSINESS_ANALYST
├── QA_LEAD
├── QA_ENGINEER
├── SENIOR_DEVELOPER
├── DEVELOPER
├── STAKEHOLDER
└── PROJECT_VIEWER
```

## Детальная матрица разрешений

### 🔐 Authentication Domain (`/api/v1/auth`)

| Endpoint | Anonymous | Any User | Description |
|----------|-----------|----------|-------------|
| `POST /auth/register` | ✅ | ✅ | Регистрация новых пользователей |
| `POST /auth/login` | ✅ | ✅ | Аутентификация |
| `POST /auth/refresh` | ✅ | ✅ | Обновление токенов |
| `POST /auth/logout` | ❌ | ✅ | Выход из системы |
| `POST /auth/validate` | ❌ | ✅ | Валидация токена |
| `PUT /auth/password/change` | ❌ | ✅ | Смена пароля |
| `POST /auth/password/reset` | ✅ | ✅ | Сброс пароля |
| `POST /auth/email/verify/*` | ✅ | ✅ | Верификация email |
| `GET /auth/sessions` | ❌ | ✅ | Управление сессиями |
| `DELETE /auth/sessions/*` | ❌ | ✅ | Завершение сессий |
| `GET /auth/me/roles` | ❌ | ✅ | Просмотр своих ролей |
| `GET /auth/me/permissions` | ❌ | ✅ | Просмотр своих разрешений |

**Rate Limits:**
- Registration: 3/minute
- Login: 5/minute  
- Password reset: 3/minute

---

### 👤 Identity Management Domain (`/api/v1/identity`)

#### User Management

| Endpoint | SYSTEM_ADMIN | COMPANY_ADMIN | HR_MANAGER | TEAM_LEAD | SELF | PROJECT_VIEWER |
|----------|--------------|---------------|------------|-----------|------|----------------|
| `GET /identity/users` | ✅ | ✅ (company) | ✅ (company) | ✅ (team) | ❌ | ❌ |
| `POST /identity/users` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /identity/users/me` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PUT /identity/users/me` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /identity/users/{id}` | ✅ | ✅ (company) | ✅ (company) | ✅ (team) | ✅ (self) | ✅ (project) |
| `PUT /identity/users/{id}` | ✅ | ✅ (company) | ✅ (company) | ❌ | ✅ (self) | ❌ |
| `DELETE /identity/users/{id}` | ✅ | ✅ (company) | ❌ | ❌ | ❌ | ❌ |
| `POST /identity/users/{id}/activate` | ✅ | ✅ (company) | ✅ (company) | ❌ | ❌ | ❌ |

#### Profile Management

| Endpoint | Any User | Manager+ | Admin+ | Description |
|----------|----------|----------|--------|-------------|
| `GET /identity/profiles/me` | ✅ | ✅ | ✅ | Собственный профиль |
| `PUT /identity/profiles/me` | ✅ | ✅ | ✅ | Обновление профиля |
| `PUT /identity/profiles/me/avatar` | ✅ | ✅ | ✅ | Загрузка аватара |
| `GET /identity/profiles/{user_id}` | ✅ (team/project) | ✅ | ✅ | Профиль коллеги |
| `GET /identity/profiles/{user_id}/public` | ✅ | ✅ | ✅ | Публичная информация |

#### Role Management

| Endpoint | SYSTEM_ADMIN | COMPANY_ADMIN | DEPARTMENT_HEAD | TEAM_LEAD | Description |
|----------|--------------|---------------|-----------------|-----------|-------------|
| `GET /identity/roles` | ✅ | ✅ (scope) | ✅ (scope) | ✅ (scope) | Список ролей |
| `POST /identity/roles` | ✅ | ❌ | ❌ | ❌ | Создание ролей |
| `PUT /identity/roles/{id}` | ✅ | ❌ | ❌ | ❌ | Изменение ролей |
| `DELETE /identity/roles/{id}` | ✅ | ❌ | ❌ | ❌ | Удаление ролей |
| `POST /identity/users/{id}/roles` | ✅ | ✅ (company) | ✅ (dept) | ✅ (team) | Назначение ролей |
| `DELETE /identity/users/{id}/roles/{role_id}` | ✅ | ✅ (company) | ✅ (dept) | ✅ (team) | Отзыв ролей |

---

### 🏢 Organization Management Domain (`/api/v1/organizations`)

#### Company Management

| Endpoint | SYSTEM_ADMIN | COMPANY_OWNER | COMPANY_ADMIN | BILLING_MANAGER | COMPANY_VIEWER |
|----------|--------------|---------------|---------------|-----------------|----------------|
| `GET /organizations/companies` | ✅ (all) | ❌ | ❌ | ❌ | ❌ |
| `POST /organizations/companies` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET /organizations/companies/my` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PUT /organizations/companies/my` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `DELETE /organizations/companies/{id}` | ✅ | ❌ | ❌ | ❌ | ❌ |

#### Company Configuration

| Endpoint | COMPANY_OWNER | COMPANY_ADMIN | BILLING_MANAGER | SECURITY_MANAGER |
|----------|---------------|---------------|-----------------|------------------|
| `GET /organizations/companies/{id}/settings` | ✅ | ✅ | ✅ (billing) | ✅ (security) |
| `PUT /organizations/companies/{id}/settings` | ✅ | ✅ | ✅ (billing) | ✅ (security) |
| `GET /organizations/companies/{id}/branding` | ✅ | ✅ | ❌ | ❌ |
| `PUT /organizations/companies/{id}/branding` | ✅ | ✅ | ❌ | ❌ |
| `GET /organizations/companies/{id}/contact` | ✅ | ✅ | ✅ | ❌ |
| `PUT /organizations/companies/{id}/contact` | ✅ | ✅ | ❌ | ❌ |

#### Subscription Management

| Endpoint | COMPANY_OWNER | BILLING_MANAGER | COMPANY_ADMIN | Description |
|----------|---------------|-----------------|---------------|-------------|
| `GET /organizations/companies/{id}/subscription` | ✅ | ✅ | ✅ | Информация о подписке |
| `PUT /organizations/companies/{id}/subscription` | ✅ | ✅ | ❌ | Изменение подписки |
| `GET /organizations/companies/{id}/subscription/usage` | ✅ | ✅ | ✅ | Использование ресурсов |
| `GET /organizations/companies/{id}/subscription/plans` | ✅ | ✅ | ✅ | Доступные планы |

#### Department Hierarchy

| Endpoint | COMPANY_ADMIN | DEPARTMENT_HEAD | DEPARTMENT_ADMIN | DEPARTMENT_VIEWER |
|----------|---------------|-----------------|------------------|-------------------|
| `GET /organizations/departments` | ✅ | ✅ (dept+sub) | ✅ (dept+sub) | ✅ (dept+sub) |
| `POST /organizations/departments` | ✅ | ✅ (sub-dept) | ❌ | ❌ |
| `GET /organizations/departments/{id}` | ✅ | ✅ (access) | ✅ (access) | ✅ (access) |
| `PUT /organizations/departments/{id}` | ✅ | ✅ (own) | ✅ (own) | ❌ |
| `DELETE /organizations/departments/{id}` | ✅ | ✅ (own) | ❌ | ❌ |
| `GET /organizations/departments/hierarchy` | ✅ | ✅ | ✅ | ✅ |
| `POST /organizations/departments/{id}/members` | ✅ | ✅ (dept) | ✅ (dept) | ❌ |

#### Team Management

| Endpoint | DEPT_HEAD | TEAM_OWNER | TEAM_ADMIN | TEAM_LEAD | TEAM_VIEWER |
|----------|-----------|------------|------------|-----------|-------------|
| `GET /organizations/teams` | ✅ (dept) | ✅ (own) | ✅ (own) | ✅ (own) | ✅ (own) |
| `POST /organizations/teams` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /organizations/teams/{id}` | ✅ (dept) | ✅ | ✅ | ✅ | ✅ |
| `PUT /organizations/teams/{id}` | ✅ (dept) | ✅ | ✅ | ❌ | ❌ |
| `DELETE /organizations/teams/{id}` | ✅ (dept) | ✅ | ❌ | ❌ | ❌ |
| `GET /organizations/teams/{id}/members` | ✅ (dept) | ✅ | ✅ | ✅ | ✅ |
| `POST /organizations/teams/{id}/members` | ✅ (dept) | ✅ | ✅ | ❌ | ❌ |
| `DELETE /organizations/teams/{id}/members/{user_id}` | ✅ (dept) | ✅ | ✅ | ❌ | ❌ |
| `GET /organizations/teams/my` | ✅ | ✅ | ✅ | ✅ | ✅ |

---

### 📊 Project Management Domain (`/api/v1/projects`)

#### Project Lifecycle

| Endpoint | PROJECT_OWNER | PROJECT_MANAGER | ARCHITECT | ANALYST | DEVELOPER | PROJECT_VIEWER |
|----------|---------------|-----------------|-----------|---------|-----------|----------------|
| `GET /projects` | ✅ (access) | ✅ (access) | ✅ (access) | ✅ (access) | ✅ (access) | ✅ (access) |
| `POST /projects` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET /projects/{id}` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PUT /projects/{id}` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `DELETE /projects/{id}` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /projects/{id}/archive` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /projects/{id}/restore` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

#### Project Team & Access

| Endpoint | PROJECT_OWNER | PROJECT_MANAGER | TEAM_LEAD | PROJECT_VIEWER |
|----------|---------------|-----------------|-----------|----------------|
| `GET /projects/{id}/members` | ✅ | ✅ | ✅ | ✅ |
| `POST /projects/{id}/members` | ✅ | ✅ | ❌ | ❌ |
| `PUT /projects/{id}/members/{user_id}` | ✅ | ✅ | ❌ | ❌ |
| `DELETE /projects/{id}/members/{user_id}` | ✅ | ✅ | ❌ | ❌ |
| `GET /projects/{id}/permissions` | ✅ | ✅ | ✅ | ✅ |

#### Requirements Management

| Endpoint | ANALYST | BUSINESS_ANALYST | ARCHITECT | PROJECT_MANAGER | DEVELOPER | PROJECT_VIEWER |
|----------|---------|------------------|-----------|-----------------|-----------|----------------|
| `GET /projects/{id}/requirements` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /projects/{id}/requirements` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /projects/{id}/requirements/search` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /projects/{id}/requirements/stats` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /projects/{id}/requirements/import` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /projects/{id}/requirements/export` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

#### Individual Requirements

| Endpoint | ANALYST | APPROVER | PROJECT_MANAGER | DEVELOPER | PROJECT_VIEWER |
|----------|---------|----------|-----------------|-----------|----------------|
| `GET /projects/{id}/requirements/{req_id}` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PUT /projects/{id}/requirements/{req_id}` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `DELETE /projects/{id}/requirements/{req_id}` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /projects/{id}/requirements/{req_id}/approve` | ❌ | ✅ | ✅ | ❌ | ❌ |
| `POST /projects/{id}/requirements/{req_id}/reject` | ❌ | ✅ | ✅ | ❌ | ❌ |
| `PUT /projects/{id}/requirements/{req_id}/status` | ✅ | ✅ | ✅ | ❌ | ❌ |

#### Requirement Relationships

| Endpoint | ANALYST | ARCHITECT | PROJECT_VIEWER |
|----------|---------|-----------|----------------|
| `GET /projects/{id}/requirements/{req_id}/relationships` | ✅ | ✅ | ✅ |
| `POST /projects/{id}/requirements/{req_id}/relationships` | ✅ | ✅ | ❌ |
| `DELETE /projects/{id}/requirements/{req_id}/relationships/{rel_id}` | ✅ | ✅ | ❌ |
| `GET /projects/{id}/requirements/{req_id}/trace-matrix` | ✅ | ✅ | ✅ |

#### Release Management

| Endpoint | RELEASE_MANAGER | PROJECT_MANAGER | PROJECT_OWNER | PROJECT_VIEWER |
|----------|-----------------|-----------------|---------------|----------------|
| `GET /projects/{id}/releases` | ✅ | ✅ | ✅ | ✅ |
| `POST /projects/{id}/releases` | ✅ | ✅ | ✅ | ❌ |
| `GET /projects/{id}/releases/{release_id}` | ✅ | ✅ | ✅ | ✅ |
| `PUT /projects/{id}/releases/{release_id}` | ✅ | ✅ | ✅ | ❌ |
| `DELETE /projects/{id}/releases/{release_id}` | ✅ | ✅ | ✅ | ❌ |
| `POST /projects/{id}/releases/{release_id}/publish` | ✅ | ✅ | ✅ | ❌ |
| `POST /projects/{id}/releases/{release_id}/rollback` | ✅ | ✅ | ✅ | ❌ |
| `GET /projects/{id}/releases/{release_id}/changelog` | ✅ | ✅ | ✅ | ✅ |

#### Project Analytics

| Endpoint | PROJECT_VIEWER | PROJECT_MANAGER | QA_ENGINEER | BUSINESS_ANALYST |
|----------|----------------|-----------------|-------------|------------------|
| `GET /projects/{id}/analytics/summary` | ✅ | ✅ | ✅ | ✅ |
| `GET /projects/{id}/analytics/progress` | ✅ | ✅ | ✅ | ✅ |
| `GET /projects/{id}/analytics/velocity` | ❌ | ✅ | ✅ | ✅ |
| `GET /projects/{id}/analytics/quality` | ❌ | ✅ | ✅ | ❌ |

---

### 🔬 Quality Assurance Domain (`/api/v1/quality`)

#### Test Management

| Endpoint | QA_LEAD | QA_ENGINEER | QA_AUTOMATION | QA_VIEWER | PROJECT_VIEWER |
|----------|---------|-------------|---------------|-----------|----------------|
| `GET /quality/test-plans` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /quality/test-plans` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /quality/test-plans/{id}` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PUT /quality/test-plans/{id}` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `DELETE /quality/test-plans/{id}` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /quality/test-plans/{id}/execute` | ✅ | ✅ | ✅ | ❌ | ❌ |

#### Test Cases

| Endpoint | QA_LEAD | QA_ENGINEER | QA_AUTOMATION | QA_VIEWER |
|----------|---------|-------------|---------------|-----------|
| `GET /quality/test-cases` | ✅ | ✅ | ✅ | ✅ |
| `POST /quality/test-cases` | ✅ | ✅ | ✅ | ❌ |
| `GET /quality/test-cases/{id}` | ✅ | ✅ | ✅ | ✅ |
| `PUT /quality/test-cases/{id}` | ✅ | ✅ | ✅ | ❌ |
| `DELETE /quality/test-cases/{id}` | ✅ | ✅ | ❌ | ❌ |
| `POST /quality/test-cases/{id}/execute` | ✅ | ✅ | ✅ | ❌ |

#### Test Execution & Results

| Endpoint | QA_LEAD | QA_ENGINEER | QA_AUTOMATION | QA_VIEWER |
|----------|---------|-------------|---------------|-----------|
| `GET /quality/executions` | ✅ | ✅ | ✅ | ✅ |
| `POST /quality/executions` | ✅ | ✅ | ✅ | ❌ |
| `GET /quality/executions/{id}` | ✅ | ✅ | ✅ | ✅ |
| `PUT /quality/executions/{id}` | ✅ | ✅ | ✅ | ❌ |

#### Integration Testing

| Endpoint | QA_AUTOMATION | QA_LEAD | QA_ENGINEER | Description |
|----------|---------------|---------|-------------|-------------|
| `POST /quality/integration/run` | ✅ | ✅ | ❌ | Запуск автотестов |
| `GET /quality/integration/jobs/{job_id}` | ✅ | ✅ | ✅ | Статус выполнения |
| `GET /quality/integration/results` | ✅ | ✅ | ✅ | Результаты тестов |

#### Test Reporting

| Endpoint | QA_VIEWER | QA_ENGINEER | QA_LEAD | PROJECT_MANAGER |
|----------|-----------|-------------|---------|-----------------|
| `GET /quality/reports/summary` | ✅ | ✅ | ✅ | ✅ |
| `GET /quality/reports/coverage` | ✅ | ✅ | ✅ | ✅ |
| `GET /quality/reports/quality-metrics` | ❌ | ✅ | ✅ | ✅ |
| `GET /quality/reports/defect-analysis` | ❌ | ✅ | ✅ | ✅ |

#### Specifications & Documentation

| Endpoint | ANALYST | BUSINESS_ANALYST | ARCHITECT | PROJECT_VIEWER |
|----------|---------|------------------|-----------|----------------|
| `GET /quality/specifications` | ✅ | ✅ | ✅ | ✅ |
| `POST /quality/specifications` | ✅ | ✅ | ✅ | ❌ |
| `GET /quality/specifications/{id}` | ✅ | ✅ | ✅ | ✅ |
| `PUT /quality/specifications/{id}` | ✅ | ✅ | ✅ | ❌ |
| `DELETE /quality/specifications/{id}` | ✅ | ✅ | ✅ | ❌ |
| `POST /quality/specifications/{id}/generate-document` | ✅ | ✅ | ✅ | ❌ |
| `GET /quality/specifications/{id}/download/{format}` | ✅ | ✅ | ✅ | ✅ |

---

### 🤝 Collaboration Domain (`/api/v1/collaboration`)

#### Comments & Discussions

| Endpoint | PROJECT_VIEWER | MODERATOR | AUTHOR | Description |
|----------|----------------|-----------|--------|-------------|
| `GET /collaboration/comments` | ✅ (filtered) | ✅ | ✅ | Просмотр комментариев |
| `POST /collaboration/comments` | ✅ | ✅ | ✅ | Создание комментария |
| `GET /collaboration/comments/{id}` | ✅ (access) | ✅ | ✅ | Конкретный комментарий |
| `PUT /collaboration/comments/{id}` | ❌ | ✅ | ✅ (own) | Редактирование |
| `DELETE /collaboration/comments/{id}` | ❌ | ✅ | ✅ (own) | Удаление |

#### Resource-specific Comments

| Endpoint | PROJECT_VIEWER | PROJECT_MEMBER | Description |
|----------|----------------|----------------|-------------|
| `GET /collaboration/requirements/{req_id}/comments` | ✅ | ✅ | Комментарии к требованию |
| `POST /collaboration/requirements/{req_id}/comments` | ✅ | ✅ | Добавление комментария |
| `GET /collaboration/releases/{release_id}/comments` | ✅ | ✅ | Комментарии к релизу |
| `POST /collaboration/releases/{release_id}/comments` | ✅ | ✅ | Добавление комментария |

#### Relationships & Dependencies

| Endpoint | ANALYST | ARCHITECT | PROJECT_VIEWER |
|----------|---------|-----------|----------------|
| `GET /collaboration/relationships` | ✅ | ✅ | ✅ |
| `POST /collaboration/relationships` | ✅ | ✅ | ❌ |
| `GET /collaboration/relationships/{id}` | ✅ | ✅ | ✅ |
| `PUT /collaboration/relationships/{id}` | ✅ | ✅ | ❌ |
| `DELETE /collaboration/relationships/{id}` | ✅ | ✅ | ❌ |

#### Relationship Analytics

| Endpoint | PROJECT_VIEWER | ANALYST | ARCHITECT |
|----------|----------------|---------|-----------|
| `GET /collaboration/relationships/matrix` | ✅ | ✅ | ✅ |
| `GET /collaboration/relationships/dependencies` | ✅ | ✅ | ✅ |
| `GET /collaboration/relationships/impact-analysis` | ❌ | ✅ | ✅ |

#### Activity Feeds

| Endpoint | Any User | PROJECT_MEMBER | Description |
|----------|----------|----------------|-------------|
| `GET /collaboration/activity/recent` | ✅ (filtered) | ✅ | Недавняя активность |
| `GET /collaboration/activity/my` | ✅ | ✅ | Личная активность |
| `GET /collaboration/activity/project/{id}` | ❌ | ✅ | Активность проекта |
| `GET /collaboration/activity/requirement/{id}` | ❌ | ✅ | Активность требования |

#### Notifications

| Endpoint | Any User | Description |
|----------|----------|-------------|
| `GET /collaboration/notifications/my` | ✅ | Мои уведомления |
| `PUT /collaboration/notifications/{id}/read` | ✅ (own) | Отметить как прочитанное |
| `DELETE /collaboration/notifications/{id}` | ✅ (own) | Удалить уведомление |
| `PUT /collaboration/notifications/preferences` | ✅ | Настройки уведомлений |

---

### 📊 Analytics & Reporting Domain (`/api/v1/analytics`)

#### Dashboard Overview

| Endpoint | Any User | PROJECT_MEMBER | Description |
|----------|----------|----------------|-------------|
| `GET /analytics/dashboard/overview` | ✅ (filtered) | ✅ | Общий обзор |
| `GET /analytics/dashboard/my` | ✅ | ✅ | Персональный дашборд |
| `POST /analytics/dashboard/preferences` | ✅ | ✅ | Настройки дашборда |
| `GET /analytics/dashboard/widgets/available` | ✅ | ✅ | Доступные виджеты |

#### Project Analytics

| Endpoint | PROJECT_VIEWER | PROJECT_MANAGER | PORTFOLIO_MANAGER |
|----------|----------------|-----------------|-------------------|
| `GET /analytics/projects/summary` | ✅ (own projects) | ✅ | ✅ |
| `GET /analytics/projects/{id}/stats` | ✅ | ✅ | ✅ |
| `GET /analytics/projects/{id}/health` | ❌ | ✅ | ✅ |
| `GET /analytics/projects/portfolio` | ❌ | ❌ | ✅ |

#### Requirements Analytics

| Endpoint | PROJECT_VIEWER | ANALYST | QA_VIEWER |
|----------|----------------|---------|-----------|
| `GET /analytics/requirements/stats` | ✅ | ✅ | ✅ |
| `GET /analytics/requirements/trends` | ❌ | ✅ | ✅ |
| `GET /analytics/requirements/quality` | ❌ | ✅ | ✅ |
| `GET /analytics/requirements/coverage` | ❌ | ✅ | ✅ |

#### Team Performance

| Endpoint | TEAM_LEAD | TEAM_ADMIN | TEAM_MEMBER |
|----------|-----------|------------|-------------|
| `GET /analytics/teams/{id}/performance` | ✅ | ✅ | ❌ |
| `GET /analytics/teams/{id}/workload` | ✅ | ✅ | ❌ |
| `GET /analytics/teams/{id}/velocity` | ✅ | ✅ | ❌ |

#### Quality Metrics

| Endpoint | QA_VIEWER | QA_ENGINEER | QA_LEAD |
|----------|-----------|-------------|---------|
| `GET /analytics/quality/defects` | ✅ | ✅ | ✅ |
| `GET /analytics/quality/test-coverage` | ✅ | ✅ | ✅ |
| `GET /analytics/quality/automation-rate` | ❌ | ✅ | ✅ |

#### Business Intelligence

| Endpoint | BUSINESS_ANALYST | RESOURCE_MANAGER | PORTFOLIO_MANAGER |
|----------|------------------|------------------|-------------------|
| `GET /analytics/business/roi` | ✅ | ✅ | ✅ |
| `GET /analytics/business/time-to-market` | ✅ | ✅ | ✅ |
| `GET /analytics/business/resource-utilization` | ❌ | ✅ | ✅ |

#### Custom Reports

| Endpoint | ANALYST | BUSINESS_ANALYST | REPORT_VIEWER |
|----------|---------|------------------|---------------|
| `GET /analytics/reports` | ✅ | ✅ | ✅ (access) |
| `POST /analytics/reports` | ✅ | ✅ | ❌ |
| `GET /analytics/reports/{id}` | ✅ (access) | ✅ (access) | ✅ (access) |
| `GET /analytics/reports/{id}/export` | ✅ (access) | ✅ (access) | ✅ (access) |

---

### ⚙️ Configuration Domain (`/api/v1/configuration`)

#### System Settings

| Endpoint | SYSTEM_ADMIN | PLATFORM_ADMIN | ADMIN |
|----------|--------------|----------------|-------|
| `GET /configuration/settings` | ✅ | ✅ | ✅ (scope) |
| `PUT /configuration/settings` | ✅ | ❌ | ❌ |
| `GET /configuration/settings/schema` | ✅ | ✅ | ✅ (scope) |

#### Reference Data Management

| Endpoint | SYSTEM_ADMIN | PROJECT_VIEWER | Description |
|----------|--------------|----------------|-------------|
| `GET /configuration/reference/requirement-types` | ✅ | ✅ | Просмотр типов |
| `POST /configuration/reference/requirement-types` | ✅ | ❌ | Создание типа |
| `PUT /configuration/reference/requirement-types/{id}` | ✅ | ❌ | Изменение типа |
| `DELETE /configuration/reference/requirement-types/{id}` | ✅ | ❌ | Удаление типа |

| Endpoint | SYSTEM_ADMIN | PROJECT_VIEWER | Description |
|----------|--------------|----------------|-------------|
| `GET /configuration/reference/requirement-priorities` | ✅ | ✅ | Просмотр приоритетов |
| `POST /configuration/reference/requirement-priorities` | ✅ | ❌ | Создание приоритета |
| `PUT /configuration/reference/requirement-priorities/{id}` | ✅ | ❌ | Изменение приоритета |
| `DELETE /configuration/reference/requirement-priorities/{id}` | ✅ | ❌ | Удаление приоритета |

| Endpoint | SYSTEM_ADMIN | PROJECT_VIEWER | Description |
|----------|--------------|----------------|-------------|
| `GET /configuration/reference/requirement-statuses` | ✅ | ✅ | Просмотр статусов |
| `POST /configuration/reference/requirement-statuses` | ✅ | ❌ | Создание статуса |
| `PUT /configuration/reference/requirement-statuses/{id}` | ✅ | ❌ | Изменение статуса |
| `DELETE /configuration/reference/requirement-statuses/{id}` | ✅ | ❌ | Удаление статуса |

| Endpoint | SYSTEM_ADMIN | PROJECT_VIEWER | Description |
|----------|--------------|----------------|-------------|
| `GET /configuration/reference/relationship-types` | ✅ | ✅ | Просмотр типов связей |
| `POST /configuration/reference/relationship-types` | ✅ | ❌ | Создание типа связи |
| `PUT /configuration/reference/relationship-types/{id}` | ✅ | ❌ | Изменение типа связи |
| `DELETE /configuration/reference/relationship-types/{id}` | ✅ | ❌ | Удаление типа связи |

#### User Preferences

| Endpoint | Any User | Description |
|----------|----------|-------------|
| `GET /configuration/preferences/my` | ✅ | Мои предпочтения |
| `PUT /configuration/preferences/my` | ✅ | Обновление предпочтений |
| `GET /configuration/preferences/defaults` | ✅ | Предпочтения по умолчанию |

#### Company Configuration

| Endpoint | COMPANY_ADMIN | COMPANY_OWNER | Description |
|----------|---------------|---------------|-------------|
| `GET /configuration/company/workflows` | ✅ | ✅ | Рабочие процессы |
| `PUT /configuration/company/workflows` | ✅ | ✅ | Настройка процессов |
| `GET /configuration/company/templates` | ✅ | ✅ | Шаблоны |
| `POST /configuration/company/templates` | ✅ | ✅ | Создание шаблона |

---

### 🛠️ System Administration Domain (`/api/v1/system`)

#### System Health & Monitoring

| Endpoint | PUBLIC | ADMIN | SUPPORT_ADMIN | SYSTEM_ADMIN |
|----------|--------|-------|---------------|--------------|
| `GET /system/health` | ✅ | ✅ | ✅ | ✅ |
| `GET /system/health/detailed` | ❌ | ✅ | ✅ | ✅ |
| `GET /system/metrics` | ❌ | ✅ | ✅ | ✅ |
| `GET /system/info` | ❌ | ✅ | ✅ | ✅ |

#### User Management (Admin)

| Endpoint | SYSTEM_ADMIN | PLATFORM_ADMIN | Description |
|----------|--------------|----------------|-------------|
| `GET /system/admin/users` | ✅ | ✅ | Все пользователи системы |
| `GET /system/admin/users/stats` | ✅ | ✅ | Статистика пользователей |
| `POST /system/admin/users/{id}/impersonate` | ✅ | ❌ | Авторизация от имени |
| `GET /system/admin/users/{id}/audit` | ✅ | ✅ | Журнал действий |

#### Company Management (Admin)

| Endpoint | SYSTEM_ADMIN | PLATFORM_ADMIN | Description |
|----------|--------------|----------------|-------------|
| `GET /system/admin/companies` | ✅ | ✅ | Все компании |
| `GET /system/admin/companies/stats` | ✅ | ✅ | Статистика компаний |
| `POST /system/admin/companies/{id}/suspend` | ✅ | ❌ | Приостановка компании |
| `POST /system/admin/companies/{id}/activate` | ✅ | ❌ | Активация компании |

#### System Audit & Logging

| Endpoint | SECURITY_AUDITOR | SYSTEM_ADMIN | SUPPORT_ADMIN |
|----------|------------------|--------------|---------------|
| `GET /system/audit/log` | ✅ | ✅ | ✅ |
| `GET /system/audit/security-events` | ✅ | ✅ | ✅ |
| `GET /system/logs` | ❌ | ✅ | ✅ |
| `GET /system/logs/errors` | ❌ | ✅ | ✅ |

#### Backup & Maintenance

| Endpoint | SYSTEM_ADMIN | Description |
|----------|--------------|-------------|
| `POST /system/backup/create` | ✅ | Создание резервной копии |
| `GET /system/backup/list` | ✅ | Список резервных копий |
| `POST /system/backup/restore` | ✅ | Восстановление из копии |
| `GET /system/backup/{id}/download` | ✅ | Скачивание копии |

#### Performance & Optimization

| Endpoint | SYSTEM_ADMIN | Description |
|----------|--------------|-------------|
| `GET /system/performance/stats` | ✅ | Статистика производительности |
| `POST /system/cache/clear` | ✅ | Очистка кеша |
| `POST /system/maintenance/start` | ✅ | Начало обслуживания |
| `POST /system/maintenance/end` | ✅ | Окончание обслуживания |

#### Feature Flags & Configuration

| Endpoint | SYSTEM_ADMIN | ADMIN | Description |
|----------|--------------|-------|-------------|
| `GET /system/features` | ✅ | ✅ | Список feature flags |
| `PUT /system/features/{id}` | ✅ | ❌ | Управление feature flag |
| `GET /system/configuration/export` | ✅ | ❌ | Экспорт конфигурации |
| `POST /system/configuration/import` | ✅ | ❌ | Импорт конфигурации |

---

## Контекстные разрешения

### Scope-based Permissions

```typescript
// Пример контекстных разрешений
interface PermissionContext {
  user_id: string;
  company_id?: string;
  department_id?: string;
  team_id?: string;
  project_id?: string;
  resource_id?: string;
  scope: RoleScope;
}

// Правила наследования
SYSTEM > COMPANY > DEPARTMENT > TEAM > PROJECT > RESOURCE

// Примеры проверок
hasPermission("view_project", {
  user_id: "123",
  project_id: "456",
  scope: "PROJECT"
}) -> проверяет роли пользователя в проекте 456

hasPermission("manage_company", {
  user_id: "123", 
  company_id: "789",
  scope: "COMPANY"  
}) -> проверяет роли пользователя в компании 789
```

### Иерархические права

1. **Системные роли** имеют доступ ко всем ресурсам
2. **Компанийные роли** имеют доступ к ресурсам своей компании
3. **Департаментские роли** имеют доступ к ресурсам своего департамента и ниже
4. **Командные роли** имеют доступ к ресурсам своей команды
5. **Проектные роли** имеют доступ к ресурсам конкретного проекта

### Специальные правила

#### Owner правила
- Владельцы ресурсов имеют полные права на свои ресурсы
- PROJECT_OWNER может управлять всеми аспектами проекта
- COMPANY_OWNER может управлять всей компанией

#### Self правила  
- Пользователи всегда могут управлять своими данными
- `/identity/users/me`, `/identity/profiles/me` доступны всем
- Собственные настройки и предпочтения доступны для изменения

#### Cross-domain правила
- QA роли имеют доступ к requirements для создания тестов
- BUSINESS_ANALYST имеет доступ к analytics across projects
- ARCHITECT имеет доступ к relationships и dependencies

## Rate Limiting по ролям

### Системные роли
```
SYSTEM_ADMIN: 10000 requests/hour
PLATFORM_ADMIN: 5000 requests/hour
SUPPORT_ADMIN: 3000 requests/hour
```

### Компанийные роли
```
COMPANY_OWNER: 5000 requests/hour
COMPANY_ADMIN: 3000 requests/hour
BILLING_MANAGER: 1000 requests/hour
```

### Обычные пользователи
```
PROJECT_MANAGER: 2000 requests/hour
DEVELOPER: 1500 requests/hour
PROJECT_VIEWER: 1000 requests/hour
```

### Специальные ограничения
```
Bulk operations: 100 requests/hour
Report generation: 10 requests/hour
File uploads: 50 requests/hour
Authentication: 5 requests/minute
```

## Audit & Compliance

### Обязательное логирование
- Все операции с SYSTEM scope
- Назначение и отзыв ролей
- Изменения в company settings
- Доступ к sensitive data
- Failed authentication attempts

### GDPR Compliance
- Право на просмотр данных: `GET /identity/users/me/data`
- Право на удаление: `DELETE /identity/users/me/data`
- Право на портируемость: `GET /identity/users/me/export`
- Согласие на обработку данных

### Security Monitoring
- Подозрительная активность по ролям
- Превышение rate limits
- Доступ к данным других компаний
- Массовые операции пользователей

Эта матрица разрешений обеспечивает:
- ✅ Детальный контроль доступа на уровне endpoint'ов
- ✅ Иерархическую ролевую модель с наследованием
- ✅ Контекстные разрешения (scope-based)
- ✅ Принцип наименьших привилегий
- ✅ Audit trail для всех критических операций
- ✅ Соответствие GDPR и другим требованиям compliance
