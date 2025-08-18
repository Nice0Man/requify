"""
Сервис для работы с иерархией ролей (DAG).

Реализует алгоритмы:
- Проверка циклов в графе ролей
- Топологическая сортировка ролей
- Вычисление наследуемых разрешений
- Поиск путей в графе ролей
- Кеширование результатов
"""

from typing import List, Dict, Set, Optional, Tuple, Any
from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timedelta
import asyncio
from functools import lru_cache

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

from app.models.role_hierarchy import RoleHierarchy, RoleHierarchyCache, InheritanceType
from app.models.enhanced_role_system import EnhancedRole
from app.crud.enhanced_role import enhanced_role
from app.utils.logger import logger
from .base import BaseService, ServiceError
from app.core.exceptions import (
    NotFoundError,
    ValidationError,
    ConflictError,
    BusinessLogicError,
)


class RoleHierarchyError(ServiceError):
    """Ошибки сервиса иерархии ролей."""

    pass


class CyclicDependencyError(RoleHierarchyError):
    """Ошибка циклической зависимости в иерархии ролей."""

    pass


class InvalidHierarchyError(RoleHierarchyError):
    """Ошибка некорректной иерархии ролей."""

    pass


@dataclass
class RoleNode:
    """Узел в графе ролей."""

    role_id: int
    role_name: str
    permissions: Set[str]
    level: int = 0
    parents: Set[int] = None
    children: Set[int] = None

    def __post_init__(self):
        if self.parents is None:
            self.parents = set()
        if self.children is None:
            self.children = set()


@dataclass
class InheritancePath:
    """Путь наследования между ролями."""

    source_role_id: int
    target_role_id: int
    path: List[int]
    inheritance_rules: List[RoleHierarchy]
    effective_permissions: Set[str]


