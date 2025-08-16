"""
Тесты алгоритмов DAG для иерархии ролей.
Покрывают все основные алгоритмы графов.
"""

import pytest
from typing import List, Set
from unittest.mock import MagicMock

from app.services.role_hierarchy_service import RoleDAG, CyclicDependencyError
from app.models.role_hierarchy import RoleHierarchy, InheritanceType
from app.models.enhanced_role_system import EnhancedRole


class TestRoleDAGBasics:
    """Базовые тесты для RoleDAG."""

    def test_empty_dag_creation(self):
        """Тест создания пустого DAG."""
        dag = RoleDAG()

        assert len(dag.nodes) == 0
        assert len(dag.adjacency_list) == 0
        assert len(dag.reverse_adjacency_list) == 0
        assert not dag.has_cycle()

    def test_single_role_addition(self):
        """Тест добавления одной роли."""
        dag = RoleDAG()

        # Создаем mock роли
        role = self._create_mock_role(1, "admin", ["read", "write", "admin"])
        dag.add_role(role)

        assert 1 in dag.nodes
        assert dag.nodes[1].role_name == "admin"
        assert dag.nodes[1].permissions == {"read", "write", "admin"}
        assert dag.nodes[1].level == 0

    def test_multiple_roles_addition(self):
        """Тест добавления нескольких ролей."""
        dag = RoleDAG()

        roles = [
            self._create_mock_role(1, "viewer", ["read"]),
            self._create_mock_role(2, "editor", ["read", "write"]),
            self._create_mock_role(3, "admin", ["read", "write", "admin"]),
        ]

        for role in roles:
            dag.add_role(role)

        assert len(dag.nodes) == 3
        assert all(i in dag.nodes for i in [1, 2, 3])

    def _create_mock_role(
        self, id: int, name: str, permissions: List[str]
    ) -> MagicMock:
        """Создать mock роли для тестирования."""
        role = MagicMock()
        role.id = id
        role.name = name
        role.permissions_config = {"permissions": permissions}
        role.role_level = 0
        return role


class TestRoleDAGInheritance:
    """Тесты добавления связей наследования."""

    def test_simple_inheritance(self):
        """Тест простого наследования между двумя ролями."""
        dag = RoleDAG()

        # Добавляем роли
        parent_role = self._create_mock_role(1, "user", ["read"])
        child_role = self._create_mock_role(2, "admin", ["admin"])

        dag.add_role(parent_role)
        dag.add_role(child_role)

        # Добавляем связь наследования
        hierarchy = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.FULL,
            is_active=True,
        )

        dag.add_inheritance(hierarchy)

        # Проверяем связи
        assert 2 in dag.adjacency_list[1]  # parent -> child
        assert 1 in dag.reverse_adjacency_list[2]  # child <- parent
        assert 1 in dag.nodes[2].parents
        assert 2 in dag.nodes[1].children
        assert not dag.has_cycle()

    def test_chain_inheritance(self):
        """Тест цепочки наследования."""
        dag = RoleDAG()

        # Создаем цепочку: 1 -> 2 -> 3 -> 4
        roles = [
            self._create_mock_role(i, f"role_{i}", [f"perm_{i}"]) for i in range(1, 5)
        ]

        for role in roles:
            dag.add_role(role)

        # Добавляем связи наследования
        for i in range(1, 4):
            hierarchy = RoleHierarchy(
                parent_role_id=i,
                child_role_id=i + 1,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            )
            dag.add_inheritance(hierarchy)

        assert not dag.has_cycle()

        # Проверяем предков и потомков
        ancestors_4 = dag.get_ancestors(4)
        assert ancestors_4 == {1, 2, 3}

        descendants_1 = dag.get_descendants(1)
        assert descendants_1 == {2, 3, 4}

    def test_multiple_parents(self):
        """Тест множественного наследования."""
        dag = RoleDAG()

        # Создаем структуру с множественным наследованием
        roles = [
            self._create_mock_role(1, "reader", ["read"]),
            self._create_mock_role(2, "writer", ["write"]),
            self._create_mock_role(
                3, "editor", ["edit"]
            ),  # наследует от reader и writer
        ]

        for role in roles:
            dag.add_role(role)

        # Добавляем множественное наследование
        hierarchies = [
            RoleHierarchy(
                parent_role_id=1,
                child_role_id=3,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            ),  # reader -> editor
            RoleHierarchy(
                parent_role_id=2,
                child_role_id=3,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            ),  # writer -> editor
        ]

        for hierarchy in hierarchies:
            dag.add_inheritance(hierarchy)

        assert not dag.has_cycle()

        ancestors_3 = dag.get_ancestors(3)
        assert ancestors_3 == {1, 2}

    def test_inactive_inheritance(self):
        """Тест неактивного наследования."""
        dag = RoleDAG()

        roles = [
            self._create_mock_role(1, "parent", ["read"]),
            self._create_mock_role(2, "child", ["write"]),
        ]

        for role in roles:
            dag.add_role(role)

        # Неактивная связь не должна добавляться
        hierarchy = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.FULL,
            is_active=False,
        )

        dag.add_inheritance(hierarchy)

        # Связь не должна быть добавлена
        assert 2 not in dag.adjacency_list.get(1, set())
        assert 1 not in dag.reverse_adjacency_list.get(2, set())

    def _create_mock_role(
        self, id: int, name: str, permissions: List[str]
    ) -> MagicMock:
        """Создать mock роли для тестирования."""
        role = MagicMock()
        role.id = id
        role.name = name
        role.permissions_config = {"permissions": permissions}
        role.role_level = 0
        return role


