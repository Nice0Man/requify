"""
Relationship Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any, Set, Tuple
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass
from datetime import datetime

try:
    import networkx as nx

    HAS_NETWORKX = True
except ImportError:
    HAS_NETWORKX = False
    nx = None

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select, and_, or_, delete, func, exists
from fastapi import HTTPException, status

from app.models.user import User
from app.models.relationship import Relationship
from app.models.relationship_types import RelationshipType
from app.models.requirement import Requirement
from app.crud.base import CRUDBase
from app.utils.logger import logger
from .base import BaseService, ServiceError


class RelationshipServiceError(ServiceError):
    """Ошибки сервиса связей."""

    pass


class RelationshipNotFoundError(RelationshipServiceError):
    """Ошибка - связь не найдена."""

    pass


class CyclicDependencyError(RelationshipServiceError):
    """Ошибка циклической зависимости."""

    pass


class RelationshipValidationError(RelationshipServiceError):
    """Ошибка валидации связи."""

    pass


class RelationshipDirection(str, Enum):
    """Направления связей."""

    FORWARD = "forward"
    BACKWARD = "backward"
    BIDIRECTIONAL = "bidirectional"


class RelationshipStatus(str, Enum):
    """Статусы связей."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    PROPOSED = "proposed"
    REJECTED = "rejected"


@dataclass
class RelationshipInfo:
    """Информация о связи."""

    id: int
    source_id: int
    target_id: int
    relationship_type: str
    direction: RelationshipDirection
    status: RelationshipStatus
    created_at: datetime
    metadata: Dict[str, Any] = None


@dataclass
class DependencyGraph:
    """Граф зависимостей."""

    nodes: List[int]
    edges: List[Tuple[int, int, str]]
    cycles: List[List[int]]
    root_nodes: List[int]
    leaf_nodes: List[int]


@dataclass
class TraceabilityMatrix:
    """Матрица трассировки."""

    requirements: List[int]
    relationships: Dict[Tuple[int, int], str]
    coverage_stats: Dict[str, int]


# Абстрактные интерфейсы
class IRelationshipRepository(ABC):
    """Интерфейс репозитория связей."""

    @abstractmethod
    async def create_relationship(
        self, db: AsyncSession, relationship_data: Dict[str, Any]
    ) -> Relationship:
        """Создать связь."""
        pass

    @abstractmethod
    async def get_relationship_by_id(
        self, db: AsyncSession, relationship_id: int
    ) -> Optional[Relationship]:
        """Получить связь по ID."""
        pass

    @abstractmethod
    async def get_requirement_relationships(
        self,
        db: AsyncSession,
        requirement_id: int,
        direction: Optional[RelationshipDirection] = None,
    ) -> List[Relationship]:
        """Получить связи требования."""
        pass


class IRelationshipValidator(ABC):
    """Интерфейс валидатора связей."""

    @abstractmethod
    async def validate_relationship_creation(
        self,
        db: AsyncSession,
        source_id: int,
        target_id: int,
        relationship_type: str,
        user: User,
    ) -> bool:
        """Валидировать создание связи."""
        pass

    @abstractmethod
    async def check_cyclic_dependency(
        self, db: AsyncSession, source_id: int, target_id: int, relationship_type: str
    ) -> bool:
        """Проверить циклическую зависимость."""
        pass


class IDependencyAnalyzer(ABC):
    """Интерфейс анализатора зависимостей."""

    @abstractmethod
    async def build_dependency_graph(
        self, db: AsyncSession, project_id: Optional[int] = None
    ) -> DependencyGraph:
        """Построить граф зависимостей."""
        pass

    @abstractmethod
    async def find_dependency_cycles(
        self, db: AsyncSession, requirements: List[int]
    ) -> List[List[int]]:
        """Найти циклы в зависимостях."""
        pass


class ITraceabilityManager(ABC):
    """Интерфейс менеджера трассировки."""

    @abstractmethod
    async def build_traceability_matrix(
        self, db: AsyncSession, requirements: List[int]
    ) -> TraceabilityMatrix:
        """Построить матрицу трассировки."""
        pass


