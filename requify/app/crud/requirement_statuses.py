from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from requify.app.crud.base import CRUDBase
from requify.app.models.requirement_statuses import RequirementStatus
from requify.app.schemas.requirement_statuses import (
    RequirementStatusCreate,
    RequirementStatusUpdate,
)


class CRUDRequirementStatus(
    CRUDBase[RequirementStatus, RequirementStatusCreate, RequirementStatusUpdate]
):
    async def get_by_name(
        self, db: AsyncSession, *, name: str
    ) -> Optional[RequirementStatus]:
        """Get requirement status by name"""
        query = select(self.model).where(self.model.name == name)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_active_statuses(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[RequirementStatus]:
        """Get all active requirement statuses"""
        query = select(self.model).offset(skip).limit(limit).order_by(self.model.name)
        result = await db.execute(query)
        return result.scalars().all()


requirement_status = CRUDRequirementStatus(RequirementStatus)
