from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.relationship_types import RelationshipType
from app.schemas.relationship_types import (
    RelationshipTypeCreate,
    RelationshipTypeUpdate,
)


class CRUDRelationshipType(
    CRUDBase[RelationshipType, RelationshipTypeCreate, RelationshipTypeUpdate]
):
    async def get_by_name(
        self, db: AsyncSession, *, name: str
    ) -> Optional[RelationshipType]:
        """Get relationship type by name"""
        query = select(self.model).where(self.model.name == name)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_active_types(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[RelationshipType]:
        """Get all active relationship types"""
        query = select(self.model).offset(skip).limit(limit).order_by(self.model.name)
        result = await db.execute(query)
        return result.scalars().all()


relationship_type = CRUDRelationshipType(RelationshipType)