# Конкретные реализации
class DatabaseRelationshipRepository(IRelationshipRepository):
    """Репозиторий связей в базе данных."""

    def __init__(self):
        self.relationship_crud = CRUDBase(Relationship)
        self.relationship_type_crud = CRUDBase(RelationshipType)

    async def create_relationship(
        self, db: AsyncSession, relationship_data: Dict[str, Any]
    ) -> Relationship:
        """Создать связь."""
        return await self.relationship_crud.create(db, obj_in=relationship_data)

    async def get_relationship_by_id(
        self, db: AsyncSession, relationship_id: int
    ) -> Optional[Relationship]:
        """Получить связь по ID."""
        return await self.relationship_crud.get(db, id=relationship_id)

    async def get_requirement_relationships(
        self,
        db: AsyncSession,
        requirement_id: int,
        direction: Optional[RelationshipDirection] = None,
    ) -> List[Relationship]:
        """Получить связи требования."""
        stmt = select(Relationship).options(
            selectinload(Relationship.source_requirement),
            selectinload(Relationship.target_requirement),
            selectinload(Relationship.relationship_type),
        )

        if direction == RelationshipDirection.FORWARD:
            stmt = stmt.where(Relationship.source_id == requirement_id)
        elif direction == RelationshipDirection.BACKWARD:
            stmt = stmt.where(Relationship.target_id == requirement_id)
        else:
            stmt = stmt.where(
                or_(
                    Relationship.source_id == requirement_id,
                    Relationship.target_id == requirement_id,
                )
            )

        result = await db.execute(stmt)
        return result.scalars().all()

    async def delete_relationship(
        self, db: AsyncSession, relationship: Relationship
    ) -> bool:
        """Удалить связь."""
        await self.relationship_crud.remove(db, id=relationship.id)
        return True

    async def get_relationships_by_type(
        self, db: AsyncSession, relationship_type: str, project_id: Optional[int] = None
    ) -> List[Relationship]:
        """Получить связи по типу."""
        stmt = (
            select(Relationship)
            .join(RelationshipType)
            .options(
                selectinload(Relationship.source_requirement),
                selectinload(Relationship.target_requirement),
            )
            .where(RelationshipType.name == relationship_type)
        )

        if project_id:
            stmt = stmt.join(
                Requirement, Relationship.source_id == Requirement.id
            ).where(Requirement.project_id == project_id)

        result = await db.execute(stmt)
        return result.scalars().all()


class StandardRelationshipValidator(IRelationshipValidator):
    """Стандартный валидатор связей."""

    async def validate_relationship_creation(
        self,
        db: AsyncSession,
        source_id: int,
        target_id: int,
        relationship_type: str,
        user: User,
    ) -> bool:
        """Валидировать создание связи."""
        # Проверка, что требования разные
        if source_id == target_id:
            raise RelationshipValidationError(
                "Cannot create relationship with the same requirement"
            )

        # Проверка существования требований
        source_exists = await self._check_requirement_exists(db, source_id)
        target_exists = await self._check_requirement_exists(db, target_id)

        if not source_exists:
            raise RelationshipValidationError(
                f"Source requirement {source_id} not found"
            )

        if not target_exists:
            raise RelationshipValidationError(
                f"Target requirement {target_id} not found"
            )

        # Проверка существования типа связи
        if not await self._check_relationship_type_exists(db, relationship_type):
            raise RelationshipValidationError(
                f"Relationship type {relationship_type} not found"
            )

        # Проверка существующих связей
        if await self._check_existing_relationship(
            db, source_id, target_id, relationship_type
        ):
            raise RelationshipValidationError("Relationship already exists")

        return True

    async def check_cyclic_dependency(
        self, db: AsyncSession, source_id: int, target_id: int, relationship_type: str
    ) -> bool:
        """Проверить циклическую зависимость."""
        # Проверяем только для типов зависимостей
        dependency_types = ["depends", "dependency", "parent", "child", "blocks"]

        if relationship_type.lower() not in dependency_types:
            return False

        # Простая проверка: есть ли уже путь от target к source
        return await self._has_path(db, target_id, source_id, dependency_types)

    async def _check_requirement_exists(
        self, db: AsyncSession, requirement_id: int
    ) -> bool:
        """Проверить существование требования."""
        stmt = select(exists().where(Requirement.id == requirement_id))
        result = await db.execute(stmt)
        return result.scalar()

    async def _check_relationship_type_exists(
        self, db: AsyncSession, relationship_type: str
    ) -> bool:
        """Проверить существование типа связи."""
        stmt = select(exists().where(RelationshipType.name == relationship_type))
        result = await db.execute(stmt)
        return result.scalar()

    async def _check_existing_relationship(
        self, db: AsyncSession, source_id: int, target_id: int, relationship_type: str
    ) -> bool:
        """Проверить существующую связь."""
        stmt = (
            select(exists())
            .select_from(Relationship)
            .join(RelationshipType)
            .where(
                and_(
                    Relationship.source_id == source_id,
                    Relationship.target_id == target_id,
                    RelationshipType.name == relationship_type,
                )
            )
        )
        result = await db.execute(stmt)
        return result.scalar()

    async def _has_path(
        self, db: AsyncSession, from_id: int, to_id: int, relationship_types: List[str]
    ) -> bool:
        """Проверить существование пути между требованиями."""
        # Упрощенная реализация - проверяем прямую связь
        stmt = (
            select(exists())
            .select_from(Relationship)
            .join(RelationshipType)
            .where(
                and_(
                    Relationship.source_id == from_id,
                    Relationship.target_id == to_id,
                    RelationshipType.name.in_(relationship_types),
                )
            )
        )
        result = await db.execute(stmt)
        return result.scalar()


