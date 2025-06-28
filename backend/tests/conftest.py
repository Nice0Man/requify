"""
Конфигурация тестов для pytest.

Содержит фикстуры и настройки для тестирования.
"""

import os
import pytest
import pytest_asyncio

# Configure pytest-asyncio mode
pytestmark = pytest.mark.asyncio(mode="auto")

# Set testing environment variable
os.environ["TESTING"] = "true"

import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.core.config import settings
from app.models.base import Base
from app.api.deps import get_db
from app.crud import user as crud_user
from app.schemas.user import UserCreate
from app.core.security import get_password_hash


# Тестовая база данных
TEST_DATABASE_URL = settings.test_db.async_url


# Test database engine and session
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_test_db() -> AsyncGenerator[AsyncSession, None]:
    """Database session override for testing."""
    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for the test session."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def setup_test_db():
    """Setup test database for the session."""
    # Create all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    # Drop all tables after tests
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Database session for individual tests."""
    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """HTTP client fixture with database override."""

    # Override only database dependency
    app.dependency_overrides[get_db] = get_test_db

    # Create transport
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    # Clear overrides after test
    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(db_session: AsyncSession) -> dict:
    """Create a test user for authentication."""
    user_data = UserCreate(
        email="testuser@example.com",
        username="testuser",
        password="testpassword123",
        name="Test User",
        role="user",
        is_active=True,
        is_superuser=False,
    )

    user = await crud_user.create(db_session, obj_in=user_data)
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "name": user.name,
        "password": "testpassword123",  # Keep plain password for login
    }


@pytest.fixture
async def test_superuser(db_session: AsyncSession) -> dict:
    """Create a test superuser for authentication."""
    user_data = UserCreate(
        email="admin@example.com",
        username="admin",
        password="adminpassword123",
        name="Admin User",
        role="admin",
        is_active=True,
        is_superuser=True,
    )

    user = await crud_user.create(db_session, obj_in=user_data)
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "name": user.name,
        "password": "adminpassword123",  # Keep plain password for login
    }


@pytest.fixture
async def auth_headers(client: AsyncClient, test_user: dict) -> dict:
    """Get authentication headers for test user."""
    # Login to get token
    login_data = {"username": test_user["email"], "password": test_user["password"]}

    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200

    token_data = response.json()
    return {"Authorization": f"Bearer {token_data['access_token']}"}


@pytest.fixture
async def superuser_headers(client: AsyncClient, test_superuser: dict) -> dict:
    """Get authentication headers for test superuser."""
    # Login to get token
    login_data = {
        "username": test_superuser["email"],
        "password": test_superuser["password"],
    }

    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200

    token_data = response.json()
    return {"Authorization": f"Bearer {token_data['access_token']}"}


# User-related fixtures
@pytest.fixture
def sample_user_create_data():
    """Sample user creation data."""
    return {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "securepassword123",
        "name": "New User",
        "role": "user",
        "is_active": True,
        "is_superuser": False,
    }


@pytest.fixture
def sample_project_create_data():
    """Sample project creation data."""
    return {
        "name": "Test Project",
        "description": "Test project description",
        "status": "active",
    }


@pytest.fixture
def sample_requirement_create_data():
    """Sample requirement creation data."""
    return {
        "title": "Test Requirement",
        "description": "Test requirement description",
        "priority": "medium",
        "status": "draft",
    }
