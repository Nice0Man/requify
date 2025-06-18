"""CRUD операции для модели Relationship."""

from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from requify.app.crud.base import CRUDBase
from requify.app.models.relationship import Relationship
from requify.app.schemas.relationship import RelationshipCreate, RelationshipUpdate


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


relationship = CRUDRelationship(Relationship)
