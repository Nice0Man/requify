"""
Тесты для системы иерархии ролей (DAG).
"""

import pytest
from typing import List, Set
from datetime import datetime, timezone

from app.models.role_hierarchy import RoleHierarchy, InheritanceType
from app.models.enhanced_role_system import EnhancedRole
from app.services.role_hierarchy_service import (
    RoleHierarchyService,
    RoleDAG,
    CyclicDependencyError,
    InvalidHierarchyError,
)
from app.crud.role_hierarchy import role_hierarchy
from app.crud.enhanced_role import enhanced_role


class TestRoleDAG:
    """Тесты для класса RoleDAG."""

    def test_create_empty_dag(self):
        """Тест создания пустого DAG."""
        dag = RoleDAG()
        assert len(dag.nodes) == 0
        assert len(dag.adjacency_list) == 0
        assert len(dag.reverse_adjacency_list) == 0
        assert not dag.has_cycle()

    def test_add_single_role(self):
        """Тест добавления одной роли."""
        dag = RoleDAG()

        # Создаем мок роли
        role = EnhancedRole(
            id=1,
            name="admin",
            display_name="Administrator",
            scope="system",
            permissions_config={"permissions": ["read", "write", "admin"]},
        )

        dag.add_role(role)

        assert 1 in dag.nodes
        assert dag.nodes[1].role_name == "admin"
        assert dag.nodes[1].permissions == {"read", "write", "admin"}

    def test_add_simple_inheritance(self):
        """Тест добавления простого наследования."""
        dag = RoleDAG()

        # Создаем роли
        admin_role = EnhancedRole(
            id=1,
            name="admin",
            display_name="Administrator",
            scope="system",
            permissions_config={"permissions": ["read", "write", "admin"]},
        )

        user_role = EnhancedRole(
            id=2,
            name="user",
            display_name="User",
            scope="system",
            permissions_config={"permissions": ["read"]},
        )

        dag.add_role(admin_role)
        dag.add_role(user_role)

        # Создаем связь наследования (admin наследует от user)
        hierarchy = RoleHierarchy(
            parent_role_id=2,  # user
            child_role_id=1,  # admin
            inheritance_type=InheritanceType.FULL,
            is_active=True,
        )

        dag.add_inheritance(hierarchy)

        # Проверяем связи
        assert 1 in dag.adjacency_list[2]  # user -> admin
        assert 2 in dag.reverse_adjacency_list[1]  # admin <- user
        assert not dag.has_cycle()

    def test_detect_cycle(self):
        """Тест обнаружения циклов."""
        dag = RoleDAG()

        # Создаем роли
        for i in range(1, 4):
            role = EnhancedRole(
                id=i,
                name=f"role_{i}",
                display_name=f"Role {i}",
                scope="system",
                permissions_config={"permissions": [f"perm_{i}"]},
            )
            dag.add_role(role)

        # Создаем цепочку: 1 -> 2 -> 3
        for i in range(1, 3):
            hierarchy = RoleHierarchy(
                parent_role_id=i,
                child_role_id=i + 1,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            )
            dag.add_inheritance(hierarchy)

        assert not dag.has_cycle()

        # Добавляем замыкающую связь: 3 -> 1 (создаем цикл)
        cycle_hierarchy = RoleHierarchy(
            parent_role_id=3,
            child_role_id=1,
            inheritance_type=InheritanceType.FULL,
            is_active=True,
        )
        dag.add_inheritance(cycle_hierarchy)

        assert dag.has_cycle()
        cycle = dag.find_cycle()
        assert cycle is not None
        assert len(cycle) > 0

    def test_topological_sort(self):
        """Тест топологической сортировки."""
        dag = RoleDAG()

        # Создаем иерархию: admin <- manager <- user <- viewer
        roles = [
            (1, "viewer", ["read"]),
            (2, "user", ["read", "write"]),
            (3, "manager", ["read", "write", "manage"]),
            (4, "admin", ["read", "write", "manage", "admin"]),
        ]

        for role_id, name, perms in roles:
            role = EnhancedRole(
                id=role_id,
                name=name,
                display_name=name.title(),
                scope="system",
                permissions_config={"permissions": perms},
            )
            dag.add_role(role)

        # Создаем связи наследования
        inheritances = [
            (1, 2),  # viewer -> user
            (2, 3),  # user -> manager
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

        topo_order = dag.topological_sort()

        # Проверяем, что порядок корректен
        assert len(topo_order) == 4
        # viewer должен быть раньше user, user раньше manager и т.д.
        viewer_pos = topo_order.index(1)
        user_pos = topo_order.index(2)
        manager_pos = topo_order.index(3)
        admin_pos = topo_order.index(4)

        assert viewer_pos < user_pos < manager_pos < admin_pos

    def test_compute_effective_permissions(self):
        """Тест вычисления эффективных разрешений."""
        dag = RoleDAG()

        # Создаем роли с разными разрешениями
        viewer = EnhancedRole(
            id=1,
            name="viewer",
            display_name="Viewer",
            scope="system",
            permissions_config={"permissions": ["read"]},
        )

        editor = EnhancedRole(
            id=2,
            name="editor",
            display_name="Editor",
            scope="system",
            permissions_config={"permissions": ["edit"]},
        )

        dag.add_role(viewer)
        dag.add_role(editor)

        # editor наследует от viewer
        hierarchy = RoleHierarchy(
            parent_role_id=1,  # viewer
            child_role_id=2,  # editor
            inheritance_type=InheritanceType.FULL,
            is_active=True,
        )

        dag.add_inheritance(hierarchy)
        dag.hierarchy_rules[(1, 2)] = hierarchy

        # Вычисляем эффективные разрешения для editor
        effective_perms = dag.compute_effective_permissions(2)

        # editor должен иметь свои разрешения + унаследованные от viewer
        expected_perms = {"edit", "read"}
        assert effective_perms == expected_perms

    def test_get_ancestors_and_descendants(self):
        """Тест получения предков и потомков."""
        dag = RoleDAG()

        # Создаем линейную иерархию: 1 -> 2 -> 3 -> 4
        for i in range(1, 5):
            role = EnhancedRole(
                id=i,
                name=f"role_{i}",
                display_name=f"Role {i}",
                scope="system",
                permissions_config={"permissions": [f"perm_{i}"]},
            )
            dag.add_role(role)

        for i in range(1, 4):
            hierarchy = RoleHierarchy(
                parent_role_id=i,
                child_role_id=i + 1,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            )
            dag.add_inheritance(hierarchy)

        # Проверяем предков для роли 4
        ancestors = dag.get_ancestors(4)
        assert ancestors == {1, 2, 3}

        # Проверяем потомков для роли 1
        descendants = dag.get_descendants(1)
        assert descendants == {2, 3, 4}

        # Проверяем промежуточную роль
        ancestors_2 = dag.get_ancestors(3)
        assert ancestors_2 == {1, 2}

        descendants_2 = dag.get_descendants(2)
        assert descendants_2 == {3, 4}


class TestRoleHierarchyService:
    """Тесты для сервиса иерархии ролей."""

    @pytest.fixture
    def service(self):
        """Создать экземпляр сервиса."""
        return RoleHierarchyService()

    def test_service_initialization(self, service):
        """Тест инициализации сервиса."""
        assert service.get_service_name() == "RoleHierarchyService"
        assert service._dag_cache is None
        assert service._cache_valid_until is None


class TestInheritanceTypes:
    """Тесты для разных типов наследования."""

    def test_full_inheritance(self):
        """Тест полного наследования."""
        hierarchy = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.FULL,
            is_active=True,
        )

        parent_permissions = {"read", "write", "admin"}
        inherited = hierarchy.get_inherited_permissions(parent_permissions)

        assert inherited == parent_permissions

    def test_partial_inheritance(self):
        """Тест частичного наследования."""
        hierarchy = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.PARTIAL,
            inherited_permissions=["read", "write"],
            is_active=True,
        )

        parent_permissions = {"read", "write", "admin", "delete"}
        inherited = hierarchy.get_inherited_permissions(parent_permissions)

        assert inherited == {"read", "write"}

    def test_restrict_inheritance(self):
        """Тест ограничивающего наследования."""
        hierarchy = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.RESTRICT,
            excluded_permissions=["admin", "delete"],
            is_active=True,
        )

        parent_permissions = {"read", "write", "admin", "delete"}
        inherited = hierarchy.get_inherited_permissions(parent_permissions)

        assert inherited == {"read", "write"}

    def test_inheritance_validation(self):
        """Тест валидации наследования."""
        # Валидное полное наследование
        full_hierarchy = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.FULL,
            is_active=True,
        )
        assert full_hierarchy.validate_inheritance()

        # Невалидное частичное наследование (без указания разрешений)
        partial_hierarchy = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.PARTIAL,
            is_active=True,
        )
        assert not partial_hierarchy.validate_inheritance()

        # Валидное частичное наследование
        valid_partial = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.PARTIAL,
            inherited_permissions=["read"],
            is_active=True,
        )
        assert valid_partial.validate_inheritance()


class TestRoleHierarchyProperties:
    """Тесты для свойств и методов иерархии ролей."""

    def test_is_effective_property(self):
        """Тест проверки эффективности связи."""
        now = datetime.now(timezone.utc)

        # Активная связь без временных ограничений
        hierarchy1 = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.FULL,
            is_active=True,
        )
        assert hierarchy1.is_effective

        # Неактивная связь
        hierarchy2 = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.FULL,
            is_active=False,
        )
        assert not hierarchy2.is_effective

        # Связь с будущей датой начала
        hierarchy3 = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.FULL,
            is_active=True,
            effective_from=datetime(2030, 1, 1, tzinfo=timezone.utc),
        )
        assert not hierarchy3.is_effective

        # Связь с прошедшей датой окончания
        hierarchy4 = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.FULL,
            is_active=True,
            effective_until=datetime(2020, 1, 1, tzinfo=timezone.utc),
        )
        assert not hierarchy4.is_effective


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