class TestCycleDetection:
    """Тесты обнаружения циклов в DAG."""

    def test_no_cycle_empty_graph(self):
        """Тест отсутствия циклов в пустом графе."""
        dag = RoleDAG()
        assert not dag.has_cycle()
        assert dag.find_cycle() is None

    def test_no_cycle_single_node(self):
        """Тест отсутствия циклов с одним узлом."""
        dag = RoleDAG()
        role = self._create_mock_role(1, "admin", ["admin"])
        dag.add_role(role)

        assert not dag.has_cycle()
        assert dag.find_cycle() is None

    def test_no_cycle_linear_chain(self):
        """Тест отсутствия циклов в линейной цепи."""
        dag = RoleDAG()

        # Создаем цепь: 1 -> 2 -> 3
        for i in range(1, 4):
            role = self._create_mock_role(i, f"role_{i}", [f"perm_{i}"])
            dag.add_role(role)

        for i in range(1, 3):
            hierarchy = RoleHierarchy(
                parent_role_id=i,
                child_role_id=i + 1,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            )
            dag.add_inheritance(hierarchy)

        assert not dag.has_cycle()
        assert dag.find_cycle() is None

    def test_detect_simple_cycle(self):
        """Тест обнаружения простого цикла."""
        dag = RoleDAG()

        # Создаем роли
        for i in range(1, 3):
            role = self._create_mock_role(i, f"role_{i}", [f"perm_{i}"])
            dag.add_role(role)

        # Создаем цикл: 1 -> 2 -> 1
        hierarchies = [
            RoleHierarchy(
                parent_role_id=1,
                child_role_id=2,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            ),
            RoleHierarchy(
                parent_role_id=2,
                child_role_id=1,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            ),
        ]

        for hierarchy in hierarchies:
            dag.add_inheritance(hierarchy)

        assert dag.has_cycle()
        cycle = dag.find_cycle()
        assert cycle is not None
        assert len(cycle) >= 2

    def test_detect_complex_cycle(self):
        """Тест обнаружения сложного цикла."""
        dag = RoleDAG()

        # Создаем роли
        for i in range(1, 5):
            role = self._create_mock_role(i, f"role_{i}", [f"perm_{i}"])
            dag.add_role(role)

        # Создаем структуру с циклом: 1 -> 2 -> 3 -> 4 -> 2
        hierarchies = [
            RoleHierarchy(
                parent_role_id=1,
                child_role_id=2,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            ),
            RoleHierarchy(
                parent_role_id=2,
                child_role_id=3,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            ),
            RoleHierarchy(
                parent_role_id=3,
                child_role_id=4,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            ),
            RoleHierarchy(
                parent_role_id=4,
                child_role_id=2,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            ),  # Цикл
        ]

        for hierarchy in hierarchies:
            dag.add_inheritance(hierarchy)

        assert dag.has_cycle()
        cycle = dag.find_cycle()
        assert cycle is not None
        assert len(cycle) >= 3

    def test_no_cycle_with_multiple_roots(self):
        """Тест отсутствия циклов с несколькими корнями."""
        dag = RoleDAG()

        # Создаем структуру: 1->3, 2->3, 3->4
        for i in range(1, 5):
            role = self._create_mock_role(i, f"role_{i}", [f"perm_{i}"])
            dag.add_role(role)

        hierarchies = [
            RoleHierarchy(
                parent_role_id=1,
                child_role_id=3,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            ),
            RoleHierarchy(
                parent_role_id=2,
                child_role_id=3,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            ),
            RoleHierarchy(
                parent_role_id=3,
                child_role_id=4,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            ),
        ]

        for hierarchy in hierarchies:
            dag.add_inheritance(hierarchy)

        assert not dag.has_cycle()

    def _create_mock_role(
        self, id: int, name: str, permissions: List[str]
    ) -> MagicMock:
        """Создать mock роли для тестирования."""
        role = MagicMock()
        role.id = id
        role.name = name
        role.permissions_config = {"permissions": permissions}
        role.role_level = 0
        return role


