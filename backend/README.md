# Requify Backend

<<<<<<< HEAD
Автоматизированная система управления требованиями - Backend API

## 🚀 Быстрый старт

### Требования
- Python 3.13+
- Poetry
- PostgreSQL 15+
- Redis 7+

### Установка и запуск

1. **Клонирование и установка зависимостей:**
```bash
cd backend
poetry install
```

2. **Настройка окружения:**
```bash
cp env.example .env
# Отредактируйте .env файл
```

3. **Запуск базы данных (Docker):**
```bash
docker-compose up -d postgres redis
```

4. **Миграции базы данных:**
```bash
make migrate
```

5. **Запуск сервера разработки:**
```bash
make dev
```

API будет доступно по адресу: http://localhost:8000
Документация API: http://localhost:8000/docs

## 🛠️ Разработка

### Доступные команды

```bash
# Установка зависимостей
make install-dev          # Установить все зависимости
make update               # Обновить зависимости

# Качество кода
make format               # Автоформатирование кода
make lint                 # Проверка качества кода
make pre-commit           # Проверки перед коммитом

# Тестирование
make test                 # Запуск всех тестов
make test-unit            # Только unit тесты
make test-integration     # Только integration тесты
make test-cov             # Тесты с покрытием

# Безопасность
make security             # Проверка уязвимостей

# База данных
make migrate              # Применить миграции
make create-migration     # Создать миграцию
make db-reset             # Сброс базы данных

# CI/CD симуляция
make ci                   # Полный CI pipeline
make ci-lint              # Только линтинг (как в CI)
make ci-test              # Только тесты (как в CI)

# Помощь
make help                 # Показать все команды
```

### Workflow разработки

1. **Перед началом работы:**
```bash
git pull origin main
make clean install-dev
```

2. **Во время разработки:**
```bash
make format          # Форматирование кода
make lint           # Проверка качества
make test-unit      # Быстрые тесты
```

3. **Перед коммитом:**
```bash
make pre-commit     # Полная проверка
```

4. **Перед пушем:**
```bash
make ci             # Симуляция CI
```

## 🧪 Тестирование

### Структура тестов
- `tests/` - все тесты
- `conftest.py` - конфигурация pytest и фикстуры
- `test_*.py` - тестовые файлы

### Маркеры тестов
- `@pytest.mark.unit` - Unit тесты (быстрые, без внешних зависимостей)
- `@pytest.mark.integration` - Integration тесты (с базой данных)
- `@pytest.mark.api` - API тесты
- `@pytest.mark.slow` - Медленные тесты

### Запуск тестов

```bash
# Все тесты
make test

# По типам
make test-unit
make test-integration
make test-api

# С покрытием
make test-cov

# Только быстрые тесты
make test-fast

# Конкретный тест
poetry run pytest tests/test_users_api.py -v

# С определенным маркером
poetry run pytest -m "unit" -v
poetry run pytest -m "not slow" -v
```

## 🔍 Качество кода

### Инструменты
- **Black** - автоформатирование кода
- **isort** - сортировка импортов
- **Flake8** - проверка стиля кода
- **Pylint** - статический анализ
- **pytest** - тестирование
- **pytest-cov** - покрытие кода

### Конфигурация
- `pyproject.toml` - основная конфигурация
- `setup.cfg` - конфигурация flake8, isort, pytest
- `.pylintrc` - конфигурация pylint

### Стандарты
- Длина строки: 88 символов
- Стиль импортов: Google
- Минимальное покрытие: 80%

## 🔄 CI/CD

### GitHub Actions Workflow

Workflow автоматически запускается при:
- Push в ветки `main`, `develop`
- Pull Request в ветки `main`, `develop`
- Изменения в папке `backend/`

### Этапы CI/CD

1. **Lint** (обязательный) - проверка качества кода:
   - Black (форматирование)
   - isort (импорты)
   - Flake8 (стиль)
   - Pylint (анализ)

2. **Test** (после lint) - тестирование:
   - Unit тесты
   - Integration тесты
   - Покрытие кода (минимум 80%)

3. **Security** (параллельно) - проверка безопасности:
   - Safety (уязвимости зависимостей)

4. **Build** (после lint+test) - сборка:
   - Poetry build
   - Проверка артефактов

### Локальная симуляция CI

```bash
# Полный CI pipeline
make ci

# Отдельные этапы
make ci-lint
make ci-test
make security
make build
```

## 📁 Структура проекта

```
backend/
├── app/                    # Основное приложение
│   ├── api/               # API endpoints
│   ├── core/              # Основные настройки
│   ├── crud/              # CRUD операции
│   ├── db/                # База данных
│   ├── models/            # SQLAlchemy модели
│   ├── schemas/           # Pydantic схемы
│   ├── services/          # Бизнес-логика
│   └── main.py           # FastAPI приложение
├── tests/                 # Тесты
├── alembic/              # Миграции БД
├── scripts/              # Вспомогательные скрипты
├── static/               # Статические файлы
├── uploads/              # Загруженные файлы
├── logs/                 # Логи
└── pyproject.toml        # Конфигурация проекта
```

## 🔧 Конфигурация

### Переменные окружения

Основные переменные (см. `env.example`):

```env
# База данных
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/db
TEST_DATABASE_URL=postgresql+asyncpg://user:pass@host:port/test_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Безопасность
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Приложение
DEBUG=false
LOG_LEVEL=INFO
```

### Профили окружения

- `env.development` - разработка
- `env.production` - продакшн
- `env.example` - пример

## 🐛 Отладка

### Логи

```bash
# Очистка логов
make logs-clear

# Просмотр логов
tail -f logs/app.log
```

### База данных

```bash
# Сброс БД
make db-reset

# История миграций
make migrate-history

# Текущая миграция
make migrate-current
```

### Тесты

```bash
# Подробный вывод
make test-verbose

# Остановка на первой ошибке
poetry run pytest -x

# Запуск конкретного теста
poetry run pytest tests/test_users_api.py::test_create_user -v
```

## 📚 Дополнительные ресурсы

- [FastAPI документация](https://fastapi.tiangolo.com/)
- [SQLAlchemy документация](https://docs.sqlalchemy.org/)
- [Pytest документация](https://docs.pytest.org/)
- [Poetry документация](https://python-poetry.org/docs/)

## 🤝 Вклад в проект

1. Создайте feature branch
2. Внесите изменения
3. Запустите `make pre-commit`
4. Создайте Pull Request
5. Убедитесь, что CI проходит успешно

## 📄 Лицензия

[Добавить информацию о лицензии]
=======
FastAPI backend application for Requify project.

## Features

- FastAPI web framework
- PostgreSQL database integration  
- Redis caching
- MinIO object storage
- JWT authentication
- OpenAPI/Swagger documentation
- Docker containerization

## Development

```bash
# Install dependencies
pip install -e .

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

See `.env.example` for required environment configuration.
>>>>>>> dev-backend
