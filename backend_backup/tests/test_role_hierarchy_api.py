"""
Тесты API endpoints для системы иерархии ролей.
Тестирование всех REST endpoints с реальными данными.
"""

import pytest
from typing import Dict, Any, List
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock

from app.models.enhanced_role_system import EnhancedRole
from app.models.role_hierarchy import RoleHierarchy, InheritanceType
from app.models.user import User
from app.core.constants import Permission, RoleScope, TeamRole, CompanyRole
from .conftest_role_hierarchy import RoleHierarchyTestHelper


class TestRoleHierarchyAPIEndpoints:
    """Тесты API endpoints иерархии ролей."""

    @pytest.fixture
    async def test_user_with_permissions(self, db_session) -> User:
        """Создать тестового пользователя с нужными разрешениями."""
        user = User(
            email="api.test@example.com",
            username="apitest",
            hashed_password="hashed_password",
            is_active=True,
            is_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # В реальном приложении здесь была бы настройка разрешений через роли
        return user

    @pytest.fixture
    async def test_roles_for_api(self, db_session, test_helper) -> List[EnhancedRole]:
        """Создать тестовые роли для API тестов."""
        roles = []

        # Создаем роли с реальными разрешениями
        roles_data = [
            {
                "name": "api_viewer",
                "permissions": [
                    Permission.VIEW_REQUIREMENT.value,
                    Permission.VIEW_DASHBOARD.value,
                ],
                "role_level": 10,
            },
            {
                "name": "api_editor",
                "permissions": [
                    Permission.CREATE_REQUIREMENT.value,
                    Permission.EDIT_REQUIREMENT.value,
                ],
                "role_level": 20,
            },
            {
                "name": "api_manager",
                "permissions": [
                    Permission.APPROVE_REQUIREMENT.value,
                    Permission.MANAGE_PROJECT.value,
                ],
                "role_level": 30,
            },
            {
                "name": "api_admin",
                "permissions": [
                    Permission.MANAGE_USERS.value,
                    Permission.MANAGE_SYSTEM.value,
                ],
                "role_level": 40,
            },
        ]

        for role_data in roles_data:
            role = await test_helper.create_test_role(
                db_session,
                role_data["name"],
                role_data["permissions"],
                role_level=role_data["role_level"],
            )
            roles.append(role)

        return roles

    @pytest.fixture
    def mock_auth_dependencies(self, test_user_with_permissions):
        """Mock для зависимостей аутентификации."""
        with patch(
            "app.api.dependencies.core.auth.get_current_user"
        ) as mock_get_user, patch(
            "app.api.dependencies.permissions.base.require_permission"
        ) as mock_require_perm:

            mock_get_user.return_value = test_user_with_permissions
            mock_require_perm.return_value = lambda: None  # Разрешаем все операции

            yield {
                "get_current_user": mock_get_user,
                "require_permission": mock_require_perm,
            }


class TestCreateRoleInheritanceAPI:
    """Тесты создания связей наследования через API."""

    @pytest.mark.asyncio
    async def test_create_inheritance_success(
        self,
        client: AsyncClient,
        db_session,
        test_roles_for_api,
        mock_auth_dependencies,
    ):
        """Тест успешного создания связи наследования."""
        parent_role = test_roles_for_api[0]  # viewer
        child_role = test_roles_for_api[1]  # editor

        payload = {
            "parent_role_id": parent_role.id,
            "child_role_id": child_role.id,
            "inheritance_type": InheritanceType.FULL.value,
            "priority": 0,
            "description": "Editor inherits from Viewer",
        }

        response = await client.post(
            "/api/v1/identity/role-hierarchy/create", json=payload
        )

        assert response.status_code == 201
        data = response.json()

        assert data["parent_role_id"] == parent_role.id
        assert data["child_role_id"] == child_role.id
        assert data["inheritance_type"] == InheritanceType.FULL.value
        assert data["is_active"] is True

    @pytest.mark.asyncio
    async def test_create_inheritance_with_conditions(
        self,
        client: AsyncClient,
        db_session,
        test_roles_for_api,
        mock_auth_dependencies,
    ):
        """Тест создания наследования с условиями."""
        parent_role = test_roles_for_api[0]
        child_role = test_roles_for_api[1]

        payload = {
            "parent_role_id": parent_role.id,
            "child_role_id": child_role.id,
            "inheritance_type": InheritanceType.PARTIAL.value,
            "inherited_permissions": [Permission.VIEW_REQUIREMENT.value],
            "conditions": {"environment": "production"},
            "priority": 1,
        }

        response = await client.post(
            "/api/v1/identity/role-hierarchy/create", json=payload
        )

        assert response.status_code == 201
        data = response.json()

        assert data["inheritance_type"] == InheritanceType.PARTIAL.value
        # В реальной реализации здесь проверялись бы conditions

    @pytest.mark.asyncio
    async def test_create_inheritance_validation_error(
        self, client: AsyncClient, test_roles_for_api, mock_auth_dependencies
    ):
        """Тест ошибки валидации при создании наследования."""
        role = test_roles_for_api[0]

        # Попытка создать самонаследование
        payload = {
            "parent_role_id": role.id,
            "child_role_id": role.id,  # Та же роль
            "inheritance_type": InheritanceType.FULL.value,
        }

        response = await client.post(
            "/api/v1/identity/role-hierarchy/create", json=payload
        )

        assert response.status_code == 400
        assert "ошибка" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_create_inheritance_unauthorized(
        self, client: AsyncClient, test_roles_for_api
    ):
        """Тест неавторизованного доступа."""
        payload = {
            "parent_role_id": test_roles_for_api[0].id,
            "child_role_id": test_roles_for_api[1].id,
            "inheritance_type": InheritanceType.FULL.value,
        }

        # Без mock_auth_dependencies - должна быть ошибка авторизации
        response = await client.post(
            "/api/v1/identity/role-hierarchy/create", json=payload
        )

        assert response.status_code in [401, 403]


class TestRemoveRoleInheritanceAPI:
    """Тесты удаления связей наследования через API."""

    @pytest.mark.asyncio
    async def test_remove_inheritance_success(
        self,
        client: AsyncClient,
        db_session,
        test_roles_for_api,
        mock_auth_dependencies,
        test_helper,
    ):
        """Тест успешного удаления связи наследования."""
        parent_role = test_roles_for_api[0]
        child_role = test_roles_for_api[1]

        # Сначала создаем связь
        hierarchy = await test_helper.create_test_hierarchy(
            db_session, parent_role.id, child_role.id
        )

        response = await client.delete(
            f"/api/v1/identity/role-hierarchy/{parent_role.id}/{child_role.id}"
        )

        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_remove_nonexistent_inheritance(
        self, client: AsyncClient, test_roles_for_api, mock_auth_dependencies
    ):
        """Тест удаления несуществующей связи."""
        parent_role = test_roles_for_api[0]
        child_role = test_roles_for_api[1]

        # Пытаемся удалить несуществующую связь
        response = await client.delete(
            f"/api/v1/identity/role-hierarchy/{parent_role.id}/{child_role.id}"
        )

        assert response.status_code == 404


class TestGetRoleAncestorsAPI:
    """Тесты получения предков ролей через API."""

    @pytest.mark.asyncio
    async def test_get_role_ancestors_success(
        self,
        client: AsyncClient,
        db_session,
        test_roles_for_api,
        mock_auth_dependencies,
        test_helper,
    ):
        """Тест успешного получения предков роли."""
        # Создаем цепочку: role[0] -> role[1] -> role[2]
        await test_helper.create_test_hierarchy(
            db_session,
            test_roles_for_api[0].id,  # viewer
            test_roles_for_api[1].id,  # editor
        )

        await test_helper.create_test_hierarchy(
            db_session,
            test_roles_for_api[1].id,  # editor
            test_roles_for_api[2].id,  # manager
        )

        response = await client.get(
            f"/api/v1/identity/role-hierarchy/role/{test_roles_for_api[2].id}/ancestors"
        )

        assert response.status_code == 200
        data = response.json()

        # manager должен иметь предков: viewer, editor
        assert len(data) == 2
        ancestor_ids = [role["id"] for role in data]
        assert test_roles_for_api[0].id in ancestor_ids  # viewer
        assert test_roles_for_api[1].id in ancestor_ids  # editor

    @pytest.mark.asyncio
    async def test_get_ancestors_empty_result(
        self, client: AsyncClient, test_roles_for_api, mock_auth_dependencies
    ):
        """Тест получения предков для роли без родителей."""
        response = await client.get(
            f"/api/v1/identity/role-hierarchy/role/{test_roles_for_api[0].id}/ancestors"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0  # Нет предков


class TestGetRoleDescendantsAPI:
    """Тесты получения потомков ролей через API."""

    @pytest.mark.asyncio
    async def test_get_role_descendants_success(
        self,
        client: AsyncClient,
        db_session,
        test_roles_for_api,
        mock_auth_dependencies,
        test_helper,
    ):
        """Тест успешного получения потомков роли."""
        # Создаем цепочку: role[0] -> role[1] -> role[2]
        await test_helper.create_test_hierarchy(
            db_session,
            test_roles_for_api[0].id,  # viewer
            test_roles_for_api[1].id,  # editor
        )

        await test_helper.create_test_hierarchy(
            db_session,
            test_roles_for_api[1].id,  # editor
            test_roles_for_api[2].id,  # manager
        )

        response = await client.get(
            f"/api/v1/identity/role-hierarchy/role/{test_roles_for_api[0].id}/descendants"
        )

        assert response.status_code == 200
        data = response.json()

        # viewer должен иметь потомков: editor, manager
        assert len(data) == 2
        descendant_ids = [role["id"] for role in data]
        assert test_roles_for_api[1].id in descendant_ids  # editor
        assert test_roles_for_api[2].id in descendant_ids  # manager


class TestGetRoleInheritanceInfoAPI:
    """Тесты получения информации о наследовании роли."""

    @pytest.mark.asyncio
    async def test_get_role_inheritance_info_success(
        self,
        client: AsyncClient,
        db_session,
        test_roles_for_api,
        mock_auth_dependencies,
        test_helper,
    ):
        """Тест успешного получения информации о наследовании."""
        # Создаем простую иерархию
        await test_helper.create_test_hierarchy(
            db_session,
            test_roles_for_api[0].id,  # viewer
            test_roles_for_api[1].id,  # editor
        )

        response = await client.get(
            f"/api/v1/identity/role-hierarchy/role/{test_roles_for_api[1].id}/info"
        )

        assert response.status_code == 200
        data = response.json()

        assert data["role_id"] == test_roles_for_api[1].id
        assert data["role_name"] == test_roles_for_api[1].name
        assert "effective_permissions" in data
        assert "direct_permissions" in data
        assert "inherited_permissions" in data
        assert "parent_roles" in data
        assert "child_roles" in data

        # editor должен иметь viewer в родителях
        assert test_roles_for_api[0].id in data["parent_roles"]

    @pytest.mark.asyncio
    async def test_get_role_info_nonexistent_role(
        self, client: AsyncClient, mock_auth_dependencies
    ):
        """Тест получения информации о несуществующей роли."""
        response = await client.get("/api/v1/identity/role-hierarchy/role/99999/info")

        assert response.status_code == 404


class TestValidateRoleInheritanceAPI:
    """Тесты валидации связей наследования через API."""

    @pytest.mark.asyncio
    async def test_validate_inheritance_success(
        self, client: AsyncClient, test_roles_for_api, mock_auth_dependencies
    ):
        """Тест успешной валидации связи наследования."""
        payload = {
            "parent_role_id": test_roles_for_api[0].id,
            "child_role_id": test_roles_for_api[1].id,
        }

        response = await client.post(
            "/api/v1/identity/role-hierarchy/validate", json=payload
        )

        assert response.status_code == 200
        data = response.json()

        assert data["is_valid"] is True
        assert len(data["errors"]) == 0

    @pytest.mark.asyncio
    async def test_validate_inheritance_self_reference(
        self, client: AsyncClient, test_roles_for_api, mock_auth_dependencies
    ):
        """Тест валидации самонаследования."""
        payload = {
            "parent_role_id": test_roles_for_api[0].id,
            "child_role_id": test_roles_for_api[0].id,  # Та же роль
        }

        response = await client.post(
            "/api/v1/identity/role-hierarchy/validate", json=payload
        )

        assert response.status_code == 200
        data = response.json()

        assert data["is_valid"] is False
        assert len(data["errors"]) > 0
        assert any("сама от себя" in error.lower() for error in data["errors"])


class TestFindInheritancePathAPI:
    """Тесты поиска путей наследования через API."""

    @pytest.mark.asyncio
    async def test_find_inheritance_path_success(
        self,
        client: AsyncClient,
        db_session,
        test_roles_for_api,
        mock_auth_dependencies,
        test_helper,
    ):
        """Тест успешного поиска пути наследования."""
        # Создаем цепочку: role[0] -> role[1] -> role[2]
        await test_helper.create_test_hierarchy(
            db_session, test_roles_for_api[0].id, test_roles_for_api[1].id
        )

        await test_helper.create_test_hierarchy(
            db_session, test_roles_for_api[1].id, test_roles_for_api[2].id
        )

        response = await client.get(
            f"/api/v1/identity/role-hierarchy/path/{test_roles_for_api[0].id}/{test_roles_for_api[2].id}"
        )

        assert response.status_code == 200
        data = response.json()

        assert data["path_exists"] is True
        assert data["source_role_id"] == test_roles_for_api[0].id
        assert data["target_role_id"] == test_roles_for_api[2].id
        assert len(data["path_steps"]) > 0

    @pytest.mark.asyncio
    async def test_find_inheritance_path_no_path(
        self, client: AsyncClient, test_roles_for_api, mock_auth_dependencies
    ):
        """Тест поиска несуществующего пути."""
        response = await client.get(
            f"/api/v1/identity/role-hierarchy/path/{test_roles_for_api[2].id}/{test_roles_for_api[0].id}"
        )

        assert response.status_code == 200
        data = response.json()

        assert data["path_exists"] is False
        assert len(data["path_steps"]) == 0


class TestGetHierarchyStatsAPI:
    """Тесты получения статистики иерархии."""

    @pytest.mark.asyncio
    async def test_get_hierarchy_stats_success(
        self,
        client: AsyncClient,
        db_session,
        test_roles_for_api,
        mock_auth_dependencies,
        test_helper,
    ):
        """Тест успешного получения статистики."""
        # Создаем несколько связей
        await test_helper.create_test_hierarchy(
            db_session, test_roles_for_api[0].id, test_roles_for_api[1].id
        )

        await test_helper.create_test_hierarchy(
            db_session,
            test_roles_for_api[1].id,
            test_roles_for_api[2].id,
            InheritanceType.PARTIAL,
        )

        response = await client.get("/api/v1/identity/role-hierarchy/stats")

        assert response.status_code == 200
        data = response.json()

        assert "total_roles" in data
        assert "total_relationships" in data
        assert "active_relationships" in data
        assert "inheritance_types_distribution" in data
        assert "max_depth" in data
        assert "roles_with_multiple_parents" in data
        assert "orphaned_roles" in data
        assert "potential_conflicts" in data

        assert data["total_roles"] >= len(test_roles_for_api)
        assert data["total_relationships"] >= 2

        # Проверяем распределение типов наследования
        distribution = data["inheritance_types_distribution"]
        assert InheritanceType.FULL.value in distribution
        assert InheritanceType.PARTIAL.value in distribution


class TestBulkCreateInheritanceAPI:
    """Тесты массового создания связей наследования."""

    @pytest.mark.asyncio
    async def test_bulk_create_inheritance_success(
        self, client: AsyncClient, test_roles_for_api, mock_auth_dependencies
    ):
        """Тест успешного массового создания связей."""
        payload = {
            "relationships": [
                {
                    "parent_role_id": test_roles_for_api[0].id,
                    "child_role_id": test_roles_for_api[1].id,
                    "inheritance_type": InheritanceType.FULL.value,
                },
                {
                    "parent_role_id": test_roles_for_api[1].id,
                    "child_role_id": test_roles_for_api[2].id,
                    "inheritance_type": InheritanceType.PARTIAL.value,
                    "inherited_permissions": [Permission.VIEW_REQUIREMENT.value],
                },
            ],
            "validate_dag": True,
            "skip_conflicts": False,
        }

        response = await client.post(
            "/api/v1/identity/role-hierarchy/bulk-create", json=payload
        )

        assert response.status_code == 200
        data = response.json()

        assert data["created_count"] == 2
        assert data["skipped_count"] == 0
        assert len(data["errors"]) == 0
        assert len(data["created_relationships"]) == 2

    @pytest.mark.asyncio
    async def test_bulk_create_with_conflicts_skip(
        self, client: AsyncClient, test_roles_for_api, mock_auth_dependencies
    ):
        """Тест массового создания с пропуском конфликтов."""
        payload = {
            "relationships": [
                {
                    "parent_role_id": test_roles_for_api[0].id,
                    "child_role_id": test_roles_for_api[1].id,
                    "inheritance_type": InheritanceType.FULL.value,
                },
                {
                    "parent_role_id": test_roles_for_api[0].id,
                    "child_role_id": test_roles_for_api[0].id,  # Самонаследование
                    "inheritance_type": InheritanceType.FULL.value,
                },
            ],
            "validate_dag": True,
            "skip_conflicts": True,
        }

        response = await client.post(
            "/api/v1/identity/role-hierarchy/bulk-create", json=payload
        )

        assert response.status_code == 200
        data = response.json()

        assert data["created_count"] == 1  # Только одна связь создана
        assert data["skipped_count"] == 1  # Одна пропущена
        assert len(data["errors"]) == 1  # Одна ошибка зафиксирована


class TestGetHierarchyConflictsAPI:
    """Тесты получения конфликтов в иерархии."""

    @pytest.mark.asyncio
    async def test_get_conflicts_empty(
        self, client: AsyncClient, test_roles_for_api, mock_auth_dependencies
    ):
        """Тест получения конфликтов в чистой иерархии."""
        response = await client.get("/api/v1/identity/role-hierarchy/conflicts")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        # В чистой иерархии конфликтов быть не должно
        assert len(data) == 0

    @pytest.mark.asyncio
    async def test_get_conflicts_specific_role(
        self, client: AsyncClient, test_roles_for_api, mock_auth_dependencies
    ):
        """Тест получения конфликтов для конкретной роли."""
        response = await client.get(
            f"/api/v1/identity/role-hierarchy/conflicts?role_id={test_roles_for_api[0].id}"
        )

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)


class TestAPIErrorHandling:
    """Тесты обработки ошибок в API."""

    @pytest.mark.asyncio
    async def test_invalid_role_id_format(
        self, client: AsyncClient, mock_auth_dependencies
    ):
        """Тест некорректного формата ID роли."""
        response = await client.get(
            "/api/v1/identity/role-hierarchy/role/invalid_id/ancestors"
        )

        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_missing_required_fields(
        self, client: AsyncClient, mock_auth_dependencies
    ):
        """Тест отсутствующих обязательных полей."""
        payload = {
            "parent_role_id": 1
            # Отсутствует child_role_id
        }

        response = await client.post(
            "/api/v1/identity/role-hierarchy/create", json=payload
        )

        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_invalid_inheritance_type(
        self, client: AsyncClient, test_roles_for_api, mock_auth_dependencies
    ):
        """Тест некорректного типа наследования."""
        payload = {
            "parent_role_id": test_roles_for_api[0].id,
            "child_role_id": test_roles_for_api[1].id,
            "inheritance_type": "invalid_type",
        }

        response = await client.post(
            "/api/v1/identity/role-hierarchy/create", json=payload
        )

        assert response.status_code == 422  # Validation error


class TestAPIPerformance:
    """Тесты производительности API."""

    @pytest.mark.asyncio
    async def test_large_hierarchy_stats_performance(
        self, client: AsyncClient, db_session, test_helper, mock_auth_dependencies
    ):
        """Тест производительности получения статистики большой иерархии."""
        import time

        # Создаем много ролей и связей
        roles = []
        for i in range(20):
            role = await test_helper.create_test_role(
                db_session, f"perf_role_{i}", [Permission.VIEW_DASHBOARD.value]
            )
            roles.append(role)

        # Создаем много связей
        for i in range(15):
            await test_helper.create_test_hierarchy(
                db_session, roles[i].id, roles[i + 1].id
            )

        # Измеряем время ответа API
        start_time = time.time()

        response = await client.get("/api/v1/identity/role-hierarchy/stats")

        end_time = time.time()
        response_time = end_time - start_time

        assert response.status_code == 200
        # API должен отвечать быстро (< 1 сек)
        assert response_time < 1.0

        data = response.json()
        assert data["total_roles"] >= 20
        assert data["total_relationships"] >= 15


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