class TestTopologicalSort:
    """Тесты топологической сортировки."""

    def test_empty_graph_topological_sort(self):
        """Тест топологической сортировки пустого графа."""
        dag = RoleDAG()
        result = dag.topological_sort()
        assert result == []

    def test_single_node_topological_sort(self):
        """Тест топологической сортировки одного узла."""
        dag = RoleDAG()
        role = self._create_mock_role(1, "admin", ["admin"])
        dag.add_role(role)

        result = dag.topological_sort()
        assert result == [1]

    def test_linear_chain_topological_sort(self):
        """Тест топологической сортировки линейной цепи."""
        dag = RoleDAG()

        # Создаем цепь: 1 -> 2 -> 3 -> 4
        for i in range(1, 5):
            role = self._create_mock_role(i, f"role_{i}", [f"perm_{i}"])
            dag.add_role(role)

        for i in range(1, 4):
            hierarchy = RoleHierarchy(
                parent_role_id=i,
                child_role_id=i + 1,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            )
            dag.add_inheritance(hierarchy)

        result = dag.topological_sort()

        # Проверяем правильность порядка
        assert len(result) == 4
        for i in range(3):
            assert result.index(i + 1) < result.index(i + 2)

    def test_complex_dag_topological_sort(self):
        """Тест топологической сортировки сложного DAG."""
        dag = RoleDAG()

        # Создаем сложную структуру
        for i in range(1, 6):
            role = self._create_mock_role(i, f"role_{i}", [f"perm_{i}"])
            dag.add_role(role)

        # Структура: 1->3, 2->3, 3->4, 3->5
        hierarchies = [
            RoleHierarchy(1, 3, InheritanceType.FULL, is_active=True),
            RoleHierarchy(2, 3, InheritanceType.FULL, is_active=True),
            RoleHierarchy(3, 4, InheritanceType.FULL, is_active=True),
            RoleHierarchy(3, 5, InheritanceType.FULL, is_active=True),
        ]

        for hierarchy in hierarchies:
            dag.add_inheritance(hierarchy)

        result = dag.topological_sort()

        # Проверяем правильность порядка
        assert len(result) == 5

        # 1 и 2 должны быть раньше 3
        assert result.index(1) < result.index(3)
        assert result.index(2) < result.index(3)

        # 3 должен быть раньше 4 и 5
        assert result.index(3) < result.index(4)
        assert result.index(3) < result.index(5)

    def test_topological_sort_with_cycle_raises_error(self):
        """Тест, что топологическая сортировка выбрасывает ошибку при цикле."""
        dag = RoleDAG()

        # Создаем роли
        for i in range(1, 4):
            role = self._create_mock_role(i, f"role_{i}", [f"perm_{i}"])
            dag.add_role(role)

        # Создаем цикл: 1 -> 2 -> 3 -> 1
        hierarchies = [
            RoleHierarchy(1, 2, InheritanceType.FULL, is_active=True),
            RoleHierarchy(2, 3, InheritanceType.FULL, is_active=True),
            RoleHierarchy(3, 1, InheritanceType.FULL, is_active=True),
        ]

        for hierarchy in hierarchies:
            dag.add_inheritance(hierarchy)

        with pytest.raises(CyclicDependencyError):
            dag.topological_sort()

    def _create_mock_role(
        self, id: int, name: str, permissions: List[str]
    ) -> MagicMock:
        """Создать mock роли для тестирования."""
        role = MagicMock()
        role.id = id
        role.name = name
        role.permissions_config = {"permissions": permissions}
        role.role_level = 0
        return role


