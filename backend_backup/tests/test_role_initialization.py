"""
Тесты для сервиса инициализации ролей.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Dict, List

from app.services.role_initialization_service import RoleInitializationService
from app.models.role_hierarchy import InheritanceType
from app.core.constants import RoleScope, Permission


class TestRoleInitializationService:
    """Тесты для RoleInitializationService."""

    def setup_method(self):
        """Настройка для каждого теста."""
        self.service = RoleInitializationService()

    def test_get_enhanced_role_definitions(self):
        """Тест получения определений ролей."""
        definitions = self.service.get_enhanced_role_definitions()

        # Проверяем что определения не пустые
        assert len(definitions) > 0

        # Проверяем наличие обязательных ролей
        role_names = [role["name"] for role in definitions]
        required_roles = [
            "system_administrator",
            "platform_administrator",
            "company_owner",
            "company_administrator",
            "manager",
            "editor",
            "author",
            "viewer",
        ]

        for required_role in required_roles:
            assert required_role in role_names, f"Роль {required_role} отсутствует"

        # Проверяем структуру определений
        for role_def in definitions:
            assert "name" in role_def
            assert "display_name" in role_def
            assert "description" in role_def
            assert "scope" in role_def
            assert "role_level" in role_def
            assert "permissions_config" in role_def
            assert "permissions" in role_def["permissions_config"]
            assert isinstance(role_def["permissions_config"]["permissions"], list)

    def test_get_role_hierarchy_definitions(self):
        """Тест получения определений иерархии ролей."""
        hierarchy_definitions = self.service.get_role_hierarchy_definitions()

        # Проверяем что определения не пустые
        assert len(hierarchy_definitions) > 0

        # Проверяем структуру
        for parent_name, child_name, inheritance_type in hierarchy_definitions:
            assert isinstance(parent_name, str)
            assert isinstance(child_name, str)
            assert isinstance(inheritance_type, InheritanceType)
            assert parent_name != child_name, "Роль не может наследовать сама от себя"

        # Проверяем наличие ключевых связей
        hierarchy_dict = {
            (parent, child): itype for parent, child, itype in hierarchy_definitions
        }

        # System Admin должен наследовать от других ролей
        assert ("system_administrator", "platform_administrator") in hierarchy_dict
        assert ("system_administrator", "company_owner") in hierarchy_dict

        # Цепочка наследования должна быть правильной
        assert ("company_owner", "company_administrator") in hierarchy_dict
        assert ("company_administrator", "manager") in hierarchy_dict
        assert ("manager", "editor") in hierarchy_dict
        assert ("editor", "author") in hierarchy_dict
        assert ("author", "viewer") in hierarchy_dict

    def test_role_permissions_coverage(self):
        """Тест покрытия разрешений в ролях."""
        definitions = self.service.get_enhanced_role_definitions()

        # Проверяем что System Administrator имеет все разрешения
        system_admin = next(
            (role for role in definitions if role["name"] == "system_administrator"),
            None,
        )
        assert system_admin is not None

        system_admin_permissions = set(
            system_admin["permissions_config"]["permissions"]
        )
        all_permissions = set(perm.value for perm in Permission)

        assert (
            system_admin_permissions == all_permissions
        ), "System Administrator должен иметь все разрешения"

        # Проверяем что Viewer имеет минимальные разрешения
        viewer = next((role for role in definitions if role["name"] == "viewer"), None)
        assert viewer is not None

        viewer_permissions = set(viewer["permissions_config"]["permissions"])

        # Viewer должен иметь базовые разрешения на просмотр
        required_viewer_permissions = {
            Permission.VIEW_PROJECT.value,
            Permission.VIEW_REQUIREMENT.value,
            Permission.VIEW_DASHBOARD.value,
            Permission.USE_API.value,
        }

        assert required_viewer_permissions.issubset(
            viewer_permissions
        ), "Viewer должен иметь базовые разрешения на просмотр"

    def test_role_hierarchy_levels(self):
        """Тест правильности уровней иерархии."""
        definitions = self.service.get_enhanced_role_definitions()

        # Создаем словарь ролей по именам
        roles_by_name = {role["name"]: role for role in definitions}

        # Получаем иерархию
        hierarchy_definitions = self.service.get_role_hierarchy_definitions()

        # Проверяем что родительская роль имеет уровень выше дочерней
        for parent_name, child_name, _ in hierarchy_definitions:
            if parent_name in roles_by_name and child_name in roles_by_name:
                parent_level = roles_by_name[parent_name]["hierarchy_level"]
                child_level = roles_by_name[child_name]["hierarchy_level"]

                assert parent_level < child_level, (
                    f"Родительская роль {parent_name} (уровень {parent_level}) "
                    f"должна иметь уровень ниже дочерней роли {child_name} (уровень {child_level})"
                )

    def test_prepare_role_data(self):
        """Тест подготовки данных роли."""
        # Тестируем с enum значениями
        role_def = {
            "name": "test_role",
            "scope": RoleScope.SYSTEM,
            "permissions_config": {"permissions": ["test_perm"]},
            "hierarchy_level": 5,  # Должно быть удалено
        }

        prepared_data = self.service._prepare_role_data(role_def)

        assert prepared_data["name"] == "test_role"
        assert prepared_data["scope"] == "system"  # Enum преобразован в строку
        assert "hierarchy_level" not in prepared_data  # Служебное поле удалено
        assert prepared_data["permissions_config"] == {"permissions": ["test_perm"]}

    @pytest.mark.asyncio
    async def test_role_inheritance_no_cycles(self):
        """Тест отсутствия циклов в иерархии ролей."""
        # Получаем определения иерархии
        hierarchy_definitions = self.service.get_role_hierarchy_definitions()

        # Строим граф для проверки циклов
        graph = {}
        for parent_name, child_name, _ in hierarchy_definitions:
            if parent_name not in graph:
                graph[parent_name] = []
            graph[parent_name].append(child_name)

        # Проверяем на циклы через DFS
        def has_cycle(graph, start, visited, rec_stack):
            visited[start] = True
            rec_stack[start] = True

            if start in graph:
                for neighbor in graph[start]:
                    if neighbor not in visited:
                        visited[neighbor] = False

                    if not visited[neighbor]:
                        if has_cycle(graph, neighbor, visited, rec_stack):
                            return True
                    elif rec_stack[neighbor]:
                        return True

            rec_stack[start] = False
            return False

        # Проверяем каждый узел
        all_nodes = set()
        for parent_name, child_name, _ in hierarchy_definitions:
            all_nodes.add(parent_name)
            all_nodes.add(child_name)

        visited = {node: False for node in all_nodes}
        rec_stack = {node: False for node in all_nodes}

        for node in all_nodes:
            if not visited[node]:
                assert not has_cycle(
                    graph, node, visited, rec_stack
                ), f"Обнаружен цикл в иерархии ролей, начинающийся с {node}"

    def test_service_name(self):
        """Тест имени сервиса."""
        assert self.service.get_service_name() == "RoleInitializationService"