class RoleDAG:
    """
    Направленный ациклический граф ролей.

    Представляет иерархию ролей в виде DAG и предоставляет
    алгоритмы для работы с ним.
    """

    def __init__(self):
        self.nodes: Dict[int, RoleNode] = {}
        self.adjacency_list: Dict[int, Set[int]] = defaultdict(set)
        self.reverse_adjacency_list: Dict[int, Set[int]] = defaultdict(set)
        self.hierarchy_rules: Dict[Tuple[int, int], RoleHierarchy] = {}

    def add_role(self, role: EnhancedRole) -> None:
        """Добавить роль в граф."""
        permissions = set()
        if role.permissions_config and "permissions" in role.permissions_config:
            permissions = set(role.permissions_config["permissions"])

        self.nodes[role.id] = RoleNode(
            role_id=role.id,
            role_name=role.name,
            permissions=permissions,
            level=role.role_level or 0,
        )

    def add_inheritance(self, hierarchy: RoleHierarchy) -> None:
        """Добавить связь наследования."""
        if not hierarchy.is_effective:
            return

        parent_id = hierarchy.parent_role_id
        child_id = hierarchy.child_role_id

        # Добавляем связь в граф
        self.adjacency_list[parent_id].add(child_id)
        self.reverse_adjacency_list[child_id].add(parent_id)

        # Обновляем узлы
        if parent_id in self.nodes:
            self.nodes[parent_id].children.add(child_id)
        if child_id in self.nodes:
            self.nodes[child_id].parents.add(parent_id)

        # Сохраняем правило наследования
        self.hierarchy_rules[(parent_id, child_id)] = hierarchy

    def has_cycle(self) -> bool:
        """
        Проверить наличие циклов в графе (алгоритм DFS).

        Returns:
            True если граф содержит циклы
        """
        WHITE, GRAY, BLACK = 0, 1, 2
        colors = {node_id: WHITE for node_id in self.nodes}

        def dfs(node_id: int) -> bool:
            if colors[node_id] == GRAY:  # Обратное ребро найдено
                return True
            if colors[node_id] == BLACK:  # Уже обработан
                return False

            colors[node_id] = GRAY

            for child_id in self.adjacency_list.get(node_id, set()):
                if dfs(child_id):
                    return True

            colors[node_id] = BLACK
            return False

        for node_id in self.nodes:
            if colors[node_id] == WHITE:
                if dfs(node_id):
                    return True

        return False

    def find_cycle(self) -> Optional[List[int]]:
        """
        Найти цикл в графе (если есть).

        Returns:
            Список ID ролей, образующих цикл, или None
        """
        WHITE, GRAY, BLACK = 0, 1, 2
        colors = {node_id: WHITE for node_id in self.nodes}
        parent = {node_id: None for node_id in self.nodes}

        def dfs(node_id: int, path: List[int]) -> Optional[List[int]]:
            if colors[node_id] == GRAY:
                # Найден цикл, возвращаем путь от node_id до node_id
                cycle_start = path.index(node_id)
                return path[cycle_start:] + [node_id]

            if colors[node_id] == BLACK:
                return None

            colors[node_id] = GRAY
            path.append(node_id)

            for child_id in self.adjacency_list.get(node_id, set()):
                cycle = dfs(child_id, path.copy())
                if cycle:
                    return cycle

            colors[node_id] = BLACK
            return None

        for node_id in self.nodes:
            if colors[node_id] == WHITE:
                cycle = dfs(node_id, [])
                if cycle:
                    return cycle

        return None

    def topological_sort(self) -> List[int]:
        """
        Топологическая сортировка ролей (алгоритм Кана).

        Returns:
            Список ID ролей в топологическом порядке

        Raises:
            CyclicDependencyError: Если граф содержит циклы
        """
        # Вычисляем входящие степени
        in_degree = {node_id: 0 for node_id in self.nodes}
        for parent_id in self.adjacency_list:
            for child_id in self.adjacency_list[parent_id]:
                in_degree[child_id] += 1

        # Инициализируем очередь с узлами без входящих ребер
        queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
        result = []

        while queue:
            node_id = queue.popleft()
            result.append(node_id)

            # Удаляем исходящие ребра
            for child_id in self.adjacency_list.get(node_id, set()):
                in_degree[child_id] -= 1
                if in_degree[child_id] == 0:
                    queue.append(child_id)

        # Проверяем на циклы
        if len(result) != len(self.nodes):
            cycle = self.find_cycle()
            raise CyclicDependencyError(f"Цикл обнаружен в иерархии ролей: {cycle}")

        return result

    def get_ancestors(self, role_id: int) -> Set[int]:
        """
        Получить всех предков роли (рекурсивно).

        Args:
            role_id: ID роли

        Returns:
            Множество ID предков
        """
        ancestors = set()
        visited = set()

        def dfs(current_id: int):
            if current_id in visited:
                return
            visited.add(current_id)

            for parent_id in self.reverse_adjacency_list.get(current_id, set()):
                ancestors.add(parent_id)
                dfs(parent_id)

        dfs(role_id)
        return ancestors

    def get_descendants(self, role_id: int) -> Set[int]:
        """
        Получить всех потомков роли (рекурсивно).

        Args:
            role_id: ID роли

        Returns:
            Множество ID потомков
        """
        descendants = set()
        visited = set()

        def dfs(current_id: int):
            if current_id in visited:
                return
            visited.add(current_id)

            for child_id in self.adjacency_list.get(current_id, set()):
                descendants.add(child_id)
                dfs(child_id)

        dfs(role_id)
        return descendants

    def compute_effective_permissions(self, role_id: int) -> Set[str]:
        """
        Вычислить эффективные разрешения роли с учетом наследования.

        Args:
            role_id: ID роли

        Returns:
            Множество эффективных разрешений
        """
        if role_id not in self.nodes:
            return set()

        effective_permissions = self.nodes[role_id].permissions.copy()

        # Получаем предков в топологическом порядке
        ancestors = self.get_ancestors(role_id)
        topo_order = self.topological_sort()

        # Применяем наследование от предков к потомкам
        for ancestor_id in topo_order:
            if ancestor_id in ancestors:
                ancestor_permissions = self.nodes[ancestor_id].permissions

                # Находим правило наследования
                hierarchy_rule = self.hierarchy_rules.get((ancestor_id, role_id))
                if hierarchy_rule:
                    inherited = hierarchy_rule.get_inherited_permissions(
                        ancestor_permissions
                    )
                    effective_permissions.update(inherited)

        return effective_permissions

    def find_inheritance_path(
        self, source_role_id: int, target_role_id: int
    ) -> Optional[InheritancePath]:
        """
        Найти путь наследования от одной роли к другой.

        Args:
            source_role_id: ID исходной роли (предок)
            target_role_id: ID целевой роли (потомок)

        Returns:
            Путь наследования или None если пути нет
        """
        # BFS для поиска кратчайшего пути
        queue = deque([(source_role_id, [source_role_id])])
        visited = {source_role_id}

        while queue:
            current_id, path = queue.popleft()

            if current_id == target_role_id:
                # Собираем правила наследования для пути
                rules = []
                for i in range(len(path) - 1):
                    rule = self.hierarchy_rules.get((path[i], path[i + 1]))
                    if rule:
                        rules.append(rule)

                # Вычисляем эффективные разрешения
                effective_permissions = self.compute_effective_permissions(
                    target_role_id
                )

                return InheritancePath(
                    source_role_id=source_role_id,
                    target_role_id=target_role_id,
                    path=path,
                    inheritance_rules=rules,
                    effective_permissions=effective_permissions,
                )

            for child_id in self.adjacency_list.get(current_id, set()):
                if child_id not in visited:
                    visited.add(child_id)
                    queue.append((child_id, path + [child_id]))

        return None