class NetworkXDependencyAnalyzer(IDependencyAnalyzer):
    """Анализатор зависимостей на основе NetworkX."""

    async def build_dependency_graph(
        self, db: AsyncSession, project_id: Optional[int] = None
    ) -> DependencyGraph:
        """Построить граф зависимостей."""
        # Получение всех зависимостей
        dependency_types = ["depends", "dependency", "parent", "child", "blocks"]

        stmt = (
            select(Relationship)
            .join(RelationshipType)
            .where(RelationshipType.name.in_(dependency_types))
        )

        if project_id:
            stmt = stmt.join(
                Requirement, Relationship.source_id == Requirement.id
            ).where(Requirement.project_id == project_id)

        result = await db.execute(stmt)
        relationships = result.scalars().all()

        nodes = set()
        edges = []

        for rel in relationships:
            nodes.add(rel.source_id)
            nodes.add(rel.target_id)
            edges.append((rel.source_id, rel.target_id, rel.relationship_type.name))

        # Если NetworkX доступен, используем его для анализа
        if HAS_NETWORKX and nx:
            graph = nx.DiGraph()
            for rel in relationships:
                graph.add_edge(rel.source_id, rel.target_id)

            try:
                cycles = list(nx.simple_cycles(graph))
            except:
                cycles = []

            root_nodes = [node for node in nodes if graph.in_degree(node) == 0]
            leaf_nodes = [node for node in nodes if graph.out_degree(node) == 0]
        else:
            # Простая реализация без NetworkX
            cycles = []
            root_nodes = []
            leaf_nodes = []

            # Простое определение корневых и листовых узлов
            sources = {rel.source_id for rel in relationships}
            targets = {rel.target_id for rel in relationships}

            root_nodes = list(sources - targets)
            leaf_nodes = list(targets - sources)

        return DependencyGraph(
            nodes=list(nodes),
            edges=edges,
            cycles=cycles,
            root_nodes=root_nodes,
            leaf_nodes=leaf_nodes,
        )

    async def find_dependency_cycles(
        self, db: AsyncSession, requirements: List[int]
    ) -> List[List[int]]:
        """Найти циклы в зависимостях."""
        if not HAS_NETWORKX or not nx:
            # Простая реализация без NetworkX
            logger.warning("NetworkX not available, cycle detection is limited")
            return []

        # Получение зависимостей для указанных требований
        stmt = (
            select(Relationship)
            .join(RelationshipType)
            .where(
                and_(
                    RelationshipType.name.in_(
                        ["depends", "dependency", "parent", "child"]
                    ),
                    or_(
                        Relationship.source_id.in_(requirements),
                        Relationship.target_id.in_(requirements),
                    ),
                )
            )
        )

        result = await db.execute(stmt)
        relationships = result.scalars().all()

        # Построение графа
        graph = nx.DiGraph()
        for rel in relationships:
            graph.add_edge(rel.source_id, rel.target_id)

        # Поиск циклов
        try:
            cycles = list(nx.simple_cycles(graph))
            return cycles
        except:
            return []


