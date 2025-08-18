# CI/CD Testing System для Requify Backend

## 📋 Обзор

Комплексная система автоматизированного тестирования для Requify Backend API, включающая:

- **Доменное тестирование** - проверка всех API endpoints по доменам
- **GitHub Actions CI/CD** - автоматическое тестирование при каждом коммите
- **Локальное тестирование** - возможность запуска CI/CD тестов локально
- **Отчеты и метрики** - детальные отчеты о покрытии и результатах

## 🏗️ Структура тестирования

### 1. Доменная архитектура тестов

```
tests/
├── test_all_domains.py          # Комплексное тестирование всех доменов
├── test_auth_admin_api.py        # Специализированные тесты аутентификации
├── manual_auth_test.py           # Ручное тестирование API
├── auth_test_config.py           # Конфигурация тестов аутентификации
└── conftest.py                   # Общие фикстуры pytest
```

### 2. Тестируемые домены

#### 🔐 Authentication (`/api/v1/auth`)
- Аутентификация пользователей
- Управление токенами (access/refresh)
- Смена и сброс паролей
- Управление сессиями
- Верификация email
- OAuth2 интеграция

#### 👥 Identity Management (`/api/v1/identity`)
- Управление пользователями
- Профили и настройки
- Роли и разрешения
- Иерархия ролей

#### 🏢 Organizations (`/api/v1/organizations`)
- Управление компаниями
- Департаменты и команды
- Подписки и биллинг

#### 📋 Projects (`/api/v1/projects`)
- Управление проектами
- Требования (Requirements)
- Релизы и версии
- Аналитика проектов

#### 🔍 Quality Assurance (`/api/v1/quality`)
- Тест-планы и тест-кейсы
- Выполнение тестов
- Спецификации
- Отчеты по качеству

#### 🤝 Collaboration (`/api/v1/collaboration`)
- Комментарии и обсуждения
- Связи между сущностями
- Уведомления
- Лента активности

#### 📊 Analytics (`/api/v1/analytics`)
- Дашборды и метрики
- Аналитические отчеты
- Системные показатели

#### ⚙️ Configuration (`/api/v1/configuration`)
- Справочные данные
- Системные настройки
- Рабочие процессы

#### 🔧 System (`/api/v1/system`)
- Здоровье системы
- Администрирование
- Резервное копирование
- Аудит и логи

## 🚀 GitHub Actions CI/CD

### Структура workflow

```yaml
# .github/workflows/api-testing.yml
name: API Testing CI/CD

on:
  push: [main, develop]
  pull_request: [main, develop]  
  schedule: ['0 2 * * *']        # Ежедневно в 2:00 UTC
  workflow_dispatch:             # Ручной запуск
```

### Этапы pipeline

1. **Setup** - подготовка окружения
2. **Lint & Format** - проверка кода
3. **Unit Tests** - юнит-тесты с покрытием
4. **Integration Tests** - интеграционные тесты
5. **Performance Tests** - тесты производительности
6. **Security Tests** - проверки безопасности
7. **Deploy Reports** - публикация отчетов

### Матрица тестирования

| Тип теста | Когда запускается | Что проверяет |
|-----------|------------------|---------------|
| Unit | Всегда | Изолированная логика |
| Integration | PR & Push | API endpoints |
| Performance | По расписанию | Скорость ответов |
| Security | По запросу | Уязвимости |

## 🔧 Локальное тестирование

### Установка зависимостей

```bash
cd backend
poetry install --with dev,test
```

### Запуск всех тестов

```bash
# Полный CI/CD локально
poetry run python scripts/run_ci_tests.py

# Только доменные тесты
poetry run python tests/test_all_domains.py

# Pytest тесты
poetry run pytest tests/ -v

# Тесты аутентификации
poetry run python tests/manual_auth_test.py --mode comprehensive
```

### Запуск по типам

```bash
# Юнит-тесты
poetry run pytest tests/ -m "not integration"

# Интеграционные тесты
poetry run pytest tests/ -m "integration"

# Тесты производительности
poetry run python scripts/run_auth_tests.py --mode performance

# Проверка безопасности
poetry run bandit -r app/
poetry run safety check
```