class RoleHierarchyService(BaseService):
    """
    Сервис для управления иерархией ролей.

    Предоставляет методы для:
    - Построения DAG ролей
    - Проверки корректности иерархии
    - Вычисления наследуемых разрешений
    - Кеширования результатов
    """

    def __init__(self):
        super().__init__()
        self.service_name = "role_hierarchy"
        self._dag_cache: Optional[RoleDAG] = None
        self._cache_valid_until: Optional[datetime] = None

    def get_service_name(self) -> str:
        """Возвращает имя сервиса."""
        return "RoleHierarchyService"

    async def build_role_dag(
        self, db: AsyncSession, force_refresh: bool = False
    ) -> RoleDAG:
        """
        Построить DAG ролей из базы данных.

        Args:
            db: Сессия базы данных
            force_refresh: Принудительно обновить кеш

        Returns:
            Граф ролей
        """
        # Проверяем кеш
        if (
            not force_refresh
            and self._dag_cache
            and self._cache_valid_until
            and datetime.now() < self._cache_valid_until
        ):
            return self._dag_cache

        try:
            self.logger.debug(
                f"Начинаем построение DAG ролей", extra={"force_refresh": force_refresh}
            )

            dag = RoleDAG()

            # Загружаем все роли
            roles_stmt = select(EnhancedRole).where(EnhancedRole.is_active == True)
            roles_result = await db.execute(roles_stmt)
            roles = roles_result.scalars().all()

            # Добавляем роли в граф
            for role in roles:
                dag.add_role(role)

            # Загружаем иерархию
            hierarchy_stmt = (
                select(RoleHierarchy)
                .where(RoleHierarchy.is_active == True)
                .options(
                    selectinload(RoleHierarchy.parent_role),
                    selectinload(RoleHierarchy.child_role),
                )
            )
            hierarchy_result = await db.execute(hierarchy_stmt)
            hierarchies = hierarchy_result.scalars().all()

            # Добавляем связи наследования
            for hierarchy in hierarchies:
                dag.add_inheritance(hierarchy)

            # Проверяем на циклы
            if dag.has_cycle():
                cycle = dag.find_cycle()
                self.logger.error(f"Обнаружен цикл в иерархии ролей: {cycle}")
                raise CyclicDependencyError(f"Обнаружен цикл в иерархии ролей: {cycle}")

            # Кешируем результат
            self._dag_cache = dag
            self._cache_valid_until = datetime.now() + timedelta(minutes=15)

            self.logger.info(
                f"DAG ролей успешно построен",
                extra={
                    "roles_count": len(roles),
                    "hierarchies_count": len(hierarchies),
                },
            )

            return dag

        except Exception as e:
            self.logger.error(
                f"Ошибка при построении DAG ролей: {str(e)}", exc_info=True
            )
            raise BusinessLogicError(f"Не удалось построить граф ролей: {str(e)}")

    async def validate_inheritance(
        self, db: AsyncSession, parent_role_id: int, child_role_id: int
    ) -> bool:
        """
        Валидировать возможность создания связи наследования.

        Args:
            db: Сессия базы данных
            parent_role_id: ID родительской роли
            child_role_id: ID дочерней роли

        Returns:
            True если связь можно создать

        Raises:
            ValidationError: Если связь некорректна
            ConflictError: Если связь создаст цикл
        """
        try:
            self.logger.debug(
                f"Валидация связи наследования",
                extra={
                    "parent_role_id": parent_role_id,
                    "child_role_id": child_role_id,
                },
            )

            # Проверка самонаследования
            if parent_role_id == child_role_id:
                raise ValidationError("Роль не может наследовать сама от себя")

            # Строим текущий DAG
            dag = await self.build_role_dag(db)

            # Проверяем, что обе роли существуют
            if parent_role_id not in dag.nodes or child_role_id not in dag.nodes:
                raise NotFoundError("Одна или обе роли не найдены")

            # Проверяем, что связь не создаст цикл
            # Если child уже является предком parent, то связь создаст цикл
            parent_ancestors = dag.get_ancestors(parent_role_id)
            if child_role_id in parent_ancestors:
                raise ConflictError(
                    f"Связь {parent_role_id} -> {child_role_id} создаст цикл"
                )

            # Дополнительные проверки бизнес-логики
            parent_role = dag.nodes[parent_role_id]
            child_role = dag.nodes[child_role_id]

            # Проверка уровней ролей (необязательно)
            if parent_role.level > child_role.level:
                self.logger.warning(
                    f"Родительская роль {parent_role_id} имеет уровень выше "
                    f"дочерней роли {child_role_id}"
                )

            return True

        except (ValidationError, NotFoundError, ConflictError):
            raise
        except Exception as e:
            self.logger.error(
                f"Ошибка при валидации наследования: {str(e)}", exc_info=True
            )
            raise BusinessLogicError(f"Ошибка валидации связи наследования: {str(e)}")

    async def create_inheritance(
        self,
        db: AsyncSession,
        parent_role_id: int,
        child_role_id: int,
        inheritance_type: InheritanceType = InheritanceType.FULL,
        conditions: Optional[Dict[str, Any]] = None,
        created_by: Optional[int] = None,
    ) -> RoleHierarchy:
        """
        Создать связь наследования между ролями.

        Args:
            db: Сессия базы данных
            parent_role_id: ID родительской роли
            child_role_id: ID дочерней роли
            inheritance_type: Тип наследования
            conditions: Условия наследования
            created_by: ID создателя

        Returns:
            Созданная связь наследования
        """
        try:
            self.logger.debug(
                f"Создание связи наследования",
                extra={
                    "parent_role_id": parent_role_id,
                    "child_role_id": child_role_id,
                    "inheritance_type": inheritance_type.value,
                },
            )

            # Валидируем связь
            await self.validate_inheritance(db, parent_role_id, child_role_id)

            # Создаем связь
            hierarchy = RoleHierarchy(
                parent_role_id=parent_role_id,
                child_role_id=child_role_id,
                inheritance_type=inheritance_type,
                conditions=conditions,
                created_by=created_by,
            )

            db.add(hierarchy)
            await db.commit()
            await db.refresh(hierarchy)

            # Сбрасываем кеш
            self._invalidate_cache()

            self.logger.info(
                f"Создана связь наследования: {parent_role_id} -> {child_role_id}"
            )

            return hierarchy

        except (ValidationError, NotFoundError, ConflictError):
            await db.rollback()
            raise
        except Exception as e:
            await db.rollback()
            self.logger.error(
                f"Ошибка при создании связи наследования: {str(e)}", exc_info=True
            )
            raise BusinessLogicError(f"Не удалось создать связь наследования: {str(e)}")

    async def get_role_effective_permissions(
        self, db: AsyncSession, role_id: int, use_cache: bool = True
    ) -> Set[str]:
        """
        Получить эффективные разрешения роли с учетом наследования.

        Args:
            db: Сессия базы данных
            role_id: ID роли
            use_cache: Использовать кеш

        Returns:
            Множество эффективных разрешений
        """
        try:
            # Проверяем кеш
            if use_cache:
                cached_permissions = await self._get_cached_permissions(db, role_id)
                if cached_permissions is not None:
                    return cached_permissions

            # Строим DAG и вычисляем разрешения
            dag = await self.build_role_dag(db)
            effective_permissions = dag.compute_effective_permissions(role_id)

            # Кешируем результат
            if use_cache:
                await self._cache_permissions(db, role_id, effective_permissions)

            self.logger.debug(
                f"Получены эффективные разрешения для роли {role_id}",
                extra={"permissions_count": len(effective_permissions)},
            )

            return effective_permissions

        except Exception as e:
            self.logger.error(
                f"Ошибка при получении разрешений роли {role_id}: {str(e)}",
                exc_info=True,
            )
            raise BusinessLogicError(f"Не удалось получить разрешения роли: {str(e)}")

    async def get_role_ancestors(self, db: AsyncSession, role_id: int) -> List[int]:
        """Получить всех предков роли."""
        try:
            dag = await self.build_role_dag(db)
            ancestors = dag.get_ancestors(role_id)

            # Сортируем по топологическому порядку
            topo_order = dag.topological_sort()
            result = [rid for rid in topo_order if rid in ancestors]

            self.logger.debug(
                f"Получены предки для роли {role_id}",
                extra={"ancestors_count": len(result)},
            )

            return result

        except Exception as e:
            self.logger.error(
                f"Ошибка при получении предков роли {role_id}: {str(e)}", exc_info=True
            )
            raise BusinessLogicError(f"Не удалось получить предков роли: {str(e)}")

    async def get_role_descendants(self, db: AsyncSession, role_id: int) -> List[int]:
        """Получить всех потомков роли."""
        try:
            dag = await self.build_role_dag(db)
            descendants = dag.get_descendants(role_id)

            # Сортируем по топологическому порядку
            topo_order = dag.topological_sort()
            result = [rid for rid in topo_order if rid in descendants]

            self.logger.debug(
                f"Получены потомки для роли {role_id}",
                extra={"descendants_count": len(result)},
            )

            return result

        except Exception as e:
            self.logger.error(
                f"Ошибка при получении потомков роли {role_id}: {str(e)}", exc_info=True
            )
            raise BusinessLogicError(f"Не удалось получить потомков роли: {str(e)}")

    async def find_inheritance_path(
        self, db: AsyncSession, source_role_id: int, target_role_id: int
    ) -> Optional[InheritancePath]:
        """Найти путь наследования между ролями."""
        try:
            dag = await self.build_role_dag(db)
            path = dag.find_inheritance_path(source_role_id, target_role_id)

            if path:
                self.logger.debug(
                    f"Найден путь наследования",
                    extra={
                        "source_role_id": source_role_id,
                        "target_role_id": target_role_id,
                        "path_length": len(path.path),
                    },
                )

            return path

        except Exception as e:
            self.logger.error(
                f"Ошибка при поиске пути наследования: {str(e)}", exc_info=True
            )
            raise BusinessLogicError(f"Не удалось найти путь наследования: {str(e)}")

    def _invalidate_cache(self) -> None:
        """Сбросить кеш DAG."""
        self._dag_cache = None
        self._cache_valid_until = None
        self.logger.debug("Кеш DAG ролей сброшен")

    async def _get_cached_permissions(
        self, db: AsyncSession, role_id: int
    ) -> Optional[Set[str]]:
        """Получить разрешения из кеша."""
        try:
            stmt = select(RoleHierarchyCache).where(
                and_(
                    RoleHierarchyCache.role_id == role_id,
                    RoleHierarchyCache.cache_type == "permissions",
                    RoleHierarchyCache.is_valid == True,
                )
            )
            result = await db.execute(stmt)
            cache = result.scalar_one_or_none()

            if cache and not cache.is_expired:
                return set(cache.cache_data.get("permissions", []))

            return None

        except Exception as e:
            self.logger.warning(f"Ошибка при получении кеша разрешений: {str(e)}")
            return None

    async def _cache_permissions(
        self, db: AsyncSession, role_id: int, permissions: Set[str]
    ) -> None:
        """Кешировать разрешения роли."""
        try:
            # Удаляем старый кеш
            await db.execute(
                select(RoleHierarchyCache).where(
                    and_(
                        RoleHierarchyCache.role_id == role_id,
                        RoleHierarchyCache.cache_type == "permissions",
                    )
                )
            )

            # Создаем новый кеш
            cache = RoleHierarchyCache(
                role_id=role_id,
                cache_type="permissions",
                cache_data={"permissions": list(permissions)},
                expires_at=datetime.now() + timedelta(hours=1),
            )

            db.add(cache)
            await db.commit()

        except Exception as e:
            self.logger.warning(f"Ошибка при кешировании разрешений: {str(e)}")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("role_hierarchy", RoleHierarchyService)
# Создаем singleton экземпляр
role_hierarchy_service = RoleHierarchyService()
