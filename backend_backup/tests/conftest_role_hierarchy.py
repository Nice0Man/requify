"""
Конфигурация тестов для системы иерархии ролей.
Фикстуры и утилиты для тестирования DAG ролей.
"""

import pytest
import asyncio
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.models.base import Base
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
from app.models.role_hierarchy import RoleHierarchy, RoleHierarchyCache, InheritanceType
from app.models.user import User
from app.services.role_hierarchy_service import RoleHierarchyService, RoleDAG
from app.crud.enhanced_role import enhanced_role
from app.crud.role_hierarchy import role_hierarchy


# Test database setup
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def test_engine():
    """Create test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
        echo=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    await engine.dispose()


@pytest.fixture
async def db_session(test_engine):
    """Create test database session."""
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def sample_roles(db_session: AsyncSession) -> List[EnhancedRole]:
    """Создать набор тестовых ролей."""
    roles_data = [
        {
            "id": 1,
            "name": "viewer",
            "display_name": "Viewer",
            "scope": "system",
            "permissions_config": {"permissions": ["read"]},
            "role_level": 1,
            "is_active": True,
        },
        {
            "id": 2,
            "name": "editor",
            "display_name": "Editor",
            "scope": "system",
            "permissions_config": {"permissions": ["read", "write"]},
            "role_level": 2,
            "is_active": True,
        },
        {
            "id": 3,
            "name": "manager",
            "display_name": "Manager",
            "scope": "system",
            "permissions_config": {"permissions": ["read", "write", "manage"]},
            "role_level": 3,
            "is_active": True,
        },
        {
            "id": 4,
            "name": "admin",
            "display_name": "Administrator",
            "scope": "system",
            "permissions_config": {"permissions": ["read", "write", "manage", "admin"]},
            "role_level": 4,
            "is_active": True,
        },
        {
            "id": 5,
            "name": "super_admin",
            "display_name": "Super Administrator",
            "scope": "system",
            "permissions_config": {
                "permissions": ["read", "write", "manage", "admin", "super_admin"]
            },
            "role_level": 5,
            "is_active": True,
        },
    ]

    roles = []
    for role_data in roles_data:
        role = EnhancedRole(**role_data)
        db_session.add(role)
        roles.append(role)

    await db_session.commit()

    # Refresh to get IDs
    for role in roles:
        await db_session.refresh(role)

    return roles


@pytest.fixture
async def simple_hierarchy(
    db_session: AsyncSession, sample_roles: List[EnhancedRole]
) -> List[RoleHierarchy]:
    """Создать простую иерархию ролей: viewer -> editor -> manager -> admin."""
    hierarchies = []

    # Создаем цепочку наследования
    hierarchy_data = [
        (1, 2),  # viewer -> editor
        (2, 3),  # editor -> manager
        (3, 4),  # manager -> admin
    ]

    for parent_id, child_id in hierarchy_data:
        hierarchy = RoleHierarchy(
            parent_role_id=parent_id,
            child_role_id=child_id,
            inheritance_type=InheritanceType.FULL,
            is_active=True,
            priority=0,
        )
        db_session.add(hierarchy)
        hierarchies.append(hierarchy)

    await db_session.commit()

    for hierarchy in hierarchies:
        await db_session.refresh(hierarchy)

    return hierarchies


@pytest.fixture
async def complex_hierarchy(
    db_session: AsyncSession, sample_roles: List[EnhancedRole]
) -> List[RoleHierarchy]:
    """Создать сложную иерархию с множественным наследованием."""
    hierarchies = []

    # Более сложная структура наследования
    hierarchy_data = [
        (1, 2, InheritanceType.FULL, 1),  # viewer -> editor (полное)
        (1, 3, InheritanceType.PARTIAL, 2),  # viewer -> manager (частичное)
        (2, 4, InheritanceType.FULL, 1),  # editor -> admin (полное)
        (3, 4, InheritanceType.RESTRICT, 2),  # manager -> admin (ограниченное)
        (4, 5, InheritanceType.FULL, 1),  # admin -> super_admin (полное)
    ]

    for parent_id, child_id, inheritance_type, priority in hierarchy_data:
        hierarchy = RoleHierarchy(
            parent_role_id=parent_id,
            child_role_id=child_id,
            inheritance_type=inheritance_type,
            is_active=True,
            priority=priority,
        )

        # Добавляем специфичные условия для разных типов наследования
        if inheritance_type == InheritanceType.PARTIAL:
            hierarchy.inherited_permissions = ["read"]
        elif inheritance_type == InheritanceType.RESTRICT:
            hierarchy.excluded_permissions = ["super_admin"]

        db_session.add(hierarchy)
        hierarchies.append(hierarchy)

    await db_session.commit()

    for hierarchy in hierarchies:
        await db_session.refresh(hierarchy)

    return hierarchies


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Создать тестового пользователя."""
    user = User(
        id=1,
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_password",
        is_active=True,
        is_verified=True,
    )

    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return user


