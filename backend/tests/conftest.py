"""
Конфигурация pytest для тестов Requify Backend API.

Содержит общие фикстуры и настройки для всех тестов.
Следует лучшим практикам pytest для тестирования FastAPI приложений.
"""

import pytest
import asyncio
import os
import sys
from pathlib import Path
from typing import Generator, Any, AsyncGenerator
from unittest.mock import MagicMock

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlmodel import SQLModel
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from app.main import app
from app.models.base import Base
from app.core.config import settings as app_settings
from app.db.db_helper import db_helper
from app.core.security import get_password_hash
from app.models.user import User
from app.models.enhanced_role_system import (
    EnhancedRole,
    UserRoleAssignment,
    SystemRole,
    RoleScope,
)


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


# Дополнительные фикстуры для CI/CD и интеграционного тестирования
@pytest.fixture(scope="function")
def client() -> Generator[TestClient, None, None]:
    """
    Фикстура для синхронного HTTP клиента.
    Создает TestClient для тестирования FastAPI endpoints.
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="function")
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """
    Фикстура для асинхронного HTTP клиента.
    Создает AsyncClient для асинхронного тестирования endpoints.
    """
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture(scope="function")
def admin_credentials() -> dict[str, str]:
    """
    Фикстура с учетными данными администратора для тестирования.
    """
    return {
        "username": app_settings.admin.email,
        "password": app_settings.admin.password,
        "email": app_settings.admin.email,
        "name": app_settings.admin.name,
    }


@pytest.fixture(scope="function")
def temp_directory(tmp_path: Path) -> Path:
    """
    Фикстура для создания временной директории для тестов.
    """
    test_dir = tmp_path / "test_files"
    test_dir.mkdir(exist_ok=True)
    return test_dir


@pytest.fixture(scope="function")
def sample_files(temp_directory: Path) -> dict[str, Path]:
    """
    Фикстура для создания образцов файлов для тестирования загрузки.
    """
    files = {}

    # Текстовый файл
    text_file = temp_directory / "sample.txt"
    text_file.write_text("Sample text content", encoding="utf-8")
    files["text"] = text_file

    # JSON файл
    json_file = temp_directory / "sample.json"
    json_file.write_text('{"test": "data"}', encoding="utf-8")
    files["json"] = json_file

    # Пустой файл
    empty_file = temp_directory / "empty.txt"
    empty_file.touch()
    files["empty"] = empty_file

    return files


@pytest.fixture(autouse=True)
def clean_environment():
    """
    Автоматическая очистка окружения для каждого теста.
    """
    # Сохраняем исходное состояние переменных окружения
    original_env = os.environ.copy()

    yield

    # Восстанавливаем переменные окружения
    os.environ.clear()
    os.environ.update(original_env)


# Хуки для расширенной функциональности
def pytest_configure(config):
    """
    Конфигурация pytest при запуске.
    """
    # Добавляем custom markers
    config.addinivalue_line("markers", "ci: mark test to run in CI environment")
    config.addinivalue_line("markers", "domain: mark test as domain-specific")


def pytest_collection_modifyitems(config, items):
    """
    Модификация собранных тестов.
    """
    for item in items:
        # Автоматически добавляем маркер unit для быстрых тестов
        if item.fspath.pname.startswith("test_") and not any(
            marker.name in ["integration", "performance", "security"]
            for marker in item.iter_markers()
        ):
            item.add_marker(pytest.mark.unit)


def pytest_runtest_setup(item):
    """
    Настройка перед запуском каждого теста.
    """
    # Пропускаем интеграционные тесты если нет соответствующего флага
    if "integration" in item.keywords:
        if not item.config.getoption("--run-integration", default=False):
            pytest.skip("integration tests not requested")


# Дополнительные опции командной строки
def pytest_addoption(parser):
    """
    Добавляет дополнительные опции командной строки для pytest.
    """
    parser.addoption(
        "--run-integration",
        action="store_true",
        default=False,
        help="run integration tests",
    )
    parser.addoption(
        "--run-performance",
        action="store_true",
        default=False,
        help="run performance tests",
    )
    parser.addoption(
        "--run-security", action="store_true", default=False, help="run security tests"
    )
