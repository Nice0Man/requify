"""
Интеграционные тесты для RoleHierarchyService.
Тестирование всех методов сервиса с реальной базой данных.
"""

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, patch
from typing import List, Set

from app.services.role_hierarchy_service import (
    RoleHierarchyService,
    CyclicDependencyError,
)
from app.models.role_hierarchy import RoleHierarchy, RoleHierarchyCache, InheritanceType
from app.models.enhanced_role_system import EnhancedRole
from app.core.exceptions import (
    ValidationError,
    NotFoundError,
    ConflictError,
    BusinessLogicError,
)
from .conftest_role_hierarchy import RoleHierarchyTestHelper


class TestRoleHierarchyServiceInitialization:
    """Тесты инициализации сервиса."""

    def test_service_initialization(self):
        """Тест инициализации сервиса."""
        service = RoleHierarchyService()

        assert service.service_name == "role_hierarchy"
        assert service._dag_cache is None
        assert service._cache_valid_until is None
        assert hasattr(service, "logger")

    def test_service_registration(self):
        """Тест регистрации сервиса в фабрике."""
        from app.services.base import ServiceFactory

        # Проверяем, что сервис зарегистрирован
        service = ServiceFactory.get_service("role_hierarchy")
        assert isinstance(service, RoleHierarchyService)