@pytest.fixture
def role_hierarchy_service():
    """Создать экземпляр сервиса иерархии ролей."""
    return RoleHierarchyService()


@pytest.fixture
def sample_dag() -> RoleDAG:
    """Создать образец DAG для тестирования."""
    dag = RoleDAG()

    # Добавляем роли
    roles_data = [
        (1, "viewer", {"read"}),
        (2, "editor", {"read", "write"}),
        (3, "manager", {"read", "write", "manage"}),
        (4, "admin", {"read", "write", "manage", "admin"}),
    ]

    for role_id, name, permissions in roles_data:
        # Создаем mock роли для DAG
        class MockRole:
            def __init__(self, id, name, permissions):
                self.id = id
                self.name = name
                self.permissions_config = {"permissions": list(permissions)}
                self.role_level = id

        dag.add_role(MockRole(role_id, name, permissions))

    # Добавляем связи наследования
    inheritances = [
        (1, 2),  # viewer -> editor
        (2, 3),  # editor -> manager
        (3, 4),  # manager -> admin
    ]

    for parent_id, child_id in inheritances:
        hierarchy = RoleHierarchy(
            parent_role_id=parent_id,
            child_role_id=child_id,
            inheritance_type=InheritanceType.FULL,
            is_active=True,
        )
        dag.add_inheritance(hierarchy)

    return dag


class RoleHierarchyTestHelper:
    """Помощник для тестирования иерархии ролей."""

    @staticmethod
    async def create_test_role(
        db_session: AsyncSession, name: str, permissions: List[str], **kwargs
    ) -> EnhancedRole:
        """Создать тестовую роль."""
        role_data = {
            "name": name,
            "display_name": name.title(),
            "scope": "system",
            "permissions_config": {"permissions": permissions},
            "role_level": kwargs.get("role_level", 1),
            "is_active": True,
            **kwargs,
        }

        role = EnhancedRole(**role_data)
        db_session.add(role)
        await db_session.commit()
        await db_session.refresh(role)

        return role

    @staticmethod
    async def create_test_hierarchy(
        db_session: AsyncSession,
        parent_role_id: int,
        child_role_id: int,
        inheritance_type: InheritanceType = InheritanceType.FULL,
        **kwargs,
    ) -> RoleHierarchy:
        """Создать тестовую связь наследования."""
        hierarchy = RoleHierarchy(
            parent_role_id=parent_role_id,
            child_role_id=child_role_id,
            inheritance_type=inheritance_type,
            is_active=True,
            **kwargs,
        )

        db_session.add(hierarchy)
        await db_session.commit()
        await db_session.refresh(hierarchy)

        return hierarchy

    @staticmethod
    def assert_permissions_equal(expected: set, actual: set, msg: str = ""):
        """Проверить равенство множеств разрешений."""
        assert expected == actual, (
            f"{msg}\nExpected: {sorted(expected)}\nActual: {sorted(actual)}\n"
            f"Missing: {sorted(expected - actual)}\n"
            f"Extra: {sorted(actual - expected)}"
        )

    @staticmethod
    def assert_no_cycles(dag: RoleDAG):
        """Проверить отсутствие циклов в DAG."""
        assert not dag.has_cycle(), "DAG должен быть ациклическим"

    @staticmethod
    def assert_topological_order(dag: RoleDAG, expected_order: List[int]):
        """Проверить топологический порядок."""
        actual_order = dag.topological_sort()

        # Проверяем, что все элементы присутствуют
        assert set(actual_order) == set(
            expected_order
        ), f"Множества не совпадают: {set(actual_order)} != {set(expected_order)}"

        # Проверяем, что порядок соблюдается
        for i, node in enumerate(expected_order[:-1]):
            for j in range(i + 1, len(expected_order)):
                later_node = expected_order[j]
                assert actual_order.index(node) < actual_order.index(
                    later_node
                ), f"Нарушен порядок: {node} должен быть раньше {later_node}"


@pytest.fixture
def test_helper():
    """Предоставить помощника для тестирования."""
    return RoleHierarchyTestHelper


# Параметризованные тесты
@pytest.fixture(
    params=[
        InheritanceType.FULL,
        InheritanceType.PARTIAL,
        InheritanceType.RESTRICT,
        InheritanceType.OVERRIDE,
    ]
)
def inheritance_type(request):
    """Параметр для тестирования всех типов наследования."""
    return request.param


@pytest.fixture(params=[1, 2, 3, 5, 10])
def hierarchy_depth(request):
    """Параметр для тестирования разной глубины иерархии."""
    return request.param


@pytest.fixture(params=[True, False])
def use_cache(request):
    """Параметр для тестирования с кешем и без."""
    return request.param
