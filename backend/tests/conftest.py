"""
Конфигурация pytest для тестов совместимости моделей и схем.

Содержит общие фикстуры и настройки для всех тестов.
"""

import pytest
import asyncio
from typing import Generator, Any

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.engine import Engine
from sqlmodel import SQLModel

from app.models.base import Base
from app.core.config import settings as app_settings


# Автоматическое включение asyncio для асинхронных тестов
@pytest.fixture(scope="session")
def event_loop():
    """Создает event loop для всей сессии тестов."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def test_settings():
    """Настройки для тестов."""
    # Используем копию настроек для тестов
    test_config = app_settings.model_copy()
    test_config.run.env = "testing"
    return test_config


@pytest.fixture(scope="session")
def test_engine_session():
    """
    Создает тестовый движок базы данных для всей сессии.

    Использует SQLite in-memory для быстрых тестов.
    """
    engine = create_engine(
        "sqlite:///:memory:",
        echo=False,  # Отключаем SQL логи в тестах
        connect_args={"check_same_thread": False},
    )

    # Включаем поддержку внешних ключей в SQLite
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    event.listens_for(engine, "connect")(set_sqlite_pragma)

    return engine


@pytest.fixture(scope="function")
def test_db_session(test_engine_session: Engine) -> Generator[Session, None, None]:
    """
    Создает изолированную сессию для каждого теста.

    Каждый тест получает чистую базу данных.
    """
    # Создаем все таблицы
    Base.metadata.create_all(test_engine_session)

    # Создаем сессию
    with Session(test_engine_session) as session:
        yield session

    # Очищаем все таблицы после теста
    Base.metadata.drop_all(test_engine_session)


@pytest.fixture
def sample_user_data():
    """Базовые данные пользователя для тестов."""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "name": "Test User",
        "status": "active",
        "auth_provider": "local",
        "is_email_verified": True,
        "is_active": True,
    }


@pytest.fixture
def sample_company_data():
    """Базовые данные компании для тестов."""
    return {
        "name": "Test Company",
        "description": "Test company description",
        "website": "https://test.com",
        "industry": "Technology",
        "size": "startup",
    }


@pytest.fixture
def sample_project_data():
    """Базовые данные проекта для тестов."""
    return {
        "name": "Test Project",
        "description": "Test project description",
        "status": "active",
        "priority": "high",
    }


@pytest.fixture
def sample_requirement_data():
    """Базовые данные требования для тестов."""
    return {
        "title": "Test Requirement",
        "description": "Test requirement description",
        "type": "functional",
        "priority": "high",
        "status": "draft",
    }


# Маркеры для категоризации тестов
def pytest_configure(config):
    """Конфигурация pytest маркеров."""
    config.addinivalue_line("markers", "unit: marks tests as unit tests (fast)")
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests (slower)"
    )
    config.addinivalue_line(
        "markers", "performance: marks tests as performance tests (slow)"
    )
    config.addinivalue_line(
        "markers", "compatibility: marks tests as model-schema compatibility tests"
    )


# Хуки для логирования и отчетности
def pytest_runtest_setup(item):
    """Выполняется перед каждым тестом."""
    # Можно добавить логирование начала теста
    pass


def pytest_runtest_teardown(item, nextitem):
    """Выполняется после каждого теста."""
    # Можно добавить логирование завершения теста
    pass


# Фикстуры для конкретных сценариев тестирования
@pytest.fixture
def user_with_profile_data(sample_user_data):
    """Данные пользователя с профилем."""
    return {
        "user": sample_user_data,
        "profile": {
            "first_name": "Test",
            "last_name": "User",
            "display_name": "Test User",
            "bio": "Test bio",
            "avatar_url": "https://example.com/avatar.jpg",
            "phone": "+1234567890",
            "position": "Developer",
            "department": "Engineering",
            "timezone": "UTC",
        },
    }


@pytest.fixture
def user_with_settings_data(sample_user_data):
    """Данные пользователя с настройками."""
    return {
        "user": sample_user_data,
        "settings": {
            "notification_settings": {
                "email": True,
                "sms": False,
                "push": True,
                "frequency": "daily",
            },
            "interface_settings": {
                "theme": "dark",
                "language": "ru",
                "timezone": "Europe/Moscow",
                "items_per_page": 25,
            },
            "privacy_settings": {
                "profile_visibility": "public",
                "activity_visibility": "private",
            },
            "security_settings": {
                "two_factor_enabled": True,
                "login_notifications": True,
            },
        },
    }


@pytest.fixture
def complex_user_data(sample_user_data, sample_company_data):
    """Данные для комплексного пользователя со всеми связями."""
    return {
        "user": sample_user_data,
        "company": sample_company_data,
        "profile": {
            "first_name": "Complex",
            "last_name": "User",
            "display_name": "Complex User",
            "bio": "Complex user bio",
            "position": "Senior Developer",
            "department": "Engineering",
        },
        "settings": {
            "notification_settings": {"email": True},
            "interface_settings": {"theme": "dark"},
        },
    }


# Утилиты для тестов
class TestDataFactory:
    """Фабрика для создания тестовых данных."""

    @staticmethod
    def create_user_data(index: int = 0, **overrides) -> dict:
        """Создает данные пользователя с уникальными значениями."""
        base_data = {
            "username": f"user_{index}",
            "email": f"user_{index}@example.com",
            "name": f"User {index}",
            "status": "active",
            "is_active": True,
        }
        base_data.update(overrides)
        return base_data

    @staticmethod
    def create_company_data(index: int = 0, **overrides) -> dict:
        """Создает данные компании с уникальными значениями."""
        base_data = {
            "name": f"Company {index}",
            "description": f"Company {index} description",
            "industry": "Technology",
        }
        base_data.update(overrides)
        return base_data


@pytest.fixture
def test_data_factory():
    """Предоставляет фабрику тестовых данных."""
    return TestDataFactory


# Параметризованные фикстуры для массового тестирования
@pytest.fixture(params=[10, 50, 100])
def user_count(request):
    """Параметризованное количество пользователей для массовых тестов."""
    return request.param


@pytest.fixture(params=["sqlite", "memory"])
def db_type(request):
    """Параметризованный тип базы данных для тестов."""
    return request.param


# Настройки для различных типов тестов
pytest_plugins = [
    # Можно добавить дополнительные плагины
]
