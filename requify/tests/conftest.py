"""
Конфигурация тестов для pytest.

Содержит фикстуры и настройки для тестирования.
"""

import pytest
import pytest_asyncio

# Configure pytest-asyncio mode
pytestmark = pytest.mark.asyncio(mode="auto")
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from requify.app.main import app
from requify.app.core.config import settings
from requify.app.models.base import Base
from requify.app.api.deps import get_db


# Тестовая база данных
TEST_DATABASE_URL = settings.test_db.async_url


@pytest_asyncio.fixture
async def test_engine():
    """Создать тестовый движок БД."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    # Создаем таблицы
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Очищаем после тестов
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture
async def test_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Создать тестовую сессию БД."""
    TestingSessionLocal = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client(test_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Создать тестовый HTTP клиент."""

    def override_get_db():
        return test_session

    app.dependency_overrides[get_db] = override_get_db

    # For newer httpx versions, use transport instead of app parameter
    from httpx import ASGITransport

    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def sample_user_data():
    """Пример данных пользователя для тестов."""
    return {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpass123",
        "is_active": True,
        "is_superuser": False,
    }


@pytest.fixture
def sample_project_data():
    """Пример данных проекта для тестов."""
    return {
        "name": "Test Project",
        "description": "Test project description",
        "status": "active",
    }


@pytest.fixture
def sample_requirement_data():
    """Пример данных требования для тестов."""
    return {
        "title": "Test Requirement",
        "description": "Test requirement description",
        "priority": "high",
        "type": "functional",
        "status": "draft",
    }


@pytest.fixture
def auth_headers():
    """Заголовки авторизации для тестов."""
    return {"Authorization": "Bearer mock-jwt-token-123"}