class TestPermissionComputation:
    """Тесты вычисления эффективных разрешений."""

    def test_single_role_permissions(self):
        """Тест разрешений одной роли."""
        dag = RoleDAG()

        role = self._create_mock_role(1, "admin", ["read", "write", "admin"])
        dag.add_role(role)

        permissions = dag.compute_effective_permissions(1)
        assert permissions == {"read", "write", "admin"}

    def test_inherited_permissions(self):
        """Тест наследованных разрешений."""
        dag = RoleDAG()

        # Создаем роли с разными разрешениями
        parent_role = self._create_mock_role(1, "user", ["read"])
        child_role = self._create_mock_role(2, "admin", ["admin"])

        dag.add_role(parent_role)
        dag.add_role(child_role)

        # Добавляем наследование
        hierarchy = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.FULL,
            is_active=True,
        )

        dag.add_inheritance(hierarchy)
        dag.hierarchy_rules[(1, 2)] = hierarchy

        # Проверяем эффективные разрешения
        child_permissions = dag.compute_effective_permissions(2)
        expected = {"read", "admin"}  # собственные + унаследованные

        assert child_permissions == expected

    def test_chain_inherited_permissions(self):
        """Тест наследования по цепочке."""
        dag = RoleDAG()

        # Создаем цепочку ролей
        roles_data = [
            (1, "viewer", {"read"}),
            (2, "editor", {"edit"}),
            (3, "manager", {"manage"}),
            (4, "admin", {"admin"}),
        ]

        for role_id, name, permissions in roles_data:
            role = self._create_mock_role(role_id, name, list(permissions))
            dag.add_role(role)

        # Создаем цепочку наследования: 1->2->3->4
        for i in range(1, 4):
            hierarchy = RoleHierarchy(
                parent_role_id=i,
                child_role_id=i + 1,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            )
            dag.add_inheritance(hierarchy)
            dag.hierarchy_rules[(i, i + 1)] = hierarchy

        # Проверяем эффективные разрешения admin
        admin_permissions = dag.compute_effective_permissions(4)
        expected = {"read", "edit", "manage", "admin"}

        assert admin_permissions == expected

    def test_multiple_inheritance_permissions(self):
        """Тест множественного наследования разрешений."""
        dag = RoleDAG()

        # Создаем роли
        roles_data = [
            (1, "reader", {"read"}),
            (2, "writer", {"write"}),
            (3, "editor", {"edit"}),  # наследует от reader и writer
        ]

        for role_id, name, permissions in roles_data:
            role = self._create_mock_role(role_id, name, list(permissions))
            dag.add_role(role)

        # Создаем множественное наследование
        hierarchies = [
            (1, 3, InheritanceType.FULL),  # reader -> editor
            (2, 3, InheritanceType.FULL),  # writer -> editor
        ]

        for parent_id, child_id, inheritance_type in hierarchies:
            hierarchy = RoleHierarchy(
                parent_role_id=parent_id,
                child_role_id=child_id,
                inheritance_type=inheritance_type,
                is_active=True,
            )
            dag.add_inheritance(hierarchy)
            dag.hierarchy_rules[(parent_id, child_id)] = hierarchy

        # Проверяем эффективные разрешения editor
        editor_permissions = dag.compute_effective_permissions(3)
        expected = {"read", "write", "edit"}

        assert editor_permissions == expected

    def test_nonexistent_role_permissions(self):
        """Тест разрешений несуществующей роли."""
        dag = RoleDAG()

        permissions = dag.compute_effective_permissions(999)
        assert permissions == set()

    def _create_mock_role(
        self, id: int, name: str, permissions: List[str]
    ) -> MagicMock:
        """Создать mock роли для тестирования."""
        role = MagicMock()
        role.id = id
        role.name = name
        role.permissions_config = {"permissions": permissions}
        role.role_level = 0
        return role


