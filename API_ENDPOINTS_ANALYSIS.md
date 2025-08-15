# Анализ и Оптимизация API Endpoints 

## Обзор системы

**Requify** - система управления требованиями с многопользовательской архитектурой, поддерживающей:
- Компании (Companies) с подписками и настройками
- Департаменты (Departments) и команды (Teams)
- Проекты (Projects) и требования (Requirements)
- Релизы (Releases) и тестирование (Testing)
- Развитую ролевую систему RBAC

## Текущие API Endpoints (по доменам)

### 🔐 Аутентификация и Авторизация (`/api/v1/auth`)
```
POST   /auth/register               # Регистрация пользователя
POST   /auth/login                  # Вход в систему
POST   /auth/refresh                # Обновление токенов
POST   /auth/logout                 # Выход из системы
POST   /auth/validate-token         # Валидация токена
POST   /auth/change-password        # Смена пароля
POST   /auth/reset-password         # Сброс пароля
POST   /auth/reset-password/confirm # Подтверждение сброса
POST   /auth/verify-email/request   # Запрос верификации email
POST   /auth/verify-email/confirm   # Подтверждение email
GET    /auth/sessions               # Список сессий
POST   /auth/sessions/revoke        # Отзыв сессий
GET    /auth/roles/my-roles         # Мои роли
GET    /auth/permissions/my-permissions # Мои разрешения
POST   /auth/oauth2/auth0           # OAuth2 Auth0
GET    /auth/oauth2/auth0/userinfo  # Информация Auth0
GET    /auth/oauth2/auth0/status    # Статус Auth0
```

### 👥 Управление пользователями (`/api/v1/users`)
```
GET    /users/                      # Список пользователей
POST   /users/                      # Создание пользователя  
GET    /users/me                    # Текущий пользователь
PUT    /users/me                    # Обновление профиля
GET    /users/{user_id}             # Пользователь по ID
PUT    /users/{user_id}             # Обновление пользователя
DELETE /users/{user_id}             # Удаление пользователя
POST   /users/{user_id}/activate    # Активация
POST   /users/{user_id}/deactivate  # Деактивация

# Профили пользователей
GET    /users/profiles/me           # Мой профиль
PUT    /users/profiles/me           # Обновление профиля
GET    /users/profiles/{user_id}    # Профиль пользователя
PUT    /users/profiles/me/avatar    # Обновление аватара
PUT    /users/profiles/me/contact   # Контактная информация
```

### 🏢 Управление компаниями (`/api/v1/companies`)
```
GET    /companies/                  # Список компаний
POST   /companies/                  # Создание компании
GET    /companies/{company_id}      # Компания по ID
PUT    /companies/{company_id}      # Обновление компании
DELETE /companies/{company_id}      # Удаление компании

# Контактная информация компании
GET    /companies/{company_id}/contact     # Контакты
POST   /companies/{company_id}/contact     # Создание контактов
PUT    /companies/{company_id}/contact     # Обновление контактов

# Подписки компании
GET    /companies/{company_id}/subscription # Подписка
POST   /companies/{company_id}/subscription # Создание подписки
PUT    /companies/{company_id}/subscription # Обновление подписки

# Настройки компании
GET    /companies/{company_id}/settings    # Настройки
POST   /companies/{company_id}/settings    # Создание настроек
PUT    /companies/{company_id}/settings    # Обновление настроек

# Брендинг компании  
GET    /companies/{company_id}/branding    # Брендинг
POST   /companies/{company_id}/branding    # Создание брендинга
PUT    /companies/{company_id}/branding    # Обновление брендинга
```

### 🏬 Департаменты (`/api/v1/departments`)
```
GET    /departments/                       # Список департаментов
POST   /departments/                       # Создание департамента
GET    /departments/{department_id}        # Департамент по ID
PUT    /departments/{department_id}        # Обновление департамента
DELETE /departments/{department_id}        # Удаление департамента
GET    /departments/company/{company_id}   # Департаменты компании
GET    /departments/company/{company_id}/hierarchy # Иерархия
```

