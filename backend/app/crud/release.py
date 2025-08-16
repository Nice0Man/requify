"""CRUD операции для модели Release."""

from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.release import Release
from app.schemas.release import ReleaseCreate, ReleaseUpdate


class CRUDRelease(CRUDBase[Release, ReleaseCreate, ReleaseUpdate]):
    """CRUD операции для модели Release."""

    async def get_by_project(
        self, db: AsyncSession, *, project_id: int, skip: int = 0, limit: int = 100
    ) -> List[Release]:
        """Получить релизы проекта."""
        stmt = (
            select(Release)
            .where(Release.project_id == project_id)
            .options(selectinload(Release.project))
            .offset(skip)
            .limit(limit)
            .order_by(Release.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_version(
        self, db: AsyncSession, *, project_id: int, version: str
    ) -> Optional[Release]:
        """Получить релиз по версии."""
        stmt = select(Release).where(
            Release.project_id == project_id, Release.version == version
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_requirements(
        self, db: AsyncSession, *, id: int
    ) -> Optional[Release]:
        """Получить релиз с требованиями."""
        stmt = (
            select(Release)
            .where(Release.id == id)
            .options(selectinload(Release.requirements), selectinload(Release.project))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


release = CRUDRelease(Release)