class TestAncestorsAndDescendants:
    """Тесты поиска предков и потомков."""

    def test_no_ancestors_for_root(self):
        """Тест отсутствия предков у корневой роли."""
        dag = RoleDAG()

        role = self._create_mock_role(1, "root", ["admin"])
        dag.add_role(role)

        ancestors = dag.get_ancestors(1)
        assert ancestors == set()

    def test_single_ancestor(self):
        """Тест одного предка."""
        dag = RoleDAG()

        # Создаем parent -> child
        parent = self._create_mock_role(1, "parent", ["read"])
        child = self._create_mock_role(2, "child", ["write"])

        dag.add_role(parent)
        dag.add_role(child)

        hierarchy = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.FULL,
            is_active=True,
        )
        dag.add_inheritance(hierarchy)

        ancestors = dag.get_ancestors(2)
        assert ancestors == {1}

        descendants = dag.get_descendants(1)
        assert descendants == {2}

    def test_chain_ancestors_and_descendants(self):
        """Тест предков и потомков в цепочке."""
        dag = RoleDAG()

        # Создаем цепочку: 1 -> 2 -> 3 -> 4 -> 5
        for i in range(1, 6):
            role = self._create_mock_role(i, f"role_{i}", [f"perm_{i}"])
            dag.add_role(role)

        for i in range(1, 5):
            hierarchy = RoleHierarchy(
                parent_role_id=i,
                child_role_id=i + 1,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            )
            dag.add_inheritance(hierarchy)

        # Проверяем предков
        assert dag.get_ancestors(1) == set()
        assert dag.get_ancestors(2) == {1}
        assert dag.get_ancestors(3) == {1, 2}
        assert dag.get_ancestors(4) == {1, 2, 3}
        assert dag.get_ancestors(5) == {1, 2, 3, 4}

        # Проверяем потомков
        assert dag.get_descendants(1) == {2, 3, 4, 5}
        assert dag.get_descendants(2) == {3, 4, 5}
        assert dag.get_descendants(3) == {4, 5}
        assert dag.get_descendants(4) == {5}
        assert dag.get_descendants(5) == set()

    def test_complex_ancestors_and_descendants(self):
        """Тест предков и потомков в сложной структуре."""
        dag = RoleDAG()

        # Создаем сложную структуру: 1,2->3->4,5
        for i in range(1, 6):
            role = self._create_mock_role(i, f"role_{i}", [f"perm_{i}"])
            dag.add_role(role)

        hierarchies = [
            RoleHierarchy(1, 3, InheritanceType.FULL, is_active=True),
            RoleHierarchy(2, 3, InheritanceType.FULL, is_active=True),
            RoleHierarchy(3, 4, InheritanceType.FULL, is_active=True),
            RoleHierarchy(3, 5, InheritanceType.FULL, is_active=True),
        ]

        for hierarchy in hierarchies:
            dag.add_inheritance(hierarchy)

        # Проверяем предков
        assert dag.get_ancestors(3) == {1, 2}
        assert dag.get_ancestors(4) == {1, 2, 3}
        assert dag.get_ancestors(5) == {1, 2, 3}

        # Проверяем потомков
        assert dag.get_descendants(1) == {3, 4, 5}
        assert dag.get_descendants(2) == {3, 4, 5}
        assert dag.get_descendants(3) == {4, 5}

    def test_ancestors_and_descendants_with_cycles_prevention(self):
        """Тест предотвращения бесконечного цикла при поиске предков/потомков."""
        dag = RoleDAG()

        # Создаем роли
        for i in range(1, 4):
            role = self._create_mock_role(i, f"role_{i}", [f"perm_{i}"])
            dag.add_role(role)

        # Искусственно создаем структуру с циклом в adjacency_list
        # (обычно это предотвращается валидацией, но тестируем защиту)
        dag.adjacency_list[1].add(2)
        dag.adjacency_list[2].add(3)
        dag.adjacency_list[3].add(1)  # цикл

        dag.reverse_adjacency_list[2].add(1)
        dag.reverse_adjacency_list[3].add(2)
        dag.reverse_adjacency_list[1].add(3)  # цикл

        # Алгоритмы должны завершаться, а не зависать
        ancestors = dag.get_ancestors(1)
        descendants = dag.get_descendants(1)

        # Проверяем, что вызовы завершились (не зависли)
        assert isinstance(ancestors, set)
        assert isinstance(descendants, set)

    def _create_mock_role(
        self, id: int, name: str, permissions: List[str]
    ) -> MagicMock:
        """Создать mock роли для тестирования."""
        role = MagicMock()
        role.id = id
        role.name = name
        role.permissions_config = {"permissions": permissions}
        role.role_level = 0
        return role


