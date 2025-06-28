"""CRUD операции для модели Relationship."""

from typing import List, Dict, Any, Optional, Set, Tuple
from sqlalchemy import select, or_, and_, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.relationship import Relationship
from app.schemas.relationship import RelationshipCreate, RelationshipUpdate
from app.schemas.trace_matrix import TraceNode, TraceLink


class CRUDRelationship(CRUDBase[Relationship, RelationshipCreate, RelationshipUpdate]):
    """CRUD операции для модели Relationship."""

    async def get_by_source(
        self, db: AsyncSession, *, source_id: int, skip: int = 0, limit: int = 100
    ) -> List[Relationship]:
        """Получить связи от источника."""
        stmt = (
            select(Relationship)
            .where(Relationship.source_id == source_id)
            .options(selectinload(Relationship.target), selectinload(Relationship.type))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_by_target(
        self, db: AsyncSession, *, target_id: int, skip: int = 0, limit: int = 100
    ) -> List[Relationship]:
        """Получить связи к цели."""
        stmt = (
            select(Relationship)
            .where(Relationship.target_id == target_id)
            .options(selectinload(Relationship.source), selectinload(Relationship.type))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_by_requirement(
        self, db: AsyncSession, *, requirement_id: int, skip: int = 0, limit: int = 100
    ) -> List[Relationship]:
        """Получить все связи требования (входящие и исходящие)."""
        stmt = (
            select(Relationship)
            .where(
                or_(
                    Relationship.source_id == requirement_id,
                    Relationship.target_id == requirement_id,
                )
            )
            .options(
                selectinload(Relationship.source),
                selectinload(Relationship.target),
                selectinload(Relationship.type),
            )
            .offset(skip)
            .limit(limit)
            .order_by(desc(Relationship.created_at))
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_outgoing_relationships(
        self, db: AsyncSession, *, requirement_id: int
    ) -> List[Relationship]:
        """Получить исходящие связи требования."""
        stmt = (
            select(Relationship)
            .where(Relationship.source_id == requirement_id)
            .options(selectinload(Relationship.target), selectinload(Relationship.type))
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_incoming_relationships(
        self, db: AsyncSession, *, requirement_id: int
    ) -> List[Relationship]:
        """Получить входящие связи требования."""
        stmt = (
            select(Relationship)
            .where(Relationship.target_id == requirement_id)
            .options(selectinload(Relationship.source), selectinload(Relationship.type))
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_all_relationships(
        self, db: AsyncSession, *, requirement_id: int
    ) -> List[Relationship]:
        """Получить все связи требования."""
        return await self.get_by_requirement(db, requirement_id=requirement_id)

    async def get_direct_dependencies(
        self, db: AsyncSession, *, requirement_id: int
    ) -> List[Relationship]:
        """Получить прямые зависимости требования."""
        stmt = (
            select(Relationship)
            .where(Relationship.source_id == requirement_id)
            .options(selectinload(Relationship.target), selectinload(Relationship.type))
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_direct_dependents(
        self, db: AsyncSession, *, requirement_id: int
    ) -> List[Relationship]:
        """Получить прямых зависимых требования."""
        stmt = (
            select(Relationship)
            .where(Relationship.target_id == requirement_id)
            .options(selectinload(Relationship.source), selectinload(Relationship.type))
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_all_dependencies_recursive(
        self, db: AsyncSession, *, requirement_id: int, max_depth: int = 10
    ) -> List[Relationship]:
        """Получить все зависимости рекурсивно."""
        visited = set()
        all_dependencies = []

        async def _get_dependencies_recursive(req_id: int, depth: int = 0):
            if depth >= max_depth or req_id in visited:
                return

            visited.add(req_id)
            dependencies = await self.get_direct_dependencies(db, requirement_id=req_id)

            for dep in dependencies:
                if dep not in all_dependencies:
                    all_dependencies.append(dep)
                await _get_dependencies_recursive(dep.target_id, depth + 1)

        await _get_dependencies_recursive(requirement_id)
        return all_dependencies

    async def get_all_dependents_recursive(
        self, db: AsyncSession, *, requirement_id: int, max_depth: int = 10
    ) -> List[Relationship]:
        """Получить всех зависимых рекурсивно."""
        visited = set()
        all_dependents = []

        async def _get_dependents_recursive(req_id: int, depth: int = 0):
            if depth >= max_depth or req_id in visited:
                return

            visited.add(req_id)
            dependents = await self.get_direct_dependents(db, requirement_id=req_id)

            for dep in dependents:
                if dep not in all_dependents:
                    all_dependents.append(dep)
                await _get_dependents_recursive(dep.source_id, depth + 1)

        await _get_dependents_recursive(requirement_id)
        return all_dependents

    async def build_trace_matrix(
        self, db: AsyncSession, *, requirement_id: int, depth: int = 3
    ) -> List[List[TraceNode]]:
        """Построить матрицу трассируемости."""
        from app.models.requirement import Requirement
        from app.models.requirement_types import RequirementType

        # Получаем центральное требование
        central_req_stmt = (
            select(Requirement, RequirementType.name)
            .join(RequirementType, Requirement.type_id == RequirementType.id)
            .where(Requirement.id == requirement_id)
        )
        central_result = await db.execute(central_req_stmt)
        central_req, central_type = central_result.first()

        if not central_req:
            return []

        matrix = []
        visited = set()

        # Уровень 0 - центральное требование
        central_node = TraceNode(
            requirement_id=central_req.id,
            requirement_title=central_req.title,
            requirement_type=central_type,
            level=0,
            children=[],
            parents=[],
        )
        matrix.append([central_node])
        visited.add(requirement_id)

        # Строим матрицу по уровням
        for level in range(1, depth + 1):
            level_nodes = []
            prev_level_req_ids = [node.requirement_id for node in matrix[level - 1]]

            for req_id in prev_level_req_ids:
                # Получаем зависимости
                dependencies = await self.get_direct_dependencies(
                    db, requirement_id=req_id
                )
                dependents = await self.get_direct_dependents(db, requirement_id=req_id)

                # Обрабатываем зависимости
                for dep in dependencies:
                    if dep.target_id not in visited:
                        target_req_stmt = (
                            select(Requirement, RequirementType.name)
                            .join(
                                RequirementType,
                                Requirement.type_id == RequirementType.id,
                            )
                            .where(Requirement.id == dep.target_id)
                        )
                        target_result = await db.execute(target_req_stmt)
                        target_req, target_type = target_result.first()

                        if target_req:
                            node = TraceNode(
                                requirement_id=target_req.id,
                                requirement_title=target_req.title,
                                requirement_type=target_type,
                                level=level,
                                children=[],
                                parents=[],
                            )
                            level_nodes.append(node)
                            visited.add(dep.target_id)

                # Обрабатываем зависимых
                for dep in dependents:
                    if dep.source_id not in visited:
                        source_req_stmt = (
                            select(Requirement, RequirementType.name)
                            .join(
                                RequirementType,
                                Requirement.type_id == RequirementType.id,
                            )
                            .where(Requirement.id == dep.source_id)
                        )
                        source_result = await db.execute(source_req_stmt)
                        source_req, source_type = source_result.first()

                        if source_req:
                            node = TraceNode(
                                requirement_id=source_req.id,
                                requirement_title=source_req.title,
                                requirement_type=source_type,
                                level=level,
                                children=[],
                                parents=[],
                            )
                            level_nodes.append(node)
                            visited.add(dep.source_id)

            if level_nodes:
                matrix.append(level_nodes)
            else:
                break

        return matrix

    async def check_circular_dependency(
        self, db: AsyncSession, *, source_id: int, target_id: int
    ) -> bool:
        """Проверить на циклическую зависимость."""
        if source_id == target_id:
            return True

        visited = set()

        async def _has_path(from_id: int, to_id: int) -> bool:
            if from_id == to_id:
                return True
            if from_id in visited:
                return False

            visited.add(from_id)
            dependencies = await self.get_direct_dependencies(
                db, requirement_id=from_id
            )

            for dep in dependencies:
                if await _has_path(dep.target_id, to_id):
                    return True
            return False

        return await _has_path(target_id, source_id)

    async def get_relationship_statistics(
        self, db: AsyncSession, *, project_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Получить статистику связей."""
        from app.models.requirement import Requirement
        from app.models.relationship_types import RelationshipType

        # Базовый запрос
        base_query = select(Relationship)

        if project_id:
            base_query = base_query.join(
                Requirement, Relationship.source_id == Requirement.id
            ).where(Requirement.project_id == project_id)

        # Общее количество связей
        total_count_query = select(func.count(Relationship.id))
        if project_id:
            total_count_query = total_count_query.select_from(
                Relationship.join(Requirement, Relationship.source_id == Requirement.id)
            ).where(Requirement.project_id == project_id)

        total_result = await db.execute(total_count_query)
        total_relationships = total_result.scalar() or 0

        # Статистика по типам
        type_stats_query = select(
            RelationshipType.name, func.count(Relationship.id).label("count")
        ).join(RelationshipType, Relationship.type_id == RelationshipType.id)

        if project_id:
            type_stats_query = type_stats_query.join(
                Requirement, Relationship.source_id == Requirement.id
            ).where(Requirement.project_id == project_id)

        type_stats_query = type_stats_query.group_by(RelationshipType.name)
        type_result = await db.execute(type_stats_query)

        type_statistics = {}
        for type_name, count in type_result:
            type_statistics[type_name] = count

        return {
            "total_relationships": total_relationships,
            "by_type": type_statistics,
            "generated_at": datetime.now().isoformat(),
        }


relationship = CRUDRelationship(Relationship)