### 👥 Команды (`/api/v1/teams`)
```
GET    /teams/                             # Список команд
POST   /teams/                             # Создание команды
GET    /teams/{team_id}                    # Команда по ID
PUT    /teams/{team_id}                    # Обновление команды
DELETE /teams/{team_id}                    # Удаление команды
POST   /teams/{team_id}/members           # Добавление участника
DELETE /teams/{team_id}/members/{user_id} # Удаление участника
GET    /teams/stats/overview              # Статистика команд
```

### 📊 Проекты (`/api/v1/projects`)
```
GET    /projects/                          # Список проектов
POST   /projects/                          # Создание проекта
GET    /projects/{project_id}              # Проект по ID
PUT    /projects/{project_id}              # Обновление проекта
DELETE /projects/{project_id}              # Удаление проекта
GET    /projects/{project_id}/requirements # Требования проекта
POST   /projects/{project_id}/sync-to-release # Синхронизация с релизом
GET    /projects/{project_id}/releases     # Релизы проекта
GET    /projects/{project_id}/stats        # Статистика проекта
```

### 📋 Требования (`/api/v1/requirements`)
```
GET    /requirements/search                # Поиск требований
GET    /requirements/                      # Список требований
POST   /requirements/                      # Создание требования
GET    /requirements/{requirement_id}      # Требование по ID
PUT    /requirements/{requirement_id}      # Обновление требования
DELETE /requirements/{requirement_id}      # Удаление требования
POST   /requirements/{requirement_id}/change-status # Смена статуса
GET    /requirements/{requirement_id}/tests # Тесты требования
GET    /requirements/{requirement_id}/relationships # Связи требования
POST   /requirements/{requirement_id}/relationships # Создание связи
```

### 🚀 Релизы (`/api/v1/releases`)
```
GET    /releases/                          # Список релизов
POST   /releases/                          # Создание релиза
GET    /releases/{release_id}              # Релиз по ID
PUT    /releases/{release_id}              # Обновление релиза
DELETE /releases/{release_id}              # Удаление релиза
POST   /releases/create-from-requirements  # Создание из требований
POST   /releases/{release_id}/generate-specification # Генерация спецификации
POST   /releases/{release_id}/publish      # Публикация релиза
GET    /releases/{release_id}/requirements # Требования релиза
GET    /releases/{release_id}/changelog    # Журнал изменений
```

### 🧪 Тестирование (`/api/v1/testing`)
```
GET    /testing/results                    # Результаты тестирования
GET    /testing/plans                      # Планы тестирования
POST   /testing/plans                      # Создание плана
GET    /testing/plans/{plan_id}            # План по ID
GET    /testing/cases                      # Тест-кейсы
POST   /testing/cases                      # Создание тест-кейса
GET    /testing/executions                 # Выполнение тестов
POST   /testing/executions                 # Запуск теста
GET    /testing/reports/summary            # Сводка тестирования
POST   /testing/integration/run            # Интеграционные тесты
GET    /testing/integration/status/{job_id} # Статус интеграционного теста
```

### 🔗 Связи (`/api/v1/relationships`)
```
GET    /relationships/                     # Список связей
POST   /relationships/                     # Создание связи
GET    /relationships/{relationship_id}    # Связь по ID
PUT    /relationships/{relationship_id}    # Обновление связи
DELETE /relationships/{relationship_id}    # Удаление связи
GET    /relationships/requirements/{requirement_id}/relationships # Связи требования
POST   /relationships/requirements/{requirement_id}/relationships # Создание связи
GET    /relationships/requirements/{requirement_id}/dependencies  # Зависимости
GET    /relationships/requirements/{requirement_id}/dependents    # Зависимые
GET    /relationships/requirements/{requirement_id}/trace-matrix  # Матрица трассировки
```

### 💬 Комментарии (`/api/v1/comments`)
```
GET    /comments/                          # Список комментариев
POST   /comments/                          # Создание комментария
GET    /comments/{comment_id}              # Комментарий по ID
PUT    /comments/{comment_id}              # Обновление комментария
DELETE /comments/{comment_id}              # Удаление комментария
GET    /comments/requirements/{requirement_id}/comments # Комментарии требования
POST   /comments/requirements/{requirement_id}/comments # Создание комментария
GET    /comments/recent                    # Недавние комментарии
GET    /comments/statistics                # Статистика комментариев
```