class TestInheritancePath:
    """Тесты поиска путей наследования."""

    def test_direct_inheritance_path(self):
        """Тест прямого пути наследования."""
        dag = RoleDAG()

        # Создаем parent -> child
        parent = self._create_mock_role(1, "parent", ["read"])
        child = self._create_mock_role(2, "child", ["write"])

        dag.add_role(parent)
        dag.add_role(child)

        hierarchy = RoleHierarchy(
            parent_role_id=1,
            child_role_id=2,
            inheritance_type=InheritanceType.FULL,
            is_active=True,
        )
        dag.add_inheritance(hierarchy)
        dag.hierarchy_rules[(1, 2)] = hierarchy

        path = dag.find_inheritance_path(1, 2)

        assert path is not None
        assert path.source_role_id == 1
        assert path.target_role_id == 2
        assert path.path == [1, 2]
        assert len(path.inheritance_rules) == 1

    def test_chain_inheritance_path(self):
        """Тест пути наследования по цепочке."""
        dag = RoleDAG()

        # Создаем цепочку: 1 -> 2 -> 3 -> 4
        for i in range(1, 5):
            role = self._create_mock_role(i, f"role_{i}", [f"perm_{i}"])
            dag.add_role(role)

        for i in range(1, 4):
            hierarchy = RoleHierarchy(
                parent_role_id=i,
                child_role_id=i + 1,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            )
            dag.add_inheritance(hierarchy)
            dag.hierarchy_rules[(i, i + 1)] = hierarchy

        path = dag.find_inheritance_path(1, 4)

        assert path is not None
        assert path.source_role_id == 1
        assert path.target_role_id == 4
        assert path.path == [1, 2, 3, 4]
        assert len(path.inheritance_rules) == 3

    def test_no_inheritance_path(self):
        """Тест отсутствия пути наследования."""
        dag = RoleDAG()

        # Создаем две несвязанные роли
        role1 = self._create_mock_role(1, "role1", ["perm1"])
        role2 = self._create_mock_role(2, "role2", ["perm2"])

        dag.add_role(role1)
        dag.add_role(role2)

        path = dag.find_inheritance_path(1, 2)
        assert path is None

    def test_complex_inheritance_path(self):
        """Тест сложного пути наследования."""
        dag = RoleDAG()

        # Создаем сложную структуру
        for i in range(1, 6):
            role = self._create_mock_role(i, f"role_{i}", [f"perm_{i}"])
            dag.add_role(role)

        # Структура: 1->2, 1->3, 2->4, 3->4, 4->5
        hierarchies_data = [(1, 2), (1, 3), (2, 4), (3, 4), (4, 5)]

        for parent_id, child_id in hierarchies_data:
            hierarchy = RoleHierarchy(
                parent_role_id=parent_id,
                child_role_id=child_id,
                inheritance_type=InheritanceType.FULL,
                is_active=True,
            )
            dag.add_inheritance(hierarchy)
            dag.hierarchy_rules[(parent_id, child_id)] = hierarchy

        # Должен найти кратчайший путь от 1 до 5
        path = dag.find_inheritance_path(1, 5)

        assert path is not None
        assert path.source_role_id == 1
        assert path.target_role_id == 5
        # Может быть [1, 2, 4, 5] или [1, 3, 4, 5]
        assert len(path.path) == 4
        assert path.path[0] == 1
        assert path.path[-1] == 5

    def _create_mock_role(
        self, id: int, name: str, permissions: List[str]
    ) -> MagicMock:
        """Создать mock роли для тестирования."""
        role = MagicMock()
        role.id = id
        role.name = name
        role.permissions_config = {"permissions": permissions}
        role.role_level = 0
        return role