class StandardTraceabilityManager(ITraceabilityManager):
    """Стандартный менеджер трассировки."""

    async def build_traceability_matrix(
        self, db: AsyncSession, requirements: List[int]
    ) -> TraceabilityMatrix:
        """Построить матрицу трассировки."""
        # Получение всех связей между указанными требованиями
        stmt = (
            select(Relationship)
            .options(selectinload(Relationship.relationship_type))
            .where(
                and_(
                    Relationship.source_id.in_(requirements),
                    Relationship.target_id.in_(requirements),
                )
            )
        )

        result = await db.execute(stmt)
        relationships = result.scalars().all()

        # Построение матрицы
        relationship_map = {}
        for rel in relationships:
            key = (rel.source_id, rel.target_id)
            relationship_map[key] = rel.relationship_type.name

        # Статистика покрытия
        total_possible = len(requirements) * (
            len(requirements) - 1
        )  # без самореференций
        actual_relationships = len(relationships)

        coverage_stats = {
            "total_requirements": len(requirements),
            "total_relationships": actual_relationships,
            "total_possible": total_possible,
            "coverage_percentage": (
                (actual_relationships / total_possible * 100)
                if total_possible > 0
                else 0
            ),
        }

        return TraceabilityMatrix(
            requirements=requirements,
            relationships=relationship_map,
            coverage_stats=coverage_stats,
        )


