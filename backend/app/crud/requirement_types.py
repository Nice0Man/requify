from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.crud.base import CRUDBase
from app.models.requirement_types import RequirementType
from app.schemas.requirement_types import (
    RequirementTypeCreate,
    RequirementTypeUpdate,
)


class CRUDRequirementType(
    CRUDBase[RequirementType, RequirementTypeCreate, RequirementTypeUpdate]
):
    async def get_by_name(
        self, db: AsyncSession, *, name: str
    ) -> Optional[RequirementType]:
        """Get requirement type by name"""
        query = select(self.model).where(self.model.name == name)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_active_types(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[RequirementType]:
        """Get all active requirement types"""
        query = select(self.model).offset(skip).limit(limit).order_by(self.model.name)
        result = await db.execute(query)
        return result.scalars().all()


requirement_type = CRUDRequirementType(RequirementType)
