from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, desc, func

from app.crud.base import CRUDBase
from app.models.requirement_group_version import RequirementGroupVersion
from app.schemas.requirement_group_version import (
    RequirementGroupVersionCreate,
    RequirementGroupVersionUpdate,
)


class CRUDRequirementGroupVersion(
    CRUDBase[
        RequirementGroupVersion,
        RequirementGroupVersionCreate,
        RequirementGroupVersionUpdate,
    ]
):
    async def get_by_group(
        self, db: AsyncSession, *, group_id: int, skip: int = 0, limit: int = 100
    ) -> List[RequirementGroupVersion]:
        """Get all versions for a specific requirement group"""
        query = (
            select(self.model)
            .where(self.model.group_id == group_id)
            .options(selectinload(self.model.group))
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.version_number))
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_latest_version(
        self, db: AsyncSession, *, group_id: int
    ) -> Optional[RequirementGroupVersion]:
        """Get the latest version of a requirement group"""
        query = (
            select(self.model)
            .where(self.model.group_id == group_id)
            .options(selectinload(self.model.group))
            .order_by(desc(self.model.version_number))
            .limit(1)
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def get_by_version_number(
        self, db: AsyncSession, *, group_id: int, version_number: int
    ) -> Optional[RequirementGroupVersion]:
        """Get specific version of a requirement group"""
        query = (
            select(self.model)
            .where(
                and_(
                    self.model.group_id == group_id,
                    self.model.version_number == version_number,
                )
            )
            .options(selectinload(self.model.group))
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def get_next_version_number(self, db: AsyncSession, *, group_id: int) -> int:
        """Get the next version number for a group"""
        query = select(func.max(self.model.version_number)).where(
            self.model.group_id == group_id
        )
        result = await db.execute(query)
        max_version = result.scalar()
        return (max_version or 0) + 1

    async def create_new_version(
        self, db: AsyncSession, *, obj_in: RequirementGroupVersionCreate
    ) -> RequirementGroupVersion:
        """Create a new version with auto-incremented version number"""
        if not obj_in.version_number:
            obj_in.version_number = await self.get_next_version_number(
                db, group_id=obj_in.group_id
            )
        return await self.create(db, obj_in=obj_in)


requirement_group_version = CRUDRequirementGroupVersion(RequirementGroupVersion)