### 📊 Дашборд (`/api/v1/dashboard`)
```
GET    /dashboard/stats                    # Статистика дашборда
GET    /dashboard/                         # Обзор дашборда
GET    /dashboard/overview                 # Обзор статистики
GET    /dashboard/my-projects              # Мои проекты
GET    /dashboard/my-requirements          # Мои требования
GET    /dashboard/my-activity              # Моя активность
GET    /dashboard/my-notifications         # Мои уведомления
GET    /dashboard/activity/recent          # Недавняя активность
GET    /dashboard/projects/stats           # Статистика проектов
GET    /dashboard/requirements/stats       # Статистика требований
POST   /dashboard/activity                 # Создание записи активности
POST   /dashboard/preferences              # Обновление предпочтений
```

### 📖 Справочники (`/api/v1/reference`)
```
GET    /reference/requirement-types        # Типы требований
POST   /reference/requirement-types        # Создание типа
GET    /reference/requirement-priorities   # Приоритеты требований
POST   /reference/requirement-priorities   # Создание приоритета
GET    /reference/requirement-statuses     # Статусы требований
POST   /reference/requirement-statuses     # Создание статуса
GET    /reference/relationship-types       # Типы связей
POST   /reference/relationship-types       # Создание типа связи
```

### 📄 Спецификации (`/api/v1/specifications`)
```
GET    /specifications/                    # Список спецификаций
POST   /specifications/                    # Создание спецификации
GET    /specifications/{spec_id}           # Спецификация по ID
PUT    /specifications/{spec_id}           # Обновление спецификации
DELETE /specifications/{spec_id}           # Удаление спецификации
GET    /specifications/{spec_id}/requirements # Требования спецификации
POST   /specifications/{spec_id}/generate-document # Генерация документа
```

### 🔧 Роли (`/api/v1/roles`)
```
GET    /roles/                             # Список ролей
POST   /roles/                             # Создание роли
GET    /roles/{role_id}                    # Роль по ID
PUT    /roles/{role_id}                    # Обновление роли
DELETE /roles/{role_id}                    # Удаление роли
GET    /roles/assignable                   # Назначаемые роли
GET    /roles/search                       # Поиск ролей
POST   /roles/assignments                  # Назначение роли
DELETE /roles/assignments/{assignment_id}  # Отзыв назначения
GET    /roles/permissions/check            # Проверка разрешений
```

### ⚙️ Настройки (`/api/v1/settings`)
```
GET    /settings/                          # Список настроек
POST   /settings/                          # Создание настройки
GET    /settings/{setting_id}              # Настройка по ID
PUT    /settings/{setting_id}              # Обновление настройки
DELETE /settings/{setting_id}              # Удаление настройки
```

### 🛠️ Администрирование (`/api/v1/admin`)
```
GET    /admin/users                        # Пользователи (админ)
GET    /admin/system-info                  # Информация о системе
GET    /admin/health                       # Проверка состояния
GET    /admin/metrics                      # Метрики системы
GET    /admin/logs                         # Логи системы
GET    /admin/users-stats                  # Статистика пользователей
GET    /admin/projects-stats               # Статистика проектов
POST   /admin/backup                       # Создание резервной копии
GET    /admin/backups                      # Список резервных копий
POST   /admin/system-settings              # Обновление системных настроек
GET    /admin/audit-log                    # Журнал аудита
```

## Ролевая система RBAC

### Уровни ролей (RoleScope):
1. **SYSTEM** - Системный уровень (все компании)
2. **COMPANY** - Уровень компании
3. **DEPARTMENT** - Уровень департамента  
4. **TEAM** - Уровень команды
5. **PROJECT** - Уровень проекта
6. **RESOURCE** - Уровень ресурса (требование, релиз, тест)

### Основные типы ролей:

#### Системные роли (SystemRole):
- `SYSTEM_ADMIN` - Полный доступ ко всей системе
- `PLATFORM_ADMIN` - Управление платформой
- `SUPPORT_ADMIN` - Продвинутая поддержка
- `BILLING_ADMIN` - Управление биллингом
- `SECURITY_AUDITOR` - Аудит безопасности

#### Компанийные роли (CompanyRole):
- `COMPANY_ADMIN` - Админ компании
- `COMPANY_OWNER` - Владелец компании
- `BILLING_MANAGER` - Менеджер по биллингу
- `HR_MANAGER` - HR менеджер
- `SECURITY_MANAGER` - Менеджер безопасности

