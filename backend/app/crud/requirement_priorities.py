from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.crud.base import CRUDBase
from app.models.requirement_priorities import RequirementPriority
from app.schemas.requirement_priorities import (
    RequirementPriorityCreate,
    RequirementPriorityUpdate,
)


class CRUDRequirementPriority(
    CRUDBase[RequirementPriority, RequirementPriorityCreate, RequirementPriorityUpdate]
):
    async def get_by_name(
        self, db: AsyncSession, *, name: str
    ) -> Optional[RequirementPriority]:
        """Get requirement priority by name"""
        query = select(self.model).where(self.model.name == name)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_active_priorities(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[RequirementPriority]:
        """Get all active requirement priorities"""
        query = select(self.model).offset(skip).limit(limit).order_by(self.model.name)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_multi(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[RequirementPriority]:
        """Get multiple requirement priorities"""
        query = select(self.model).offset(skip).limit(limit).order_by(self.model.name)
        result = await db.execute(query)
        return list(result.scalars().all())


requirement_priority = CRUDRequirementPriority(RequirementPriority)