class RelationshipService(BaseService):
    """
    Основной сервис связей.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными)
    - Strategy (разные валидаторы и анализаторы)
    - Command (операции со связями)
    """

    def __init__(self):
        self._repository: IRelationshipRepository = DatabaseRelationshipRepository()
        self._validator: IRelationshipValidator = StandardRelationshipValidator()
        self._dependency_analyzer: IDependencyAnalyzer = NetworkXDependencyAnalyzer()
        self._traceability_manager: ITraceabilityManager = StandardTraceabilityManager()
        super().__init__()

    def get_service_name(self) -> str:
        return "RelationshipService"

    def set_repository(self, repository: IRelationshipRepository):
        """Установить репозиторий связей."""
        self._repository = repository
        self._log_operation("set_repository", {"repository": type(repository).__name__})

    def set_validator(self, validator: IRelationshipValidator):
        """Установить валидатор связей."""
        self._validator = validator
        self._log_operation("set_validator", {"validator": type(validator).__name__})

    async def create_relationship(
        self,
        db: AsyncSession,
        source_id: int,
        target_id: int,
        relationship_type: str,
        user: User,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Relationship:
        """Создать связь между требованиями."""
        try:
            self._log_operation(
                "create_relationship",
                {
                    "source_id": source_id,
                    "target_id": target_id,
                    "relationship_type": relationship_type,
                    "user_id": user.id,
                },
            )

            # Валидация
            await self._validator.validate_relationship_creation(
                db, source_id, target_id, relationship_type, user
            )

            # Проверка циклических зависимостей
            if await self._validator.check_cyclic_dependency(
                db, source_id, target_id, relationship_type
            ):
                raise CyclicDependencyError(
                    "This relationship would create a cyclic dependency"
                )

            # Получение типа связи
            type_stmt = select(RelationshipType).where(
                RelationshipType.name == relationship_type
            )
            type_result = await db.execute(type_stmt)
            rel_type = type_result.scalar_one_or_none()

            if not rel_type:
                raise RelationshipValidationError(
                    f"Relationship type {relationship_type} not found"
                )

            # Создание связи
            relationship_data = {
                "source_id": source_id,
                "target_id": target_id,
                "relationship_type_id": rel_type.id,
                "metadata": metadata or {},
                "created_at": datetime.utcnow(),
                "created_by": user.id,
            }

            relationship = await self._repository.create_relationship(
                db, relationship_data
            )

            return relationship

        except Exception as e:
            raise self._handle_error(e, "create_relationship")

    async def get_requirement_relationships(
        self,
        db: AsyncSession,
        requirement_id: int,
        direction: Optional[RelationshipDirection] = None,
    ) -> List[Relationship]:
        """Получить связи требования."""
        try:
            self._log_operation(
                "get_requirement_relationships",
                {
                    "requirement_id": requirement_id,
                    "direction": direction.value if direction else None,
                },
            )

            return await self._repository.get_requirement_relationships(
                db, requirement_id, direction
            )

        except Exception as e:
            raise self._handle_error(e, "get_requirement_relationships")

    async def delete_relationship(
        self, db: AsyncSession, relationship_id: int, user: User
    ) -> bool:
        """Удалить связь."""
        try:
            self._log_operation(
                "delete_relationship",
                {"relationship_id": relationship_id, "user_id": user.id},
            )

            # Получение связи
            relationship = await self._repository.get_relationship_by_id(
                db, relationship_id
            )
            if not relationship:
                raise RelationshipNotFoundError(
                    f"Relationship with ID {relationship_id} not found"
                )

            # TODO Проверка прав (упрощенная)
            # В реальной реализации здесь должна быть проверка через permission_service

            # Удаление
            success = await self._repository.delete_relationship(db, relationship)

            return success

        except Exception as e:
            raise self._handle_error(e, "delete_relationship")

    async def build_dependency_graph(
        self, db: AsyncSession, project_id: Optional[int] = None
    ) -> DependencyGraph:
        """Построить граф зависимостей."""
        try:
            self._log_operation("build_dependency_graph", {"project_id": project_id})

            return await self._dependency_analyzer.build_dependency_graph(
                db, project_id
            )

        except Exception as e:
            raise self._handle_error(e, "build_dependency_graph")

    async def find_dependency_cycles(
        self, db: AsyncSession, requirements: List[int]
    ) -> List[List[int]]:
        """Найти циклы в зависимостях."""
        try:
            self._log_operation(
                "find_dependency_cycles", {"requirements_count": len(requirements)}
            )

            return await self._dependency_analyzer.find_dependency_cycles(
                db, requirements
            )

        except Exception as e:
            raise self._handle_error(e, "find_dependency_cycles")

    async def build_traceability_matrix(
        self, db: AsyncSession, requirements: List[int]
    ) -> TraceabilityMatrix:
        """Построить матрицу трассировки."""
        try:
            self._log_operation(
                "build_traceability_matrix", {"requirements_count": len(requirements)}
            )

            return await self._traceability_manager.build_traceability_matrix(
                db, requirements
            )

        except Exception as e:
            raise self._handle_error(e, "build_traceability_matrix")

    async def get_relationship_statistics(
        self, db: AsyncSession, project_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Получить статистику связей."""
        try:
            self._log_operation(
                "get_relationship_statistics", {"project_id": project_id}
            )

            # Базовая статистика
            base_stmt = select(func.count(Relationship.id))

            if project_id:
                base_stmt = base_stmt.join(
                    Requirement, Relationship.source_id == Requirement.id
                ).where(Requirement.project_id == project_id)

            total_result = await db.execute(base_stmt)
            total_relationships = total_result.scalar()

            # Статистика по типам
            type_stmt = (
                select(
                    RelationshipType.name, func.count(Relationship.id).label("count")
                )
                .select_from(Relationship)
                .join(RelationshipType)
                .group_by(RelationshipType.name)
            )

            if project_id:
                type_stmt = type_stmt.join(
                    Requirement, Relationship.source_id == Requirement.id
                ).where(Requirement.project_id == project_id)

            type_result = await db.execute(type_stmt)
            type_counts = {row.name: row.count for row in type_result}

            return {
                "total_relationships": total_relationships,
                "relationship_types": type_counts,
                "project_id": project_id,
            }

        except Exception as e:
            raise self._handle_error(e, "get_relationship_statistics")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("relationship", RelationshipService)

# Singleton instance
relationship_service = RelationshipService()
