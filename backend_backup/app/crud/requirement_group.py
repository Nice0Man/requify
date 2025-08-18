from typing import List, Optional

from sqlalchemy import and_, desc, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.requirement_group import RequirementGroup
from app.schemas.requirement_group import RequirementGroupCreate, RequirementGroupUpdate


class CRUDRequirementGroup(
    CRUDBase[RequirementGroup, RequirementGroupCreate, RequirementGroupUpdate]
):
    async def get_by_project(
        self, db: AsyncSession, *, project_id: int, skip: int = 0, limit: int = 100
    ) -> List[RequirementGroup]:
        """Get requirement groups for a specific project"""
        query = (
            select(self.model)
            .where(self.model.project_id == project_id)
            .options(
                selectinload(self.model.project), selectinload(self.model.versions)
            )
            .offset(skip)
            .limit(limit)
            .order_by(self.model.name)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_name(
        self, db: AsyncSession, *, name: str, project_id: int
    ) -> Optional[RequirementGroup]:
        """Get requirement group by name within a project"""
        query = (
            select(self.model)
            .where(and_(self.model.name == name, self.model.project_id == project_id))
            .options(
                selectinload(self.model.project), selectinload(self.model.versions)
            )
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def get_with_versions(
        self, db: AsyncSession, *, group_id: int
    ) -> Optional[RequirementGroup]:
        """Get requirement group with all its versions loaded"""
        query = (
            select(self.model)
            .where(self.model.id == group_id)
            .options(
                selectinload(self.model.project),
                selectinload(self.model.versions),
            )
        )
        result = await db.execute(query)
        return result.scalars().first()


requirement_group = CRUDRequirementGroup(RequirementGroup)