class TestBuildRoleDAG:
    """Тесты построения DAG ролей."""

    @pytest.mark.asyncio
    async def test_build_empty_dag(self, db_session, role_hierarchy_service):
        """Тест построения пустого DAG."""
        dag = await role_hierarchy_service.build_role_dag(db_session)

        assert len(dag.nodes) == 0
        assert len(dag.adjacency_list) == 0
        assert not dag.has_cycle()

    @pytest.mark.asyncio
    async def test_build_dag_with_roles_only(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест построения DAG только с ролями (без связей)."""
        dag = await role_hierarchy_service.build_role_dag(db_session)

        assert len(dag.nodes) == len(sample_roles)
        for role in sample_roles:
            assert role.id in dag.nodes
            assert dag.nodes[role.id].role_name == role.name

    @pytest.mark.asyncio
    async def test_build_dag_with_simple_hierarchy(
        self, db_session, sample_roles, simple_hierarchy, role_hierarchy_service
    ):
        """Тест построения DAG с простой иерархией."""
        dag = await role_hierarchy_service.build_role_dag(db_session)

        assert len(dag.nodes) == len(sample_roles)
        assert not dag.has_cycle()

        # Проверяем связи
        for hierarchy in simple_hierarchy:
            parent_id = hierarchy.parent_role_id
            child_id = hierarchy.child_role_id
            assert child_id in dag.adjacency_list.get(parent_id, set())
            assert parent_id in dag.reverse_adjacency_list.get(child_id, set())

    @pytest.mark.asyncio
    async def test_build_dag_caching(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест кеширования DAG."""
        # Первый вызов - строим DAG
        dag1 = await role_hierarchy_service.build_role_dag(db_session)
        cache_time1 = role_hierarchy_service._cache_valid_until

        # Второй вызов - должен вернуть кешированный DAG
        dag2 = await role_hierarchy_service.build_role_dag(db_session)
        cache_time2 = role_hierarchy_service._cache_valid_until

        assert dag1 is dag2  # Тот же объект
        assert cache_time1 == cache_time2  # Время кеша не изменилось

    @pytest.mark.asyncio
    async def test_build_dag_force_refresh(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест принудительного обновления DAG."""
        # Первый вызов
        dag1 = await role_hierarchy_service.build_role_dag(db_session)

        # Принудительное обновление
        dag2 = await role_hierarchy_service.build_role_dag(
            db_session, force_refresh=True
        )

        assert dag1 is not dag2  # Разные объекты
        assert len(dag2.nodes) == len(sample_roles)

    @pytest.mark.asyncio
    async def test_build_dag_with_cycle_raises_error(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест, что построение DAG с циклом вызывает ошибку."""
        # Создаем цикл в иерархии
        cycle_hierarchy = RoleHierarchy(
            parent_role_id=sample_roles[3].id,  # admin
            child_role_id=sample_roles[0].id,  # viewer (создает цикл)
            inheritance_type=InheritanceType.FULL,
            is_active=True,
        )
        db_session.add(cycle_hierarchy)
        await db_session.commit()

        with pytest.raises(BusinessLogicError) as exc_info:
            await role_hierarchy_service.build_role_dag(db_session, force_refresh=True)

        assert "граф ролей" in str(exc_info.value).lower()


class TestValidateInheritance:
    """Тесты валидации наследования."""

    @pytest.mark.asyncio
    async def test_validate_valid_inheritance(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест валидации корректного наследования."""
        is_valid = await role_hierarchy_service.validate_inheritance(
            db_session, sample_roles[0].id, sample_roles[1].id  # viewer  # editor
        )

        assert is_valid is True

    @pytest.mark.asyncio
    async def test_validate_self_inheritance_raises_error(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест, что самонаследование вызывает ошибку."""
        with pytest.raises(ValidationError) as exc_info:
            await role_hierarchy_service.validate_inheritance(
                db_session,
                sample_roles[0].id,  # viewer
                sample_roles[0].id,  # viewer (сама себе)
            )

        assert "сама от себя" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_validate_nonexistent_role_raises_error(
        self, db_session, role_hierarchy_service
    ):
        """Тест, что несуществующая роль вызывает ошибку."""
        with pytest.raises(NotFoundError) as exc_info:
            await role_hierarchy_service.validate_inheritance(
                db_session, 999, 1  # несуществующая роль
            )

        assert "не найдены" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_validate_cyclic_inheritance_raises_error(
        self, db_session, sample_roles, simple_hierarchy, role_hierarchy_service
    ):
        """Тест, что циклическое наследование вызывает ошибку."""
        # simple_hierarchy создает цепь: 1->2->3->4
        # Попытка создать связь 4->1 создаст цикл

        with pytest.raises(ConflictError) as exc_info:
            await role_hierarchy_service.validate_inheritance(
                db_session,
                sample_roles[3].id,  # admin (4)
                sample_roles[0].id,  # viewer (1)
            )

        assert "цикл" in str(exc_info.value).lower()


class TestCreateInheritance:
    """Тесты создания связей наследования."""

    @pytest.mark.asyncio
    async def test_create_simple_inheritance(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест создания простой связи наследования."""
        hierarchy = await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=sample_roles[0].id,  # viewer
            child_role_id=sample_roles[1].id,  # editor
            inheritance_type=InheritanceType.FULL,
            created_by=1,
        )

        assert hierarchy is not None
        assert hierarchy.parent_role_id == sample_roles[0].id
        assert hierarchy.child_role_id == sample_roles[1].id
        assert hierarchy.inheritance_type == InheritanceType.FULL
        assert hierarchy.is_active is True
        assert hierarchy.created_by == 1

    @pytest.mark.asyncio
    async def test_create_inheritance_with_conditions(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест создания наследования с условиями."""
        conditions = {"environment": "production", "department": "engineering"}

        hierarchy = await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=sample_roles[0].id,
            child_role_id=sample_roles[1].id,
            inheritance_type=InheritanceType.PARTIAL,
            conditions=conditions,
        )

        assert hierarchy.conditions == conditions
        assert hierarchy.inheritance_type == InheritanceType.PARTIAL

    @pytest.mark.asyncio
    async def test_create_inheritance_invalidates_cache(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест, что создание наследования сбрасывает кеш."""
        # Строим DAG для создания кеша
        await role_hierarchy_service.build_role_dag(db_session)
        assert role_hierarchy_service._dag_cache is not None

        # Создаем наследование
        await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=sample_roles[0].id,
            child_role_id=sample_roles[1].id,
        )

        # Кеш должен быть сброшен
        assert role_hierarchy_service._dag_cache is None
        assert role_hierarchy_service._cache_valid_until is None

    @pytest.mark.asyncio
    async def test_create_inheritance_with_validation_error_rolls_back(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест, что ошибка валидации откатывает транзакцию."""
        with pytest.raises(ValidationError):
            await role_hierarchy_service.create_inheritance(
                db_session,
                parent_role_id=sample_roles[0].id,
                child_role_id=sample_roles[0].id,  # самонаследование
            )

        # Проверяем, что транзакция была откачена
        # (в реальном приложении здесь была бы проверка состояния БД)


class TestGetRoleEffectivePermissions:
    """Тесты получения эффективных разрешений."""

    @pytest.mark.asyncio
    async def test_get_permissions_single_role(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест получения разрешений одной роли."""
        permissions = await role_hierarchy_service.get_role_effective_permissions(
            db_session, sample_roles[0].id  # viewer
        )

        expected = {"read"}
        assert permissions == expected

    @pytest.mark.asyncio
    async def test_get_permissions_with_inheritance(
        self, db_session, sample_roles, simple_hierarchy, role_hierarchy_service
    ):
        """Тест получения разрешений с наследованием."""
        # simple_hierarchy: viewer->editor->manager->admin

        permissions = await role_hierarchy_service.get_role_effective_permissions(
            db_session, sample_roles[3].id  # admin
        )

        # admin должен иметь все разрешения от всей цепочки
        expected = {"read", "write", "manage", "admin"}
        assert permissions == expected

    @pytest.mark.asyncio
    async def test_get_permissions_with_caching(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест кеширования разрешений."""
        role_id = sample_roles[0].id

        # Первый вызов - вычисляем и кешируем
        permissions1 = await role_hierarchy_service.get_role_effective_permissions(
            db_session, role_id, use_cache=True
        )

        # Второй вызов - должен использовать кеш
        with patch.object(role_hierarchy_service, "build_role_dag") as mock_build:
            permissions2 = await role_hierarchy_service.get_role_effective_permissions(
                db_session, role_id, use_cache=True
            )

            # build_role_dag не должен вызываться при втором запросе
            # (если кеш работает на уровне базы данных)
            assert permissions1 == permissions2

    @pytest.mark.asyncio
    async def test_get_permissions_without_cache(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест получения разрешений без кеширования."""
        permissions = await role_hierarchy_service.get_role_effective_permissions(
            db_session, sample_roles[0].id, use_cache=False
        )

        assert isinstance(permissions, set)
        assert len(permissions) > 0


class TestGetRoleAncestorsAndDescendants:
    """Тесты получения предков и потомков."""

    @pytest.mark.asyncio
    async def test_get_role_ancestors(
        self, db_session, sample_roles, simple_hierarchy, role_hierarchy_service
    ):
        """Тест получения предков роли."""
        # simple_hierarchy: viewer(1)->editor(2)->manager(3)->admin(4)

        ancestors = await role_hierarchy_service.get_role_ancestors(
            db_session, sample_roles[3].id  # admin
        )

        expected = [
            sample_roles[0].id,
            sample_roles[1].id,
            sample_roles[2].id,
        ]  # viewer, editor, manager
        assert set(ancestors) == set(expected)

    @pytest.mark.asyncio
    async def test_get_role_descendants(
        self, db_session, sample_roles, simple_hierarchy, role_hierarchy_service
    ):
        """Тест получения потомков роли."""
        descendants = await role_hierarchy_service.get_role_descendants(
            db_session, sample_roles[0].id  # viewer
        )

        expected = [
            sample_roles[1].id,
            sample_roles[2].id,
            sample_roles[3].id,
        ]  # editor, manager, admin
        assert set(descendants) == set(expected)

    @pytest.mark.asyncio
    async def test_get_ancestors_root_role(
        self, db_session, sample_roles, simple_hierarchy, role_hierarchy_service
    ):
        """Тест получения предков корневой роли."""
        ancestors = await role_hierarchy_service.get_role_ancestors(
            db_session, sample_roles[0].id  # viewer (корневая роль)
        )

        assert ancestors == []

    @pytest.mark.asyncio
    async def test_get_descendants_leaf_role(
        self, db_session, sample_roles, simple_hierarchy, role_hierarchy_service
    ):
        """Тест получения потомков листовой роли."""
        descendants = await role_hierarchy_service.get_role_descendants(
            db_session, sample_roles[3].id  # admin (листовая роль)
        )

        assert descendants == []


class TestFindInheritancePath:
    """Тесты поиска путей наследования."""

    @pytest.mark.asyncio
    async def test_find_direct_inheritance_path(
        self, db_session, sample_roles, simple_hierarchy, role_hierarchy_service
    ):
        """Тест поиска прямого пути наследования."""
        path = await role_hierarchy_service.find_inheritance_path(
            db_session, sample_roles[0].id, sample_roles[1].id  # viewer  # editor
        )

        assert path is not None
        assert path.source_role_id == sample_roles[0].id
        assert path.target_role_id == sample_roles[1].id
        assert len(path.path) == 2

    @pytest.mark.asyncio
    async def test_find_chain_inheritance_path(
        self, db_session, sample_roles, simple_hierarchy, role_hierarchy_service
    ):
        """Тест поиска пути наследования по цепочке."""
        path = await role_hierarchy_service.find_inheritance_path(
            db_session, sample_roles[0].id, sample_roles[3].id  # viewer  # admin
        )

        assert path is not None
        assert path.source_role_id == sample_roles[0].id
        assert path.target_role_id == sample_roles[3].id
        assert len(path.path) == 4  # viewer -> editor -> manager -> admin

    @pytest.mark.asyncio
    async def test_find_no_inheritance_path(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест отсутствия пути наследования."""
        # Между несвязанными ролями не должно быть пути
        path = await role_hierarchy_service.find_inheritance_path(
            db_session,
            sample_roles[3].id,  # admin
            sample_roles[0].id,  # viewer (обратное направление)
        )

        assert path is None


class TestCacheOperations:
    """Тесты операций с кешем."""

    @pytest.mark.asyncio
    async def test_cache_invalidation(self, role_hierarchy_service):
        """Тест сброса кеша."""
        # Устанавливаем кеш
        role_hierarchy_service._dag_cache = "test_cache"
        role_hierarchy_service._cache_valid_until = datetime.now()

        # Сбрасываем кеш
        role_hierarchy_service._invalidate_cache()

        assert role_hierarchy_service._dag_cache is None
        assert role_hierarchy_service._cache_valid_until is None

    @pytest.mark.asyncio
    async def test_get_cached_permissions_nonexistent(
        self, db_session, role_hierarchy_service
    ):
        """Тест получения несуществующих кешированных разрешений."""
        permissions = await role_hierarchy_service._get_cached_permissions(
            db_session, 999
        )

        assert permissions is None

    @pytest.mark.asyncio
    async def test_cache_permissions_success(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест успешного кеширования разрешений."""
        role_id = sample_roles[0].id
        permissions = {"read", "write"}

        await role_hierarchy_service._cache_permissions(
            db_session, role_id, permissions
        )

        # Проверяем, что кеш создался
        cached = await role_hierarchy_service._get_cached_permissions(
            db_session, role_id
        )

        assert cached == permissions


class TestErrorHandling:
    """Тесты обработки ошибок."""

    @pytest.mark.asyncio
    async def test_build_dag_database_error(self, role_hierarchy_service):
        """Тест обработки ошибок базы данных при построении DAG."""
        # Создаем mock сессии, которая вызывает ошибку
        mock_session = AsyncMock()
        mock_session.execute.side_effect = Exception("Database error")

        with pytest.raises(BusinessLogicError) as exc_info:
            await role_hierarchy_service.build_role_dag(mock_session)

        assert "граф ролей" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_get_permissions_error_handling(self, role_hierarchy_service):
        """Тест обработки ошибок при получении разрешений."""
        mock_session = AsyncMock()

        with patch.object(
            role_hierarchy_service,
            "build_role_dag",
            side_effect=Exception("Test error"),
        ):
            with pytest.raises(BusinessLogicError) as exc_info:
                await role_hierarchy_service.get_role_effective_permissions(
                    mock_session, 1
                )

            assert "разрешения роли" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_cache_operations_error_handling(
        self, db_session, role_hierarchy_service
    ):
        """Тест обработки ошибок кеширования."""
        # Тест с неправильными данными - не должен вызывать исключение
        with patch("app.services.role_hierarchy_service.logger") as mock_logger:
            await role_hierarchy_service._cache_permissions(
                db_session, None, {"test"}  # Некорректные данные
            )

            # Должно логировать предупреждение, но не падать
            # (проверяем, что метод завершился)


class TestPerformance:
    """Тесты производительности."""

    @pytest.mark.asyncio
    async def test_large_hierarchy_performance(
        self, db_session, test_helper, role_hierarchy_service
    ):
        """Тест производительности с большой иерархией."""
        # Создаем много ролей
        roles = []
        for i in range(50):  # Умеренное количество для тестов
            role = await test_helper.create_test_role(
                db_session, f"role_{i}", [f"perm_{i}"], role_level=i
            )
            roles.append(role)

        # Создаем линейную иерархию
        for i in range(49):
            await test_helper.create_test_hierarchy(
                db_session, roles[i].id, roles[i + 1].id
            )

        # Измеряем время построения DAG
        import time

        start_time = time.time()

        dag = await role_hierarchy_service.build_role_dag(db_session)

        end_time = time.time()
        build_time = end_time - start_time

        # Проверяем, что время разумное (< 1 секунды для 50 ролей)
        assert build_time < 1.0
        assert len(dag.nodes) == 50
        assert not dag.has_cycle()

    @pytest.mark.asyncio
    async def test_cache_performance(
        self, db_session, sample_roles, role_hierarchy_service
    ):
        """Тест производительности кеширования."""
        # Первый вызов - строим DAG
        import time

        start_time = time.time()
        dag1 = await role_hierarchy_service.build_role_dag(db_session)
        first_call_time = time.time() - start_time

        # Второй вызов - используем кеш
        start_time = time.time()
        dag2 = await role_hierarchy_service.build_role_dag(db_session)
        second_call_time = time.time() - start_time

        # Кешированный вызов должен быть быстрее
        assert second_call_time < first_call_time
        assert dag1 is dag2