#### Командные роли (TeamRole):
- `OWNER` - Владелец команды
- `ADMIN` - Админ команды
- `TEAM_LEAD` - Лидер команды
- `TECH_LEAD` - Технический лидер
- `DEVELOPER` - Разработчик
- `TESTER` - Тестировщик

#### Проектные роли (ProjectRole):
- `PROJECT_MANAGER` - Менеджер проекта
- `PROJECT_OWNER` - Владелец проекта
- `ARCHITECT` - Архитектор
- `BUSINESS_ANALYST` - Бизнес-аналитик
- `QA_ENGINEER` - QA инженер

## Анализ проблем и рекомендации

### ❌ Выявленные проблемы:

1. **Неконсистентность naming convention**:
   - Смешение snake_case и kebab-case в URL
   - Неединообразные названия действий

2. **Нарушение REST принципов**:
   - Некоторые действия используют POST вместо PUT/PATCH
   - Неправильная организация вложенных ресурсов

3. **Избыточность endpoints**:
   - Дублирование функциональности в разных контроллерах
   - Слишком детализированные endpoints для простых операций

4. **Проблемы с безопасностью**:
   - Не все endpoints имеют четкую привязку к ролям
   - Отсутствует rate limiting для критических операций

5. **Организационные проблемы**:
   - Endpoints организованы по техническим, а не бизнес-доменам
   - Отсутствует четкая иерархия ресурсов

### ✅ Оптимизированная структура API

#### Принципы организации:
1. **Доменно-ориентированная архитектура** (согласно FSD)
2. **RESTful design patterns**
3. **Четкая ролевая модель RBAC**
4. **Консистентный naming convention**
5. **Правильная обработка HTTP методов**

#### Рекомендуемая структура по доменам:

```
/api/v1/
├── auth/              # Аутентификация и авторизация
├── organizations/     # Корпоративная структура
│   ├── companies/
│   ├── departments/
│   └── teams/
├── identity/          # Управление пользователями
│   ├── users/
│   ├── profiles/
│   └── roles/
├── projects/          # Управление проектами
│   ├── projects/
│   ├── requirements/
│   └── releases/
├── quality/           # Качество и тестирование
│   ├── testing/
│   └── specifications/
├── collaboration/     # Совместная работа
│   ├── comments/
│   └── relationships/
├── analytics/         # Аналитика и отчетность
│   └── dashboard/
├── configuration/     # Конфигурация системы
│   ├── settings/
│   └── reference/
└── system/           # Системное администрирование
    └── admin/
```

## Матрица разрешений по ролям

### Системные операции
| Endpoint | SYSTEM_ADMIN | PLATFORM_ADMIN | SUPPORT_ADMIN | Описание |
|----------|--------------|----------------|---------------|----------|
| `GET /admin/*` | ✅ | ✅ | ✅ | Просмотр системной информации |
| `POST /admin/backup` | ✅ | ✅ | ❌ | Создание резервных копий |
| `GET /admin/audit-log` | ✅ | ✅ | ✅ | Журнал аудита |

### Компанийные операции
| Endpoint | COMPANY_ADMIN | COMPANY_OWNER | HR_MANAGER | Описание |
|----------|---------------|---------------|------------|----------|
| `GET /companies/{id}` | ✅ | ✅ | ✅ | Просмотр информации о компании |
| `PUT /companies/{id}` | ✅ | ✅ | ❌ | Изменение компании |
| `POST /companies/{id}/users` | ✅ | ✅ | ✅ | Добавление пользователей |

### Проектные операции
| Endpoint | PROJECT_MANAGER | PROJECT_OWNER | DEVELOPER | Описание |
|----------|-----------------|---------------|-----------|----------|
| `GET /projects/{id}` | ✅ | ✅ | ✅ | Просмотр проекта |
| `PUT /projects/{id}` | ✅ | ✅ | ❌ | Изменение проекта |
| `POST /requirements/` | ✅ | ✅ | ✅ | Создание требований |

## Следующие шаги

1. **Реорганизация endpoints** согласно доменной архитектуре
2. **Внедрение консистентного RBAC** для всех операций
3. **Добавление rate limiting** для критических endpoints
4. **Улучшение документации API** с примерами для каждой роли
5. **Внедрение версионирования API** для обратной совместимости

