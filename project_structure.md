# Структура проекта Requify (Бэкенд)

```
requify/
├── alembic/                    # Миграции базы данных
│   ├── versions/               # Файлы миграций
│   ├── env.py                  # Окружение для миграций
│   └── alembic.ini             # Конфигурация Alembic
├── app/                        # Основной код приложения
│   ├── api/                    # API endpoints
│   │   ├── __init__.py
│   │   ├── deps.py             # Зависимости для API (DI)
│   │   ├── v1/                 # API версии 1
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/      # Обработчики запросов
│   │   │   │   ├── __init__.py
│   │   │   │   ├── requirements.py   # API для требований
│   │   │   │   ├── projects.py       # API для проектов
│   │   │   │   ├── releases.py       # API для релизов
│   │   │   │   ├── testing.py        # API для тестирования
│   │   │   │   └── users.py          # API для пользователей
│   │   │   └── router.py             # Маршрутизация API v1
│   ├── core/                   # Ядро приложения
│   │   ├── __init__.py
│   │   ├── config.py           # Конфигурация приложения
│   │   ├── security.py         # Аутентификация и авторизация
│   │   └── exceptions.py       # Обработка исключений
│   ├── db/                     # Работа с базой данных
│   │   ├── __init__.py
│   │   ├── base.py             # Базовые классы БД
│   │   ├── session.py          # Сессии SQLAlchemy
│   │   └── init_db.py          # Инициализация БД
│   ├── models/                 # Модели SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py             # Модель пользователя
│   │   ├── project.py          # Модель проекта
│   │   ├── requirement.py      # Модель требования
│   │   └── release.py          # Модель релиза
│   ├── schemas/                # Pydantic схемы
│   │   ├── __init__.py
│   │   ├── user.py             # Схемы пользователя
│   │   ├── project.py          # Схемы проекта
│   │   ├── requirement.py      # Схемы требования
│   │   └── release.py          # Схемы релиза
│   ├── services/               # Бизнес-логика
│   │   ├── __init__.py
│   │   ├── requirements.py     # Сервис требований
│   │   ├── projects.py         # Сервис проектов
│   │   ├── releases.py         # Сервис релизов
│   │   ├── testing.py          # Сервис тестирования
│   │   └── users.py            # Сервис пользователей
│   ├── integrations/           # Интеграции с внешними системами
│   │   ├── __init__.py
│   │   ├── testing_system.py   # Интеграция с АСУТс
│   │   └── project_management.py # Интеграция с системой управления проектами
│   └── main.py                 # Точка входа в приложение
├── tests/                      # Тесты
│   ├── __init__.py
│   ├── conftest.py             # Конфигурация тестов
│   ├── api/                    # Тесты API
│   │   ├── __init__.py
│   │   ├── test_requirements.py
│   │   ├── test_projects.py
│   │   └── test_users.py
│   └── services/               # Тесты сервисов
│       ├── __init__.py
│       ├── test_requirements.py
│       └── test_projects.py
├── scripts/                    # Скрипты для различных задач
│   ├── seed_db.py              # Заполнение БД тестовыми данными
│   └── deploy.sh               # Скрипт развертывания
├── .env.example                # Пример переменных окружения
├── .gitignore                  # Игнорируемые файлы Git
├── pyproject.toml              # Конфигурация проекта и зависимости (poetry)
├── requirements.txt            # Зависимости проекта
├── README.md                   # Документация
└── docker-compose.yml          # Конфигурация Docker
``` 