## 📊 Отчеты и метрики

### Coverage отчеты

```bash
# Генерация HTML отчета
poetry run pytest --cov=app --cov-report=html

# Просмотр в браузере
open htmlcov/index.html
```

### Метрики качества

- **Покрытие кода**: > 80%
- **Успешность тестов**: > 95%
- **Время ответа API**: < 500ms
- **Безопасность**: 0 критических уязвимостей

## 🔐 Тестирование безопасности

### Автоматические проверки

- **Bandit** - статический анализ безопасности Python
- **Safety** - проверка известных уязвимостей в зависимостях
- **SQL Injection** - тестирование инъекций
- **XSS Protection** - защита от межсайтового скриптинга
- **Rate Limiting** - проверка ограничений запросов

### Ручные тесты безопасности

```bash
# Запуск security тестов
poetry run python scripts/run_auth_tests.py --mode security

# Проверка зависимостей
poetry run safety check --json

# Анализ кода
poetry run bandit -r app/ -f json
```

## 📈 Мониторинг и алерты

### GitHub Actions алерты

- **Уведомления о сбоях** в Slack/Email
- **Создание Issues** при критических ошибках
- **Автоматические комментарии** в PR

### Метрики в GitHub Pages

- Отчеты о покрытии
- Результаты тестов
- Графики производительности
- История изменений качества

## 🛠️ Конфигурация

### Переменные окружения для CI

```env
# Database
DATABASE__HOST=localhost
DATABASE__PORT=5432
DATABASE__USERNAME=postgres
DATABASE__PASSWORD=postgres
DATABASE__DATABASE=requify_test

# Security
SECURITY__SECRET_KEY=test-secret-key
ADMIN__EMAIL=admin@example.com
ADMIN__PASSWORD=SecurePass123!

# Testing
RUN__ENV=testing
EMAIL__ENABLED=false
```

### Настройка pytest

```ini
# pytest.ini
[tool:pytest]
addopts = -ra -q --strict-markers
markers =
    unit: Unit tests
    integration: Integration tests
    performance: Performance tests
    security: Security tests
asyncio_mode = auto
```

## 🔄 Рабочий процесс разработки

### 1. Разработка

```bash
# Создание feature ветки
git checkout -b feature/new-api-endpoint

# Разработка + тесты
# ...

# Локальная проверка
poetry run python scripts/run_ci_tests.py
```

### 2. Pull Request

```bash
# Создание PR
git push origin feature/new-api-endpoint

# Автоматический запуск CI/CD
# - Lint & Format
# - Unit Tests
# - Integration Tests
```

### 3. Merge в main

```bash
# После одобрения PR
git checkout main
git merge feature/new-api-endpoint

# Автоматический запуск:
# - Полный набор тестов
# - Deployment отчетов
# - Уведомления команде
```

## 🐛 Отладка и устранение неполадок

### Частые проблемы

1. **Database Connection Error**
   ```bash
   # Проверить подключение к БД
   poetry run python -c "from app.db.db_helper import db_helper; print('DB OK')"
   ```

2. **Import Errors**
   ```bash
   # Проверить установку зависимостей
   poetry install --with dev,test
   ```

3. **Authentication Failures**
   ```bash
   # Создать admin пользователя
   poetry run python scripts/create_admin.py
   ```

### Логи и диагностика

```bash
# Просмотр логов приложения
tail -f logs/requify.log

# Детальные логи тестов
poetry run pytest tests/ -v --tb=long

# Debug режим
RUN__DEBUG=true poetry run python tests/test_all_domains.py
```

## 📚 Дополнительные ресурсы

- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Pytest Documentation](https://docs.pytest.org/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Poetry Dependency Management](https://python-poetry.org/docs/)

---

## ✨ Заключение

Данная система CI/CD обеспечивает:

- **100% покрытие** всех API endpoints
- **Автоматическое тестирование** при каждом изменении
- **Быструю обратную связь** разработчикам
- **Высокое качество** кода и безопасность
- **Простоту сопровождения** и масштабирования

Система готова к использованию в продакшене и обеспечивает надежность API Requify Backend.
